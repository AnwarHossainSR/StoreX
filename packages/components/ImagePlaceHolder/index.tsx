import { Sparkles, Trash2 } from "lucide-react";

interface UploadedImage {
  file_name: string;
  file_url: string;
}

export const ImagePlaceholder: React.FC<{
  image: UploadedImage;
  index: number;
  previewUrl: string;
  onRemove: (image: UploadedImage, index: number) => void;
  onEnhance: (image: UploadedImage, previewUrl: string) => void;
  disabled: boolean;
}> = ({ image, index, previewUrl, onRemove, onEnhance, disabled }) => {
  return (
    <div
      className="relative group flex-shrink-0 w-[150px] h-[150px] box-border overflow-hidden aspect-square"
      style={{ width: "150px", height: "150px" }}
    >
      <img
        src={previewUrl}
        alt={`Product Image ${index + 1}`}
        className="w-[150px] h-[150px] object-cover rounded-md"
        style={{ width: "150px", height: "150px" }}
      />
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-1 shadow-sm">
        <button
          type="button"
          className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          onClick={() => onEnhance(image, previewUrl)}
          disabled={disabled}
          title="Enhance Image"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-1 bg-red-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          onClick={() => onRemove(image, index)}
          disabled={disabled}
          title="Remove Image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
