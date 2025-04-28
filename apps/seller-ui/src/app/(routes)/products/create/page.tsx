"use client";
import ImageEnhancementModal from "@/components/modal/EnhancementModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import apiClient from "@/lib/apiClient";
import { ColorPicker } from "@/packages/components/colorPicker";
import {
  CustomProperties,
  CustomSpecifications,
  Property,
  Specification,
} from "@/packages/components/CustomFields";
import { ImagePlaceholder } from "@/packages/components/ImagePlaceHolder";
import { InputField } from "@/packages/components/InputField";
import RichTextEditor from "@/packages/components/RichTextEditor";
import { SizeSelector } from "@/packages/components/SizeSelector";
import { TextAreaField } from "@/packages/components/TextAreaField";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface UploadedImage {
  file_name: string;
  file_url: string;
}

interface DiscountCode {
  id: string;
  public_name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountCode: string;
  createdAt: string;
}

const DiscountCodeSelector: React.FC<{
  discountCodes: DiscountCode[];
  selectedCodes: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}> = ({ discountCodes = [], selectedCodes, onChange, disabled = false }) => {
  const handleToggle = (codeId: string) => {
    if (disabled) return;
    if (selectedCodes.includes(codeId)) {
      onChange(selectedCodes.filter((id) => id !== codeId));
    } else {
      onChange([...selectedCodes, codeId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Discount Codes
      </label>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
        {discountCodes.length === 0 ? (
          <span className="inline-block px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
            No discount codes available
          </span>
        ) : (
          discountCodes.map((code) => (
            <span
              key={code.id}
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                selectedCodes.includes(code.id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleToggle(code.id)}
            >
              {code.public_name} (
              {code.discountType === "percentage"
                ? `${code.discountValue}%`
                : `$${code.discountValue}`}
              )
            </span>
          ))
        )}
      </div>
    </div>
  );
};

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
  const [discountCodes, setDiscountCodes] = useState<string[]>([]);
  const [mode, setMode] = useState<"draft" | "edit" | "lock">("edit");
  const [imageFiles, setImageFiles] = useState<UploadedImage[]>([]);
  const [specs, setSpecs] = useState<Specification[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isEnhancementModalOpen, setIsEnhancementModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null
  );

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    pricing: true,
    inventory: true,
    specifications: true,
  });

  const [errors, setErrors] = useState<{
    title?: string;
    shortDescription?: string;
    detailedDescription?: string;
    tags?: string;
    warranty?: string;
    slug?: string;
    category?: string;
    subCategory?: string;
    regularPrice?: string;
    salePrice?: string;
    videoUrl?: string;
    stock?: string;
    shopId?: string;
    images?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const {
    createProduct,
    saveDraft,
    createProductStatus,
    createProductError,
    createProductErrorDetails,
    categories,
    categoriesError,
    categoriesErrorDetails,
    discountCodes: discountCodesData,
    discountCodesStatus,
    discountCodesError,
    discountCodesErrorDetails,
  } = useProduct();
  const { alert, setSuccess, setError, clearAlert } = useAlert();

  useEffect(() => {
    if (createProductStatus === "success") {
      setSuccess("Product created successfully! Redirecting...", {
        autoDismiss: 3000,
      });
      setTimeout(() => {
        router.push("/products");
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
    } else if (discountCodesError) {
      setError(discountCodesError, {
        isBackendError: true,
        details: discountCodesErrorDetails,
      });
    }
  }, [
    createProductStatus,
    createProductError,
    createProductErrorDetails,
    categoriesError,
    categoriesErrorDetails,
    discountCodesError,
    discountCodesErrorDetails,
    setSuccess,
    setError,
    router,
  ]);

  const makeBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Url = await makeBase64(file);
      const response = await apiClient.post("/products/upload-product-image", {
        file: base64Url,
      });
      console.log("Image uploaded successfully:", response.data);
      const uploadedImage: UploadedImage = {
        file_name: response.data.file_name,
        file_url: response.data.file_url,
      };
      setImageFiles((prev) => {
        let newFiles = [...prev, uploadedImage];
        if (newFiles.length > 8) {
          newFiles = newFiles.slice(1); // Remove oldest image
        }
        return newFiles;
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image", {
        isBackendError: true,
        details: error.message,
      });
    }
  };

  const handleRemoveImage = async (image: UploadedImage, index: number) => {
    if (mode === "lock") return;
    try {
      const response = await apiClient.post("/products/delete-product-image", {
        fileId: image.file_name,
      });
      console.log("Image deleted successfully:", response.data);
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    } catch (error: any) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image", {
        isBackendError: true,
        details: error.message,
      });
    }
  };

  const handleEnhanceImage = (image: UploadedImage) => {
    setSelectedImage(image);
    setIsEnhancementModalOpen(true);
  };

  const handleImageEnhance = (image: UploadedImage, enhancedUrl: string) => {
    setImageFiles((prev) =>
      prev.map((img) =>
        img.file_name === image.file_name
          ? { ...img, file_url: enhancedUrl }
          : img
      )
    );
  };

  const closeEnhancementModal = () => {
    setIsEnhancementModalOpen(false);
    setSelectedImage(null);
  };

  const validateForm = (isDraft: boolean = false) => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!isDraft) {
      if (!title) {
        newErrors.title = "Product title is required";
        isValid = false;
      }
      if (!shortDescription) {
        newErrors.shortDescription = "Short description is required";
        isValid = false;
      }
      if (!detailedDescription || detailedDescription === "<p><br></p>") {
        newErrors.detailedDescription = "Detailed description is required";
        isValid = false;
      }
      if (!tags) {
        newErrors.tags = "At least one tag is required";
        isValid = false;
      }
      if (!slug) {
        newErrors.slug = "Product slug is required";
        isValid = false;
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        newErrors.slug = "Slug must be lowercase, alphanumeric, and hyphenated";
        isValid = false;
      }
      if (!category) {
        newErrors.category = "Category selection is required";
        isValid = false;
      }
      if (!subCategory) {
        newErrors.subCategory = "Subcategory selection is required";
        isValid = false;
      }
      if (!regularPrice) {
        newErrors.regularPrice = "Regular price is required";
        isValid = false;
      } else if (isNaN(Number(regularPrice)) || Number(regularPrice) <= 0) {
        newErrors.regularPrice = "Regular price must be a positive number";
        isValid = false;
      }
      if (!salePrice) {
        newErrors.salePrice = "Sale price is required";
        isValid = false;
      } else if (isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
        newErrors.salePrice = "Sale price must be a positive number";
        isValid = false;
      } else if (Number(salePrice) >= Number(regularPrice)) {
        newErrors.salePrice = "Sale price must be less than regular price";
        isValid = false;
      }
      if (
        videoUrl &&
        !/^(https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+)$/.test(
          videoUrl
        )
      ) {
        newErrors.videoUrl = "Please enter a valid YouTube or Vimeo URL";
        isValid = false;
      }
      if (!stock) {
        newErrors.stock = "Stock quantity is required";
        isValid = false;
      } else if (
        isNaN(Number(stock)) ||
        Number(stock) < 0 ||
        !Number.isInteger(Number(stock))
      ) {
        newErrors.stock = "Stock must be a non-negative integer";
        isValid = false;
      }

      if (imageFiles.length === 0) {
        newErrors.images = "At least one image is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    if (!isValid && !isDraft) {
      setError("Please correct the form errors", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const sellerId = "SELLER_ID"; // Replace with actual seller ID from auth context
      const custom_specifications = specs.reduce(
        (acc, spec) => ({ ...acc, [spec.name]: spec.value }),
        {}
      );
      const custom_properties = properties.reduce(
        (acc, prop) => ({ ...acc, [prop.key]: prop.values }),
        {}
      );
      createProduct({
        sellerId,
        title,
        short_description: shortDescription,
        detailed_description: detailedDescription,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        warranty: warranty || undefined,
        slug,
        brand: brand || undefined,
        colors,
        images: imageFiles,
        custom_specifications,
        custom_properties,
        category,
        subCategory,
        sale_price: Number(salePrice),
        regular_price: Number(regularPrice),
        stock: Number(stock),
        video_url: videoUrl || undefined,
        cashOnDelivery: cashOnDelivery || undefined,
        sizes,
        discount_codes: discountCodes,
        status: mode === "edit" ? "Active" : "Pending",
      });
    }
  };

  const handleSaveDraft = () => {
    const sellerId = "SELLER_ID"; // Replace with actual seller ID from auth context
    const custom_specifications = specs.reduce(
      (acc, spec) => ({ ...acc, [spec.name]: spec.value }),
      {}
    );
    const custom_properties = properties.reduce(
      (acc, prop) => ({ ...acc, [prop.key]: prop.values }),
      {}
    );
    saveDraft({
      sellerId,
      title,
      short_description: shortDescription,
      detailed_description: detailedDescription,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      warranty: warranty || undefined,
      slug,
      brand: brand || undefined,
      colors,
      images: imageFiles,
      custom_specifications,
      custom_properties,
      category,
      subCategory,
      sale_price: salePrice ? Number(salePrice) : 0,
      regular_price: regularPrice ? Number(regularPrice) : 0,
      stock: stock ? Number(stock) : 0,
      video_url: videoUrl || undefined,
      cashOnDelivery: cashOnDelivery || undefined,
      sizes,
      discount_codes: discountCodes,
      status: "Draft",
    });
    setSuccess("Draft saved successfully!", { autoDismiss: 3000 });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Create New Product
                </h1>
                <p className="text-blue-100 mt-1">
                  Fill in the details to add a new product to your catalog
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  mode === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : mode === "edit"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </div>
          </div>

          {alert && (
            <div className="px-8 py-4">
              <Alert
                variant={alert.variant}
                className="rounded-lg"
                autoDismiss={alert.autoDismiss}
                onDismiss={clearAlert}
                details={alert.details}
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Basic Information Section */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleSection("basic")}
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                {expandedSections.basic ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.basic && (
                <div className="p-4 space-y-4">
                  <InputField
                    label="Product Title"
                    required
                    placeholder="Enter product title"
                    value={title}
                    onChange={setTitle}
                    error={errors.title}
                    helpText="Enter a clear, descriptive product name"
                    disabled={mode === "lock"}
                  />
                  <InputField
                    label="Slug"
                    required
                    placeholder="product-slug"
                    value={slug}
                    onChange={setSlug}
                    error={errors.slug}
                    helpText="Use lowercase letters, numbers, and hyphens"
                    disabled={mode === "lock"}
                  />
                  <TextAreaField
                    label="Short Description"
                    required
                    placeholder="Enter brief product description"
                    value={shortDescription}
                    onChange={setShortDescription}
                    error={errors.shortDescription}
                    helpText="Max 150 words"
                    rows={4}
                    disabled={mode === "lock"}
                  />
                  <RichTextEditor
                    label="Detailed Description"
                    required
                    value={detailedDescription}
                    onChange={setDetailedDescription}
                    placeholder="Enter detailed product description"
                    error={errors.detailedDescription}
                    helpText="Use formatting to highlight key features"
                    disabled={mode === "lock"}
                  />
                  <InputField
                    label="Tags"
                    required
                    placeholder="electronics, smartphone, wireless"
                    value={tags}
                    onChange={setTags}
                    error={errors.tags}
                    helpText="Separate tags with commas"
                    disabled={mode === "lock"}
                  />
                  <InputField
                    label="Brand"
                    placeholder="Enter brand name"
                    value={brand}
                    onChange={setBrand}
                    helpText="Optional brand name"
                    disabled={mode === "lock"}
                  />
                  <InputField
                    label="Warranty"
                    placeholder="1 Year Warranty"
                    value={warranty}
                    onChange={setWarranty}
                    error={errors.warranty}
                    helpText="Optional warranty terms"
                    disabled={mode === "lock"}
                  />
                </div>
              )}
            </div>

            {/* Media Section */}
            <div className="border rounded-xl bg-white shadow-lg">
              <button
                type="button"
                className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-t-xl hover:from-blue-600 hover:to-blue-800 transition-colors"
                onClick={() => toggleSection("media")}
              >
                <h2 className="text-lg font-semibold">Media</h2>
                {expandedSections.media ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.media && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Product Images
                    </label>
                    {imageFiles.length > 0 ? (
                      <div className="flex overflow-x-auto gap-3 pb-2">
                        {imageFiles.map((image, index) => (
                          <ImagePlaceholder
                            key={index}
                            image={image}
                            index={index}
                            previewUrl={image.file_url}
                            onRemove={handleRemoveImage}
                            onEnhance={handleEnhanceImage}
                            disabled={mode === "lock"}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No images uploaded yet
                      </div>
                    )}
                    <div
                      className="mt-4 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer w-[150px] h-[150px] flex flex-col items-center justify-center"
                      style={{ width: "150px", height: "150px" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload
                        className="mx-auto h-12 w-12 text-blue-500 animate-pulse"
                        style={{ animationDuration: "1.5s" }}
                      />
                      <p className="mt-2 text-xs font-medium text-gray-800">
                        Upload Image
                      </p>
                      <p className="text-xs text-gray-500">765 x 850</p>
                      <p className="text-xs text-gray-400">Ratio: 3:4</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={mode === "lock"}
                      />
                    </div>
                    {errors.images && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.images}
                      </p>
                    )}
                  </div>
                  <InputField
                    label="Video URL"
                    placeholder="YouTube/Vimeo URL"
                    value={videoUrl}
                    onChange={setVideoUrl}
                    error={errors.videoUrl}
                    helpText="Optional promotional video URL"
                    disabled={mode === "lock"}
                    className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Colors
                    </label>
                    <ColorPicker
                      colors={colors}
                      onChange={setColors}
                      disabled={mode === "lock"}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Section */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleSection("pricing")}
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Pricing & Discounts
                </h2>
                {expandedSections.pricing ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.pricing && (
                <div className="p-4 space-y-4">
                  <InputField
                    label="Regular Price"
                    required
                    type="number"
                    placeholder="Enter regular price"
                    value={regularPrice}
                    onChange={setRegularPrice}
                    error={errors.regularPrice}
                    helpText="Price in USD"
                    disabled={mode === "lock"}
                  />
                  <InputField
                    label="Sale Price"
                    required
                    type="number"
                    placeholder="Enter sale price"
                    value={salePrice}
                    onChange={setSalePrice}
                    error={errors.salePrice}
                    helpText="Discounted price"
                    disabled={mode === "lock"}
                  />
                  <DiscountCodeSelector
                    discountCodes={discountCodesData || []}
                    selectedCodes={discountCodes}
                    onChange={setDiscountCodes}
                    disabled={
                      mode === "lock" || discountCodesStatus === "pending"
                    }
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cashOnDelivery}
                      onChange={(e) => setCashOnDelivery(e.target.checked)}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={mode === "lock"}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Cash on Delivery
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Section */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleSection("inventory")}
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Inventory & Variants
                </h2>
                {expandedSections.inventory ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.inventory && (
                <div className="p-4 space-y-4">
                  <InputField
                    label="Stock Quantity"
                    required
                    type="number"
                    placeholder="Enter stock quantity"
                    value={stock}
                    onChange={setStock}
                    error={errors.stock}
                    helpText="Available inventory count"
                    disabled={mode === "lock"}
                  />
                  <SizeSelector
                    sizes={sizes}
                    onChange={setSizes}
                    disabled={mode === "lock"}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setSubCategory("");
                      }}
                      className={`w-full px-4 py-3 border rounded-lg ${
                        errors.category ? "border-red-300" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      disabled={mode === "lock"}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>
                  {category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.subCategory
                            ? "border-red-300"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        disabled={mode === "lock"}
                      >
                        <option value="">Select subcategory</option>
                        {categories
                          .find((cat) => cat.name === category)
                          ?.subCategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                      {errors.subCategory && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.subCategory}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Status
                    </label>
                    <select
                      value={mode}
                      onChange={(e) =>
                        setMode(e.target.value as "draft" | "edit" | "lock")
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="edit">Published</option>
                      <option value="lock">Locked</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className="border rounded-lg">
              <button
                type="button"
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleSection("specifications")}
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  Specifications & Properties
                </h2>
                {expandedSections.specifications ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedSections.specifications && (
                <div className="p-4 space-y-4">
                  <CustomSpecifications
                    specifications={specs}
                    onChange={setSpecs}
                    disabled={mode === "lock"}
                  />
                  <CustomProperties
                    properties={properties}
                    onChange={setProperties}
                    disabled={mode === "lock"}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 transition-colors"
                onClick={() => router.push("/seller/products")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 transition-colors"
                onClick={handleSaveDraft}
                disabled={createProductStatus === "pending" || mode === "lock"}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={createProductStatus === "pending" || mode === "lock"}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors ${
                  createProductStatus === "pending" || mode === "lock"
                    ? "opacity-50 cursor-not-allowed"
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

      {/* AI Enhancement Modal */}
      <ImageEnhancementModal
        isOpen={isEnhancementModalOpen}
        onClose={closeEnhancementModal}
        image={selectedImage}
        onEnhance={handleImageEnhance}
      />
    </div>
  );
}
