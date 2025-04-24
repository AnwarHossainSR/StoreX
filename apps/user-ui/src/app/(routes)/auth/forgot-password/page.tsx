"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    forgotPassword,
    forgotPasswordStatus,
    forgotPasswordError,
    forgotPasswordErrorDetails,
  } = useAuth();
  const { alert, setSuccess, setError, setInfo, clearAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    setInfo(
      "Enter your email address, and we’ll send you a one-time code to reset your password."
    );
  }, [setInfo]);

  useEffect(() => {
    if (forgotPasswordStatus === "success") {
      setSuccess(
        `A one-time code has been sent to ${email}. Please check your email.`,
        {
          autoDismiss: 5000,
        }
      );
      setIsSubmitted(true);
      setTimeout(() => {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
      }, 3000);
    } else if (forgotPasswordError) {
      setError(forgotPasswordError, {
        details: forgotPasswordErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    forgotPasswordStatus,
    forgotPasswordError,
    forgotPasswordErrorDetails,
    email,
    setSuccess,
    setError,
    router,
  ]);

  const validateEmail = () => {
    if (!email) {
      setEmailError("Please enter your email address");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    clearAlert();
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      forgotPassword({ email });
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-1 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
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

            {!isSubmitted ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                      className={`appearance-none block w-full px-3 py-2 border ${
                        emailError ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "email-error" : undefined}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={forgotPasswordStatus === "pending"}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      forgotPasswordStatus === "pending"
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {forgotPasswordStatus === "pending"
                      ? "Sending..."
                      : "Send one-time code"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Didn’t receive the code?{" "}
                    <button
                      onClick={() => forgotPassword({ email })}
                      className="font-medium text-blue-600 hover:text-blue-500"
                      disabled={forgotPasswordStatus === "pending"}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
