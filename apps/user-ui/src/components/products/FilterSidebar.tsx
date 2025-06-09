"use client";

import { ProductFilters } from "@/hooks/useProduct";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

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
  subCategories: Record<string, string[]>;
  products: any[];
  filters: ProductFilters;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export default function FilterSidebar({
  categories,
  subCategories,
  products,
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([
    filters?.minPrice || 0,
    filters?.maxPrice || 2000,
  ]);
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [brandSearch, setBrandSearch] = useState(""); // Renamed for clarity

  // Extract unique brands and colors from products
  const { availableBrands, availableColors } = useMemo(() => {
    const brandsSet = new Set<string>();
    const colorsSet = new Set<string>();

    products?.forEach((product) => {
      if (product.brand) brandsSet.add(product.brand);
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: string) => colorsSet.add(color));
      }
    });

    const brands = Array.from(brandsSet)
      .filter(Boolean)
      .map((brand) => ({
        id: brand.toLowerCase().replace(/\s+/g, "-"),
        name: brand,
        count: products.filter((p) => p.brand === brand).length,
      }))
      .sort((a, b) => b.count - a.count);

    const colors = Array.from(colorsSet)
      .filter(Boolean)
      .map((color) => ({
        id: color.toLowerCase().replace(/\s+/g, "-"),
        name: color,
        hex: getColorHex(color),
        count: products.filter((p) => p.colors?.includes(color)).length,
      }))
      .sort((a, b) => b.count - a.count);

    return { availableBrands: brands, availableColors: colors };
  }, [products]);

  // Get color hex values
  function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
      black: "#000000",
      white: "#FFFFFF",
      red: "#FF0000",
      green: "#00FF00",
      blue: "#0000FF",
      yellow: "#FFFF00",
      orange: "#FFA500",
      purple: "#800080",
      pink: "#FFC0CB",
      brown: "#A52A2A",
      gray: "#808080",
      grey: "#808080",
    };
    return colorMap[colorName.toLowerCase()] || "#6B7280";
  }

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories?.forEach((category) => {
      counts[category] = products.filter((p) => p.category === category).length;
    });
    return counts;
  }, [categories, products]);

  // Handle price range changes
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const index = parseInt(e.target.dataset.index || "0", 10);

    const newPriceRange = [...priceRange];
    newPriceRange[index] = value;

    // Ensure min <= max
    if (index === 0 && value > priceRange[1]) {
      newPriceRange[0] = priceRange[1];
    } else if (index === 1 && value < priceRange[0]) {
      newPriceRange[1] = priceRange[0];
    }

    setPriceRange(newPriceRange);
    onFiltersChange({
      minPrice: newPriceRange[0] > 0 ? newPriceRange[0] : undefined,
      maxPrice: newPriceRange[1] < 2000 ? newPriceRange[1] : undefined,
    });
  };

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({ category, subCategory: undefined });
    } else {
      onFiltersChange({ category: undefined, subCategory: undefined });
    }
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategory: string, checked: boolean) => {
    if (checked) {
      onFiltersChange({ subCategory });
    } else {
      onFiltersChange({ subCategory: undefined });
    }
  };

  // Handle brand selection
  const handleBrandChange = (brand: string, checked: boolean) => {
    const currentBrands = filters.brands || [];
    if (checked) {
      onFiltersChange({ brands: [...currentBrands, brand] });
    } else {
      onFiltersChange({
        brands: currentBrands.filter((b) => b !== brand),
      });
    }
  };

  // Handle color selection
  const handleColorChange = (color: string, checked: boolean) => {
    const currentColors = filters.colors || [];
    if (checked) {
      onFiltersChange({ colors: [...currentColors, color] });
    } else {
      onFiltersChange({
        colors: currentColors.filter((c) => c !== color),
      });
    }
  };

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchTerm || undefined });
  };

  // Filter brands based on search term
  const filteredBrands = availableBrands.filter((brand) =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Get current subcategories for selected category
  const currentSubCategories = filters?.category
    ? subCategories[filters?.category] || []
    : [];

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
        {(filters?.search ||
          filters?.category ||
          filters?.brands?.length ||
          filters?.colors?.length ||
          filters?.minPrice ||
          filters?.maxPrice) && (
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
      <FilterSection title="Search Products">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFiltersChange({ search: e.target.value || undefined });
            }}
            placeholder="Search products..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <Search size={18} className="text-gray-400" />
          </button>
        </form>
        {filters?.search && (
          <div className="mt-2 text-sm text-gray-600">
            Searching for: "{filters?.search}"
          </div>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">
              Min Price: ${priceRange[0]}
            </label>
            <input
              type="range"
              min={0}
              max={2000}
              value={priceRange[0]}
              data-index={0}
              onChange={handlePriceChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Max Price: ${priceRange[1]}
            </label>
            <input
              type="range"
              min={0}
              max={2000}
              value={priceRange[1]}
              data-index={1}
              onChange={handlePriceChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </FilterSection>

      {/* Categories */}
      {categories?.length > 0 && (
        <FilterSection title="Categories">
          <div className="space-y-2">
            {categories?.map((category) => (
              <div key={category}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`category-${category}`}
                    name="category"
                    checked={filters?.category === category}
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
                  <span className="text-gray-400 text-sm">
                    {categoryCounts[category] || 0}
                  </span>
                </div>

                {/* Subcategories */}
                {filters?.category === category &&
                  currentSubCategories?.length > 0 && (
                    <div className="ml-6 mt-2 space-y-1">
                      {currentSubCategories?.map((subCategory) => (
                        <div key={subCategory} className="flex items-center">
                          <input
                            type="radio"
                            id={`subcategory-${subCategory}`}
                            name="subCategory"
                            checked={filters?.subCategory === subCategory}
                            onChange={(e) =>
                              handleSubCategoryChange(
                                subCategory,
                                e.target.checked
                              )
                            }
                            className="h-3 w-3 text-blue-500 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`subcategory-${subCategory}`}
                            className="ml-2 text-sm text-gray-600 cursor-pointer"
                          >
                            {subCategory}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {availableColors?.length > 0 && (
        <FilterSection title="Colors">
          <div className="space-y-2">
            {availableColors?.map((color) => (
              <div key={color.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`color-${color.id}`}
                  checked={filters?.colors?.includes(color.name) || false}
                  onChange={(e) =>
                    handleColorChange(color.name, e.target.checked)
                  }
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`color-${color.id}`}
                  className="ml-2 flex items-center cursor-pointer"
                >
                  <span
                    className="w-4 h-4 inline-block mr-2 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  ></span>
                  <span className="text-gray-700">{color.name}</span>
                </label>
                <span className="text-gray-400 text-sm ml-auto">
                  {color.count}
                </span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {availableBrands?.length > 0 && (
        <FilterSection title="Brands">
          <div className="mb-3">
            <input
              type="text"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            {filteredBrands?.map((brand) => (
              <div key={brand.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`brand-${brand.id}`}
                  checked={filters.brands?.includes(brand.name) || false}
                  onChange={(e) =>
                    handleBrandChange(brand.name, e.target.checked)
                  }
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`brand-${brand.id}`}
                  className="ml-2 text-gray-700 flex-1 cursor-pointer"
                >
                  {brand.name}
                </label>
                <span className="text-gray-400 text-sm">{brand.count}</span>
              </div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}
