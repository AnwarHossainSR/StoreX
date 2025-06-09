"use client";

import { ProductFilters, useProduct } from "@/hooks/useProduct";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import FilterSidebar from "../../../components/products/FilterSidebar";
import ProductGrid from "../../../components/products/ProductGrid";

export default function ProductsPage() {
  const {
    products,
    isLoadingProducts,
    isFetchingProducts,
    productsError,
    categories,
    subCategories,
    isLoadingCategories,
    currentPage,
    totalPages,
    totalProducts,
    setPage,
    filters,
    updateFilters,
    updateSortBy,
    clearFilters,
  } = useProduct();

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<ProductFilters>) => {
    updateFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (sortBy: ProductFilters["sortBy"]) => {
    updateSortBy(sortBy);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    clearFilters();
  };

  // Error state
  if (productsError) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white py-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-500 transition-colors">
                Home
              </Link>
              <ChevronRight size={16} className="mx-2" />
              <span className="text-gray-800">All Products</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Failed to Load Products
            </h2>
            <p className="text-gray-600 mb-4">{productsError}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800">All Products</span>
            {filters.category && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-800">{filters.category}</span>
              </>
            )}
            {filters.subCategory && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-800">{filters.subCategory}</span>
              </>
            )}
          </div>

          {/* Active Filters Summary */}
          {(filters.search ||
            filters.category ||
            filters.brands?.length ||
            filters.colors?.length ||
            filters.minPrice ||
            filters.maxPrice) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {filters.category}
                </span>
              )}
              {filters.subCategory && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {filters.subCategory}
                </span>
              )}
              {filters.brands?.map((brand: string) => (
                <span
                  key={brand}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {brand}
                </span>
              ))}
              {filters.colors?.map((color: string) => (
                <span
                  key={color}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {color}
                </span>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  ${filters.minPrice || 0} - ${filters.maxPrice || 2000}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <FilterSidebar
              categories={categories}
              subCategories={subCategories}
              products={products}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              isLoading={isLoadingCategories}
            />
          </div>

          {/* Product Listing */}
          <div className="w-full lg:w-3/4">
            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              isFetching={isFetchingProducts}
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              filters={filters}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
