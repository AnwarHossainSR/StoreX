import apiClient, { withOptionalAuth } from "@/lib/apiClient";

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
  // Log out user
  async logout() {
    try {
      const response = await apiClient.post<ApiResponse<never>>("/logout");
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Logout failed", {
        cause: errorData,
      });
    }
  },

  // Initiate forgot password flow
  async forgotPassword(data: { email: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        "/forgot-password-user",
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

  // Verify OTP for forgot password
  async verifyForgotPassword(data: { email: string; otp: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        "/verify-forgot-password-user",
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

  // Reset user password
  async resetPassword(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        "/reset-password-user",
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

  // Resend OTP for registration or forgot password
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
        ? "/register-seller"
        : "/forgot-password-user";
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

  // Refresh access token
  async refreshToken() {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        "/refresh-token"
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Token refresh failed", {
        cause: errorData,
      });
    }
  },

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        "/logged-in-user",
        withOptionalAuth({})
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch user", {
        cause: errorData,
      });
    }
  },

  // Register a new seller
  async registerSeller(data: {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    country: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        "/register-seller",
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

  // Verify OTP for seller registration
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
        "/verify-seller-otp",
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

  // Log in a seller
  async sellerLogin(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        "/seller-login",
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
        "/create-shop",
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
};
