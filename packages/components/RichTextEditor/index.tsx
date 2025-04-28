"use client";
import dynamic from "next/dynamic";
import React, { useMemo } from "react";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] flex items-center justify-center text-gray-500">
      Loading editor...
    </div>
  ),
});

// Import Quill CSS (client-side only)
import "react-quill-new/dist/quill.snow.css";

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  helpText?: string;
  toolbar?: (string | { [key: string]: any })[][];
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter text...",
  error,
  required = false,
  className = "",
  disabled = false,
  helpText,
  toolbar = [
    [{ header: [1, 2, 3, 4, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["blockquote", "code-block"],
    ["superscript", "subscript"],
    ["clean"],
  ],
}) => {
  const editorId = `${
    label?.replace(/\s+/g, "-").toLowerCase() || "editor"
  }-richtext`;
  const modules = useMemo(() => ({ toolbar }), [toolbar]);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={editorId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {helpText && <p className="text-xs text-gray-500 mb-1">{helpText}</p>}
      <div
        className={`rounded-lg border ${
          error ? "border-red-300" : "border-gray-300"
        } overflow-hidden shadow-sm transition-all duration-200 ${
          disabled ? "bg-gray-100 opacity-70" : "bg-white"
        }`}
      >
        <ReactQuill
          id={editorId}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          readOnly={disabled}
          className="min-h-[150px]"
          aria-invalid={!!error}
          aria-describedby={error ? `${editorId}-error` : undefined}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${editorId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};
export default RichTextEditor;
