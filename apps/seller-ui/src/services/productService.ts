// services/productService.ts
import apiClient from "@/lib/apiClient";

const PRODUCT_BASE_URL =
  `${process.env.NEXT_PUBLIC_SERVER_URL}/product/api` ||
  "http://localhost:8080/product/api";

export interface Category {
  name: string;
  subCategories: string[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  warranty: string;
  slug: string;
  brand: string;
  colors: string[];
  image?: string;
  specifications: Specification[];
  properties: Property[];
  category: string;
  subCategory?: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Property {
  key: string;
  value: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: any;
}

export const productService = {
  async createProduct(data: {
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
  }) {
    try {
      const formData = new FormData();
      formData.append("sellerId", data.sellerId);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("warranty", data.warranty);
      formData.append("slug", data.slug);
      formData.append("brand", data.brand);
      formData.append("colors", JSON.stringify(data.colors));
      formData.append("specifications", JSON.stringify(data.specifications));
      formData.append("properties", JSON.stringify(data.properties));
      formData.append("category", data.category);
      if (data.subCategory) {
        formData.append("subCategory", data.subCategory);
      }
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await apiClient.post<ApiResponse<Product>>(
        `${PRODUCT_BASE_URL}/create-product`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Product creation failed", {
        cause: errorData,
      });
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        `${PRODUCT_BASE_URL}/get-categories`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch categories", {
        cause: errorData,
      });
    }
  },
};
