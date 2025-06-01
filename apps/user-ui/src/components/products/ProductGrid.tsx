"use client";

import { ProductFilters } from "@/hooks/useProduct";
import { Product } from "@/services/productService";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid,
  Heart,
  List,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  filters: ProductFilters;
  onSortChange: (sortBy: ProductFilters["sortBy"]) => void;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({
  products,
  isLoading,
  isFetching,
  currentPage,
  totalPages,
  totalProducts,
  filters,
  onSortChange,
  onPageChange,
}: ProductGridProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  // Calculate display range
  const startRange = totalProducts > 0 ? (currentPage - 1) * 12 + 1 : 0;
  const endRange = Math.min(currentPage * 12, totalProducts);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const calculateDiscount = (regular: number, sale: number) => {
    if (sale >= regular) return 0;
    return Math.round(((regular - sale) / regular) * 100);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400"
            : i < rating
            ? "text-yellow-300"
            : "text-gray-300"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (isLoading) {
    return (
      <div>
        {/* Toolbar Skeleton */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded ml-4"></div>
            </div>
            <div className="w-40 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
            >
              <div className="h-60 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={isFetching ? "opacity-75 pointer-events-none" : ""}>
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <button
            className={`p-2 rounded-l-md ${
              view === "grid"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setView("grid")}
          >
            <Grid size={18} />
          </button>
          <button
            className={`p-2 rounded-r-md ${
              view === "list"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setView("list")}
          >
            <List size={18} />
          </button>
          <span className="ml-4 text-gray-500 text-sm">
            Showing{" "}
            <span className="font-semibold">
              {startRange}-{endRange}
            </span>{" "}
            of <span className="font-semibold">{totalProducts}</span> results
          </span>
        </div>

        <div className="flex items-center w-full sm:w-auto">
          <label htmlFor="sort" className="mr-2 text-gray-700">
            Sort By:
          </label>
          <select
            id="sort"
            value={filters.sortBy || "featured"}
            onChange={(e) =>
              onSortChange(e.target.value as ProductFilters["sortBy"])
            }
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white w-full sm:w-auto"
          >
            <option value="featured">Featured</option>
            <option value="topSales">Best Selling</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="latest">Latest</option>
          </select>
        </div>
      </div>

      {/* No Results */}
      {products.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingCart size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Products Grid */}
      {view === "grid" && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const discount = calculateDiscount(
              product.regular_price,
              product.sale_price
            );
            const primaryImage =
              product.images?.[0]?.url || "/placeholder-product.jpg";

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <div className="h-60 overflow-hidden">
                    <Image
                      src={primaryImage}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.jpg";
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <Heart size={18} className="text-gray-600" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <Eye size={18} className="text-gray-600" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <ShoppingCart size={18} className="text-gray-600" />
                    </button>
                  </div>
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {discount}% OFF
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.category}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-blue-600 mb-2 font-medium">
                      {product.brand}
                    </p>
                  )}
                  <div className="flex items-center mb-2">
                    {renderStars(product.ratings)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.totalSales})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-800">
                        {formatPrice(product.sale_price)}
                      </span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {formatPrice(product.regular_price)}
                        </span>
                      )}
                    </div>
                    <button
                      className={`text-sm font-medium ${
                        product.stock > 0
                          ? "text-blue-500 hover:text-blue-600"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? "Add to cart" : "Out of stock"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products List */}
      {view === "list" && products.length > 0 && (
        <div className="space-y-6">
          {products.map((product) => {
            const discount = calculateDiscount(
              product.regular_price,
              product.sale_price
            );
            const primaryImage =
              product.images?.[0]?.url || "/placeholder-product.jpg";

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
              >
                <div className="relative md:w-1/3">
                  <div className="h-60 md:h-full overflow-hidden">
                    <Image
                      src={primaryImage}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-product.jpg";
                      }}
                    />
                  </div>
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {discount}% OFF
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-2">
                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="text-xl text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    {product.brand && (
                      <p className="text-sm text-blue-600 font-medium">
                        {product.brand}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center mb-4">
                    {renderStars(product.ratings)}
                    <span className="text-gray-500 ml-2">
                      {product.ratings} ({product.totalSales} sold)
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.short_description}
                  </p>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500 mr-2">
                        Colors:
                      </span>
                      <div className="inline-flex gap-1">
                        {product.colors.slice(0, 5).map((color, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{product.colors.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-between">
                    <div className="mb-3 md:mb-0">
                      <span className="text-2xl font-bold text-gray-800">
                        {formatPrice(product.sale_price)}
                      </span>
                      {discount > 0 && (
                        <span className="text-lg text-gray-500 line-through ml-2">
                          {formatPrice(product.regular_price)}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Heart size={20} className="text-gray-600" />
                      </button>
                      <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Eye size={20} className="text-gray-600" />
                      </button>
                      <button
                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                          product.stock > 0
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`h-10 w-10 flex items-center justify-center rounded-l-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Numbers */}
            {(() => {
              const pages = [];
              const showPages = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(showPages / 2)
              );
              let endPage = Math.min(totalPages, startPage + showPages - 1);

              if (endPage - startPage + 1 < showPages) {
                startPage = Math.max(1, endPage - showPages + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`h-10 w-10 flex items-center justify-center border-t border-b ${
                      currentPage === i
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              return pages;
            })()}

            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`h-10 w-10 flex items-center justify-center rounded-r-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
