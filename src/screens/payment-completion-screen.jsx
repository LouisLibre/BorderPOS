import React, { useState, useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import useGlobalStore from "@/hooks/useGlobalStore";

// trigger the update here, we have the paymentDetails

const PaymentCompletionScreen = ({ handleClose, paymentDetails }) => {
  const [countdown, setCountdown] = useState(5);
  const currentPrinter = useGlobalStore((state) => state.currentPrinter);

  console.log({ currentPrinter });

  const hasPrinted = useRef(false);

  async function printTicket(paymentDetails) {
    /*
    // console.log({ paymentDetails });
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
    console.log({ firstItem: paymentDetails.items[0] });
    const ticket_date_str =
      Array.isArray(paymentDetails.items) &&
      paymentDetails.items[0] &&
      paymentDetails.items[0].snapshot_created_at;
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

    const ticketData = {
      id: paymentDetails.ticketId.slice(0, 7),
      created_at: ticket_date_str_formatted,
      pesos_paid: paymentDetails.pesosPaid,
      dollars_paid: paymentDetails.dollarsPaid,
      cards_paid: paymentDetails.cardsPaid,
      others_paid: paymentDetails.othersPaid,
      total_due: paymentDetails.totalDue,
      change: paymentDetails.change,
      ticket_items: paymentDetails.items.map((item) => ({
        line_item_product_name: item.product_name,
        line_item_quantity: parseFloat(item.quantity),
        line_item_price: parseFloat(item.price),
        line_item_total:
          parseFloat(item.price) * parseFloat(item.quantity || 0),
      })),
    };
    console.log({ ticketData });
    const ok = await invoke("print_ticket", {
      ticketData: ticketData,
      vid: (currentPrinter && currentPrinter.vid) || 0,
      pid: (currentPrinter && currentPrinter.pid) || 0,
    });
    console.log({ ok });
  }

  useEffect(() => {
    if (!paymentDetails || hasPrinted.current) {
      return;
    }
    printTicket(paymentDetails);
    hasPrinted.current = true;
  }, [paymentDetails]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        // When countdown reaches 0, clear interval and close the screen
        if (prevCount <= 1) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, [handleClose]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Imprimiendo Ticket...</h2>
      <p className="mb-4">
        Esta pantalla se cerrará automáticamente en {countdown} segundos
      </p>
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleClose}
        >
          <Printer className="w-4 h-4" />
          Opciones de Imprimir
        </Button>
        <Button onClick={handleClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default PaymentCompletionScreen;
