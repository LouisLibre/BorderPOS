import React, { useEffect, useState } from "react";
import MainScreen from "@/screens/MainScreen/MainScreen";
import "@/assets/global.css";
import { useDatabase } from "@/services/db";
import { listen } from "@tauri-apps/api/event";

// Wrapper component for the application,
// which renders the MainScreen component and may include other global components
// such as routers, context providers, modals, etc.

// example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/App.tsx
// router example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/router/index.ts

export default function App() {
  const [importError, setImportError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const db = useDatabase();

  useEffect(() => {
    const unlisten = listen("import-csv-selected", (event) => {
      const csvContent = event.payload;
      handleCSVImport(csvContent);
    });

    const unlistenError = listen("import-csv-error", (event) => {
      setImportError(event.payload);
    });

    return () => {
      unlisten.then((f) => f());
      unlistenError.then((f) => f());
    };
  }, []);

  const handleCSVImport = async (csvContent) => {
    try {
      const sql = await db.getConnection();

      const lines = csvContent.trim().split("\n");
      // Skip the first line (header) and process the rest
      const dataLines = lines.slice(1);

      const products = dataLines.map((line) => {
        const columns = line.split(",").map((v) => v.trim());
        // Ensure each line has exactly 4 columns
        if (columns.length !== 4) {
          throw new Error(
            `Invalid row format: "${line}" does not have exactly 4 columns`
          );
        }
        const [category, code, product, price] = columns;
        return {
          sku: code,
          product_name: product,
          price: parseFloat(price),
          plu_code: code,
          barcode: null,
        };
      });

      for (const product of products) {
        // Validate price is a valid number
        if (isNaN(product.price)) {
          throw new Error(
            `Invalid price for product "${product.product_name}": "${product.price}"`
          );
        }
        await sql.execute(
          `
          INSERT OR REPLACE INTO products (sku, product_name, price, plu_code, barcode)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            product.sku,
            product.product_name,
            product.price,
            product.plu_code,
            product.barcode,
          ]
        );
      }

      console.log("Products imported successfully:", products);
      setRefreshKey((prev) => prev + 1);
      setImportError(null);
    } catch (error) {
      console.error("Error importing CSV:", error);
      setImportError(`Failed to import CSV file: ${error.message}`);
    }
  };

  return (
    <>
      <MainScreen refreshKey={refreshKey} importError={importError} />
    </>
  );
}
