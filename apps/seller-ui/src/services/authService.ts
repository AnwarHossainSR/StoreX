// services/authService.ts
import apiClient from "@/lib/apiClient";

const AUTH_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`;

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;
}

export interface ApiResponse<T> {
  message: string;
  user?: T;
  access_token?: string;
  sellerId?: string;
  seller?: Seller;
  accountLink?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: any;
}

export const authService = {
  async logout() {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/logout-seller`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Logout failed", {
        cause: errorData,
      });
    }
  },

  async forgotPassword(data: { email: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/forgot-password-user`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Forgot password request failed", {
        cause: errorData,
      });
    }
  },

  async verifyForgotPassword(data: { email: string; otp: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/verify-forgot-password-user`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "OTP verification failed", {
        cause: errorData,
      });
    }
  },

  async resetPassword(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/reset-password-user`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Password reset failed", {
        cause: errorData,
      });
    }
  },

  async resendOtp(data: {
    email: string;
    type: "register" | "forgot" | "seller-register";
    name?: string;
    password?: string;
    phone_number?: string;
    country?: string;
  }) {
    const endpoint =
      data.type === "seller-register"
        ? `${AUTH_BASE_URL}/register-seller`
        : `${AUTH_BASE_URL}/forgot-password-user`;
    const payload =
      data.type === "seller-register"
        ? {
            name: data.name,
            email: data.email,
            password: data.password,
            phone_number: data.phone_number,
            country: data.country,
          }
        : { email: data.email };

    try {
      const response = await apiClient.post<ApiResponse<never>>(
        endpoint,
        payload
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Resend OTP failed", {
        cause: errorData,
      });
    }
  },

  async refreshToken() {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/refresh-token`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Token refresh failed", {
        cause: errorData,
      });
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `${AUTH_BASE_URL}/logged-in-seller`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch user", {
        cause: errorData,
      });
    }
  },

  async registerSeller(data: {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    country: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/register-seller`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Seller registration failed", {
        cause: errorData,
      });
    }
  },

  async verifySellerOtp(data: {
    email: string;
    otp: string;
    password: string;
    name: string;
    phone_number: string;
    country: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/verify-seller-otp`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Seller OTP verification failed", {
        cause: errorData,
      });
    }
  },

  async sellerLogin(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        `${AUTH_BASE_URL}/seller-login`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Seller login failed", {
        cause: errorData,
      });
    }
  },

  async createShop(data: {
    sellerId: string;
    name: string;
    bio: string;
    address: string;
    opening_hour: string;
    website?: string;
    category: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/create-shop`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Shop creation failed", {
        cause: errorData,
      });
    }
  },

  async createStripeConnectAccount(
    sellerId: string,
    country: string,
    currency: string
  ) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${AUTH_BASE_URL}/create-stripe-connect-account`,
        { sellerId, country, currency }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to create Stripe Connect account",
        {
          cause: errorData,
        }
      );
    }
  },
};
