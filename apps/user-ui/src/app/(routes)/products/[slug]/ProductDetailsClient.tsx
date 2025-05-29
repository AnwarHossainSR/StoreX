"use client";

import { Product } from "@/services/productService";
import DomPurify from "dompurify";
import {
  Award,
  CheckCircle,
  DollarSign,
  Heart,
  Minus,
  Package,
  Palette,
  Play,
  Plus,
  Ruler,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showVideo, setShowVideo] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage =
    product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100
        )
      : 0;

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  const addToCart = () => {
    console.log("Added to cart:", {
      productId: product.id,
      quantity,
      selectedColor,
      selectedSize,
    });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-400 fill-current opacity-50"
            : "text-gray-300"
        }
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Main Product Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group">
              {product.images.length > 0 ? (
                <Image
                  src={
                    product.images[selectedImage]?.url ||
                    "/placeholder-image.jpg"
                  }
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={64} />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercentage > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{discountPercentage}% OFF
                  </div>
                )}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status}
                </div>
              </div>

              {/* Video Button */}
              {product.video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-all shadow-lg hover:shadow-xl"
                >
                  <Play size={20} className="text-blue-600" />
                </button>
              )}

              {/* Share & Wishlist */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all shadow-lg">
                  <Share2 size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`backdrop-blur-sm rounded-full p-2 transition-all shadow-lg ${
                    isWishlisted
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-white/90 hover:bg-white"
                  }`}
                >
                  <Heart
                    size={18}
                    className={
                      isWishlisted ? "text-white fill-current" : "text-gray-600"
                    }
                  />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:shadow-md ${
                      selectedImage === index
                        ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {product.brand && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {product.brand}
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  SKU: {product.id.slice(-8)}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.short_description}
              </p>
            </div>

            {/* Rating & Shop Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(product.ratings)}
                    <span className="ml-2 font-bold text-gray-900">
                      {product.ratings}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm">{product.totalSales} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Store size={16} />
                  <Link
                    href={`/shop/${product.shopId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {product.Shop.name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.sale_price.toFixed(2)}
                </span>
                {product.regular_price > product.sale_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.regular_price.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      Save $
                      {(product.regular_price - product.sale_price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>Price per unit</span>
                </div>
                {product.cashOnDelivery && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={14} />
                    <span>Cash on Delivery</span>
                  </div>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Color: {selectedColor}
                  </h3>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                        selectedColor === color
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={20} className="text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Size: {selectedSize}
                  </h3>
                </div>
                <div className="flex gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                        selectedSize === size
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock & Quantity */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-gray-600" />
                <span className="text-gray-700">Stock:</span>
                <span
                  className={`font-bold ${
                    product.stock > 10
                      ? "text-green-600"
                      : product.stock > 0
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} className="text-gray-600" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <Zap size={20} />
                Buy Now
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <Truck size={18} />
                <span className="text-sm">Free Shipping</span>
              </div>
              {product.warranty && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Shield size={18} />
                  <span className="text-sm">{product.warranty}</span>
                </div>
              )}
              {product.cashOnDelivery && (
                <div className="flex items-center gap-2 text-purple-600">
                  <DollarSign size={18} />
                  <span className="text-sm">Cash on Delivery</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-orange-600">
                <Award size={18} />
                <span className="text-sm">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {["description", "specifications", "properties", "details"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: DomPurify.sanitize(
                    product.detailed_description || "N/A"
                  ),
                }}
              />
            </div>
          )}

          {activeTab === "specifications" && product.custom_specifications && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(product.custom_specifications).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-900">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "properties" && (
            <div className="space-y-6">
              {Object.entries(product.custom_properties).map(
                ([key, values]) => (
                  <div key={key}>
                    <h3 className="font-semibold text-gray-900 mb-3">{key}</h3>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sub Category</span>
                  <span className="font-medium">{product.subCategory}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                {product.discount_codes.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-2">
                      Available Discount Codes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.discount_codes.map((code, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
