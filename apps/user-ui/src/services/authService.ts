// services/authService.ts
import apiClient from "@/lib/apiClient";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  user?: T;
  access_token?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  points: number;
  updatedAt: string;
}

export interface UserWithAddresses {
  id: number;
  shippingAddresses: ShippingAddress[];
}

export interface ShippingAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: any;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth`;

export const authService = {
  // Register a new user
  async register(data: { name: string; email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${API_BASE_URL}/register`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Registration failed", {
        cause: errorData,
      });
    }
  },

  // Verify OTP for user registration
  async verifyOtp(data: {
    email: string;
    otp: string;
    password: string;
    name: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${API_BASE_URL}/verify-otp`,
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

  // Log in a user
  async login(data: { email: string; password: string }) {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        `${API_BASE_URL}/login`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Login failed", {
        cause: errorData,
      });
    }
  },

  // Log out user
  async logout() {
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${API_BASE_URL}/logout-user`
      );
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
        `${API_BASE_URL}/forgot-password-user`,
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
        `${API_BASE_URL}/verify-forgot-password-user`,
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
        `${API_BASE_URL}/reset-password-user`,
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
    type: "register" | "forgot";
    name?: string;
    password?: string;
  }) {
    const endpoint =
      data.type === "register"
        ? `${API_BASE_URL}/register`
        : `${API_BASE_URL}/forgot-password-user`;
    const payload =
      data.type === "register"
        ? { name: data.name, email: data.email, password: data.password }
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
    const data = {
      type: "user",
    };
    try {
      const response = await apiClient.post<ApiResponse<never>>(
        `${API_BASE_URL}/refresh-token`,
        data,
        { withCredentials: true }
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
        `${API_BASE_URL}/logged-in-user`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch user", {
        cause: errorData,
      });
    }
  },

  // Change user password
  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      const response = await apiClient.put<ApiResponse<never>>(
        `${API_BASE_URL}/change-password-user`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Password change failed", {
        cause: errorData,
      });
    }
  },

  // Get user shipping addresses
  async getUserShippingAddress() {
    try {
      const response = await apiClient.get<ApiResponse<UserWithAddresses>>(
        `${API_BASE_URL}/shipping-address-user`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to fetch shipping address",
        {
          cause: errorData,
        }
      );
    }
  },

  // Create a new shipping address
  async createShippingAddress(
    data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const response = await apiClient.post<ApiResponse<ShippingAddress>>(
        `${API_BASE_URL}/shipping-address`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to create shipping address",
        {
          cause: errorData,
        }
      );
    }
  },

  // Update an existing shipping address
  async updateShippingAddress(
    id: string,
    data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
  ) {
    try {
      const response = await apiClient.put<ApiResponse<ShippingAddress>>(
        `${API_BASE_URL}/shipping-address/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to update shipping address",
        {
          cause: errorData,
        }
      );
    }
  },

  // Delete a shipping address
  async deleteShippingAddress(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<never>>(
        `${API_BASE_URL}/shipping-address/${id}`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(
        errorData?.message || "Failed to delete shipping address",
        {
          cause: errorData,
        }
      );
    }
  },
};
