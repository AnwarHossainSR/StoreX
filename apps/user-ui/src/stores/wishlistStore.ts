import { sendKafkaEvent } from "@/actions/track-user";
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
    deviceInfo: any | null,
    user: any | null
  ) => void;
  removeItem: (
    id: string,
    userInfo: any | null,
    deviceInfo: any | null,
    user: any | null
  ) => void;
  clearWishlist: (userInfo: any | null, deviceInfo: any | null) => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, userInfo, deviceInfo, user: any = null) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            toast.info("Item Already in Wishlist", {
              description: `${product.title} is already in your wishlist.`,
              action: {
                label: "View Wishlist",
                onClick: () => (window.location.href = "/wishlist"),
              },
            });
            return state;
          }

          toast.success("Added to Wishlist", {
            description: `${product.title} added to your wishlist.`,
            action: {
              label: "View Wishlist",
              onClick: () => (window.location.href = "/wishlist"),
            },
          });

          if (user && user.id) {
            // send Kafka event
            sendKafkaEvent({
              userId: user.id,
              productId: product.id,
              shopId: product.shopId,
              action: "add_to_wishlist",
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
            items: [...state.items, { id: product.id, product }],
          };
        });
      },
      removeItem: (id, userInfo, deviceInfo, user: any = null) =>
        set((state) => {
          const item = state.items.find((item) => item.id === id);
          if (item) {
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

          if (user && user.id) {
            // send Kafka event
            sendKafkaEvent({
              userId: user.id,
              productId: item?.id,
              shopId: item?.product?.shopId,
              action: "remove_from_wishlist",
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
