import {
  ApiResponse,
  authService,
  BackendErrorResponse,
  User,
} from "@/services/authService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Custom hook for handling authentication mutations
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Helper function to handle errors
  const handleError = (error: Error) => {
    const errorData = error.cause as BackendErrorResponse | undefined;
    const message = errorData?.message || error.message || "An error occurred";
    toast.error(message);
    return {
      message,
      details: errorData?.details,
    };
  };

  // Helper function to handle success
  const handleSuccess = (message: string, redirectTo?: string) => {
    toast.success(message);
    if (redirectTo) {
      router.push(redirectTo);
    }
    // Invalidate user query to refetch
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  // Login mutation
  const loginMutation = useMutation<
    ApiResponse<User>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.login,
    onSuccess: (data) => {
      handleSuccess("Login successful!", "/dashboard");
      // Update user in cache
      queryClient.setQueryData(["currentUser"], data);
    },
    onError: handleError,
  });

  // Register mutation
  const registerMutation = useMutation<
    ApiResponse<never>,
    Error,
    { name: string; email: string; password: string }
  >({
    mutationFn: authService.register,
    onSuccess: () => {
      handleSuccess(
        "Registration successful! Please check your email for OTP."
      );
    },
    onError: handleError,
  });

  // Verify OTP for registration
  const verifyOtpMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string; password: string; name: string }
  >({
    mutationFn: authService.verifyOtp,
    onSuccess: () => {
      handleSuccess("Account verified successfully!", "/auth/login");
    },
    onError: handleError,
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string }
  >({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      handleSuccess("Password reset email sent! Please check your email.");
    },
    onError: handleError,
  });

  // Verify OTP for forgot password
  const verifyForgotPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; otp: string }
  >({
    mutationFn: authService.verifyForgotPassword,
    onSuccess: () => {
      handleSuccess("OTP verified! You can now reset your password.");
    },
    onError: handleError,
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation<
    ApiResponse<never>,
    Error,
    { email: string; password: string }
  >({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      handleSuccess("Password reset successful!", "/auth/login");
    },
    onError: handleError,
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
    onSuccess: () => {
      handleSuccess("OTP resent successfully!");
    },
    onError: handleError,
  });

  // Logout mutation
  const logoutMutation = useMutation<ApiResponse<never>, Error, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear local storage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      // Clear user from cache
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });

      handleSuccess("Logged out successfully!", "/");
    },
    onError: (error) => {
      // Even if logout fails on server, clear local data
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }

      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });

      router.push("/");
    },
  });

  const chanagePassword = useMutation<
    ApiResponse<never>,
    Error,
    { oldPassword: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      handleSuccess("Password changed successfully!");
    },
    onError: handleError,
  });

  return {
    // Auth actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    verifyForgotPassword: verifyForgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    resendOtp: resendOtpMutation.mutate,
    logout: logoutMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isForgotPassword: forgotPasswordMutation.isPending,
    isVerifyingForgotPassword: verifyForgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isResendingOtp: resendOtpMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Error states (simplified)
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    verifyOtpError: verifyOtpMutation.error?.message,
    forgotPasswordError: forgotPasswordMutation.error?.message,
    verifyForgotPasswordError: verifyForgotPasswordMutation.error?.message,
    resetPasswordError: resetPasswordMutation.error?.message,
    resendOtpError: resendOtpMutation.error?.message,

    // Reset functions
    resetLoginError: () => loginMutation.reset(),
    resetRegisterError: () => registerMutation.reset(),
    resetVerifyOtpError: () => verifyOtpMutation.reset(),
    resetForgotPasswordError: () => forgotPasswordMutation.reset(),
    resetVerifyForgotPasswordError: () => verifyForgotPasswordMutation.reset(),
    resetResetPasswordError: () => resetPasswordMutation.reset(),
    resetResendOtpError: () => resendOtpMutation.reset(),

    // Auth actions
    changePassword: chanagePassword.mutate,
    isChangingPassword: chanagePassword.isPending,
    changePasswordError: chanagePassword.error?.message,
    resetChangePasswordError: () => chanagePassword.reset(),
  };
};
