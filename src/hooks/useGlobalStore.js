import { create } from "zustand";

const useGlobalStore = create((set) => ({
  cartItems: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.cartItems.find((i) => i.sku === item.sku);

      if (existingItem) {
        // If item exists, increment its quantity
        return {
          cartItems: state.cartItems.map((i) =>
            i.sku === item.sku ? { ...i, quantity: (i.quantity || 1) + 1 } : i
          ),
        };
      }

      // If item doesn't exist, add it with quantity 1
      return {
        cartItems: [...state.cartItems, { ...item, quantity: 1 }],
      };
    }),
  removeItem: (sku) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.sku !== sku),
    })),
  updateItemQuantity: (sku, quantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.sku === sku ? { ...item, quantity } : item
      ),
    })),
  clearCart: () => set({ cartItems: [] }),
}));

export default useGlobalStore;
