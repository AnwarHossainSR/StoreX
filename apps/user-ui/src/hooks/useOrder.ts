import {
  CartItem,
  Coupon,
  Order,
  OrderDetails,
  orderService,
  VerifySessionResponse,
} from "@/services/orderService";
import { useCartStore } from "@/stores/cartStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  processFullPayment: (paymentMethodId: string) => Promise<any>;
  verifySession: (sessionId?: string) => Promise<VerifySessionResponse | null>;
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
  resetSession: () => void;
  getAllOrders: () => Promise<Order[]>;
  getSingleOrder: (orderId: string) => Promise<OrderDetails>;
}

export const useOrder = (): UseOrderReturn => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useCurrentUser({ enabled: true });

  const [formData, setFormData] = useState({
    email: user?.email || "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email && formData.email !== user.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setError(null);
    setCouponError("");
    setDiscount(0);
    setCouponCode("");
  }, []);

  const { mutateAsync: createSessionMutate, isPending: isCreatingSession } =
    useMutation({
      mutationFn: (data: {
        cart: CartItem[];
        selectedAddressId: string;
        coupon?: Coupon;
      }) => orderService.createPaymentSession(data),
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        setError(null);
        console.log("Session created successfully:", data.sessionId);
      },
      onError: (error: any) => {
        const errorMessage = error.message || "Failed to create session";
        setError(errorMessage);
        setCouponError(errorMessage);
        console.error("Session creation failed:", errorMessage);
        throw error;
      },
    });

  const createSession = useCallback(
    async (selectedAddressId: string, coupon?: Coupon): Promise<string> => {
      try {
        setError(null);

        const cartItems: CartItem[] = items.map((item: any) => ({
          id: item.product.id,
          quantity: item.quantity,
          sale_price: item.product.sale_price,
          shopId: item.product.shopId,
          selectedOptions: item.selectedOptions || {},
        }));

        if (cartItems.length === 0) {
          throw new Error("Cart is empty");
        }

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await createSessionMutate({
              cart: cartItems,
              selectedAddressId,
              coupon,
            });

            console.log(
              `Session created on attempt ${attempt}:`,
              response.sessionId
            );
            return response.sessionId;
          } catch (error: any) {
            console.warn(
              `Create session attempt ${attempt} failed:`,
              error.message
            );

            if (attempt === maxRetries) {
              throw new Error(
                error.message || "Failed to create session after retries"
              );
            }

            await new Promise((resolve) => setTimeout(resolve, attempt * 500));
          }
        }

        throw new Error("Failed to create session after retries");
      } catch (error: any) {
        console.error("Create session error:", error);
        setError(error.message);
        throw error;
      }
    },
    [items, createSessionMutate]
  );

  const {
    mutateAsync: processFullPaymentMutate,
    isPending: isProcessingPayment,
  } = useMutation({
    mutationFn: (data: { paymentMethodId: string; sessionId: string }) =>
      orderService.processFullPayment(data),
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to process payment";
      setError(errorMessage);
      toast.error("Payment Error", {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      clearCart(null, null);
      placeOrder();
    },
  });

  const processFullPayment = useCallback(
    async (paymentMethodId: string) => {
      try {
        if (!sessionId) {
          throw new Error("Session not created");
        }

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const response = await processFullPaymentMutate({
              paymentMethodId,
              sessionId,
            });

            console.log(`Payment processed on attempt ${attempt}:`, response);
            return response;
          } catch (error: any) {
            console.warn(
              `Process payment attempt ${attempt} failed:`,
              error.message
            );

            if (attempt === maxRetries) {
              throw new Error(
                error.message || "Failed to process payment after retries"
              );
            }

            await new Promise((resolve) => setTimeout(resolve, attempt * 500));
          }
        }

        throw new Error("Failed to process payment after retries");
      } catch (error: any) {
        console.error("Process payment error:", error);
        setError(error.message);
        throw error;
      }
    },
    [sessionId, processFullPaymentMutate]
  );

  const { refetch: verifySessionRefetch } = useQuery({
    queryKey: ["verifySession", sessionId],
    queryFn: () =>
      sessionId
        ? orderService.verifyPaymentSession(sessionId)
        : Promise.resolve(null),
    enabled: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const verifySession = useCallback(
    async (
      providedSessionId?: string
    ): Promise<VerifySessionResponse | null> => {
      try {
        const currentSessionId = providedSessionId || sessionId;

        if (!currentSessionId) {
          throw new Error("No session ID available");
        }

        console.log("Verifying session:", currentSessionId);

        const result = await verifySessionRefetch();

        if (!result.data) {
          throw new Error("No session data received");
        } else {
          setError(null);
        }

        if (!result.data.success) {
          const errorMessage =
            result.data.message || "Session verification failed";
          console.error("Session verification failed:", {
            sessionId: currentSessionId,
            message: errorMessage,
            response: result.data,
          });
          throw new Error(errorMessage);
        }

        console.log("Session verified successfully:", result.data);
        return result.data;
      } catch (error: any) {
        console.error("Session verification error:", {
          message: error.message,
          sessionId: providedSessionId || sessionId,
        });
        setError(error.message || "Failed to verify session");
        throw error;
      }
    },
    [sessionId, verifySessionRefetch]
  );

  const placeOrder = useCallback(() => {
    try {
      clearCart(null, null);
      resetSession();

      setFormData({
        email: user?.email || "",
      });

      toast.success(
        "Order placed successfully! Confirmation will be sent soon."
      );
    } catch (error: any) {
      console.error("Error during order placement:", error);
      toast.error("Error completing order placement");
    }
  }, [user, clearCart, resetSession]);

  const { mutateAsync: validateCouponMutate, isPending: isValidatingCoupon } =
    useMutation({
      mutationFn: (code: string) => orderService.validateCoupon(code),
      onSuccess: (data) => {
        try {
          const subtotal = getTotalPrice();
          let newDiscount = 0;

          if (data.discountType === "fixed") {
            newDiscount = data.discountValue || 0;
          } else if (data.discountType === "percentage") {
            newDiscount = Math.min(
              ((data.discountValue || 0) * subtotal) / 100,
              subtotal
            );
          }

          setDiscount(newDiscount);
          setCouponError("");
          setError(null);

          toast.success("Coupon Applied", {
            description: `Coupon ${couponCode} applied successfully! Discount: $${newDiscount.toFixed(
              2
            )}`,
          });
        } catch (error: any) {
          console.error("Error processing coupon success:", error);
          setCouponError("Error applying coupon");
        }
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
      try {
        if (!code.trim()) {
          setCouponError("Please enter a coupon code");
          return;
        }

        setCouponError("");
        await validateCouponMutate(code);
      } catch (error: any) {
        console.error("Coupon validation error:", error);
        setCouponError(error.message || "Failed to validate coupon");
        throw error;
      }
    },
    [validateCouponMutate]
  );

  const getAllOrders = useCallback(async () => {
    try {
      const orders = await orderService.getAllOrders();
      return orders;
    } catch (error: any) {
      setError(error.message || "Failed to fetch orders");
      throw error;
    }
  }, []);

  const getSingleOrder = useCallback(async (orderId: string) => {
    try {
      const order = await orderService.getSingleOrder(orderId);
      return order;
    } catch (error: any) {
      setError(error.message || "Failed to fetch order");
      throw error;
    }
  }, []);

  const subtotal = getTotalPrice();
  const shipping = useMemo(() => {
    return subtotal > 100 ||
      (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;
  }, [subtotal, couponCode, couponError]);

  const total = Math.max(0, subtotal + shipping - discount);

  const isLoading =
    isCreatingSession || isProcessingPayment || isValidatingCoupon;

  return {
    sessionId,
    isLoading,
    error,
    createSession,
    processFullPayment,
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
    resetSession,
    getAllOrders,
    getSingleOrder,
  };
};
