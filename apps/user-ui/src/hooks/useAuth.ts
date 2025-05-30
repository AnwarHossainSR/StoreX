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

  // Login mutation
  const loginMutation = useMutation<
    ApiResponse<User>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.login,
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

  // Register mutation
  const registerMutation = useMutation<
    ApiResponse<never>,
    Error,
    { name: string; email: string; password: string }
  >({
    mutationFn: authService.register,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Verify OTP for registration
  const verifyOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string; password: string; name: string }
  >({
    mutationFn: authService.verifyOtp,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

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
  const verifyForgotPasswordMutation = useMutation<
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
      router.push("/auth/login");
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
      type: "register" | "forgot";
      name?: string;
      password?: string;
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

  // Logout mutation
  const logoutMutation = useMutation<ApiResponse<never>, Error, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // remove cookies
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/");
    },
    onError: (error: Error) => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // remove cookies
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/");
    },
  });

  return {
    login: loginMutation.mutate,
    loginStatus: loginMutation.status,
    loginError: loginMutation.error?.message,
    loginErrorDetails: (
      loginMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    register: registerMutation.mutate,
    registerStatus: registerMutation.status,
    registerError: registerMutation.error?.message,
    registerErrorDetails: (
      registerMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    verifyOtp: verifyOtpMutation.mutate,
    verifyOtpStatus: verifyOtpMutation.status,
    verifyOtpError: verifyOtpMutation.error?.message,
    verifyOtpErrorDetails: (
      verifyOtpMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordStatus: forgotPasswordMutation.status,
    forgotPasswordError: forgotPasswordMutation.error?.message,
    forgotPasswordErrorDetails: (
      forgotPasswordMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    verifyForgotPassword: verifyForgotPasswordMutation.mutate,
    verifyForgotPasswordStatus: verifyForgotPasswordMutation.status,
    verifyForgotPasswordError: verifyForgotPasswordMutation.error?.message,
    verifyForgotPasswordErrorDetails: (
      verifyForgotPasswordMutation.error?.cause as
        | BackendErrorResponse
        | undefined
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

    logout: logoutMutation.mutate,
  };
};
