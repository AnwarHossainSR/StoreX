"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import {
  CustomProperties,
  CustomSpecifications,
  Property,
  Specification,
} from "@/packages/components/CustomFields";
import { InputField } from "@/packages/components/InputField";
import { TextAreaField } from "@/packages/components/TextAreaField";
import { ColorPicker } from "@/packages/components/colorPicker";
import { Edit2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function CreateProductPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [warranty, setWarranty] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    tags?: string;
    warranty?: string;
    slug?: string;
    category?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    createProduct,
    createProductStatus,
    createProductError,
    createProductErrorDetails,
    categories,
    categoriesError,
    categoriesErrorDetails,
  } = useProduct();
  const { alert, setSuccess, setError, clearAlert } = useAlert();

  useEffect(() => {
    if (createProductStatus === "success") {
      setSuccess("Product created successfully!", { autoDismiss: 3000 });
      setTimeout(() => {
        window.location.href = "/products";
      }, 3000);
    } else if (createProductError) {
      setError(createProductError, {
        isBackendError: true,
        details: createProductErrorDetails,
      });
    } else if (categoriesError) {
      setError(categoriesError, {
        isBackendError: true,
        details: categoriesErrorDetails,
      });
    }
  }, [
    createProductStatus,
    createProductError,
    createProductErrorDetails,
    categoriesError,
    categoriesErrorDetails,
    setSuccess,
    setError,
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      tags?: string;
      warranty?: string;
      slug?: string;
      category?: string;
    } = {};
    let isValid = true;

    if (!title) {
      newErrors.title = "Product title is required";
      isValid = false;
    }
    if (!description) {
      newErrors.description = "Description is required";
      isValid = false;
    }
    if (!tags) {
      newErrors.tags = "Tags are required";
      isValid = false;
    }
    if (!warranty) {
      newErrors.warranty = "Warranty information is required";
      isValid = false;
    }
    if (!slug) {
      newErrors.slug = "Slug is required";
      isValid = false;
    }
    if (!category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const sellerId = "SELLER_ID"; // Replace with actual seller ID from auth context or state
      createProduct({
        sellerId,
        title,
        description,
        tags: tags.split(",").map((tag) => tag.trim()),
        warranty,
        slug,
        brand,
        colors,
        image: imageFile || undefined,
        specifications: specs,
        properties,
        category,
        subCategory: subCategory || undefined,
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Product</h1>
      <nav className="text-sm text-gray-500 mb-6">
        Dashboard {">"} Create Product
      </nav>

      {alert && (
        <Alert
          variant={alert.variant}
          className="mb-4"
          autoDismiss={alert.autoDismiss}
          onDismiss={clearAlert}
          details={alert.details}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              error={errors.title}
            />

            <TextAreaField
              label="Short Description"
              required
              helpText="Max 150 words"
              placeholder="Enter product description for quick view"
              value={description}
              onChange={setDescription}
              error={errors.description}
            />

            <InputField
              label="Tags"
              required
              placeholder="apple, flagship"
              value={tags}
              onChange={setTags}
              error={errors.tags}
            />

            <InputField
              label="Warranty"
              required
              placeholder="1 Year / No Warranty"
              value={warranty}
              onChange={setWarranty}
              error={errors.warranty}
            />

            <InputField
              label="Slug"
              required
              placeholder="product_slug"
              value={slug}
              onChange={setSlug}
              error={errors.slug}
            />

            <InputField
              label="Brand"
              placeholder="Apple"
              value={brand}
              onChange={setBrand}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory(""); // Reset subcategory when category changes
                }}
                className={`block w-full px-3 py-2 border ${
                  errors.category ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                aria-invalid={!!errors.category}
                aria-describedby={
                  errors.category ? "category-error" : undefined
                }
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600" id="category-error">
                  {errors.category}
                </p>
              )}
            </div>

            {category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a subcategory (optional)</option>
                  {categories
                    .find((cat) => cat.name === category)
                    ?.subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors
              </label>
              <ColorPicker colors={colors} onChange={setColors} />
            </div>

            <CustomSpecifications specifications={specs} onChange={setSpecs} />
            <CustomProperties
              properties={properties}
              onChange={setProperties}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={createProductStatus === "pending"}
            className={`px-6 py-2 text-white rounded-md ${
              createProductStatus === "pending"
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {createProductStatus === "pending" ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
