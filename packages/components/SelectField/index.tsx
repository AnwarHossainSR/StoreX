import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: any;
  required?: boolean;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  required,
  helpText,
  error,
  disabled,
  className,
  children,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full px-4 py-3 border ${
          error ? "border-red-300" : "border-gray-300"
        } rounded-lg shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
        }`}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600" id={`${label}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
