"use client";

import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useState } from "react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface FilterSidebarProps {
  categories: string[];
  filters: { category: string; search: string; minRating: number };
  onFiltersChange: (filters: Partial<FilterSidebarProps["filters"]>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export default function FilterSidebar({
  categories,
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: FilterSidebarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: localSearch });
  };

  // Handle category change
  const handleCategoryChange = (category: string, checked: boolean) => {
    onFiltersChange({ category: checked ? category : "" });
  };

  // Handle rating change
  const handleRatingChange = (minRating: number) => {
    onFiltersChange({ minRating });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        {(filters.search || filters.category || filters.minRating > 0) && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <FilterSection title="Search Shops">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search shops..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Search size={18} className="text-gray-400" />
          </button>
        </form>
        {filters.search && (
          <div className="mt-2 text-sm text-gray-600">
            Searching for: "{filters.search}"
          </div>
        )}
      </FilterSection>

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection title="Categories">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category}`}
                  name="category"
                  checked={filters.category === category}
                  onChange={(e) =>
                    handleCategoryChange(category, e.target.checked)
                  }
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`category-${category}`}
                  className="ml-2 text-gray-700 flex-1 cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((rating) => (
            <div key={rating} className="flex items-center">
              <input
                type="radio"
                id={`rating-${rating}`}
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => handleRatingChange(rating)}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300"
              />
              <label
                htmlFor={`rating-${rating}`}
                className="ml-2 text-gray-700 cursor-pointer"
              >
                {rating} Stars & Up
              </label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
