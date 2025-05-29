import apiClient from "@/lib/apiClient";

// Define Product type based on Prisma schema and getAllProducts response
export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  sale_price: number;
  regular_price: number;
  ratings: number;
  totalSales: number;
  images: { id: string; url: string }[];
  Shop: { id: string; name: string };
}

// Define SiteConfig type based on getCategories response
export interface SiteConfig {
  id: string;
  categories: string[];
  subCategories: Record<string, any>;
}

// Define ProductResponse for getAllProducts
export interface ProductResponse {
  data: Product[];
  top10By: "latest" | "topSales";
  top10Products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Define generic API response
export interface ApiResponse<T> {
  message: string;
  data: T; // Changed to non-optional since backend always returns data
}

// Define error response
export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: Record<string, any>;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/products`;

export const productService = {
  async getAllProducts(params: {
    page?: number;
    limit?: number;
    type?: "latest" | "topSales" | "priceLow" | "priceHigh";
    category?: string;
    subCategory?: string;
    search?: string;
  }): Promise<ProductResponse> {
    try {
      const response = await apiClient.get<ProductResponse>(
        `${API_BASE_URL}/get-all-products`,
        { params }
      );
      console.log("getAllProducts response:", response.data);
      return response.data; // Fixed: response.data.data, not response.data.data!
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch products", {
        cause: errorData,
      });
    }
  },

  async getCategories(): Promise<SiteConfig> {
    try {
      const response = await apiClient.get<SiteConfig>(
        `${API_BASE_URL}/get-categories`
      );
      console.log("getCategories response:", response.data);
      return response.data; // Fixed: response.data.data
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch categories", {
        cause: errorData,
      });
    }
  },
};
