import {
  BackendErrorResponse,
  Product,
  ProductResponse,
  SiteConfig,
  productService,
} from "@/services/productService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useProduct = () => {
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // Fetch all products (includes top10Products)
  const productsQuery = useQuery<ProductResponse, Error>({
    queryKey: ["products", page, limit],
    queryFn: () =>
      productService.getAllProducts({
        page,
        limit,
        type: "topSales",
      }),
    retry: 2,
    // keepPreviousData: true,
  });

  // Fetch categories
  const categoriesQuery = useQuery<SiteConfig, Error>({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    retry: 2,
  });

  return {
    // Products
    getProducts: productsQuery.refetch, // () => Promise<QueryObserverResult<ProductResponse, Error>>
    products: productsQuery.data?.data ?? ([] as Product[]), // Product[]
    productsStatus: productsQuery.status, // "idle" | "pending" | "success" | "error"
    productsError: productsQuery.error?.message ?? null, // string | null
    productsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null, // Record<string, any> | null

    // Top Products
    topProducts: productsQuery.data?.top10Products ?? ([] as Product[]), // Product[]
    topProductsStatus: productsQuery.status, // Same as productsQuery
    topProductsError: productsQuery.error?.message ?? null, // string | null
    topProductsErrorDetails:
      (productsQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null, // Record<string, any> | null

    // Categories
    getCategories: categoriesQuery.refetch, // () => Promise<QueryObserverResult<SiteConfig, Error>>
    categories: categoriesQuery.data?.categories ?? ([] as string[]), // string[]
    categoriesStatus: categoriesQuery.status, // "idle" | "pending" | "success" | "error"
    categoriesError: categoriesQuery.error?.message ?? null, // string | null
    categoriesErrorDetails:
      (categoriesQuery.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null, // Record<string, any> | null

    // Pagination
    currentPage: productsQuery.data?.currentPage ?? 1, // number
    totalPages: productsQuery.data?.totalPages ?? 1, // number
    totalProducts: productsQuery.data?.total ?? 0, // number
    setPage, // (page: number) => void
    setLimit, // (limit: number) => void
  };
};
