// components/TextAreaField.tsx
export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  className?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  helpText,
  error,
  className = "",
}) => {
  const textareaId = `${label.replace(/\s+/g, "-").toLowerCase()}-textarea`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}
      <textarea
        id={textareaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full px-4 py-3 border ${
          error ? "border-red-300" : "border-gray-300"
        } rounded-lg shadow-sm bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 min-h-[120px]`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        aria-label={label}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
