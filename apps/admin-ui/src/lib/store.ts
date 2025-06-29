import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SellerSignupState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  showOtp: boolean;
  setShowOtp: (show: boolean) => void;
  sellerId: string | null;
  setSellerId: (id: string | null) => void;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    name: string;
    bio: string;
    address: string;
    opening_hour: string;
    website: string;
    category: string;
    accountType: string;
    currency: string;
  };
  setFormData: (data: Partial<SellerSignupState["formData"]>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  agreeTerms: boolean;
  setAgreeTerms: (agree: boolean) => void;
  otp: string[];
  setOtp: (otp: string[]) => void;
  resetSignupState: () => void;
}

export const useSellerSignupStore = create<SellerSignupState>()(
  persist(
    (set) => ({
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
      showOtp: false,
      setShowOtp: (show) => set({ showOtp: show }),
      sellerId: null,
      setSellerId: (id) => set({ sellerId: id }),
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        name: "",
        bio: "",
        address: "",
        opening_hour: "",
        website: "",
        category: "",
        accountType: "individual",
        currency: "",
      },
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      errors: {},
      setErrors: (errors) => set({ errors }),
      agreeTerms: false,
      setAgreeTerms: (agree) => set({ agreeTerms: agree }),
      otp: ["", "", "", "", "", ""],
      setOtp: (otp) => set({ otp }),
      resetSignupState: () =>
        set({
          currentStep: 1,
          showOtp: false,
          sellerId: null,
          formData: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            country: "",
            name: "",
            bio: "",
            address: "",
            opening_hour: "",
            website: "",
            category: "",
            accountType: "individual",
            currency: "",
          },
          errors: {},
          agreeTerms: false,
          otp: ["", "", "", "", "", ""],
        }),
    }),
    {
      name: "seller-signup-storage", // Key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
