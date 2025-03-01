import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const itemsPerPage = 12;

export function Products() {
  const [currentPage, setCurrentPage] = useState(0);

  // max 66 characters per name
  const items = [
    { type: "item", name: "Tortillas de Harina" },
    {
      type: "item",
      name: "Tortillas de Mantequilla 1kg",
    },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
    { type: "item", name: "Tortillas Integral" },
    { type: "item", name: "Tortillas Maiz 1kg" },
  ];

  return (
    <div className="p-4 flex-1 flex flex-col h-full overflow-y-auto">
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-4 min-h-min">
          {items.map((item, index) => (
            <button
              key={index}
              className={`aspect-square row-span-1 col-span-1 flex items-center justify-center px-2 py-1 text-sm border-2 rounded-lg hover:bg-accent overflow-hidden ${
                item.type === "group" ? "shadow-md" : ""
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
