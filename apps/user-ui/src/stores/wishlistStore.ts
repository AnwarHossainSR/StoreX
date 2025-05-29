import useDeviceInfo from "@/hooks/useDeviceInfo";
import useUserTracking from "@/hooks/useUserTracking";
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
  userInfo: any | null;
  deviceInfo: any | null;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
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

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      userInfo: null,
      deviceInfo: null,
      addItem: (product) => {
        const { userInfo, deviceInfo } = getTrackingInfo();
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            toast.info("Item Already in Wishlist", {
              description: `${product.title} is already in your wishlist.`,
              action: {
                label: "View Wishlist",
                onClick: () => (window.location.href = "/wishlist"),
              },
            });
            return { ...state, userInfo, deviceInfo }; // Update tracking info
          }
          toast.success("Added to Wishlist", {
            description: `${product.title} added to your wishlist.`,
            action: {
              label: "View Wishlist",
              onClick: () => (window.location.href = "/wishlist"),
            },
          });
          return {
            items: [...state.items, { id: product.id, product }],
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
            toast.success("Removed from Wishlist", {
              description: `${item.product.title} removed from your wishlist.`,
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
      clearWishlist: () =>
        set((state) => {
          const { userInfo, deviceInfo } = getTrackingInfo();
          if (state.items.length > 0) {
            toast.success("Wishlist Cleared", {
              description: "All items have been removed from your wishlist.",
            });
          }
          return { items: [], userInfo, deviceInfo };
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
