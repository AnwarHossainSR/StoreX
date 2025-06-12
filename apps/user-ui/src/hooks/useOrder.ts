// src/hooks/useOrder.ts
import {
  CartItem,
  Coupon,
  orderService,
  VerifySessionResponse,
} from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export interface UseOrderReturn {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  createSession: (selectedAddressId: string, coupon?: Coupon) => Promise<void>;
  createPaymentIntent: (
    sellerStripeAccountId: string,
    amount: number
  ) => Promise<any>;
  verifySession: () => Promise<VerifySessionResponse | null>;
  placeOrder: () => void;
  formData: {
    email: string;
    name: string;
    address: string;
    apartment: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
    phone: string;
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  };
  setFormData: (
    data:
      | UseOrderReturn["formData"]
      | ((prev: UseOrderReturn["formData"]) => UseOrderReturn["formData"])
  ) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discount: number;
  couponError: string;
  setCouponError: (error: string) => void;
  total: number;
  validateCoupon: (code: string) => Promise<void>;
}

export const useOrder = (): UseOrderReturn => {
  const { items, getTotalPrice } = useCartStore();
  const { shippingAddress, user } = useCurrentUser({ enabled: true });
  const defaultShippingAddress = shippingAddress?.find(
    (addr) => addr.isDefault
  );

  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: defaultShippingAddress?.name || "",
    address: defaultShippingAddress?.address || "",
    apartment: "",
    city: defaultShippingAddress?.city || "",
    country: defaultShippingAddress?.country || "",
    state: defaultShippingAddress?.state || "",
    zipCode: defaultShippingAddress?.postalCode || "",
    phone: defaultShippingAddress?.phone || "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { mutate: createSessionMutate, isPending: isCreatingSession } =
    useMutation({
      mutationFn: (data: {
        cart: CartItem[];
        selectedAddressId: string;
        coupon?: Coupon;
      }) => orderService.createPaymentSession(data),
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        console.log("Session created:", data.sessionId);
      },
      onError: (error: any) => {
        const errorMessage = error.message || "Failed to create session";
        setCouponError(errorMessage);
        toast.error("Session Error", { description: errorMessage });
      },
    });

  const createSession = useCallback(
    async (selectedAddressId: string, coupon?: Coupon) => {
      const cartItems: CartItem[] = items.map((item: any) => ({
        id: item.product.id,
        quantity: item.quantity,
        sale_price: item.product.sale_price,
        shopId: item.product.shopId,
        selectedOptions: item.selectedOptions || {},
      }));

      return new Promise<void>((resolve, reject) => {
        createSessionMutate(
          { cart: cartItems, selectedAddressId, coupon },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });
    },
    [items, createSessionMutate]
  );

  const {
    mutateAsync: createPaymentIntentMutate,
    isPending: isCreatingPaymentIntent,
  } = useMutation({
    mutationFn: (data: {
      sellerStripeAccountId: string;
      amount: number;
      sessionId: string;
    }) => orderService.createPaymentIntent(data),
    onError: (error: any) => {
      toast.error("Payment Intent Error", {
        description: error.message || "Failed to create payment intent",
      });
    },
  });

  const createPaymentIntent = useCallback(
    async (sellerStripeAccountId: string, amount: number) => {
      if (!sessionId) {
        throw new Error("Session not created");
      }

      try {
        const response = await createPaymentIntentMutate({
          sellerStripeAccountId,
          amount: amount, // Pass amount in dollars, backend will convert to cents
          sessionId,
        });
        return response;
      } catch (error) {
        console.error("Payment intent creation failed:", error);
        throw error;
      }
    },
    [sessionId, createPaymentIntentMutate]
  );

  const { refetch: verifySessionRefetch } = useQuery({
    queryKey: ["verifySession", sessionId],
    queryFn: () =>
      sessionId
        ? orderService.verifyPaymentSession(sessionId)
        : Promise.resolve(null),
    enabled: false, // Only call manually
    retry: 1,
  });

  const verifySession =
    useCallback(async (): Promise<VerifySessionResponse | null> => {
      if (!sessionId) {
        throw new Error("No session ID available");
      }

      try {
        const result = await verifySessionRefetch();
        return result.data ?? null;
      } catch (error) {
        console.error("Session verification failed:", error);
        throw error;
      }
    }, [sessionId, verifySessionRefetch]);

  const placeOrder = useCallback(() => {
    toast.success("Order placed successfully! Confirmation will be sent soon.");
    setSessionId(null);
    setFormData({
      email: user?.email || "",
      name: defaultShippingAddress?.name || "",
      address: defaultShippingAddress?.address || "",
      apartment: "",
      city: defaultShippingAddress?.city || "",
      country: defaultShippingAddress?.country || "",
      state: defaultShippingAddress?.state || "",
      zipCode: defaultShippingAddress?.postalCode || "",
      phone: defaultShippingAddress?.phone || "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    });
    setCouponCode("");
    setDiscount(0);
    setCouponError("");
  }, [user, defaultShippingAddress]);

  const { mutateAsync: validateCouponMutate, isPending: isValidatingCoupon } =
    useMutation({
      mutationFn: (code: string) => orderService.validateCoupon(code),
      onSuccess: (data) => {
        const subtotal = getTotalPrice();
        let newDiscount = 0;

        if (data.discountType === "fixed") {
          newDiscount = data.discountValue || 0;
        } else if (data.discountType === "percentage") {
          newDiscount = ((data.discountValue || 0) * subtotal) / 100;
        }

        setDiscount(newDiscount);
        setCouponError("");
        toast.success("Coupon Applied", {
          description: `Coupon ${couponCode} applied successfully! Discount: $${newDiscount.toFixed(
            2
          )}`,
        });
      },
      onError: (error: any) => {
        const errorMessage = error.message || "Invalid coupon code";
        setCouponError(errorMessage);
        setDiscount(0);
        toast.error("Invalid Coupon", { description: errorMessage });
      },
    });

  const validateCoupon = useCallback(
    async (code: string) => {
      if (!code.trim()) {
        setCouponError("Please enter a coupon code");
        return;
      }
      await validateCouponMutate(code);
    },
    [validateCouponMutate]
  );

  const subtotal = getTotalPrice();
  const shipping =
    subtotal > 100 || (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;
  const total = Math.max(0, subtotal + shipping - discount);
  const isLoading =
    isCreatingSession || isCreatingPaymentIntent || isValidatingCoupon;

  return {
    sessionId,
    isLoading,
    error: couponError,
    createSession,
    createPaymentIntent,
    verifySession,
    placeOrder,
    formData,
    setFormData,
    couponCode,
    setCouponCode,
    discount,
    couponError,
    setCouponError,
    total,
    validateCoupon,
  };
};
