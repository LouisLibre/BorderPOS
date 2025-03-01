import MainScreen from "@/screens/MainScreen/MainScreen";
import "@/assets/global.css";
import { useDatabase } from "@/services/db";

// Wrapper component for the application,
// which renders the MainScreen component and may include other global components
// such as routers, context providers, modals, etc.

// example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/App.tsx
// router example: https://github.com/EcoPasteHub/EcoPaste/blob/master/src/router/index.ts

export default function App() {
  const db = useDatabase();

  async function loadProducts() {
    /*try {
      const sql = await db.getConnection();

      console.log("Loading products...");
      const rows = await sql.select("SELECT * FROM products");
      console.log("Products loaded:", rows);
      setProducts(rows);
    } catch (err) {
      console.error("Error querying products:", err.message);
    }*/
  }

  return (
    <>
      <MainScreen />
    </>
  );
}
