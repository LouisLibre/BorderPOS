import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const itemsPerPage = 12;

export function Products() {
  const [currentPage, setCurrentPage] = useState(0);

  // max 66 characters per name
  const items = [
    { type: "item", name: "Tortillas de Harina" },
    { type: "group", name: "Tortillas de Harina" },
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

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="p-4 flex-1 overflow-hidden flex flex-col">
      <div className="grid grid-flow-row-dense grid-cols-4 grid-rows-3 gap-4 flex-1 overflow-hidden">
        {displayedItems.map((item, index) => (
          <button
            key={index}
            className={`row-span-1 col-span-1 flex items-center justify-center px-2 py-1 text-sm border-2 rounded-lg hover:bg-accent overflow-hidden ${
              item.type === "group" ? "shadow-md" : ""
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="w-full flex justify-center items-center mt-6 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentPage === index ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
          }
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
