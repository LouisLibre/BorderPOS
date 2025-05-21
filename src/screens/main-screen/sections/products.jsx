import React from "react";
import { useState } from "react";
import { useDatabase } from "@/services/db";
import useGlobalStore from "@/hooks/useGlobalStore";

const itemsPerPage = 12;

export function Products({ items = [] }) {
  const addItem = useGlobalStore((state) => state.addItem);

  const handleProductClick = (item) => {
    addItem(item); // Default quantity is 1
  };

  // TODO: Implement an optional nickname for each product to avoid truncation, this is done by Square POS
  return (
    <div className="p-4 flex-1 flex flex-col h-full overflow-y-auto pt-[10px]">
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 min-h-min">
          {items.map((item, index) => (
            <button
              key={item.sku}
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
