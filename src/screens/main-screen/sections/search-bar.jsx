import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ searchTerm, setSearchTerm, onSearchSubmit }) {
  const handleInputChange = (event) => {
    console.log({ value: event.target.value });
    setSearchTerm(event.target.value); // Update state in parent
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission if wrapped in form
      onSearchSubmit(searchTerm); // Call the submit handler from parent
    }
    // Add other key handlers if needed (e.g., Escape to clear)
    if (event.key === "Escape") {
      setSearchTerm(""); // Clear search on Escape
    }
  };

  return (
    <div className="flex items-center flex-1 pr-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nombre de producto o código de barras"
          className="pl-10"
          value={searchTerm} // Control input value from parent state
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} // Add key down listener
        />
      </div>
    </div>
  );
}
