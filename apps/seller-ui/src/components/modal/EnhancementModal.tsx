import {
  Check,
  Download,
  Image as ImageIcon,
  Loader,
  Maximize2,
  Sparkles,
  Trash,
  X,
  ZoomIn,
} from "lucide-react";
import React, { useState } from "react";

interface UploadedImage {
  file_name: string;
  file_url: string;
}

const ImageEnhancementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  image: UploadedImage | null;
  previewUrl: string | null;
}> = ({ isOpen, onClose, image, previewUrl }) => {
  const [enhancementType, setEnhancementType] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);

  if (!isOpen || !image || !previewUrl) return null;

  const handleEnhancement = (type: string) => {
    setProcessing(true);
    setEnhancementType(type);

    console.log(`Enhancing image ${image.file_name} with ${type}`);
    // Simulate API call with timeout
    setTimeout(() => {
      setProcessing(false);
      setEnhancedUrl(previewUrl); // In real implementation, this would be the response URL
    }, 2000);
  };

  const handleDownload = () => {
    // Download logic here
    console.log(`Downloading enhanced image ${image.file_name}`);
  };

  const handleReset = () => {
    setEnhancedUrl(null);
    setEnhancementType(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">
              Image Enhancement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Image Preview */}
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 relative overflow-hidden h-[40vh]">
              <img
                src={enhancedUrl || previewUrl}
                alt={image.file_name}
                className="max-w-full max-h-full object-contain"
              />
              {processing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                    <Loader className="h-6 w-6 text-blue-600 animate-spin mb-2" />
                    <p className="text-xs font-medium text-gray-700">
                      Processing {enhancementType}...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Image metadata */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3" />
                <span className="truncate max-w-[180px]">
                  {image.file_name}
                </span>
              </div>
              {enhancedUrl && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash className="h-3 w-3" />
                    <span className="text-xs">Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Download</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enhancement Options - Horizontal Scrollable */}
          <div className="w-full bg-gray-50 p-4 border-t border-gray-100 shrink-0">
            <h3 className="text-xs font-medium text-gray-500 mb-3 px-0.5">
              ENHANCEMENT OPTIONS
            </h3>

            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <EnhancementButton
                label="Remove BG"
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                onClick={() => handleEnhancement("Remove BG")}
                active={enhancementType === "Remove BG"}
                disabled={processing}
              />

              <EnhancementButton
                label="Drop Shadow"
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                onClick={() => handleEnhancement("Drop Shadow")}
                active={enhancementType === "Drop Shadow"}
                disabled={processing}
              />

              <EnhancementButton
                label="Retouch"
                icon={<Sparkles className="h-3.5 w-3.5" />}
                onClick={() => handleEnhancement("Retouch")}
                active={enhancementType === "Retouch"}
                disabled={processing}
              />

              <EnhancementButton
                label="Upscale"
                icon={<ZoomIn className="h-3.5 w-3.5" />}
                onClick={() => handleEnhancement("UpScale")}
                active={enhancementType === "UpScale"}
                disabled={processing}
              />
            </div>

            {enhancedUrl && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  onClick={handleDownload}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Apply & Download</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhancement option button component - Horizontal version
const EnhancementButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active: boolean;
  disabled: boolean;
}> = ({ label, icon, onClick, active, disabled }) => {
  return (
    <button
      type="button"
      className={`flex-shrink-0 flex flex-col items-center justify-center p-2.5 rounded-lg transition-all ${
        active
          ? "bg-blue-50 border border-blue-200 shadow-sm"
          : "border border-gray-200 hover:bg-gray-100"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={{ minWidth: "90px" }}
    >
      <div
        className={`p-2 rounded-full mb-1.5 ${
          active ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        {icon}
      </div>
      <p
        className={`text-xs font-medium ${
          active ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {label}
      </p>
    </button>
  );
};

export default ImageEnhancementModal;
