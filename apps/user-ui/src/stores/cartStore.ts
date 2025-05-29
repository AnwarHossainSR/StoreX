import useDeviceInfo from "@/hooks/useDeviceInfo";
import useUserTracking from "@/hooks/useUserTracking";
import { Product } from "@/types";
import { toast } from "sonner";
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
  userInfo: any | null;
  deviceInfo: any | null;
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

// Helper function to get user and device info
const getTrackingInfo = () => {
  const { userData, isLoading, error } = useUserTracking();
  const deviceInfo = useDeviceInfo();
  return {
    userInfo: !isLoading && !error ? userData : null,
    deviceInfo: deviceInfo || null,
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      userInfo: null,
      deviceInfo: null,
      addItem: (product, quantity, color, size) => {
        const { userInfo, deviceInfo } = getTrackingInfo();
        const id = `${product.id}-${color}-${size}`;
        set((state) => {
          const existingItem = state.items.find((item) => item.id === id);
          if (existingItem) {
            toast.info("Item Already in Cart", {
              description: `${product.title} (${color}, ${size}) is already in your cart.`,
              action: {
                label: "View Cart",
                onClick: () => (window.location.href = "/cart"),
              },
            });
            return { ...state, userInfo, deviceInfo }; // Update tracking info
          }
          const validQuantity = Math.max(1, Math.min(quantity, product.stock));
          toast.success("Added to Cart", {
            description: `${product.title} (x${validQuantity}, ${color}, ${size}) added to cart.`,
            action: {
              label: "View Cart",
              onClick: () => (window.location.href = "/cart"),
            },
          });
          return {
            items: [
              ...state.items,
              { id, product, quantity: validQuantity, color, size },
            ],
            userInfo,
            deviceInfo,
          };
        });
      },
      removeItem: (id) =>
        set((state) => {
          const { userInfo, deviceInfo } = getTrackingInfo();
          const item = state.items.find((item) => item.id === id);
          if (item) {
            toast.success("Item Removed", {
              description: `${item.product.title} removed from cart.`,
              action: {
                label: "Undo",
                onClick: () => {
                  set((current) => ({
                    ...current,
                    items: [...current.items, item],
                    userInfo,
                    deviceInfo,
                  }));
                },
              },
            });
          }
          return {
            items: state.items.filter((item) => item.id !== id),
            userInfo,
            deviceInfo,
          };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const { userInfo, deviceInfo } = getTrackingInfo();
          const item = state.items.find((item) => item.id === id);
          if (!item) return { ...state, userInfo, deviceInfo };

          if (quantity < 1) {
            toast.error("Invalid Quantity", {
              description: "Quantity cannot be less than 1.",
            });
            return { ...state, userInfo, deviceInfo };
          }
          if (quantity > item.product.stock) {
            toast.warning("Stock Limit Reached", {
              description: `Only ${item.product.stock} units available for ${item.product.title}.`,
            });
            return { ...state, userInfo, deviceInfo };
          }

          toast.success("Quantity Updated", {
            description: `${item.product.title} quantity changed to ${quantity}.`,
          });
          return {
            items: state.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: Math.max(
                      1,
                      Math.min(quantity, item.product.stock)
                    ),
                  }
                : item
            ),
            userInfo,
            deviceInfo,
          };
        }),
      clearCart: () =>
        set((state) => {
          const { userInfo, deviceInfo } = getTrackingInfo();
          if (state.items.length > 0) {
            toast.success("Cart Cleared", {
              description: "All items have been removed from your cart.",
            });
          }
          return { items: [], userInfo, deviceInfo };
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
