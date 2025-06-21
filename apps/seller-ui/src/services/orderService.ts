import apiClient from "@/lib/apiClient";

const ORDER_BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`;

export interface Order {
  id: string;
  date: string;
  status: string;
  total: string;
  items: number;
  customer: string;
  email: string;
  phone: string;
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

export const orderService = {
  async getOrders(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string | undefined = undefined,
    sortField: string = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) {
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(
        `${ORDER_BASE_URL}/get-seller-orders`,
        {
          params: { page, limit, search, status, sortField, sortDirection },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch orders", {
        cause: errorData,
      });
    }
  },

  async updateOrderStatus(id: string, status: string) {
    try {
      const response = await apiClient.put<ApiResponse<Order>>(
        `${ORDER_BASE_URL}/update-seller-order-status/${id}`,
        { status },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to update order status", {
        cause: errorData,
      });
    }
  },

  async exportOrders(
    search: string = "",
    status: string | undefined = undefined
  ) {
    try {
      const response = await apiClient.get(`${ORDER_BASE_URL}/export`, {
        params: { search, status },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { message: "Orders exported successfully" };
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to export orders", {
        cause: errorData,
      });
    }
  },
};
