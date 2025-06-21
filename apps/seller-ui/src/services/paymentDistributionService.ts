// src/services/paymentDistributionService.ts
import apiClient from "@/lib/apiClient";
import { BackendErrorResponse } from "./authService";

interface PaymentDistribution {
  id: string; // paymentId (e.g., PAY-SABC-25-000001)
  orderId: string; // e.g., SABC-25-000001
  customer: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  cardLast4: string | null;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const PAYMENT_BASE_URL = "/orders";

export const paymentDistributionService = {
  async getPayments(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string | undefined = undefined,
    method: string | undefined = undefined,
    sortField: string = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PaginatedResponse<PaymentDistribution>> {
    try {
      const response = await apiClient.get<
        PaginatedResponse<PaymentDistribution>
      >(`${PAYMENT_BASE_URL}/get-seller-payments`, {
        params: {
          page,
          limit,
          search,
          status,
          method,
          sortField,
          sortDirection,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to fetch payments", {
        cause: errorData,
      });
    }
  },

  async exportPayments(
    search: string = "",
    status: string | undefined = undefined,
    method: string | undefined = undefined,
    startDate?: string,
    endDate?: string,
    amountMin?: number,
    amountMax?: number
  ) {
    try {
      const response = await apiClient.get(
        `${PAYMENT_BASE_URL}/export-seller-payments`,
        {
          params: {
            search,
            status,
            method,
            startDate,
            endDate,
            amountMin,
            amountMax,
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payments_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { message: "Payments exported successfully" };
    } catch (error) {
      const errorData = (error as any).response?.data as BackendErrorResponse;
      throw new Error(errorData?.message || "Failed to export payments", {
        cause: errorData,
      });
    }
  },
};
