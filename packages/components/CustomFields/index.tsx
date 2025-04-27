// components/Form/CustomFields.tsx

import { InputField } from "@/packages/components/InputField";
import { Plus, X } from "lucide-react";
import React, { useRef } from "react";

// ------------------
// Custom Specifications
// ------------------
export interface Specification {
  name: string;
  value: string;
}

export interface CustomSpecificationsProps {
  specifications: Specification[];
  onChange: (specs: Specification[]) => void;
}

export const CustomSpecifications: React.FC<CustomSpecificationsProps> = ({
  specifications,
  onChange,
}) => {
  const updateSpec = (
    index: number,
    field: keyof Specification,
    newValue: string
  ) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const addSpec = () => onChange([...specifications, { name: "", value: "" }]);
  const removeSpec = (index: number) =>
    onChange(specifications.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Specifications</h3>
        <button
          type="button"
          onClick={addSpec}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
        >
          <Plus size={12} className="mr-1" /> Add Spec
        </button>
      </div>

      <div className="space-y-2">
        {specifications.map((spec, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition p-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-[120px]">
              <InputField
                label="Name"
                placeholder="Weight"
                value={spec.name}
                onChange={(v) => updateSpec(idx, "name", v)}
                required
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <InputField
                label="Value"
                placeholder="1.5kg"
                value={spec.value}
                onChange={(v) => updateSpec(idx, "value", v)}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => removeSpec(idx)}
              className="p-1 text-red-600 bg-white border border-red-400 rounded-full hover:bg-red-50 transition"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------
// Custom Properties (tags input)
// ------------------
export interface Property {
  key: string;
  values: string[];
}

export interface CustomPropertiesProps {
  properties: Property[];
  onChange: (props: Property[]) => void;
}

export const CustomProperties: React.FC<CustomPropertiesProps> = ({
  properties,
  onChange,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updatePropKey = (index: number, newKey: string) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], key: newKey };
    onChange(updated);
  };

  const addValue = (index: number) => {
    const input = inputRefs.current[index];
    if (!input || !input.value.trim()) return;
    const updated = [...properties];
    updated[index] = {
      ...updated[index],
      values: [...updated[index].values, input.value.trim()],
    };
    onChange(updated);
    input.value = "";
  };

  const removeValue = (pIndex: number, vIndex: number) => {
    const updated = [...properties];
    updated[pIndex].values = updated[pIndex].values.filter(
      (_, i) => i !== vIndex
    );
    onChange(updated);
  };

  const addProp = () => onChange([...properties, { key: "", values: [] }]);
  const removeProp = (index: number) =>
    onChange(properties.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
        <button
          type="button"
          onClick={addProp}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-white border border-green-600 rounded hover:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-400 transition"
        >
          <Plus size={12} className="mr-1" /> Add Prop
        </button>
      </div>

      <div className="space-y-2">
        {properties.map((prop, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <InputField
                label="Property Name"
                placeholder="Material"
                value={prop.key}
                onChange={(v) => updatePropKey(idx, v)}
                required
              />
              <button
                type="button"
                onClick={() => removeProp(idx)}
                className="p-1 text-red-600 bg-white border border-red-400 rounded-full hover:bg-red-50 transition"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {prop.values.map((val, vIdx) => (
                <div
                  key={vIdx}
                  className="flex items-center bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs"
                >
                  {val}
                  <button
                    type="button"
                    onClick={() => removeValue(idx, vIdx)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Add value..."
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                className="flex-1 h-8 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addValue(idx);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addValue(idx)}
                className="p-1 text-green-600 bg-white border border-green-600 rounded hover:bg-green-50 transition"
                title="Add value"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
