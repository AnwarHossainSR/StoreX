import apiClient from "@/lib/apiClient";

export interface ApiResponse<T> {
  message: string;
  user?: T;
  access_token?: string;
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
      `${API_BASE_URL}` + data.type === "register"
        ? "/register"
        : "/forgot-password-user";
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

  // Get current authenticated user - Mark this as optional auth
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
};
