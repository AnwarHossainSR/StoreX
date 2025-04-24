"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";

interface OtpInputProps {
  email: string;
  type: "register" | "forgot";
  name?: string; // Required for register type
  password?: string; // Required for register type
  onSubmit: (otp: string) => void;
  isLoading: boolean;
  error?: string;
}

export default function OtpInput({
  email,
  type,
  name,
  password,
  onSubmit,
  isLoading,
  error,
}: OtpInputProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { resendOtp, resendOtpStatus, resendOtpError, resendOtpErrorDetails } =
    useAuth();

  // @ts-ignore
  useEffect(() => {
    inputRefs.current[0]?.focus();

    if (timeLeft > 0) {
      const countdownTimer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(countdownTimer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .slice(0, 6)
      .replace(/[^0-9]/g, "");

    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newOtp[i] = pasteData[i];
        }
      }
      setOtp(newOtp);

      const lastFilledIndex = Math.min(pasteData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => !digit)) {
      return;
    }
    onSubmit(otp.join(""));
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setTimeLeft(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    resendOtp({ email, type, name, password });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          Verification code
        </label>
        <div className="mt-2 flex gap-2 items-center justify-center">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
        {resendOtpError && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {resendOtpError}
            {resendOtpErrorDetails &&
              typeof resendOtpErrorDetails === "string" &&
              `: ${resendOtpErrorDetails}`}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue36500 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={!canResend || resendOtpStatus === "pending"}
            className={`font-medium ${
              canResend && resendOtpStatus !== "pending"
                ? "text-blue-600 hover:text-blue-500 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {resendOtpStatus === "pending"
              ? "Resending..."
              : canResend
              ? "Resend code"
              : `Resend code in ${timeLeft} seconds`}
          </button>
        </p>
      </div>
    </form>
  );
}
