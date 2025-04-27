import {
  ApiResponse,
  BackendErrorResponse,
  Category,
  DiscountCode,
  Product,
  productService,
} from "@/services/productService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useProduct = () => {
  const router = useRouter();

  // Create product mutation
  const createProductMutation = useMutation<
    ApiResponse<Product>,
    Error,
    {
      sellerId: string;
      title: string;
      description: string;
      tags: string[];
      warranty: string;
      slug: string;
      brand: string;
      colors: string[];
      image?: File;
      specifications: any;
      properties: any;
      category: string;
      subCategory?: string;
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
    createProduct: createProductMutation.mutate,
    createProductStatus: createProductMutation.status,
    createProductError: createProductMutation.error?.message,
    createProductErrorDetails: (
      createProductMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,

    categories: categoriesQuery.data?.data || [],
    categoriesStatus: categoriesQuery.status,
    categoriesError: categoriesQuery.error?.message,
    categoriesErrorDetails: (
      categoriesQuery.error?.cause as BackendErrorResponse | undefined
    )?.details,

    discountCodes: discountCodesQuery.data || [],
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
