import {
  ApiResponse,
  BackendErrorResponse,
  Category,
  DiscountCode,
  PaginatedResponse,
  Product,
  productService,
  UploadedImage,
} from "@/services/productService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useProduct = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch products query with pagination
  const getProductsQuery = (page: number, limit: number) =>
    useQuery<PaginatedResponse<Product>, Error>({
      queryKey: ["products", page, limit],
      queryFn: () => productService.getProducts(page, limit),
    });

  // Create product mutation
  const createProductMutation = useMutation<
    ApiResponse<Product>,
    Error,
    {
      title: string;
      short_description: string;
      detailed_description: string;
      tags: string[];
      warranty?: string;
      slug: string;
      brand?: string;
      colors: string[];
      images: UploadedImage[];
      custom_specifications: Record<string, string>;
      custom_properties: Record<string, string[]>;
      category: string;
      subCategory: string;
      sale_price: number;
      regular_price: number;
      stock: number;
      video_url?: string;
      cashOnDelivery?: boolean;
      sizes: string[];
      discount_codes: string[];
      status: "Active" | "Pending" | "Draft";
    }
  >({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      router.push("/seller/products");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation<ApiResponse<void>, Error, string>({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Fetch categories query
  const categoriesQuery = useQuery<ApiResponse<Category[]>, Error>({
    queryKey: ["categories"],
    queryFn: productService.getCategories,
  });

  // Fetch discount codes query
  const discountCodesQuery = useQuery<ApiResponse<DiscountCode[]>, Error>({
    queryKey: ["discountCodes"],
    queryFn: productService.getDiscountCodes,
  });

  // Create discount code mutation
  const createDiscountCodeMutation = useMutation<
    ApiResponse<DiscountCode>,
    Error,
    {
      public_name: string;
      discountType: string;
      discountValue: number;
      discountCode: string;
    }
  >({
    mutationFn: productService.createDiscountCode,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  // Delete discount code mutation
  const deleteDiscountCodeMutation = useMutation<
    ApiResponse<void>,
    Error,
    string
  >({
    mutationFn: productService.deleteDiscountCode,
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      return {
        message: error.message,
        details: errorData?.details,
      };
    },
  });

  return {
    getProducts: getProductsQuery,
    createProduct: createProductMutation.mutate,
    createProductStatus: createProductMutation.status,
    createProductError: createProductMutation.error?.message,
    createProductErrorDetails: (
      createProductMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,
    saveDraft: (data: Parameters<typeof createProductMutation.mutate>[0]) => {
      createProductMutation.mutate({ ...data, status: "Draft" });
    },
    deleteProduct: deleteProductMutation.mutate,
    deleteProductStatus: deleteProductMutation.status,
    deleteProductError: deleteProductMutation.error?.message,
    deleteProductErrorDetails: (
      deleteProductMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    categories: categoriesQuery.data?.data || [],
    categoriesStatus: categoriesQuery.status,
    categoriesError: categoriesQuery.error?.message,
    categoriesErrorDetails: (
      categoriesQuery.error?.cause as BackendErrorResponse | undefined
    )?.details,

    discountCodes: discountCodesQuery.data?.data || [],
    discountCodesStatus: discountCodesQuery.status,
    discountCodesError: discountCodesQuery.error?.message,
    discountCodesErrorDetails: (
      discountCodesQuery.error?.cause as BackendErrorResponse | undefined
    )?.details,

    createDiscountCode: createDiscountCodeMutation.mutate,
    createDiscountCodeStatus: createDiscountCodeMutation.status,
    createDiscountCodeError: createDiscountCodeMutation.error?.message,
    createDiscountCodeErrorDetails: (
      createDiscountCodeMutation.error?.cause as
        | BackendErrorResponse
        | undefined
    )?.details,

    deleteDiscountCode: deleteDiscountCodeMutation.mutate,
    deleteDiscountCodeStatus: deleteDiscountCodeMutation.status,
    deleteDiscountCodeError: deleteDiscountCodeMutation.error?.message,
    deleteDiscountCodeErrorDetails: (
      deleteDiscountCodeMutation.error?.cause as
        | BackendErrorResponse
        | undefined
    )?.details,
  };
};
