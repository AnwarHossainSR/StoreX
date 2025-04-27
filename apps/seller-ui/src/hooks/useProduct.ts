// hooks/useProduct.ts
import {
  ApiResponse,
  BackendErrorResponse,
  Category,
  Product,
  productService,
  Property,
  Specification,
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
      specifications: Specification[];
      properties: Property[];
      category: string;
      subCategory?: string;
    }
  >({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      router.push("/seller/products"); // Redirect to product list or dashboard
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
  };
};
