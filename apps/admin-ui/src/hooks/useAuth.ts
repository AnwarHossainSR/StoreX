import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ApiResponse,
  authService,
  BackendErrorResponse,
  User,
} from "../services/authService";

export const useAuth = () => {
  const router = useRouter();

  // Forgot password mutation
  const forgotPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string }
  >({
    mutationFn: authService.forgotPassword,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Verify OTP for forgot password
  const forgotPasswordOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string }
  >({
    mutationFn: authService.verifyForgotPassword,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    {
      email: string;
      type: "register" | "forgot" | "seller-register";
      name?: string;
      password?: string;
      phone_number?: string;
      country?: string;
    }
  >({
    mutationFn: authService.resendOtp,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Seller login mutation
  const adminLoginMutation = useMutation<
    ApiResponse<User>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.adminLogin,
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Verify OTP for seller registration
  const verifyAdminOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    {
      email: string;
      otp: string;
      password: string;
      name: string;
      phone_number: string;
      country: string;
    }
  >({
    mutationFn: authService.verifyAdminOtp,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
    retry: 0,
  });

  const logoutAdmin = useMutation<ApiResponse<never>, Error>({
    mutationFn: authService.logout,
    onSuccess: () => {
      // clear localstorage access-admin-token and refresh-admin-token
      localStorage.removeItem("access_admin_token");
      localStorage.removeItem("refresh_admin_token");
      // clear cookies access-admin-token and refresh-admin-token
      document.cookie =
        "access_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
    retry: 0,
  });

  return {
    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordStatus: forgotPasswordMutation.status,
    forgotPasswordError: forgotPasswordMutation.error?.message,
    forgotPasswordErrorDetails: (
      forgotPasswordMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    verifyForgotPassword: forgotPasswordOtpMutation.mutate,
    verifyForgotPasswordStatus: forgotPasswordOtpMutation.status,
    verifyForgotPasswordError: forgotPasswordOtpMutation.error?.message,
    verifyForgotPasswordErrorDetails: (
      forgotPasswordOtpMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    resetPassword: resetPasswordMutation.mutate,
    resetPasswordStatus: resetPasswordMutation.status,
    resetPasswordError: resetPasswordMutation.error?.message,
    resetPasswordErrorDetails: (
      resetPasswordMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    resendOtp: resendOtpMutation.mutate,
    resendOtpStatus: resendOtpMutation.status,
    resendOtpError: resendOtpMutation.error?.message,
    resendOtpErrorDetails: (
      resendOtpMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    adminLogin: adminLoginMutation.mutate,
    adminLoginStatus: adminLoginMutation.status,
    adminLoginError: adminLoginMutation.error?.message,
    adminLoginErrorDetails: (
      adminLoginMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    verifyAdminOtp: verifyAdminOtpMutation.mutate,
    verifyAdminOtpStatus: verifyAdminOtpMutation.status,
    verifyAdminOtpError: verifyAdminOtpMutation.error?.message,
    verifyAdminOtpErrorDetails: (
      verifyAdminOtpMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,
    logoutAdmin: logoutAdmin.mutate,
  };
};
