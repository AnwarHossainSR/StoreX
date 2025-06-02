"use client";

import FilterSidebar from "@/components/shops/ShopFilterSidebar";
import ShopGrid from "@/components/shops/ShopGrid";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Static data for shops with real Pexels image URLs for coverBanner and avater
const staticShops = [
  {
    id: "1",
    name: "TechTrend Innovations",
    category: "Electronics",
    ratings: 4.5,
    reviews: [{ rating: 4.5, review: "Great products!" }],
    address: "123 Tech Street, Silicon Valley",
    coverBanner:
      "https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg", // Electronics-themed cover
    avater:
      "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg", // Tech-themed avater
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Fashion Hub",
    category: "Fashion",
    ratings: 4.0,
    reviews: [{ rating: 4.0, review: "Stylish collection!" }],
    address: "456 Style Avenue, New York",
    coverBanner:
      "https://images.pexels.com/photos/994234/pexels-photo-994234.jpeg", // Fashion-themed cover
    avater:
      "https://images.pexels.com/photos/4498134/pexels-photo-4498134.jpeg", // Fashion-themed avater
    createdAt: "2025-06-01T12:00:00Z",
  },
  {
    id: "3",
    name: "Home Essentials",
    category: "Home & Living",
    ratings: 4.8,
    reviews: [{ rating: 4.8, review: "Quality home goods!" }],
    address: "789 Comfort Road, Chicago",
    coverBanner:
      "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg", // Home-themed cover
    avater:
      "https://images.pexels.com/photos/6492400/pexels-photo-6492400.jpeg", // Home-themed avater
    createdAt: "2025-05-30T12:00:00Z",
  },
];

// Static categories (replace with siteConfig API call)
const staticCategories = ["Electronics", "Fashion", "Home & Living", "Books"];

export default function ShopsPage() {
  const [shops, setShops] = useState(staticShops);
  const [categories, setCategories] = useState(staticCategories);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minRating: 0,
    sortBy: "featured" as "featured" | "highest-rated" | "newest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(staticShops.length);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate fetching data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filteredShops = staticShops;

      // Apply filters
      if (filters.category) {
        filteredShops = filteredShops.filter(
          (shop) => shop.category === filters.category
        );
      }
      if (filters.search) {
        filteredShops = filteredShops.filter((shop) =>
          shop.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      if (filters.minRating) {
        filteredShops = filteredShops.filter(
          (shop) => shop.ratings >= filters.minRating
        );
      }

      // Apply sorting
      if (filters.sortBy === "highest-rated") {
        filteredShops = filteredShops.sort((a, b) => b.ratings - a.ratings);
      } else if (filters.sortBy === "newest") {
        filteredShops = filteredShops.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Pagination
      const pageSize = 12;
      setTotalShops(filteredShops.length);
      setTotalPages(Math.ceil(filteredShops.length / pageSize));
      const startIndex = (currentPage - 1) * pageSize;
      setShops(filteredShops.slice(startIndex, startIndex + pageSize));
      setIsLoading(false);
    }, 500);
  }, [filters, currentPage]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({ category: "", search: "", minRating: 0, sortBy: "featured" });
    setCurrentPage(1);
  };

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
            <span className="text-gray-800">All Shops</span>
            {filters.category && (
              <>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-800">{filters.category}</span>
              </>
            )}
          </div>

          {/* Active Filters Summary */}
          {(filters.search || filters.category || filters.minRating > 0) && (
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
              {filters.minRating > 0 && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  Min Rating: {filters.minRating}
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
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              isLoading={isLoading}
            />
          </div>

          {/* Shop Listing */}
          <div className="w-full lg:w-3/4">
            <ShopGrid
              shops={shops}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              totalShops={totalShops}
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
