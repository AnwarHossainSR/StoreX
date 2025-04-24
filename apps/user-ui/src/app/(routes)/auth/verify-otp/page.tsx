"use client";

import OtpInput from "@/components/Otp/OtpInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const {
    verifyForgotPassword,
    verifyForgotPasswordStatus,
    verifyForgotPasswordError,
    verifyForgotPasswordErrorDetails,
  } = useAuth();
  const { alert, setSuccess, setError, setInfo, clearAlert } = useAlert();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailFromParams = searchParams.get("email") || "";
    setEmail(emailFromParams);
    setInfo(
      "Enter the one-time code sent to your email to verify your identity."
    );
  }, [searchParams, setInfo]);

  useEffect(() => {
    if (verifyForgotPasswordStatus === "success") {
      setSuccess("Code verified! Redirecting to reset password...", {
        autoDismiss: 3000,
      });
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 3000);
    } else if (verifyForgotPasswordError) {
      setError(verifyForgotPasswordError, {
        details: verifyForgotPasswordErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    verifyForgotPasswordStatus,
    verifyForgotPasswordError,
    verifyForgotPasswordErrorDetails,
    setSuccess,
    setError,
    router,
    email,
  ]);

  const handleOtpSubmit = (otp: string) => {
    if (!email) {
      setError("Email is missing. Please start the process again.");
      return;
    }
    verifyForgotPassword({ email, otp });
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-1 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter the one-time code sent to your email.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {alert && (
              <Alert
                variant={alert.variant}
                className="mb-4"
                autoDismiss={alert.autoDismiss}
                onDismiss={clearAlert}
                details={alert.details}
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <OtpInput
                email={email}
                type="forgot"
                onSubmit={handleOtpSubmit}
                isVerifyOtpPending={verifyForgotPasswordStatus === "pending"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
