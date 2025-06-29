import React, { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import useGlobalStore from "@/hooks/useGlobalStore";
import { useDatabase } from "@/services/db";

export default function ConfigScreen({ toggleDrawer }) {
  const setCurrentPrinter = useGlobalStore((state) => state.setCurrentPrinter);
  const currentPrinter = useGlobalStore((state) => state.currentPrinter);
  const set_usd_to_mxn_exchange_rate = useGlobalStore(
    (state) => state.set_usd_to_mxn_exchange_rate
  );
  const exchange_rate_usd_to_mxn = useGlobalStore(
    (state) => state.exchange_rate_usd_to_mxn
  );
  const renderTick = useGlobalStore((state) => state.renderTick);

  const [printers, setPrinters] = React.useState([]);
  const [exchangeRate, setExchangeRate] = React.useState(
    `${exchange_rate_usd_to_mxn}`
  );

  useEffect(() => {
    console.log("Setting exchange rate to:", exchange_rate_usd_to_mxn);
    setExchangeRate(exchange_rate_usd_to_mxn.toString());
  }, [exchange_rate_usd_to_mxn, renderTick]);

  const handleRateBlur = () => {
    // 4. onBlur updates the SLOW global state after parsing.
    set_usd_to_mxn_exchange_rate(exchangeRate);
  };

  const db = useDatabase();

  React.useEffect(() => {
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
    } else {
      setCurrentPrinter(null); // Clear selection if "Selecciona Impresora" is chosen
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
        {/* Changed: Applied p-4 for consistent padding around the settings content */}
        <div className="flex flex-col space-y-4 flex-1 p-4 bg-gray-50">
          {/* Printer Selection Row */}
          <div className="flex items-center">
            {/* Changed: Applied fixed width (w-72) and consistent margin (mr-4). shrink-0 prevents the label from shrinking. */}
            <div className="text-xl mr-4 w-60 shrink-0">Impresora</div>
            <div className="text-lg flex-1">
              {" "}
              {/* flex-1 allows the input wrapper to take remaining space */}
              <select
                className="bg-gray-50 border h-10 border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={handlePrinterSelect}
                value={
                  currentPrinter
                    ? `${currentPrinter.vid},${currentPrinter.pid}`
                    : ""
                }
              >
                <option value="">Selecciona Impresora</option>
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

          {/* Exchange Rate Row */}
          <div className="flex items-center">
            {/* Changed: Applied fixed width (w-72) and consistent margin (mr-4). shrink-0 prevents the label from shrinking. */}
            <div className="text-xl mr-4 w-60 shrink-0">
              Exchange Rate USD/MXN
            </div>
            <div className="text-lg flex-1">
              {" "}
              {/* flex-1 allows the input wrapper to take remaining space */}
              <input
                className="bg-gray-50 h-10 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                type="text"
                placeholder="Enter exchange rate"
                value={exchangeRate}
                onChange={(event) => setExchangeRate(event.target.value)}
                onBlur={handleRateBlur}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
