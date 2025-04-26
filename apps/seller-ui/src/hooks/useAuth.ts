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

  // Seller register mutation
  const sellerRegisterMutation = useMutation<
    ApiResponse<never>,
    Error,
    {
      name: string;
      email: string;
      password: string;
      phone_number: string;
      country: string;
    }
  >({
    mutationFn: authService.registerSeller,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Create shop mutation
  const createShopMutation = useMutation<
    ApiResponse<never>,
    Error,
    {
      sellerId: string;
      name: string;
      bio: string;
      address: string;
      opening_hour: string;
      website?: string;
      category: string;
    }
  >({
    mutationFn: authService.createShop,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Create Stripe Connect account mutation
  const createStripeConnectAccountMutation = useMutation<
    ApiResponse<never>,
    Error,
    string
  >({
    mutationFn: authService.createStripeConnectAccount,
    onSuccess: (data) => {
      if (data.accountLink) {
        window.location.href = data.accountLink; // Redirect to Stripe
      }
    },
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
      router.push("/auth/seller/login");
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
  const sellerLoginMutation = useMutation<
    ApiResponse<User>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.sellerLogin,
    onSuccess: () => {
      router.push("/seller/dashboard");
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
  const verifySellerOtpMutation = useMutation<
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
    mutationFn: authService.verifySellerOtp,
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

    sellerLogin: sellerLoginMutation.mutate,
    sellerLoginStatus: sellerLoginMutation.status,
    sellerLoginError: sellerLoginMutation.error?.message,
    sellerLoginErrorDetails: (
      sellerLoginMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    sellerRegister: sellerRegisterMutation.mutate,
    sellerRegisterStatus: sellerRegisterMutation.status,
    sellerRegisterError: sellerRegisterMutation.error?.message,
    sellerRegisterErrorDetails: (
      sellerRegisterMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    resetSellerRegister: sellerRegisterMutation.reset,

    createShop: createShopMutation.mutate,
    createShopStatus: createShopMutation.status,
    createShopError: createShopMutation.error?.message,
    createShopErrorDetails: (
      createShopMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    verifySellerOtp: verifySellerOtpMutation.mutate,
    verifySellerOtpStatus: verifySellerOtpMutation.status,
    verifySellerOtpError: verifySellerOtpMutation.error?.message,
    verifySellerOtpErrorDetails: (
      verifySellerOtpMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,
    sellerId: verifySellerOtpMutation.data?.sellerId,
    seller: verifySellerOtpMutation.data?.seller,

    createStripeConnectAccount: createStripeConnectAccountMutation.mutate,
    createStripeConnectAccountStatus: createStripeConnectAccountMutation.status,
    createStripeConnectAccountError:
      createStripeConnectAccountMutation.error?.message,
    createStripeConnectAccountErrorDetails: (
      createStripeConnectAccountMutation.error?.cause as
        | BackendErrorResponse
        | undefined
    )?.details,
  };
};
