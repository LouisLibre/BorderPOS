import React from "react";
import { useState } from "react";
import { useDatabase } from "@/services/db";
import useGlobalStore from "@/hooks/useGlobalStore";

const itemsPerPage = 12;

export function Products({ refreshKey }) {
  const [items, setItems] = useState([]);
  const db = useDatabase();
  const addItem = useGlobalStore((state) => state.addItem);

  const loadProducts = async () => {
    try {
      const sql = await db.getConnection();

      const rows = await sql.select("SELECT * FROM products");
      setItems(rows);
      /*
      [{
      sku: "SKU-001", // <-- primary key
      vendor_sku: "VENDOR-001",
      product_name: "Test Product",
      price: 100,
      created_at: "2025-12-30 21:00:00",
      updated_at: "2025-12-30 21:00:00",
      },..]
      */
    } catch (err) {
      console.error("Error querying products:", err.message);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, [refreshKey]);

  const handleProductClick = (item) => {
    addItem({ ...item, quantity: 1 });
  };

  // TODO: Implement an optional nickname for each product to avoid truncation, this is done by Square POS
  return (
    <div className="p-4 flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 min-h-min">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleProductClick(item)}
              title={item.product_name}
              className={`aspect-square row-span-1 col-span-1 flex items-center justify-center px-2 py-1 text-sm border-2 rounded-lg hover:bg-accent overflow-hidden`}
            >
              <span className="line-clamp-4 w-full text-center">
                {item.product_name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
