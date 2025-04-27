"use client";
import { InputField } from "@/packages/components/InputField";
import { TextAreaField } from "@/packages/components/TextAreaField";
import { ColorPicker } from "@/packages/components/colorPicker";
import { Edit2 } from "lucide-react";
import React, { useRef, useState } from "react";

export default function CreateProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [warranty, setWarranty] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    // TODO: handle form submission
    console.log({ title, description, tags, warranty, slug, brand, colors });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Product</h1>
      <nav className="text-sm text-gray-500 mb-6">
        Dashboard &gt; Create Product
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image uploader */}
        <div>
          <div className="border-dashed border-2 border-gray-300 rounded-lg h-80 flex items-center justify-center relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover h-full w-full rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400">
                765 x 850
                <br />
                Please choose an image
                <br />
                according to the expected ratio
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2 right-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Edit2 size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Form fields */}
        <div className="col-span-2 space-y-4">
          <InputField
            label="Product Title"
            required
            placeholder="Enter product title"
            value={title}
            onChange={setTitle}
          />

          <TextAreaField
            label="Short Description"
            required
            helpText="Max 150 words"
            placeholder="Enter product description for quick view"
            value={description}
            onChange={setDescription}
          />

          <InputField
            label="Tags"
            required
            placeholder="apple,flagship"
            value={tags}
            onChange={setTags}
          />

          <InputField
            label="Warranty"
            required
            placeholder="1 Year / No Warranty"
            value={warranty}
            onChange={setWarranty}
          />

          <InputField
            label="Slug"
            required
            placeholder="product_slug"
            value={slug}
            onChange={setSlug}
          />

          <InputField
            label="Brand"
            placeholder="Apple"
            value={brand}
            onChange={setBrand}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colors
            </label>
            <ColorPicker colors={colors} onChange={setColors} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Product
        </button>
      </div>
    </div>
  );
}
