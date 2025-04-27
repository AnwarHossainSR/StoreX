// components/InputField.tsx
import React from "react";

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string; // Add error prop
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`block w-full px-3 py-2 border ${
        error ? "border-red-300" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
      aria-invalid={!!error}
      aria-describedby={error ? `${label}-error` : undefined}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600" id={`${label}-error`}>
        {error}
      </p>
    )}
  </div>
);
