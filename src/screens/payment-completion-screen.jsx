import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";

const PaymentCompletionScreen = ({ handleClose, paymentDetails }) => {
  const [countdown, setCountdown] = useState(5);

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
