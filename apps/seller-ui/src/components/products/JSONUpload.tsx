import React, { useState, useRef } from "react";
import { Upload, Clipboard, FileJson } from "lucide-react";

interface JSONUploadProps {
  onJSONData: (data: any) => void;
}

export const JSONUpload: React.FC<JSONUploadProps> = ({ onJSONData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);
        setJsonText(JSON.stringify(parsedData, null, 2));
        setJsonError(null);
      } catch (error) {
        setJsonError(
          "Invalid JSON file. Please check the format and try again."
        );
        console.error("Error parsing JSON file:", error);
      }
    };
    reader.onerror = () => {
      setJsonError("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  const handlePasteJSON = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setJsonError(null);
  };

  const handleApply = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      onJSONData(parsedData);
      setIsModalOpen(false);
      setJsonText("");
      setJsonError(null);
    } catch (error) {
      setJsonError("Invalid JSON format. Please check and try again.");
      console.error("Error parsing JSON:", error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FileJson size={18} />
        <span>Import JSON</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">Import Product Data</h3>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Upload size={16} />
                  <span>Upload JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => {
                    navigator.clipboard
                      .readText()
                      .then((text) => {
                        setJsonText(text);
                        try {
                          JSON.parse(text);
                          setJsonError(null);
                        } catch (e) {
                          setJsonError(
                            "Invalid JSON in clipboard. Please check and try again."
                          );
                        }
                      })
                      .catch(() => {
                        setJsonError(
                          "Failed to read from clipboard. Please paste manually."
                        );
                      });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Clipboard size={16} />
                  <span>Paste from Clipboard</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                Paste or upload product data in JSON format
              </p>
            </div>

            <div className="mb-4">
              <textarea
                value={jsonText}
                onChange={handlePasteJSON}
                placeholder='{"title": "Product Title", "short_description": "Description", ...}'
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
              {jsonError && (
                <p className="mt-2 text-sm text-red-600">{jsonError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!jsonText || !!jsonError}
              >
                Apply JSON Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
