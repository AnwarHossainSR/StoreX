// components/TextAreaField.tsx
import React from "react";

export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  rows?: number;
  error?: string; // Add error prop
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  helpText,
  rows = 4,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`block w-full px-3 py-2 border ${
        error ? "border-red-300" : "border-gray-300"
      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
      aria-invalid={!!error}
      aria-describedby={error ? `${label}-error` : undefined}
    />
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    {error && (
      <p className="mt-1 text-sm text-red-600" id={`${label}-error`}>
        {error}
      </p>
    )}
  </div>
);
