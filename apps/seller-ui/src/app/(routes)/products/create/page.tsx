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
import RichTextEditor from "@/packages/components/RichTextEditor";
import { TextAreaField } from "@/packages/components/TextAreaField";
import { ColorPicker } from "@/packages/components/colorPicker";
import { Edit2, Upload } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function CreateProductPage() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
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
    shortDescription?: string;
    detailedDescription?: string;
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
      setSuccess("Product created successfully! Redirecting...", {
        autoDismiss: 3000,
      });
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
      shortDescription?: string;
      detailedDescription?: string;
      tags?: string;
      warranty?: string;
      slug?: string;
      category?: string;
    } = {};
    let isValid = true;

    if (!title) {
      newErrors.title = "Please enter the product title";
      isValid = false;
    }
    if (!shortDescription) {
      newErrors.shortDescription = "Please enter the short description";
      isValid = false;
    }
    if (!detailedDescription || detailedDescription === "<p><br></p>") {
      newErrors.detailedDescription = "Please enter the detailed description";
      isValid = false;
    }
    if (!tags) {
      newErrors.tags = "Please enter product tags";
      isValid = false;
    } else if (tags.split(",").every((tag) => tag.trim() === "")) {
      newErrors.tags = "Please enter valid tags";
      isValid = false;
    }
    if (!warranty) {
      newErrors.warranty = "Please enter warranty information";
      isValid = false;
    }
    if (!slug) {
      newErrors.slug = "Please enter the product slug";
      isValid = false;
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = "Slug must be lowercase, alphanumeric, and hyphenated";
      isValid = false;
    }
    if (!category) {
      newErrors.category = "Please select a category";
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
      const sellerId = "SELLER_ID"; // Replace with actual seller ID from auth context
      createProduct({
        sellerId,
        title,
        description: shortDescription,
        detailedDescription, // New field for rich text
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
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
    <div className="min-h-screen p-6 bg-white rounded-lg shadow-sm">
      <div className=" mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Create Product
          </h1>

          {alert && (
            <div className="px-8 pt-6">
              <Alert
                variant={alert.variant}
                className="mb-4 rounded-lg"
                autoDismiss={alert.autoDismiss}
                onDismiss={clearAlert}
                details={alert.details}
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl h-80 flex items-center justify-center bg-gray-50 transition-colors group-hover:border-blue-400">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="object-cover h-full w-full rounded-xl"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">765 x 850</p>
                        <p>Upload product image</p>
                        <p className="text-xs">Optimal ratio: 3:4</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-5 w-5 text-blue-600" />
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
              </div>

              <div className="col-span-2 space-y-6">
                <InputField
                  label="Product Title"
                  required
                  placeholder="Enter product title"
                  value={title}
                  onChange={setTitle}
                  error={errors.title}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <TextAreaField
                  label="Short Description"
                  required
                  helpText="Max 150 words"
                  placeholder="Enter product description for quick view"
                  value={shortDescription}
                  onChange={setShortDescription}
                  error={errors.shortDescription}
                  className="transition-all duration-200"
                />
                <RichTextEditor
                  label="Detailed Description"
                  required
                  value={detailedDescription}
                  onChange={setDetailedDescription}
                  placeholder="Enter detailed product description"
                  error={errors.detailedDescription}
                />
                <InputField
                  label="Tags"
                  required
                  placeholder="apple, flagship"
                  value={tags}
                  onChange={setTags}
                  error={errors.tags}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Warranty"
                  required
                  placeholder="1 Year / No Warranty"
                  value={warranty}
                  onChange={setWarranty}
                  error={errors.warranty}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Slug"
                  required
                  placeholder="product-slug"
                  value={slug}
                  onChange={setSlug}
                  error={errors.slug}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Brand"
                  placeholder="Apple"
                  value={brand}
                  onChange={setBrand}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubCategory("");
                    }}
                    className={`block w-full px-4 py-3 border ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white`}
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
                    <p
                      className="mt-1 text-sm text-red-600"
                      id="category-error"
                    >
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
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white"
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
                <CustomSpecifications
                  specifications={specs}
                  onChange={setSpecs}
                />
                <CustomProperties
                  properties={properties}
                  onChange={setProperties}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProductStatus === "pending"}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  createProductStatus === "pending"
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {createProductStatus === "pending"
                  ? "Saving..."
                  : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
