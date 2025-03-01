import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useDatabase } from "@/services/db";

function PosApp() {
  const [greetMsg, setGreetMsg] = useState("");
  const [products, setProducts] = useState([]);
  const db = useDatabase();

  console.log("Rendering PosApp...");

  async function ipc_test(name) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name: `${name}, SR` }));
  }

  useEffect(() => {
    loadProducts();
    ipc_test("John Doe");
  }, []);

  useEffect(() => {
    console.log("Returned products:", products);
  }, [products]);

  useEffect(() => {
    console.log("Greet message:", greetMsg);
  }, [greetMsg]);

  const loadProducts = async () => {
    const appConfigDirPath = await appConfigDir();
    console.log("App config dir path:", appConfigDirPath);

    const _appDataDir = await appDataDir();
    console.log("App data dir:", _appDataDir);

    try {
      const sql = await db.getConnection();

      console.log("Loading products...");
      const rows = await sql.select("SELECT * FROM products");
      console.log("Products loaded:", rows);
      setProducts(rows);
    } catch (err) {
      console.error("Error querying products:", err.message);
    }
  };

  return <h1>POS App</h1>;
}
