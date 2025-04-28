"use client";
import React from "react";

export interface SizeSelectorProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
  availableSizes?: string[];
  className?: string;
  error?: string;
  disabled?: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  onChange,
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
  className = "",
  error,
  disabled,
}) => {
  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      onChange(sizes.filter((s) => s !== size));
    } else {
      onChange([...sizes, size]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Sizes</label>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 ${
              sizes.includes(size)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
            disabled={disabled}
          >
            {size}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
