import apiClient from "@/lib/apiClient";

const PRODUCT_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products`;

export interface Category {
  name: string;
  subCategories: string[];
}

export interface UploadedImage {
  file_name: string;
  file_url: string;
  url?: string;
}

export interface Product {
  id: string;
  title: string;
  short_description: string;
  detailed_description: string;
  tags: string[];
  warranty: string;
  slug: string;
  brand: string;
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
  shopId: string;
  sellerId: string;
  status: "Active" | "Pending" | "Draft" | "Deleted";
  createdAt: string;
  updatedAt: string;
}

export interface Specification {
  name: string;
  value: string;
}

export interface Property {
  key: string;
  values: string[];
}

export interface DiscountCode {
  id: string;
  public_name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountCode: string;
  createdAt: string;
  sellerId?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BackendErrorResponse {
  status: "error";
  message: string;
  details?: any;
}

interface RawCategoriesResponse {
  id: string;
  categories: string[];
  subCategories: Record<string, string[]>;
}

export const productService = {
  async getProducts(page: number = 1, limit: number = 10) {
    try {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `${PRODUCT_BASE_URL}/seller`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch products", {
        cause: errorData,
      });
    }
  },

  async createProduct(data: {
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
  }) {
    try {
      const response = await apiClient.post<ApiResponse<Product>>(
        `${PRODUCT_BASE_URL}/create-product`,
        {
          title: data.title,
          short_description: data.short_description,
          detailed_description: data.detailed_description,
          tags: data.tags,
          warranty: data.warranty,
          slug: data.slug,
          brand: data.brand,
          colors: data.colors,
          images: data.images,
          custom_specifications: data.custom_specifications,
          custom_properties: data.custom_properties,
          category: data.category,
          subCategory: data.subCategory,
          sale_price: data.sale_price,
          regular_price: data.regular_price,
          stock: data.stock,
          video_url: data.video_url,
          cashOnDelivery: data.cashOnDelivery,
          sizes: data.sizes,
          discount_codes: data.discount_codes,
        },
        {
          headers: { "Content-Type": "application/json" },
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

  async updateProductStatus(
    id: string,
    status: "Active" | "Pending" | "Draft"
  ) {
    try {
      const response = await apiClient.put<ApiResponse<Product>>(
        `${PRODUCT_BASE_URL}/seller/${id}`,
        { status },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to update product status", {
        cause: errorData,
      });
    }
  },

  async deleteProduct(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${PRODUCT_BASE_URL}/seller/${id}`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to delete product", {
        cause: errorData,
      });
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get<RawCategoriesResponse>(
        `${PRODUCT_BASE_URL}/get-categories`
      );
      const transformedData: ApiResponse<Category[]> = {
        message: "Categories fetched successfully",
        data: response.data.categories.map((name) => ({
          name,
          subCategories: response.data.subCategories[name] || [],
        })),
      };
      return transformedData;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch categories", {
        cause: errorData,
      });
    }
  },

  async getDiscountCodes() {
    try {
      const response = await apiClient.get<ApiResponse<DiscountCode[]>>(
        `${PRODUCT_BASE_URL}/discount-codes`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch discount codes", {
        cause: errorData,
      });
    }
  },

  async createDiscountCode(data: {
    public_name: string;
    discountType: string;
    discountValue: number;
    discountCode: string;
  }) {
    try {
      const response = await apiClient.post<ApiResponse<DiscountCode>>(
        `${PRODUCT_BASE_URL}/discount-codes`,
        data
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to create discount code", {
        cause: errorData,
      });
    }
  },

  async deleteDiscountCode(id: string) {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${PRODUCT_BASE_URL}/discount-codes/${id}`
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to delete discount code", {
        cause: errorData,
      });
    }
  },
};
