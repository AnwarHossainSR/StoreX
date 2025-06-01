import apiClient from "@/lib/apiClient";

// Define Product type based on Prisma schema
export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  images: { id: string; url: string }[];
  video_url?: string;
  tags: string[];
  brand?: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sale_price: number;
  regular_price: number;
  totalSales: number;
  ratings: number;
  warranty?: string;
  custom_specifications?: Record<string, string>;
  custom_properties: {
    [key: string]: string[];
  };
  cashOnDelivery?: boolean;
  discount_codes: string[];
  status: "Active" | "Pending" | "Draft" | "Deleted";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  shopId: string;
  sellerId: string;
  Shop: { id: string; name: string };
}

// Define SiteConfig type
export interface SiteConfig {
  id: string;
  categories: string[];
  subCategories: Record<string, string[]>;
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
  data: T;
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
    brands?: string[];
    colors?: string[];
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ProductResponse> {
    try {
      // Clean up params - remove undefined values
      const cleanParams: Record<string, any> = {};

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value) && value.length > 0) {
            cleanParams[key] = value.join(","); // Convert arrays to comma-separated strings
          } else if (!Array.isArray(value)) {
            cleanParams[key] = value;
          }
        }
      });

      const response = await apiClient.get<ProductResponse>(
        `${API_BASE_URL}/get-all-products`,
        { params: cleanParams }
      );

      console.log("getAllProducts response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Product service error:", error);
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
      return response.data;
    } catch (error) {
      console.error("Categories service error:", error);
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch categories", {
        cause: errorData,
      });
    }
  },

  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<ApiResponse<Product>>(
        `${API_BASE_URL}/get-product/${slug}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Product by slug service error:", error);
      throw {
        status: "error",
        message: error.response?.data?.message || "Failed to fetch product",
        details: error.response?.data?.details || {},
      } as BackendErrorResponse;
    }
  },

  // Additional utility methods
  async searchProducts(
    query: string,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<ProductResponse> {
    return this.getAllProducts({
      search: query,
      ...filters,
    });
  },

  async getProductsByCategory(
    category: string,
    options?: {
      subCategory?: string;
      page?: number;
      limit?: number;
      type?: "latest" | "topSales" | "priceLow" | "priceHigh";
    }
  ): Promise<ProductResponse> {
    return this.getAllProducts({
      category,
      ...options,
    });
  },

  async getFilteredProducts(filters: {
    brands?: string[];
    colors?: string[];
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    subCategory?: string;
    search?: string;
    page?: number;
    limit?: number;
    type?: "latest" | "topSales" | "priceLow" | "priceHigh";
  }): Promise<ProductResponse> {
    return this.getAllProducts(filters);
  },
};
