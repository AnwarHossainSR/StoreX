import apiClient from "@/lib/apiClient";

export interface CartItem {
  id: string;
  quantity: number;
  sale_price: number;
  shopId: string;
  selectedOptions?: Record<string, string>;
}

export interface Coupon {
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
  discountedProductId?: string;
}

export interface PaymentSessionResponse {
  sessionId: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  paymentIntentId: string;
  message?: string;
}

export interface VerifySessionResponse {
  success: boolean;
  message?: string;
  session: {
    userId: string;
    cart: CartItem[];
    sellers: {
      shopId: string;
      sellerId: string;
      stripeAccountId: string;
    }[];
    shopTotals: Record<string, number>;
    totalAmount: number;
    shippingAddressId: string;
    coupon: Coupon | null;
    orderIds: string[];
  };
  orders: {
    id: string;
    shopId: string;
    total: number;
    status: string;
    items: {
      productId: string;
      quantity: number;
      price: number;
      product: {
        title: string;
        images: { url: string }[];
      };
    }[];
  }[];
}

export interface CouponValidationResponse {
  success: boolean;
  message?: string;
  discountType?: "fixed" | "percentage";
  discountValue?: number;
}

export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: Record<string, any>;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: string;
  items: number;
  shopName: string;
  orderId: string;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  date: string;
  status: string;
  total: number;
  discountAmount: number;
  couponCode: string | null;
  shop: {
    name: string;
    address: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string;
    phone: string | null;
  } | null;
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    image: string | undefined;
    selectedOptions: Record<string, string> | null;
  }[];
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/orders`;

export const orderService = {
  async createPaymentSession(data: {
    cart: CartItem[];
    selectedAddressId: string;
    coupon?: Coupon;
  }): Promise<PaymentSessionResponse> {
    try {
      const response = await apiClient.post<PaymentSessionResponse>(
        `${API_BASE_URL}/create-payment-session`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to create payment session",
        {
          cause: errorData,
        }
      );
    }
  },

  async processFullPayment(data: {
    paymentMethodId: string;
    sessionId: string;
  }): Promise<ProcessPaymentResponse> {
    try {
      const response = await apiClient.post<ProcessPaymentResponse>(
        `${API_BASE_URL}/process-full-payment`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to process payment", {
        cause: errorData,
      });
    }
  },

  async verifyPaymentSession(
    sessionId: string
  ): Promise<VerifySessionResponse> {
    try {
      const response = await apiClient.get<VerifySessionResponse>(
        `${API_BASE_URL}/verify-payment-session?sessionId=${sessionId}`
      );
      return response.data;
    } catch (error: any) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      const errorMessage =
        errorData?.message || `Failed to verify session: ${error.message}`;
      console.error("verifyPaymentSession error:", {
        sessionId,
        errorMessage,
        errorData,
      });
      throw new Error(errorMessage, {
        cause: errorData || error,
      });
    }
  },

  async validateCoupon(code: string): Promise<CouponValidationResponse> {
    try {
      const response = await apiClient.post<CouponValidationResponse>(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/coupons/validate`,
        { code }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to validate coupon", {
        cause: errorData,
      });
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Order[] }>(
        `${API_BASE_URL}/get-all-orders`
      );
      if (!response.data.success) {
        throw new Error("Failed to fetch orders");
      }
      return response.data.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch orders", {
        cause: errorData,
      });
    }
  },

  async getSingleOrder(orderId: string): Promise<OrderDetails> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: OrderDetails;
      }>(`${API_BASE_URL}/get-order/${orderId}`);
      if (!response.data.success) {
        throw new Error("Failed to fetch order");
      }
      return response.data.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch order", {
        cause: errorData,
      });
    }
  },
};
