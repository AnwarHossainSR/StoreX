import React from "react";

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
  helpText,
  disabled = false,
  className = "",
}) => {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full px-4 py-3 border ${
          error ? "border-red-300" : "border-gray-300"
        } rounded-lg shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-label={label}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
