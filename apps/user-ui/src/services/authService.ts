import axios from "axios";

export interface ApiResponse<T> {
  message: string;
  user?: T;
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

const API_BASE_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
        "/register",
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

  async verifyOtp(data: {
    email: string;
    otp: string;
    password: string;
    name: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
        "/verify-otp",
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

  async login(data: { email: string; password: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>(
        "/login",
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

  async forgotPassword(data: { email: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
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

  async verifyForgotPassword(data: {
    email: string;
    otp: string;
    password: string;
  }) {
    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
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

  async resetPassword(data: { email: string; password: string }) {
    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
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

  async resendOtp(data: {
    email: string;
    type: "register" | "forgot";
    name?: string;
    password?: string;
  }) {
    const endpoint =
      data.type === "register" ? "/register" : "/forgot-password-user";
    const payload =
      data.type === "register"
        ? { name: data.name, email: data.email, password: data.password }
        : { email: data.email };

    try {
      const response = await axiosInstance.post<ApiResponse<never>>(
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
};
