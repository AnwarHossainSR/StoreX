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

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
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

  async createPaymentIntent(data: {
    amount: number;
    sellerStripeAccountId: string;
    sessionId: string;
  }): Promise<PaymentIntentResponse> {
    try {
      const response = await apiClient.post<PaymentIntentResponse>(
        `${API_BASE_URL}/create-payment-intent`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to create payment intent", {
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
};
