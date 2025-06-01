import {
  BackendErrorResponse,
  ProductResponse,
  SiteConfig,
  productService,
} from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

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

export const useProduct = () => {
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: "featured",
  });

  // Convert sortBy to API format
  const getApiSortType = (sortBy: string) => {
    switch (sortBy) {
      case "latest":
        return "latest";
      case "best-selling":
        return "topSales";
      case "price-low-high":
        return "priceLow";
      case "price-high-low":
        return "priceHigh";
      case "highest-rated":
        return "topSales"; // Use topSales as proxy for highest rated
      default:
        return "topSales";
    }
  };

  // Fetch all products with filters
  const productsQuery = useQuery<ProductResponse, Error>({
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
    // keepPreviousData: true,
  });

  // Fetch categories
  const categoriesQuery = useQuery<SiteConfig, Error>({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter update functions
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const updateSearch = useCallback(
    (search: string) => {
      updateFilters({ search });
    },
    [updateFilters]
  );

  const updateCategory = useCallback(
    (category: string) => {
      updateFilters({ category, subCategory: undefined }); // Reset subcategory when category changes
    },
    [updateFilters]
  );

  const updatePriceRange = useCallback(
    (minPrice: number, maxPrice: number) => {
      updateFilters({ minPrice, maxPrice });
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

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  return {
    // Products
    getProducts: productsQuery.refetch,
    products: productsQuery.data?.data ?? [],
    productsStatus: productsQuery.status,
    productsError: productsQuery.error?.message ?? null,
    productsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    isLoadingProducts: productsQuery.isLoading,
    isFetchingProducts: productsQuery.isFetching,

    // Top Products
    topProducts: productsQuery.data?.top10Products ?? [],
    topProductsStatus: productsQuery.status,
    topProductsError: productsQuery.error?.message ?? null,
    topProductsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,

    // Categories
    getCategories: categoriesQuery.refetch,
    categories: categoriesQuery.data?.categories ?? [],
    subCategories: categoriesQuery.data?.subCategories ?? {},
    categoriesStatus: categoriesQuery.status,
    categoriesError: categoriesQuery.error?.message ?? null,
    categoriesErrorDetails:
      (categoriesQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    isLoadingCategories: categoriesQuery.isLoading,

    // Pagination
    currentPage: productsQuery.data?.currentPage ?? page,
    totalPages: productsQuery.data?.totalPages ?? 1,
    totalProducts: productsQuery.data?.total ?? 0,
    limit,
    setPage: goToPage,
    setLimit: changeLimit,

    // Filters
    filters,
    updateFilters,
    updateSearch,
    updateCategory,
    updatePriceRange,
    updateSortBy,
    clearFilters,

    // Helper functions
    hasNextPage:
      (productsQuery.data?.currentPage ?? page) <
      (productsQuery.data?.totalPages ?? 1),
    hasPreviousPage: (productsQuery.data?.currentPage ?? page) > 1,
  };
};
