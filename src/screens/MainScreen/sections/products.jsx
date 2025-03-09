import React from "react";
import { useState } from "react";
import { useDatabase } from "@/services/db";

const itemsPerPage = 12;

export function Products() {
  const [items, setItems] = useState([]);
  const db = useDatabase();

  const loadProducts = async () => {
    try {
      const sql = await db.getConnection();

      const rows = await sql.select("SELECT * FROM products");
      setItems(rows);
    } catch (err) {
      console.error("Error querying products:", err.message);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  // max 66 characters per name

  return (
    <div className="p-4 flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 min-h-min">
          {items.map((item, index) => (
            <button
              key={index}
              className={`aspect-square row-span-1 col-span-1 flex items-center justify-center px-2 py-1 text-sm border-2 rounded-lg hover:bg-accent overflow-hidden`}
            >
              {item.product_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
