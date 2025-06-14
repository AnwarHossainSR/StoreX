import { create } from "zustand";

interface CheckoutState {
  activeTab: number;
  sessionCreated: boolean;
  setActiveTab: (tab: number) => void;
  triggerSessionCreation: () => void;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  activeTab: 1, // Start at Personal & Address tab
  sessionCreated: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  triggerSessionCreation: () => set({ sessionCreated: true }),
  resetCheckout: () => set({ activeTab: 1, sessionCreated: false }),
}));
