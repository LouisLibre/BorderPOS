import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { invoke } from "@tauri-apps/api/core";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function print_ticket(ticket_data, printer_info) {
  /*
    // console.log({ ticket_data });
    {
    ticketId: 'sadfasdf',
    totalDue: 100,
    items: [
     {sku: "1008", plu_code: "1008", barcode: null, product_name: "Tortilla Burro", price: 65, qunantity: 1, snapshot_created_at: "2023-03-25T00:29:52.000Z"}
    ]
    dollarsPaid: payments.DOLLARS,
    pesosPaid: payments.CASH,
    cardsPaid: payments.CARD,
    othersPaid: payments.OTHER,
    totalPaid: parseFloat(calculateTotalPaid()),
    change: parseFloat(balanceDue) > 0 ? parseFloat(balanceDue) : 0,
    };
  */
  console.log({ firstItem: ticket_data.items[0] });
  const ticket_date_str =
    Array.isArray(ticket_data.items) &&
    ticket_data.items[0] &&
    ticket_data.items[0].created_at;
  const ticket_date = ticket_date_str
    ? new Date(ticket_date_str.replace(" ", "T"))
    : new Date();
  const ticket_date_str_formatted = ticket_date
    .toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(".", "")
    .replaceAll(" ", "/")
    .toUpperCase();

  const formatted_ticket_data = {
    id: ticket_data.ticketId.slice(0, 7),
    created_at: ticket_date_str_formatted,
    pesos_paid: ticket_data.pesosPaid,
    dollars_paid: ticket_data.dollarsPaid,
    cards_paid: ticket_data.cardsPaid,
    others_paid: ticket_data.othersPaid,
    total_due: ticket_data.totalDue,
    change: ticket_data.change,
    ticket_items: ticket_data.items.map((item) => ({
      line_item_product_name: item.line_item_product_name,
      line_item_quantity: parseFloat(item.line_item_quantity),
      line_item_price: parseFloat(item.line_item_price),
      line_item_total: parseFloat(item.line_item_total),
    })),
  };
  console.log({ ticket_data, formatted_ticket_data });
  const ok = await invoke("print_ticket", {
    ticketData: formatted_ticket_data,
    vid: (printer_info && printer_info.vid) || 0,
    pid: (printer_info && printer_info.pid) || 0,
  });
  console.log({ ok });
}
