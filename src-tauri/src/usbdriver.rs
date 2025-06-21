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
// model ticket data
// figure out how to pass it into the function then worry about actually printing it
pub fn print_ticket(ticket_data: &ticket) -> String {
    /*
    print!("Hello, {}! Desde Rust!", ticket_id);
    // We define an inner function or a closure that performs the printing.
    // This closure IS allowed to return a Result and use the `?` operator.
    let print_logic = || -> Result<(), PrinterError> {
        // All the code that can fail goes inside here.
        let driver = UsbDriver::open(0x1504, 0x006e, None)?;
        let mut printer = Printer::new(driver, Protocol::default(), None);
        let print_msg = format!("Hello, {}! Desde Rust!", ticket_id);
        println!("This got executed");

        printer
            .init()?
            .debug_mode(Some(DebugMode::Dec))
            .justify(JustifyMode::CENTER)?
            .bold(true)?
            .writeln(print_msg.as_str())? // The `?` works here!
            .writeln("")?
            .writeln("")?
            .writeln("")?
            .writeln("")?
            .writeln("")?
            .writeln("")?
            .writeln("")?;

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
    */
    "Printed successfully".to_string()
}
