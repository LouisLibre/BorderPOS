import React from "react";
import { useDatabase } from "@/services/db";
import useGlobalStore from "@/hooks/useGlobalStore";

const TicketModal = ({ isOpen, onClose, children }) => {
  const currentPrinter = useGlobalStore((state) => state.currentPrinter);
  // Close modal on Escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
      <div className="relative bg-white w-[500px] h-[500px] rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Ticket de Venta</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t text-right">
          <div className="flex items-center pr-2">
            {currentPrinter ? (
              <p>
                Selected Printer: {currentPrinter.manufacturer} -{" "}
                {currentPrinter.product} (VID: {currentPrinter.vid}, PID:{" "}
                {currentPrinter.pid})
              </p>
            ) : (
              <p>No printer selected</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="mr-3 px-4 py-2 bg-white text-black border border-gray-400 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-white text-black border border-gray-400 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Descargar PDF
          </button>
          {/* Add more footer buttons if needed */}
        </div>
      </div>
    </div>
  );
};

export default function SalesScreen({ toggleDrawer }) {
  const [sales, setSales] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentTicketID, setCurrentTicketID] = React.useState(null);
  const [currentTicket, setCurrentTicket] = React.useState(null);

  const db = useDatabase();

  const loadSales = async () => {
    try {
      const sql = await db.getConnection();
      const rows = await sql.select(
        "SELECT * FROM tickets ORDER BY created_at DESC"
      );
      console.log(rows);
      setSales(rows);
      /*
      [
          {
            "id": "d36905e9207ea637b92a475b87a9d683a2dfd573ee7d031383ae8ff43081de6d",
            "subtotal": 47,
            "taxes": 0,
            "total_due": 47,
            "dollars_paid": 5,
            "pesos_paid": 0,
            "cards_paid": 0,
            "others_paid": 0,
            "total_paid": 100,
            "change": 53,
            "cashier_name": "Cashier",
            "pos_id": "POS1",
            "created_at": "2025-03-25 00:29:52"
          },
          {
            "id": "dfa25714783fad435f822eab1c49debc2f19982415e59dfb4e20b0032da4acaf",
            "subtotal": 70,
            "taxes": 0,
            "total_due": 70,
            "dollars_paid": 0,
            "pesos_paid": 71.5,
            "cards_paid": 0,
            "others_paid": 0,
            "total_paid": 71.5,
            "change": 1.5,
            "cashier_name": "Cashier",
            "pos_id": "POS1",
            "created_at": "2025-03-25 00:31:03"
          }
        ]
  */
    } catch (err) {
      console.error("Error querying sales:", err.message);
      setSales([]);
    }
  };

  const loadTicket = async (ticketID) => {
    try {
      const sql = await db.getConnection();
      const rows = await sql.select(
        "SELECT * FROM ticket_items WHERE ticket_id = ?",
        [ticketID]
      );
      console.log(rows);
      setCurrentTicket(rows);
      //setTicket(rows[0]);
    } catch (err) {
      console.error("Error querying ticket:", err.message);
      setCurrentTicket(null);
    }
  };

  React.useEffect(() => {
    loadSales();
  }, []);

  React.useEffect(() => {
    loadTicket(currentTicketID);
  }, [currentTicketID]);

  return (
    <>
      <div className="flex flex-col h-screen w-full bg-background">
        <div className="flex border-b p-2 h-16">
          <div
            className="flex items-center justify-center w-10 h-10 bg-background rounded-full cursor-pointer pl-2 mr-2 pt-[6.5px]"
            onClick={toggleDrawer}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-9 w-9"
              fill="none"
              viewBox="0 0 24 24"
              stroke="rgb(60,60,60)"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
          <div className="flex items-center justify-center text-xl text-center">
            Listado de Ventas
          </div>
        </div>
        {/* 
          Sales Table
          Headers: ID | Date | Total | Actions
          Sample Data: 1 | 2023-01-01 | $100 MXN | Imprimir, PDF, Cancelar
        */}
        {/* Sales Table */}
        <div className="flex-1 flex flex-col overflow-y-auto py-6 bg-gray-50">
          <div className="w-full max-w-5xl mx-auto px-4">
            <table className="w-full table-auto bg-white shadow-sm overflow-hidden">
              <thead className="bg-gray-100 border-b border-t border-l border-r">
                <tr>
                  <th className="text-center px-6 py-3 text-gray-800 font-medium border-r">
                    Ticket ID
                  </th>
                  <th className="text-left px-6 py-3 text-gray-800 font-medium border-r">
                    Fecha
                  </th>
                  <th className="text-left px-6 py-3 text-gray-800 font-medium border-r">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-gray-800 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 border"
                  >
                    <td className="px-6 py-4 text-center text-gray-700 font-mono border-r">
                      {`${sale.id.slice(0, 7)}`}{" "}
                    </td>
                    <td className="px-6 py-4 text-gray-700 border-r">
                      {sale.created_at}
                    </td>
                    <td className="px-6 py-4 text-gray-700 border-r">
                      ${sale.total_due}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => {
                            setCurrentTicketID(sale.id);
                            setIsModalOpen(true);
                          }}
                          className="text-sm text-blue-600 flex items-center px-3 py-2 text-base font-medium bg-white border rounded-sm hover:shadow-[0px_1.5px_1px_0px_rgba(0,0,0,0.1)] hover:shadow-blue-300 cursor-pointer"
                        >
                          Abrir Ticket
                        </button>
                        <button className="text-sm text-red-600 flex items-center px-3 py-2 text-base font-medium bg-white border rounded-sm hover:shadow-[0px_1.5px_1px_0px_rgba(0,0,0,0.1)] hover:shadow-red-300 cursor-pointer">
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => {
          setCurrentTicketID(null);
          setCurrentTicket(null);
          setIsModalOpen(false);
        }}
      >
        <pre>
          Tortilleria Sinaloa
          <br />
          Ticked ID:{" "}
          {currentTicket &&
            Array.isArray(currentTicket) &&
            currentTicket[0] &&
            currentTicket[0].ticket_id.slice(0, 7)}
          <br />
          Fecha:{" "}
          {currentTicket &&
            Array.isArray(currentTicket) &&
            currentTicket[0] &&
            currentTicket[0].snapshot_created_at}
          <br />
          <br />
          {currentTicket &&
            currentTicket.map((item) => (
              <div>
                {item.line_item_product_name}
                <br />
                {item.line_item_quantity}
                <br />${item.line_item_price}
                <br />${item.line_item_total}
                <br />
                <br />
              </div>
            ))}
          Total: $
          {currentTicket &&
            currentTicket
              .reduce((sum, item) => {
                const itemTotal = item.line_item_total
                  ? parseFloat(item.line_item_total)
                  : parseFloat(item.line_item_price) *
                    parseFloat(item.line_item_quantity);
                return sum + (isNaN(itemTotal) ? 0 : itemTotal);
              }, 0)
              .toFixed(2)}
        </pre>
      </TicketModal>
    </>
  );
}
