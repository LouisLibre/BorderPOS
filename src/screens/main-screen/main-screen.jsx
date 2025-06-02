import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SearchBar } from "./sections/search-bar";
import { Products } from "./sections/products";
import { SalesBar } from "./sections/sales-bar";
import { useDatabase } from "@/services/db";
import useGlobalStore from "@/hooks/useGlobalStore";

function MainScreen({ refreshKey, importError, toggleDrawer }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allItems, setAllItems] = useState([]);

  const addItem = useGlobalStore((state) => state.addItem);

  const db = useDatabase();

  const loadProducts = async () => {
    try {
      const sql = await db.getConnection();
      const rows = await sql.select("SELECT * FROM products");
      setAllItems(rows);
    } catch (err) {
      console.error("Error querying products:", err.message);
      setAllItems([]); // Set to empty array on error
    }
  };

  useEffect(() => {
    loadProducts();
  }, [refreshKey]); // Reload products when refreshKey changes

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return allItems;
    }

    let effectiveSearchTerm = searchTerm.toLowerCase().trim();

    // If multiplier pattern detected, use term before '*'
    if (effectiveSearchTerm.includes("*")) {
      const parts = effectiveSearchTerm.split("*").map((p) => p.trim());

      // Only use the part before '*' if it exists
      if (parts.length >= 2 && parts[0]) {
        effectiveSearchTerm = parts[0];
      }
      // Otherwise fall back to regular search with original term
    }

    // Single filter implementation used for both cases
    return allItems.filter((item) => {
      const nameMatch = item.product_name
        .toLowerCase()
        .includes(effectiveSearchTerm);
      const pluMatch =
        item.plu_code &&
        item.plu_code.toLowerCase().includes(effectiveSearchTerm);
      const barcodeMatch =
        item.barcode &&
        item.barcode.toLowerCase().includes(effectiveSearchTerm);

      return nameMatch || pluMatch || barcodeMatch;
    });
  }, [searchTerm, allItems]);

  const handleSearchSubmit = useCallback(
    (currentSearchTerm) => {
      const lowerCaseSearchTerm = currentSearchTerm.toLowerCase().trim();
      let quantity = 1; // Default quantity

      // --- Check for multiplier pattern ---
      if (lowerCaseSearchTerm.includes("*")) {
        const parts = lowerCaseSearchTerm.split("*").map((p) => p.trim());

        // Check for valid pattern: [search_term] * [quantity_string]
        if (parts.length === 2 && parts[0] && parts[1]) {
          const parsedQuantity = parseFloat(parts[1]);

          // Validate quantity
          if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
            quantity = parsedQuantity; // Use parsed quantity if valid
          } else {
            console.warn(
              `Invalid quantity "${parts[1]}" in multiplier pattern.`
            );
            return false;
          }
        } else {
          console.warn(`Invalid multiplier pattern: "${currentSearchTerm}"`);
          // Continue using default quantity = 1
        }
      }

      // Try to add item with determined quantity
      if (filteredItems.length > 0) {
        addItem(filteredItems[0], quantity);
        setSearchTerm(""); // Clear search bar
        return true;
      }

      // If neither multiplier nor single match logic applied
      return false;
    },
    [filteredItems, addItem, setSearchTerm]
  );

  return (
    <>
      <div className="flex h-screen w-full bg-background">
        <div className="flex flex-col w-[60%] border-r">
          <div className="flex flex-row border-b p-2 h-16">
            {/* Hamburger Icon */}
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
            {/* Search Bar */}
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
          <Products items={filteredItems} />
        </div>
        <div className="w-[40%]">
          <SalesBar />
        </div>
      </div>
    </>
  );
}

export default MainScreen;
