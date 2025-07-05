use crate::types::ticket;
use escpos::driver::*;
use escpos::errors::PrinterError;
use escpos::printer::Printer;
use escpos::utils::*;

/// Formats a sale item for a 42-character line based on the new receipt format.
/// - name: Item name (truncated to 30 chars with ".." if longer than 32).
/// - quantity: Quantity of the item (e.g., 0.5, 1.0, 3.0).
/// - unit_price: Price per unit (e.g., 210.00).
/// - total: Total price for the item (e.g., 630.00).
/// Returns a tuple of three strings: product_name (left-aligned, 32 chars), total (right-aligned, 10 chars), and subline (if quantity != 1, else empty).
fn format_sale_item(
    name: &str,
    quantity: f32,
    unit_price: f32,
    total: f32,
) -> (String, String, String) {
    const NAME_WIDTH: usize = 44; // Max 32 chars for name, including ".." if truncated
    const TOTAL_WIDTH: usize = 12; // e.g., "$630.00", right-aligned
    const LINE_WIDTH: usize = 44; // Total line width

    // Truncate name to 30 chars and append ".." if longer than 32, or use full name if shorter
    let name_truncated = if name.len() > NAME_WIDTH {
        format!("{}..", &name[..NAME_WIDTH - 2]) // Take 30 chars, add ".."
    } else {
        name.to_string()
    };
    let product_name = format!("{:<44}", name_truncated); // Left-align, pad to 32 chars

    // Format total price (right-aligned)
    let total_str = format!("{:>12}", format!("${:.2}", total)); // e.g., "    $630.00"

    // Subline: quantity * unit price, only if quantity != 1
    let subline = if quantity != 1.0 {
        format!("{:<44}", format!("{:.1} x ${:.2}", quantity, unit_price)) // e.g., "0.5 x $210.00", pad to 42 chars
    } else {
        String::new()
    };

    (product_name, total_str, subline)
}

