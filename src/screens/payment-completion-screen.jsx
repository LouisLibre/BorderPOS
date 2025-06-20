import React, { useState, useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

// trigger the update here, we have the paymentDetails

const PaymentCompletionScreen = ({ handleClose, paymentDetails }) => {
  const [countdown, setCountdown] = useState(5);

  const hasPrinted = useRef(false);

  async function printTicket(paymentDetails) {
    /*
    // console.log({ paymentDetails });
    ticketId: 'sadfasdf'
    cardsPaid: 0
    change: 0
    dollarsPaid: 0
    items: [
     {sku: "1008", plu_code: "1008", barcode: null, product_name: "Tortilla Burro", price: 65, …}
     {sku: "1007", plu_code: "1007", barcode: null, product_name: "Tortilla Integral Chica", price: 46, …}
     {sku: "1006", plu_code: "1006", barcode: null, product_name: "Tortilla Integral con azúcar", price: 75, …}
    ]
    othersPaid: 0
    pesosPaid: 278
    totalPaid: 278
                Array.isArray(currentTicket) &&
            currentTicket[0] &&
            currentTicket[0].ticket_id.slice(0, 7)}
    */
    const ticketData = {
      folio: paymentDetails.ticketId.slice(0, 7),
      fecha:
        (Array.isArray(paymentDetails.items) &&
          paymentDetails.items[0] &&
          paymentDetails.items[0].created_at) ||
        "",
      pesos_paid: paymentDetails.pesosPaid,
      dollars_paid: paymentDetails.dollarsPaid,
      cards_paid: paymentDetails.cardsPaid,
      others_paid: paymentDetails.othersPaid,
      change_due: paymentDetails.change,
      total_due: paymentDetails.totalDue,
      productos: paymentDetails.items.map((item) => ({
        nombre: item.product_name,
        cantidad: parseFloat(item.quantity),
        precio: parseFloat(item.price),
        total: parseFloat(item.price) * parseFloat(item.quantity || 0),
      })),
    };
    console.log({ ticketData });
    const ok = await invoke("print_ticket", { ticketData: ticketData });
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
