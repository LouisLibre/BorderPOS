import { create } from "zustand";
import { DB } from "@/services/db";
import { invoke } from "@tauri-apps/api/core";

const defaultState = {
  cartItems: [],
  currentPrinter: null,
  /* 
    currentPrinter: 
      { manufacturer: "BIXOLON", 
        pid: 110, 
        product: 
        "SRP-330II", 
        vid: 5380
    }
  */
  printers: [],
  exchange_rate_usd_to_mxn: 20,
  isSettingsLoading: true,
  settingsError: null,
  renderTick: null,
};

const useGlobalStore = create((set, get) => ({
  ...defaultState,
  _initializeSettings: async () => {
    if (!get().isSettingsLoading) {
      set({ isSettingsLoading: true, settingsError: null });
    }
    try {
      const [printer, usbPrinters] = await Promise.all([
        DB.select_thermal_printer(),
        invoke("get_printers").catch((err) => {
          console.error("Error getting printers:", err);
          return []; // Return a default/fallback value
        }),
      ]);
      set({
        currentPrinter: printer || null,
        printers: Array.isArray(usbPrinters) ? usbPrinters : [],
        isSettingsLoading: false,
        settingsError: null,
      });
    } catch (err) {
      console.error("Error initializing settings:", err);
      set({
        currentPrinter: null,
        printers: [],
        isSettingsLoading: false,
        settingsError: err.message || "Failed to initialize settings",
      });
    }
  },
  setCurrentPrinter: async (printer) => {
    const previousPrinter = get().currentPrinter;
    set({ currentPrinter: printer });
    try {
      await DB.update_thermal_printer(printer);
    } catch (err) {
      console.error("Error saving printer:", err);
      set({ currentPrinter: previousPrinter });
    }
  },
  addItem: (item, quantityToAdd = 1) =>
    set((state) => {
      // Validate quantityToAdd
      const parsedQuantity = parseFloat(quantityToAdd);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        console.warn(
          `Invalid quantityToAdd: ${quantityToAdd}. Must be a positive number.`
        );
        return {}; // Return empty object to avoid mutating state
      }

      const existingItem = state.cartItems.find((i) => i.sku === item.sku);

      if (existingItem) {
        // If item exists, increment its quantity by quantityToAdd
        return {
          cartItems: state.cartItems.map((i) =>
            i.sku === item.sku
              ? { ...i, quantity: (i.quantity || 0) + parsedQuantity } // Use quantityToAdd // should be || 0 according to gemini mmm
              : i
          ),
        };
      }

      // If item doesn't exist, add it with quantity 1
      return {
        cartItems: [...state.cartItems, { ...item, quantity: parsedQuantity }],
      };
    }),
  removeItem: (sku) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.sku !== sku),
    })),
  updateItemQuantity: (sku, quantity) =>
    set((state) => {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity)) return {}; // No change if not a number
      const newQuantity = Math.max(0, parsedQuantity);
      if (newQuantity === 0) {
        // If quantity becomes zero, remove the item
        //return { cartItems: state.cartItems.filter((i) => i.sku !== sku) };
        console.log("Setting item to 0 with sku:", sku);
        return {
          cartItems: state.cartItems.map((item) =>
            item.sku === sku ? { ...item, quantity: 0 } : item
          ),
        };
      } else {
        return {
          cartItems: state.cartItems.map((item) =>
            item.sku === sku ? { ...item, quantity: newQuantity } : item
          ),
        };
      }
    }),
  clearCart: () => set({ cartItems: [] }),
  clearSettingsError: () => set({ settingsError: null }),
  set_usd_to_mxn_exchange_rate: (rate) => {
    const newRate = parseFloat(rate);
    console.log({ rate, newRate });
    if (!isNaN(newRate) && String(newRate) === String(rate).trim()) {
      set({ exchange_rate_usd_to_mxn: parseFloat(newRate.toFixed(2)) });
      console.log("New rate:", newRate);
    } else {
      // Keep the old rate
      console.log("Invalid rate:", rate);
      console.log("Old rate:", get().exchange_rate_usd_to_mxn);
      set({
        exchange_rate_usd_to_mxn: get().exchange_rate_usd_to_mxn,
        renderTick: new Date(),
      });
    }
  },
}));

useGlobalStore.getState()._initializeSettings();

export default useGlobalStore;
