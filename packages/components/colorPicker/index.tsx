import { Plus } from "lucide-react";
import React from "react";

export interface ColorPickerProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  onChange,
}) => {
  const addColor = (newColor: string) => {
    onChange([...colors, newColor]);
  };

  const removeColor = (idx: number) => {
    onChange(colors.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex items-center space-x-2">
      {colors.map((c, i) => (
        <div
          key={i}
          className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
          style={{ backgroundColor: c }}
          onClick={() => removeColor(i)}
          title="Click to remove"
        />
      ))}

      {/* Wrap the input in the button, make the input invisible but still present */}
      <button
        type="button"
        className="relative h-8 w-8 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:bg-gray-100 overflow-hidden"
      >
        <Plus size={16} />
        <input
          type="color"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => addColor(e.target.value)}
        />
      </button>
    </div>
  );
};
