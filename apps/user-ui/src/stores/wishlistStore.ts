import { Product } from "@/types";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistItem {
  id: string; // Product ID
  product: Product;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (
    product: Product,
    userInfo: any | null,
    deviceInfo: any | null
  ) => void;
  removeItem: (
    id: string,
    userInfo: any | null,
    deviceInfo: any | null
  ) => void;
  clearWishlist: (userInfo: any | null, deviceInfo: any | null) => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, userInfo, deviceInfo) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            console.log(
              "Add Item - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.info("Item Already in Wishlist", {
              description: `${product.title} is already in your wishlist.`,
              action: {
                label: "View Wishlist",
                onClick: () => (window.location.href = "/wishlist"),
              },
            });
            return state;
          }
          console.log(
            "Add Item - User Info:",
            userInfo,
            "Device Info:",
            deviceInfo
          );
          toast.success("Added to Wishlist", {
            description: `${product.title} added to your wishlist.`,
            action: {
              label: "View Wishlist",
              onClick: () => (window.location.href = "/wishlist"),
            },
          });
          return {
            items: [...state.items, { id: product.id, product }],
          };
        });
      },
      removeItem: (id, userInfo, deviceInfo) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
            console.log(
              "Remove Item - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.success("Removed from Wishlist", {
              description: `${item.product.title} removed from your wishlist.`,
              action: {
                label: "Undo",
                onClick: () => {
                  set((current) => ({
                    items: [...current.items, item],
                  }));
                },
              },
            });
          }
          return {
            items: state.items.filter((item) => item.id !== id),
          };
        }),
      clearWishlist: (userInfo, deviceInfo) =>
        set((state) => {
          if (state.items.length > 0) {
            console.log(
              "Clear Wishlist - User Info:",
              userInfo,
              "Device Info:",
              deviceInfo
            );
            toast.success("Wishlist Cleared", {
              description: "All items have been removed from your wishlist.",
            });
          }
          return { items: [] };
        }),
      isInWishlist: (id) => get().items.some((item) => item.id === id),
      getTotalItems: () => get().items.length,
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
