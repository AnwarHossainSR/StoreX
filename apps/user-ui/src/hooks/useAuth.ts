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

  const registerMutation = useMutation<
    ApiResponse<never>,
    Error,
    { name: string; email: string; password: string }
  >({
    mutationFn: authService.register,
    onSuccess: (data, variables) => {
      router.push(
        `/auth/verify-otp?email=${encodeURIComponent(variables.email)}`
      );
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  const verifyOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string; password: string; name: string }
  >({
    mutationFn: authService.verifyOtp,
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

  const forgotPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string }
  >({
    mutationFn: authService.forgotPassword,
    onSuccess: (data, variables) => {
      router.push(
        `/auth/verify-otp?email=${encodeURIComponent(
          variables.email
        )}&type=forgot`
      );
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  const verifyForgotPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string; password: string }
  >({
    mutationFn: authService.verifyForgotPassword,
    onSuccess: () => {
      router.push("/auth/reset-password");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

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
    onSuccess: () => {
      // No navigation needed; OTP is resent
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
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
  };
};
