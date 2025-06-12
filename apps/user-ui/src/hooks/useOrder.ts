import {
  CartItem,
  Coupon,
  orderService,
  VerifySessionResponse,
} from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export interface UseOrderReturn {
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  createSession: (
    selectedAddressId: string,
    coupon?: Coupon
  ) => Promise<string>;
  createPaymentIntent: (
    sellerStripeAccountId: string,
    amount: number
  ) => Promise<any>;
  verifySession: (sessionId: string) => Promise<VerifySessionResponse | null>;
  placeOrder: () => void;
  formData: {
    email: string;
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
  const { user } = useCurrentUser({ enabled: true });

  const [formData, setFormData] = useState({
    email: user?.email || "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Sync formData.email with user.email when user changes
  useEffect(() => {
    if (user?.email && formData.email !== user.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const { mutateAsync: createSessionMutate, isPending: isCreatingSession } =
    useMutation({
      mutationFn: (data: {
        cart: CartItem[];
        selectedAddressId: string;
        coupon?: Coupon;
      }) => orderService.createPaymentSession(data),
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        console.log("Session created in useOrder:", data.sessionId);
      },
      onError: (error: any) => {
        const errorMessage = error.message || "Failed to create session";
        setCouponError(errorMessage);
        toast.error("Session Error", { description: errorMessage });
        throw error; // Ensure error propagates to caller
      },
    });

  const createSession = useCallback(
    async (selectedAddressId: string, coupon?: Coupon): Promise<string> => {
      const cartItems: CartItem[] = items.map((item: any) => ({
        id: item.product.id,
        quantity: item.quantity,
        sale_price: item.product.sale_price,
        shopId: item.product.shopId,
        selectedOptions: item.selectedOptions || {},
      }));

      try {
        const response = await createSessionMutate({
          cart: cartItems,
          selectedAddressId,
          coupon,
        });
        return response.sessionId;
      } catch (error) {
        console.error("Create session failed in useOrder:", error);
        throw error;
      }
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
          amount,
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
    enabled: false,
    retry: 1,
  });

  const verifySession = useCallback(
    async (
      providedSessionId?: string
    ): Promise<VerifySessionResponse | null> => {
      const currentSessionId = providedSessionId || sessionId;
      if (!currentSessionId) {
        throw new Error("No session ID available");
      }

      try {
        const result = await verifySessionRefetch();
        return result.data ?? null;
      } catch (error) {
        console.error("Session verification failed:", error);
        throw error;
      }
    },
    [sessionId, verifySessionRefetch]
  );

  const placeOrder = useCallback(() => {
    toast.success("Order placed successfully! Confirmation will be sent soon.");
    setSessionId(null);
    setFormData({
      email: user?.email || "",
    });
    setCouponCode("");
    setDiscount(0);
    setCouponError("");
  }, [user]);

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
