"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800">Error</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg p-12 text-center shadow-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || "An unexpected error occurred."}
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              onClick={reset}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
