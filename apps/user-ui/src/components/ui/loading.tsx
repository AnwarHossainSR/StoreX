"use client";

import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bars";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const LoadingSpinner = () => (
    <div
      className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
    />
  );

  const LoadingDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${
            size === "sm"
              ? "w-2 h-2"
              : size === "md"
              ? "w-3 h-3"
              : size === "lg"
              ? "w-4 h-4"
              : "w-5 h-5"
          } bg-blue-600 rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className="flex space-x-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${
            size === "sm"
              ? "w-1 h-4"
              : size === "md"
              ? "w-2 h-6"
              : size === "lg"
              ? "w-3 h-8"
              : "w-4 h-10"
          } bg-blue-600 rounded animate-pulse`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );

  const LoadingBars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${
            size === "sm"
              ? "w-1"
              : size === "md"
              ? "w-2"
              : size === "lg"
              ? "w-3"
              : "w-4"
          } bg-blue-600 rounded-t animate-pulse`}
          style={{
            height: `${20 + (i % 3) * 10}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1.2s",
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <LoadingDots />;
      case "pulse":
        return <LoadingPulse />;
      case "bars":
        return <LoadingBars />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {renderLoader()}
      {text && (
        <p
          className={`text-gray-600 font-medium ${textSizeClasses[size]} animate-pulse`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Page Loading Component for route transitions
export const PageLoading: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-200 max-w-md w-full mx-4">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-indigo-200 border-b-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
        <p className="text-gray-600">
          Please wait while we prepare your content
        </p>
        <div className="mt-6 flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Auth Loading Component
export const AuthLoading: React.FC = () => (
  <div
    className="min-h-screen animate-gradient flex items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/20 max-w-sm w-full mx-4">
      <div className="text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-200/50 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin-custom"></div>
          <div className="absolute inset-2 border-2 border-indigo-200 border-b-indigo-500 rounded-full animate-spin-custom-reverse"></div>
        </div>
        <h3
          className="text-2xl font-bold text-gray-900 animate-pulse-slow"
          aria-label="Authentication in progress"
        >
          Authenticating...
        </h3>
        <p className="text-gray-700 text-base max-w-xs mx-auto">
          Verifying your credentials, please wait
        </p>
        <div className="w-full h-1 bg-gray-200/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-progress"></div>
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      @keyframes spin-custom {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes spin-custom-reverse {
        0% {
          transform: rotate(360deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
      @keyframes pulse-slow {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      @keyframes progress {
        0% {
          width: 0%;
        }
        50% {
          width: 80%;
        }
        100% {
          width: 20%;
        }
      }
      .animate-gradient {
        background-size: 200% 200%;
        animation: gradient 15s ease-in-out infinite;
      }
      .animate-spin-custom {
        animation: spin-custom 1.2s linear infinite;
      }
      .animate-spin-custom-reverse {
        animation: spin-custom-reverse 1.8s linear infinite;
      }
      .animate-pulse-slow {
        animation: pulse-slow 2s ease-in-out infinite;
      }
      .animate-progress {
        animation: progress 2s ease-in-out infinite;
      }
    `}</style>
  </div>
);

// Button Loading Component
export const ButtonLoading: React.FC<{ text?: string }> = ({
  text = "Loading...",
}) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    <span>{text}</span>
  </div>
);

export default Loading;
