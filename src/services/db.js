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
