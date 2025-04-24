"use client";

import OtpInput from "@/components/Otp/OtpInput";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyOTPPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type =
    (searchParams.get("type") as "register" | "forgot") || "register";
  const {
    verifyOtp,
    verifyOtpStatus,
    verifyOtpError,
    verifyOtpErrorDetails,
    verifyForgotPassword,
    verifyForgotPasswordStatus,
    verifyForgotPasswordError,
    verifyForgotPasswordErrorDetails,
  } = useAuth();

  const handleOtpSubmit = (otp: string) => {
    if (type === "forgot") {
      verifyForgotPassword({ email, otp, password: "" }); // Password is not needed for verification
    } else {
      verifyOtp({ email, otp, password: "", name: "" }); // Name and password are handled in registration
    }
  };

  const errorMessage =
    type === "forgot"
      ? verifyForgotPasswordError &&
        `${verifyForgotPasswordError}${
          verifyForgotPasswordErrorDetails &&
          typeof verifyForgotPasswordErrorDetails === "string"
            ? `: ${verifyForgotPasswordErrorDetails}`
            : ""
        }`
      : verifyOtpError &&
        `${verifyOtpError}${
          verifyOtpErrorDetails && typeof verifyOtpErrorDetails === "string"
            ? `: ${verifyOtpErrorDetails}`
            : ""
        }`;

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-1 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 max-w">
            We've sent a verification code to your email address. Please enter
            the code below to verify your account.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <OtpInput
              email={email}
              type={type}
              onSubmit={handleOtpSubmit}
              isLoading={
                type === "forgot"
                  ? verifyForgotPasswordStatus === "pending"
                  : verifyOtpStatus === "pending"
              }
              error={errorMessage}
            />

            <div className="mt-4 text-center">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
