"use client";

import { useSellerSignupStore } from "@/lib/store";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function SuccessPage() {
  const resetSignupState = useSellerSignupStore(
    (state) => state.resetSignupState
  );

  // Reset Zustand state on mount
  useEffect(() => {
    resetSignupState();
    console.log("Zustand signup state reset on SuccessPage");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100">
        {/* Header with Logo */}
        <div className="flex flex-col items-center">
          <img
            src="/storex-logo.png"
            alt="StoreX Logo"
            className="h-14 w-auto mb-6"
          />
          <CheckCircle className="h-16 w-16 text-green-600" />
          <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
            Success!
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 text-center leading-relaxed">
            Your StoreX seller account has been successfully created. You're
            ready to start managing your shop and selling your products!
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Start Selling Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Need help?{" "}
          <a
            href="/support"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
