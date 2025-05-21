import React from "react";
import { invoke } from "@tauri-apps/api/core";
import useGlobalStore from "@/hooks/useGlobalStore";
import { useDatabase } from "@/services/db";

export default function ConfigScreen({ toggleDrawer }) {
  const [printers, setPrinters] = React.useState([]);

  const setCurrentPrinter = useGlobalStore((state) => state.setCurrentPrinter);
  const currentPrinter = useGlobalStore((state) => state.currentPrinter);

  const db = useDatabase();

  const db_select_thermal_printer = async () => {
    try {
      const sql = await db.getConnection();
      const result = await sql.select(
        "SELECT * FROM settings WHERE key = 'thermal_printer'"
      );
      if (result.length > 0) {
        return JSON.parse(result[0].value);
      }
      return null;
    } catch (err) {
      console.error("Error getting thermal_printer:", err);
      return null;
    }
  };

  const db_update_thermal_printer = async (printer) => {
    try {
      const sql = await db.getConnection();
      await sql.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        ["thermal_printer", JSON.stringify(printer)]
      );
    } catch (err) {
      console.error("Error setting thermal_printer:", err);
    }
  };

  React.useEffect(() => {
    db_select_thermal_printer().then((printer) => {
      setCurrentPrinter(printer);
    });

    invoke("get_printers")
      .then((_printers) => {
        setPrinters(_printers);
      })
      .catch((err) => {
        console.error("Error getting printers:", err);
      });

    // We have the case when get_printers returns an empty array and we have a previously printer saved in the database
    // it should probably then be added to the list of printers array but with a label of "(not connected)"
  }, []);

  const isPrinterConnected = currentPrinter
    ? printers.some(
        (p) => p.vid === currentPrinter.vid && p.pid === currentPrinter.pid
      )
    : true; // True when no printer is selected

  const handlePrinterSelect = (event) => {
    const selectedValue = event.target.value;
    console.log("Selected value:", selectedValue);

    if (selectedValue) {
      const [vid, pid] = selectedValue.split(",").map(Number);
      const selectedPrinter = printers.find(
        (printer) => printer.vid === vid && printer.pid === pid
      );
      setCurrentPrinter(selectedPrinter || null);
      db_update_thermal_printer(selectedPrinter || null);
    } else {
      setCurrentPrinter(null); // Clear selection if "Selecciona Impresora" is chosen
      db_update_thermal_printer(null);
    }
  };

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
            Configuración
          </div>
        </div>
        <div className="flex flex-1 py-2 pl-[18px] bg-gray-50">
          {/* Printer Selection: Printer Label then dropwdown with printers */}
          <div className="flex flex-1">
            <div className="text-xl mr-3">Impresora</div>
            <div className="text-lg w-100">
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={handlePrinterSelect}
                value={
                  currentPrinter
                    ? `${currentPrinter.vid},${currentPrinter.pid}`
                    : ""
                }
              >
                <option value="" disabled>
                  Selecciona Impresora
                </option>
                {printers.map((printer) => (
                  <option
                    key={`${printer.vid},${printer.pid}`}
                    value={`${printer.vid},${printer.pid}`}
                  >
                    {printer.manufacturer} - {printer.product}
                  </option>
                ))}
                {currentPrinter && !isPrinterConnected && (
                  <option value={`${currentPrinter.vid},${currentPrinter.pid}`}>
                    {currentPrinter.manufacturer} - {currentPrinter.product}{" "}
                    (printer not connected)
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
