import { create } from "zustand";

const useGlobalStore = create((set) => ({
  cartItems: [],
  addItem: (item, quantityToAdd = 1) =>
    set((state) => {
      // Validate quantityToAdd
      const parsedQuantity = parseFloat(quantityToAdd);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        console.warn(
          `Invalid quantityToAdd: ${quantityToAdd}. Must be a positive number.`
        );
        return state; // Return current state if quantity is invalid
      }

      const existingItem = state.cartItems.find((i) => i.sku === item.sku);

      if (existingItem) {
        // If item exists, increment its quantity by quantityToAdd
        return {
          cartItems: state.cartItems.map((i) =>
            i.sku === item.sku
              ? { ...i, quantity: (i.quantity || 1) + parsedQuantity } // Use quantityToAdd
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
      const newQuantity = Math.max(0, parsedQuantity);
      if (newQuantity === 0) {
        // If quantity becomes zero, remove the item
        return { cartItems: state.cartItems.filter((i) => i.sku !== sku) };
      } else {
        return {
          cartItems: state.cartItems.map((item) =>
            item.sku === sku ? { ...item, quantity: newQuantity } : item
          ),
        };
      }
    }),
  clearCart: () => set({ cartItems: [] }),
}));

export default useGlobalStore;
