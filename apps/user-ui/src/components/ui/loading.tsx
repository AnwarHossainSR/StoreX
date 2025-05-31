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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Authenticating...
        </h3>
        <p className="text-gray-600 text-sm">Verifying your credentials</p>
      </div>
    </div>
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
