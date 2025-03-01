import { SearchBar } from "./sections/search-bar";
import { Products } from "./sections/products";
import { SalesBar } from "./sections/sales-bar";

function MainScreen() {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="flex flex-col w-[63%] border-r">
        <SearchBar />
        <Products />
      </div>
      <div className="w-[37%]">
        <SalesBar />
      </div>
    </div>
  );
}

export default MainScreen;
