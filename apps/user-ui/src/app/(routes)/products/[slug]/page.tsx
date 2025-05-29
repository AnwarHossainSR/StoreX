"use client";

import {
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Mock product data - In a real app, this would come from an API/database
const product = {
  id: 1,
  name: "iPhone 14 Pro Max",
  description:
    "The latest Apple iPhone with A16 Bionic chip, 48MP camera system, and Dynamic Island. Experience the most advanced iPhone ever with revolutionary features and all-day battery life.",
  price: 1099,
  discountPrice: 999,
  rating: 4.9,
  reviews: 214,
  stock: 10,
  brand: "Apple",
  category: "Electronics",
  images: [
    "https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg",
    "https://images.pexels.com/photos/5750002/pexels-photo-5750002.jpeg",
    "https://images.pexels.com/photos/5750003/pexels-photo-5750003.jpeg",
    "https://images.pexels.com/photos/5750004/pexels-photo-5750004.jpeg",
  ],
  features: [
    "6.7-inch Super Retina XDR display",
    "A16 Bionic chip",
    "48MP Main camera",
    "Dynamic Island",
    "All-day battery life",
    "iOS 16",
  ],
  specifications: {
    Display: "6.7-inch Super Retina XDR",
    Processor: "A16 Bionic chip",
    RAM: "6GB",
    Storage: "128GB/256GB/512GB/1TB",
    Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    Battery: "4323mAh",
    OS: "iOS 16",
  },
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const addToCart = () => {
    // Implement cart functionality
    console.log("Added to cart:", { ...product, quantity });
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link
            href="/category/electronics"
            className="hover:text-blue-500 transition-colors"
          >
            Electronics
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-800">
                  ${product.discountPrice}
                </span>
                {product.discountPrice < product.price && (
                  <span className="ml-2 text-xl text-gray-500 line-through">
                    ${product.price}
                  </span>
                )}
                <span className="ml-2 text-sm text-green-500">
                  Save ${product.price - product.discountPrice}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">
                  Key Features:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 py-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium text-gray-800">
                    {product.brand}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-800">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span
                    className={`font-medium ${
                      product.stock > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {product.stock > 0
                      ? `In Stock (${product.stock})`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} className="text-gray-600" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={20} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => {}}
                  className="ml-4 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Heart size={24} className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={addToCart}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </button>
                <Link
                  href="/checkout"
                  className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                  Buy Now
                </Link>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600">
                  <Truck size={20} className="mr-2" />
                  <span>Free shipping on orders over $100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-gray-200"
              >
                <span className="text-gray-600">{key}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
