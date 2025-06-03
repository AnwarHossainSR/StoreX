import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
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
            <span className="text-gray-800">Page Not Found</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg p-12 text-center shadow-md">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-10a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
