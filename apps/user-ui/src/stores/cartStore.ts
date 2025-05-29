import { Product } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartItem {
  id: string; // Unique ID (productId + color + size)
  product: Product;
  quantity: number;
  color: string;
  size: string;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    color: string,
    size: string
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, color, size) => {
        const id = `${product.id}-${color}-${size}`;
        set((state) => {
          const existingItem = state.items.find((item) => item.id === id);
          if (existingItem) {
            // Item already in cart, show toast and don't modify cart
            // toast.info("Item Already in Cart", {
            //   description: `${product.title} (${color}, ${size}) is already in your cart.`,
            //   action: {
            //     label: "View Cart",
            //     onClick: () => (window.location.href = "/cart"),
            //   },
            // });
            return state; // No changes to cart
          }
          // Add new item, respecting stock limit
          const validQuantity = Math.max(1, Math.min(quantity, product.stock));
          return {
            items: [
              ...state.items,
              { id, product, quantity: validQuantity, color, size },
            ],
          };
        });
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.max(1, Math.min(quantity, item.product.stock)),
                }
              : item
          ),
        })),
      clearCart: () =>
        set({
          items: [],
        }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.quantity * item.product.sale_price,
          0
        ),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
