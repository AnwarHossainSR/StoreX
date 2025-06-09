import {
  BackendErrorResponse,
  ProductResponse,
  SiteConfig,
  productService,
} from "@/services/productService";
import { keepPreviousData, useQuery } from "@tanstack/react-query"; // Updated import for v5
import { useCallback, useState } from "react";

// Define ProductFilters interface
export interface ProductFilters {
  search?: string;
  category?: string;
  subCategory?: string;
  brands?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?:
    | "featured"
    | "latest"
    | "topSales"
    | "priceLow"
    | "priceHigh"
    | "highest-rated";
}

// Define the return type for the useProduct hook
export interface UseProductReturn {
  getProducts: () => Promise<void>;
  products: ProductResponse["data"];
  productsStatus: "pending" | "success" | "error";
  productsError: string | null;
  productsErrorDetails: Record<string, any> | null;
  isLoadingProducts: boolean;
  isFetchingProducts: boolean;
  topProducts: ProductResponse["top10Products"];
  topProductsStatus: "pending" | "success" | "error";
  topProductsError: string | null;
  topProductsErrorDetails: Record<string, any> | null;
  getCategories: () => Promise<void>;
  categories: SiteConfig["categories"];
  subCategories: SiteConfig["subCategories"];
  categoriesStatus: "pending" | "success" | "error";
  categoriesError: string | null;
  categoriesErrorDetails: Record<string, any> | null;
  isLoadingCategories: boolean;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  setPage: (newPage: number) => void;
  filters: ProductFilters;
  updateFilters: (newFilters: Partial<ProductFilters>) => void;
  updateSearch: (search: string) => void;
  updateCategory: (category: string) => void;
  updatePriceRange: (minPrice: number, maxPrice: number) => void;
  updateSortBy: (sortBy: ProductFilters["sortBy"]) => void;
  clearFilters: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useProduct = (): UseProductReturn => {
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: "featured",
  });

  // Convert sortBy to API format
  const getApiSortType = (sortBy: string) => {
    switch (sortBy) {
      case "latest":
        return "latest";
      case "topSales":
        return "topSales";
      case "priceLow":
        return "priceLow";
      case "priceHigh":
        return "priceHigh";
      case "highest-rated":
        return "highest-rated";
      default:
        return "topSales";
    }
  };

  // Fetch all products with filters
  const productsQuery = useQuery({
    queryKey: ["products", page, limit, filters],
    queryFn: () =>
      productService.getAllProducts({
        page,
        limit,
        type: getApiSortType(filters.sortBy || "featured"),
        category: filters.category,
        subCategory: filters.subCategory,
        search: filters.search,
        brands: filters.brands,
        colors: filters.colors,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      }),
    retry: 2,
    placeholderData: keepPreviousData, // Replace keepPreviousData with placeholderData
  });

  // Fetch categories
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    placeholderData: keepPreviousData, // Replace keepPreviousData with placeholderData
  });

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const updateSearch = useCallback(
    (search: string) => {
      updateFilters({ search: search || undefined });
    },
    [updateFilters]
  );

  const updateCategory = useCallback(
    (category: string) => {
      updateFilters({ category, subCategory: undefined });
    },
    [updateFilters]
  );

  const updatePriceRange = useCallback(
    (minPrice: number, maxPrice: number) => {
      updateFilters({
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 2000 ? maxPrice : undefined,
      });
    },
    [updateFilters]
  );

  const updateSortBy = useCallback(
    (sortBy: ProductFilters["sortBy"]) => {
      updateFilters({ sortBy });
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters({ sortBy: "featured" });
    setPage(1);
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    getProducts: productsQuery.refetch,
    products: productsQuery.data?.data ?? [],
    productsStatus: productsQuery.status,
    productsError: productsQuery.error?.message ?? null,
    productsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    isLoadingProducts: productsQuery.isLoading,
    isFetchingProducts: productsQuery.isFetching,
    topProducts: productsQuery.data?.top10Products ?? [],
    topProductsStatus: productsQuery.status,
    topProductsError: productsQuery.error?.message ?? null,
    topProductsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    getCategories: categoriesQuery.refetch,
    categories: categoriesQuery.data?.categories ?? [],
    subCategories: categoriesQuery.data?.subCategories ?? {},
    categoriesStatus: categoriesQuery.status,
    categoriesError: categoriesQuery.error?.message ?? null,
    categoriesErrorDetails:
      (categoriesQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    isLoadingCategories: categoriesQuery.isLoading,
    currentPage: productsQuery.data?.currentPage ?? page,
    totalPages: productsQuery.data?.totalPages ?? 1,
    totalProducts: productsQuery.data?.total ?? 0,
    limit,
    setPage: goToPage,
    filters,
    updateFilters,
    updateSearch,
    updateCategory,
    updatePriceRange,
    updateSortBy,
    clearFilters,
    hasNextPage:
      (productsQuery.data?.currentPage ?? page) <
      (productsQuery.data?.totalPages ?? 1),
    hasPreviousPage: (productsQuery.data?.currentPage ?? page) > 1,
  };
};