// usb driver address: vendor id, product id
// TODO: Agregarle el header ( nombre empresa, direccion, rfc ) desde la configuracion de la app
// TODO: Pasar el vendor_id y product_id de la configuracion de la app
pub fn print_ticket<D: Driver>(driver: D, ticket_data: &ticket) -> String {
    // We define an inner function or a closure that performs the printing.
    // This closure IS allowed to return a Result and use the `?` operator.
    let print_logic = || -> Result<(), PrinterError> {
        // All the code that can fail goes inside here.
        let mut printer = Printer::new(driver, Protocol::default(), None);
        let print_msg = format!("Hello, {}! Desde Rust!", ticket_data.id);
        println!("This got executed");

        printer
            .init()?
            .debug_mode(Some(DebugMode::Dec))
            .justify(JustifyMode::CENTER)?
            .bold(true)?
            .writeln("Tortilleria y Productos")? // TODO: Make this dynamic
            .writeln("Sinaloa")? // TODO: Make this dynamic
            .feed()?
            .writeln("RFC: CAAE56040051Q6")? // TODO: Make this dynamic
            .writeln("AV. DE LAS PALMAS 4340 C.P. 22106")? // TODO: Make this dynamic
            .writeln(" TIUANA BAJA CALIFORNIA")? // TODO: Make this dynamic
            .writeln("")?
            .bold(true)?
            .write("Folio: ")?
            .bold(false)?
            .writeln(ticket_data.id.as_str())?
            .bold(true)?
            .write("Fecha: ")?
            .bold(false)?
            .writeln(ticket_data.created_at.as_str())?
            .writeln("")?
            .writeln("")?;

        // Print header
        printer.justify(JustifyMode::LEFT)?;

        printer.font(Font::A)?;
        printer.bold(true)?;
        printer.write("PRODUCTO                           ")?;
        printer.writeln("IMPORTE")?;
        printer.bold(false)?;
        printer.writeln("------------------------------------------")?;

        for ticket_item in ticket_data.ticket_items.iter() {
            let (product_name, total_str, subline) = format_sale_item(
                ticket_item.line_item_product_name.as_str(),
                ticket_item.line_item_quantity,
                ticket_item.line_item_price,
                ticket_item.line_item_total,
            );
            printer.font(Font::C)?;
            printer.write(&product_name)?;
            //printer.bold(true)?;
            printer.write(&total_str)?;
            //printer.bold(false)?;
            printer.writeln("")?;
            if !subline.is_empty() {
                printer.font(Font::B)?;
                printer.writeln(&subline)?;
                printer.font(Font::C)?;
            }
        }
        printer.font(Font::A)?;
        printer.writeln("------------------------------------------")?;
        printer.bold(true)?;
        printer.font(Font::C)?;
        printer.bold(false)?; // Ensure bold is off for "TOTAL:"
        let total_str = format!("TOTAL ${:.2}", ticket_data.total_due);
        let (_total_label, total_amount) = total_str.split_at(6); // Split at "TOTAL:" (6 chars)
        let aligned_total_str = format!("{:>56}", total_str); // Full string for alignment
        let (aligned_label, aligned_amount) =
            aligned_total_str.split_at(aligned_total_str.len() - total_amount.len()); // Split aligned string
        printer.write(aligned_label)?; // Print "TOTAL:" non-bold
        printer.bold(true)?; // Turn on bold for amount
        printer.write(aligned_amount)?; // Print "$230950.00" bold
        printer.bold(false)?; // Turn off bold after
        printer.writeln("")?;

        // SU PAGO MXN
        let payment_str = format!("SU PAGO MXN: ${:.2}", ticket_data.pesos_paid);
        let (payment_label, payment_amount) = payment_str.split_once('$').unwrap();
        let label_padding = 56 - total_amount.len();
        let aligned_payment_label = format!("{:>label_padding$}", payment_label);
        printer.write(&aligned_payment_label)?;
        // Create aligned payment amount using the aligned_total_str as padding
        let amount_padding = total_amount.len();
        let payment_amount_formatted: String = format!("${}", payment_amount);
        let aligned_payment_amount: String =
            format!("{:>amount_padding$}", payment_amount_formatted);
        printer.writeln(&aligned_payment_amount)?;

        // SU PAGO USD
        let payment_str = format!("SU PAGO USD: ${:.2}", ticket_data.dollars_paid);
        let (payment_label, payment_amount) = payment_str.split_once('$').unwrap();
        let label_padding = 56 - total_amount.len();
        let aligned_payment_label = format!("{:>label_padding$}", payment_label);
        printer.write(&aligned_payment_label)?;
        // Create aligned payment amount using the aligned_total_str as padding
        let amount_padding = total_amount.len();
        let payment_amount_formatted: String = format!("${}", payment_amount);
        let aligned_payment_amount: String =
            format!("{:>amount_padding$}", payment_amount_formatted);
        printer.writeln(&aligned_payment_amount)?;

        // SU PAGO TARJETA
        let payment_str = format!("SU PAGO TARJETA: ${:.2}", ticket_data.cards_paid);
        let (payment_label, payment_amount) = payment_str.split_once('$').unwrap();
        let label_padding = 56 - total_amount.len();
        let aligned_payment_label = format!("{:>label_padding$}", payment_label);
        printer.write(&aligned_payment_label)?;
        // Create aligned payment amount using the aligned_total_str as padding
        let amount_padding = total_amount.len();
        let payment_amount_formatted = format!("${}", payment_amount);
        let aligned_payment_amount: String =
            format!("{:>amount_padding$}", payment_amount_formatted);
        printer.writeln(&aligned_payment_amount)?;

        // SU PAGO OTROS $50.00
        let payment_str = format!("SU PAGO OTROS: ${:.2}", ticket_data.others_paid);
        let (payment_label, payment_amount) = payment_str.split_once('$').unwrap();
        let label_padding = 56 - total_amount.len();
        let aligned_payment_label = format!("{:>label_padding$}", payment_label);
        printer.write(&aligned_payment_label)?;
        // Create aligned payment amount using the aligned_total_str as padding
        let amount_padding = total_amount.len();
        let payment_amount_formatted = format!("${}", payment_amount);
        let aligned_payment_amount: String =
            format!("{:>amount_padding$}", payment_amount_formatted);
        printer.writeln(&aligned_payment_amount)?;

        let result_dash = "-";
        let dashes_times_total_amount_len = result_dash.repeat(total_amount.len());
        let aligned_dash = format!("{:>56}", dashes_times_total_amount_len);
        printer.writeln(&aligned_dash)?;

        // SU CAMBIO
        let payment_str = format!("SU CAMBIO: ${:.2}", ticket_data.change);
        let (payment_label, payment_amount) = payment_str.split_once('$').unwrap();
        let label_padding = 56 - total_amount.len();
        let aligned_payment_label = format!("{:>label_padding$}", payment_label);
        printer.write(&aligned_payment_label)?;
        // Create aligned payment amount using the aligned_total_str as padding
        let amount_padding = total_amount.len();
        let payment_amount_formatted = format!("${}", payment_amount);
        let aligned_payment_amount: String =
            format!("{:>amount_padding$}", payment_amount_formatted);
        printer.bold(true)?;
        printer.writeln(&aligned_payment_amount)?;
        printer.bold(false)?;

        printer.writeln("")?;
        printer.writeln("")?;
        printer.writeln("")?;
        printer.justify(JustifyMode::CENTER)?;
        printer.bold(false)?;
        printer.writeln("! Muchas Gracias por su compra !")?;
        printer.bold(false)?;
        printer.writeln("")?;
        printer.writeln("")?;
        printer.writeln("")?;
        printer.print_cut()?;

        // If we reach this point, everything was successful.
        // We return Ok with a unit type `()` because we don't need a success value.
        Ok(())
    };

    // Now, we call our closure and `match` on its result.
    // Based on the outcome, we return the required String.
    match print_logic() {
        Ok(_) => {
            // If the closure returned Ok, it means printing was successful.
            "Printed successfully".to_string()
        }
        Err(e) => {
            // If the closure returned an Err, we format the error into a String.
            // This string will be returned to the caller.
            format!("Printing failed: {}", e)
        }
    }
}
