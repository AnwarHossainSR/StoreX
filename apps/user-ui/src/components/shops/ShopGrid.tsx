"use client";

import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Shop {
  id: string;
  name: string;
  category: string;
  ratings: number;
  reviews: { rating: number; review?: string }[];
  address: string;
  coverBanner?: string;
  avatar?: string; // Added logo field
}

interface ShopGridProps {
  shops: Shop[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalShops: number;
  filters: { sortBy: "featured" | "highest-rated" | "newest" };
  onSortChange: (sortBy: "featured" | "highest-rated" | "newest") => void;
  onPageChange: (page: number) => void;
}

export default function ShopGrid({
  shops,
  isLoading,
  currentPage,
  totalPages,
  totalShops,
  filters,
  onSortChange,
  onPageChange,
}: ShopGridProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  // Calculate display range
  const startRange = totalShops > 0 ? (currentPage - 1) * 12 + 1 : 0;
  const endRange = Math.min(currentPage * 12, totalShops);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
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

        {/* Shops Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
            >
              <div className="h-60 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
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
            of <span className="font-semibold">{totalShops}</span> results
          </span>
        </div>

        <div className="flex items-center w-full sm:w-auto">
          <label htmlFor="sort" className="mr-2 text-gray-700">
            Sort By:
          </label>
          <select
            id="sort"
            value={filters.sortBy}
            onChange={(e) =>
              onSortChange(
                e.target.value as "featured" | "highest-rated" | "newest"
              )
            }
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white w-full sm:w-auto"
          >
            <option value="featured">Featured</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* No Results */}
      {shops.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm0-10a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No shops found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Shops Grid */}
      {view === "grid" && shops.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="h-60 overflow-hidden">
                  <Link href={`/shops/${shop.id}`}>
                    <Image
                      src={shop.coverBanner || "/fallback-product.svg"}
                      alt={shop.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/fallback-product.svg";
                      }}
                    />
                  </Link>
                </div>
                {/* Shop Logo */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={shop.avatar || "/fallback-product.svg"}
                    alt={`${shop.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-product.svg";
                    }}
                  />
                </div>
              </div>
              <div className="p-4">
                <Link href={`/shops/${shop.id}`}>
                  <h3 className="text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors line-clamp-2">
                    {shop.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mb-2">{shop.category}</p>
                <div className="flex items-center mb-2">
                  {renderStars(shop.ratings)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({shop.reviews.length})
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {shop.address}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shops List */}
      {view === "list" && shops.length > 0 && (
        <div className="space-y-6">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row"
            >
              <div className="relative md:w-1/3">
                <div className="h-60 md:h-full overflow-hidden">
                  <Link href={`/shops/${shop.id}`}>
                    <Image
                      src={shop.coverBanner || "/fallback-product.svg"}
                      alt={shop.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/fallback-product.svg";
                      }}
                    />
                  </Link>
                </div>
                {/* Shop Logo */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <Image
                    src={shop.avatar || "/fallback-product.svg"}
                    alt={`${shop.name} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain bg-white"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-product.svg";
                    }}
                  />
                </div>
              </div>
              <div className="p-6 flex-1">
                <Link href={`/shops/${shop.id}`}>
                  <h3 className="text-xl text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
                    {shop.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{shop.category}</p>
                <div className="flex items-center mb-2">
                  {renderStars(shop.ratings)}
                  <span className="text-gray-500 ml-2">
                    {shop.ratings} ({shop.reviews.length} reviews)
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {shop.address}
                </p>
              </div>
            </div>
          ))}
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
