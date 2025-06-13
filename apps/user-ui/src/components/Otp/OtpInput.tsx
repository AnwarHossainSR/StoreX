"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface OtpInputProps {
  email: string;
  type: "register" | "forgot";
  name?: string;
  password?: string;
  onSubmit: (otp: string) => void;
  isVerifyOtpPending: boolean;
}

export default function OtpInput({
  email,
  type,
  name,
  password,
  onSubmit,
  isVerifyOtpPending,
}: OtpInputProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const { resendOtp, resendOtpStatus, resendOtpError, resendOtpErrorDetails } =
    useAuth();
  const { alert, setError, setWarning, clearAlert } = useAlert();

  useEffect(() => {
    if (resendOtpStatus === "success") {
      setWarning("A new OTP has been sent to your email. Check your inbox.", {
        autoDismiss: 5000,
      });
    } else if (resendOtpError) {
      setError(resendOtpError, {
        details: resendOtpErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    resendOtpStatus,
    resendOtpError,
    resendOtpErrorDetails,
    setWarning,
    setError,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    clearAlert();
    onSubmit(otpValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Validate pasted data: must be a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp(newOtp);

      // Focus the last input field after pasting
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();

      clearAlert();
    } else {
      setError("Please paste a valid 6-digit OTP");
    }
  };

  const handleResend = () => {
    clearAlert();
    resendOtp({ email, type, name, password });
  };

  return (
    <div className="space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onPaste={index === 0 ? handlePaste : undefined}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        <div>
          <button
            type="submit"
            disabled={isVerifyOtpPending}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isVerifyOtpPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isVerifyOtpPending ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="font-medium text-blue-600 hover:text-blue-500"
            disabled={resendOtpStatus === "pending"}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
