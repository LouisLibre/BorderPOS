import Database from "@tauri-apps/plugin-sql";
import { listen } from "@tauri-apps/api/event";
import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";

info("DB.js");

export class DB {
  static #connection = null;

  static async getConnection() {
    if (!this.#connection) {
      try {
        this.#connection = await Database.load("sqlite:pos_demo.db");
      } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
      }
    }
    return this.#connection;
  }

  static async query(sql, params = []) {
    const db = await this.getConnection();
    return db.execute(sql, params);
  }

  static async close() {
    if (this.#connection) {
      await this.#connection.close();
      this.#connection = null;
    }
  }

  static async select_thermal_printer() {
    try {
      const sql = await this.getConnection();
      const result = await sql.select(
        "SELECT * FROM settings WHERE key = 'thermal_printer'"
      );
      if (result.length > 0) {
        return JSON.parse(result[0].value);
      }
      return null;
    } catch (err) {
      console.error("Error getting thermal_printer:", err);
      return null;
    }
  }

  static async update_thermal_printer(printer) {
    try {
      const sql = await this.getConnection();
      await sql.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        ["thermal_printer", JSON.stringify(printer)]
      );
    } catch (err) {
      console.error("Error setting thermal_printer:", err);
    }
  }

  static async get_exchange_rate() {
    try {
      const db = await this.getConnection();
      const result = await db.select(
        "SELECT value FROM settings WHERE key = 'exchange_rate_usd_to_mxn'"
      );
      if (result.length > 0) {
        const rate = parseFloat(result[0].value);
        return isNaN(rate) ? 20.0 : rate; // Default to 20.0 if invalid
      }
      return 20.0; // Default if no rate is found
    } catch (err) {
      console.error("Error retrieving exchange rate:", err);
      error(`Error retrieving exchange rate: ${err}`);
      return 20.0; // Default on error
    }
  }

  static async update_exchange_rate(rate) {
    try {
      const db = await this.getConnection();
      const fixedRate = rate.toFixed(2); // Ensure 2 decimal places
      await db.execute(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
        ["exchange_rate_usd_to_mxn", fixedRate]
      );
      info(`Exchange rate updated to ${fixedRate}`);
    } catch (err) {
      console.error("Error updating exchange rate:", err);
      error(`Error updating exchange rate: ${err}`);
      throw err;
    }
  }
}

export function useDatabase() {
  return DB;
}

// Handles window close button ("X")
const unlisten = await getCurrentWindow().onCloseRequested(async (event) => {
  event.preventDefault();
  if (!isClosing) {
    await handleCloseOrQuit();
  }
});

// BUG: NOT WORKING ON MAC OS X
// Low priority because Rust itself takes care of closing the db
// Handle CMD+Q and other quit events
await listen("tauri://close-requested", async () => {
  if (!isClosing) {
    await handleCloseOrQuit();
  }
});

await listen("trigger-cleanup", async () => {
  info("Triggering cleanup...");
  if (!isClosing) {
    await handleCloseOrQuit();
  }
});

let isClosing = false;

async function handleCloseOrQuit() {
  isClosing = true;
  console.log("Tauri is closing. Closing DB connection...");
  info("Tauri is closing. Closing DB connection...");

  try {
    await DB.close();
    console.log("DB connection closed successfully.");
    info("DB connection closed successfully.");
  } catch (error) {
    console.error("Error closing DB connection:", error);
    error("Error closing DB connection:", error);
  } finally {
    getCurrentWindow().destroy();
  }
}
