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
  ) => Promise<string>;
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
  setFormData: (data: Partial<UseOrderReturn["formData"]>) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  couponError: string;
  setCouponError: (error: string) => void;
  total: number;
}

export const useOrder = (): UseOrderReturn => {
  const { items, getTotalPrice } = useCartStore();
  const { shippingAddress, user } = useCurrentUser({ enabled: true });
  const defaultShippingAddress = shippingAddress?.find(
    (addr) => addr.isDefault
  );

  const [sessionId, setSessionId] = useState<string | null>(null);
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

  const updateFormData = useCallback(
    (data: Partial<UseOrderReturn["formData"]>) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const { mutate: createSessionMutate, isPending: isCreatingSession } =
    useMutation({
      mutationFn: (data: {
        cart: CartItem[];
        selectedAddressId: string;
        coupon?: Coupon;
      }) => orderService.createPaymentSession(data),
      onSuccess: (data) => {
        setSessionId(data.sessionId);
        toast.success("Session created successfully");
      },
      onError: (error: any) => {
        setCouponError(error.message || "Failed to create session");
        toast.error("Session Error", { description: error.message });
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
      await createSessionMutate({ cart: cartItems, selectedAddressId, coupon });
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
    onSuccess: (data) => data.clientSecret,
  });

  const createPaymentIntent = useCallback(
    async (sellerStripeAccountId: string, amount: number) => {
      if (!sessionId) throw new Error("Session not created");
      const clientSecret = await createPaymentIntentMutate({
        sellerStripeAccountId,
        amount: Math.round(amount * 100),
        sessionId,
      });
      return clientSecret;
    },
    [sessionId, createPaymentIntentMutate]
  );

  const { refetch: verifySessionRefetch } = useQuery({
    queryKey: ["verifySession", sessionId],
    queryFn: () =>
      sessionId
        ? orderService.verifyPaymentSession(sessionId)
        : Promise.resolve(null),
    enabled: !!sessionId,
    retry: 1,
  });

  const verifySession =
    useCallback(async (): Promise<VerifySessionResponse | null> => {
      const result = await verifySessionRefetch();
      return result.data ?? null;
    }, [verifySessionRefetch]);

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

  const subtotal = getTotalPrice();
  const shipping =
    subtotal > 100 || (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;
  const total = subtotal + shipping - discount;
  const isLoading = isCreatingSession || isCreatingPaymentIntent;

  return {
    sessionId,
    isLoading,
    error: couponError,
    createSession,
    createPaymentIntent,
    verifySession,
    placeOrder,
    formData,
    setFormData: updateFormData,
    couponCode,
    setCouponCode,
    discount,
    setDiscount,
    couponError,
    setCouponError,
    total,
  };
};
