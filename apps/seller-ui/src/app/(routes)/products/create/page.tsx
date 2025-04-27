"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import { ColorPicker } from "@/packages/components/colorPicker";
import {
  CustomProperties,
  CustomSpecifications,
  Property,
  Specification,
} from "@/packages/components/CustomFields";
import { InputField } from "@/packages/components/InputField";
import RichTextEditor from "@/packages/components/RichTextEditor";
import { SizeSelector } from "@/packages/components/SizeSelector";
import { TextAreaField } from "@/packages/components/TextAreaField";
import { Edit2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [discountCodes, setDiscountCodes] = useState("");
  const [mode, setMode] = useState<"draft" | "edit" | "lock">("edit");
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
    regularPrice?: string;
    salePrice?: string;
    videoUrl?: string;
    stock?: string;
    sizes?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
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
        router.push("/seller/products");
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
    router,
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
      regularPrice?: string;
      salePrice?: string;
      videoUrl?: string;
      stock?: string;
      sizes?: string;
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
    if (!regularPrice) {
      newErrors.regularPrice = "Please enter the regular price";
      isValid = false;
    } else if (isNaN(Number(regularPrice)) || Number(regularPrice) <= 0) {
      newErrors.regularPrice = "Regular price must be a positive number";
      isValid = false;
    }
    if (salePrice && (isNaN(Number(salePrice)) || Number(salePrice) <= 0)) {
      newErrors.salePrice = "Sale price must be a positive number";
      isValid = false;
    } else if (salePrice && Number(salePrice) >= Number(regularPrice)) {
      newErrors.salePrice = "Sale price must be less than regular price";
      isValid = false;
    }
    if (videoUrl) {
      const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      const vimeoRegex = /^https?:\/\/(www\.)?vimeo\.com\/.+$/;
      if (!youtubeRegex.test(videoUrl) && !vimeoRegex.test(videoUrl)) {
        newErrors.videoUrl = "Please enter a valid YouTube or Vimeo embed URL";
        isValid = false;
      }
    }
    if (!stock) {
      newErrors.stock = "Please enter the stock quantity";
      isValid = false;
    } else if (
      isNaN(Number(stock)) ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      newErrors.stock = "Stock must be a non-negative integer";
      isValid = false;
    }
    if (sizes.length === 0) {
      newErrors.sizes = "Please select at least one size";
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
        detailedDescription,
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
        regularPrice: Number(regularPrice),
        salePrice: salePrice ? Number(salePrice) : undefined,
        videoUrl: videoUrl || undefined,
        cashOnDelivery,
        stock: Number(stock),
        sizes,
        discountCodes:
          discountCodes
            .split(",")
            .map((code) => code.trim())
            .filter((code) => code) || undefined,
        mode,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden">
          <div className=" px-8 py-6">
            <h1 className="text-3xl font-bold">Create New Product</h1>
          </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: Image */}
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
                <InputField
                  label="Product Title"
                  required
                  placeholder="Enter product title"
                  value={title}
                  onChange={setTitle}
                  error={errors.title}
                  helpText="Enter a concise product name"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Slug"
                  required
                  placeholder="product-slug"
                  value={slug}
                  onChange={setSlug}
                  error={errors.slug}
                  helpText="Use lowercase letters, numbers, and hyphens"
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Tags"
                  required
                  placeholder="apple, flagship"
                  value={tags}
                  onChange={setTags}
                  error={errors.tags}
                  helpText="Separate tags with commas"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Warranty"
                  required
                  placeholder="1 Year / No Warranty"
                  value={warranty}
                  onChange={setWarranty}
                  error={errors.warranty}
                  helpText="Specify warranty duration or terms"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Column 2: Specifications and Properties */}
              <div className="space-y-6">
                <InputField
                  label="Brand"
                  placeholder="Apple"
                  value={brand}
                  onChange={setBrand}
                  helpText="Enter the brand name (optional)"
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
                <RichTextEditor
                  label="Detailed Description"
                  required
                  value={detailedDescription}
                  onChange={setDetailedDescription}
                  placeholder="Enter detailed product description"
                  error={errors.detailedDescription}
                  helpText="Use formatting, images (resize/align), and media to highlight features"
                  className="transition-all duration-200"
                />
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

                <div className="flex items-center space-x-3 gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </label>
                  <input
                    type="checkbox"
                    checked={cashOnDelivery}
                    onChange={(e) => setCashOnDelivery(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Column 3: Other Fields */}
              <div className="space-y-6">
                <InputField
                  label="Regular Price"
                  required
                  type="number"
                  placeholder="Enter regular price"
                  value={regularPrice}
                  onChange={setRegularPrice}
                  error={errors.regularPrice}
                  helpText="Price in USD"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Sale Price"
                  type="number"
                  placeholder="Enter sale price (optional)"
                  value={salePrice}
                  onChange={setSalePrice}
                  error={errors.salePrice}
                  helpText="Discounted price, if applicable"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  label="Video URL"
                  placeholder="Enter YouTube/Vimeo embed URL (optional)"
                  value={videoUrl}
                  onChange={setVideoUrl}
                  error={errors.videoUrl}
                  helpText="E.g., https://www.youtube.com/watch?v=..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />

                <InputField
                  label="Stock Quantity"
                  required
                  type="number"
                  placeholder="Enter stock quantity"
                  value={stock}
                  onChange={setStock}
                  error={errors.stock}
                  helpText="Number of items in stock"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <SizeSelector
                  sizes={sizes}
                  onChange={setSizes}
                  error={errors.sizes}
                  className="transition-all duration-200"
                />
                <InputField
                  label="Discount Codes"
                  placeholder="CODE1, CODE2 (optional)"
                  value={discountCodes}
                  onChange={setDiscountCodes}
                  helpText="Comma-separated discount codes"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as "draft" | "edit" | "lock")
                    }
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="edit">Edit</option>
                    <option value="lock">Lock</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                onClick={() => router.push("/seller/products")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProductStatus === "pending" || mode === "lock"}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  createProductStatus === "pending" || mode === "lock"
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {createProductStatus === "pending"
                  ? "Saving..."
                  : mode === "lock"
                  ? "Locked"
                  : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
