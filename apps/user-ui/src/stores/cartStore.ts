import { sendKafkaEvent } from "@/actions/track-user";
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
  addItem: (
    product: Product,
    quantity: number,
    color: string,
    size: string,
    userInfo: any | null,
    deviceInfo: any | null,
    user: any | null
  ) => void;
  removeItem: (
    id: string,
    userInfo: any | null,
    deviceInfo: any | null,
    user: any | null
  ) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    userInfo: any | null,
    deviceInfo: any | null
  ) => void;
  clearCart: (userInfo: any | null, deviceInfo: any | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (
        product,
        quantity,
        color,
        size,
        userInfo,
        deviceInfo,
        user: any = null
      ) => {
        const id = `${product.id}-${color}-${size}`;
        set((state) => {
          const existingItem = state.items.find((item) => item.id === id);
          if (existingItem) {
            console.log(
              "Add Item - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.info("Item Already in Cart", {
              description: `${product.title} (${color}, ${size}) is already in your cart.`,
              action: {
                label: "View Cart",
                onClick: () => (window.location.href = "/cart"),
              },
            });
            return state;
          }
          const validQuantity = Math.max(1, Math.min(quantity, product.stock));
          console.log(
            "Add Item - User Info:",
            userInfo,
            "Device Info:",
            deviceInfo
          );
          toast.success("Added to Cart", {
            description: `${product.title} (x${validQuantity}, ${color}, ${size}) added to cart.`,
            action: {
              label: "View Cart",
              onClick: () => (window.location.href = "/cart"),
            },
          });

          if (user && user.id) {
            // send Kafka event
            sendKafkaEvent({
              userId: user.id,
              productId: product.id,
              shopId: product.shopId,
              action: "add_to_cart",
              country: userInfo?.country,
              city: userInfo?.city,
              region: userInfo?.region,
              latitude: userInfo?.latitude,
              longitude: userInfo?.longitude,
              ip: userInfo?.ip,
              device: deviceInfo?.device?.type,
            });
          }

          return {
            items: [
              ...state.items,
              { id, product, quantity: validQuantity, color, size },
            ],
          };
        });
      },
      removeItem: (id, userInfo, deviceInfo, user: any = null) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
            console.log(
              "Remove Item - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.success("Item Removed", {
              description: `${item.product.title} removed from cart.`,
              action: {
                label: "Undo",
                onClick: () => {
                  set((current) => ({
                    items: [...current.items, item],
                  }));
                },
              },
            });

            if (user && user.id) {
              // send Kafka event
              sendKafkaEvent({
                userId: user.id,
                productId: item.product.id,
                shopId: item.product.shopId,
                action: "remove_from_cart",
                country: userInfo?.country,
                city: userInfo?.city,
                region: userInfo?.region,
                latitude: userInfo?.latitude,
                longitude: userInfo?.longitude,
                ip: userInfo?.ip,
                device: deviceInfo?.device?.type,
              });
            }
          }
          return {
            items: state.items.filter((item) => item.id !== id),
          };
        }),
      updateQuantity: (id, quantity, userInfo, deviceInfo) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (!item) return state;

          if (quantity < 1) {
            console.log(
              "Invalid Quantity - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.error("Invalid Quantity", {
              description: "Quantity cannot be less than 1.",
            });
            return state;
          }
          if (quantity > item.product.stock) {
            console.log(
              "Stock Limit - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.warning("Stock Limit Reached", {
              description: `Only ${item.product.stock} units available for ${item.product.title}.`,
            });
            return state;
          }

          console.log(
            "Update Quantity - User Info:",
            userInfo,
            "Device Info:",
            deviceInfo
          );
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
          };
        }),
      clearCart: (userInfo, deviceInfo) =>
        set((state) => {
          if (state.items.length > 0) {
            console.log(
              "Clear Cart - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.success("Cart Cleared", {
              description: "All items have been removed from your cart.",
            });
          }
          return { items: [] };
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
