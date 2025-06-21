import {
  ApiResponse,
  BackendErrorResponse,
  Order,
  PaginatedResponse,
  orderService,
} from "@/services/orderService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

export const useOrder = () => {
  const queryClient = useQueryClient();

  const getOrdersQuery = (
    page: number,
    limit: number,
    search: string = "",
    status: string | undefined = undefined,
    sortField: string = "createdAt",
    sortDirection: "asc" | "desc" = "desc"
  ) => {
    // Stabilize query parameters
    const queryParams = useMemo(
      () => ({
        page,
        limit,
        search,
        status,
        sortField,
        sortDirection,
      }),
      [page, limit, search, status, sortField, sortDirection]
    );

    return useQuery<PaginatedResponse<Order>, Error>({
      queryKey: [
        "orders",
        queryParams.page,
        queryParams.limit,
        queryParams.search,
        queryParams.status,
        queryParams.sortField,
        queryParams.sortDirection,
      ],
      queryFn: () =>
        orderService.getOrders(
          queryParams.page,
          queryParams.limit,
          queryParams.search,
          queryParams.status,
          queryParams.sortField,
          queryParams.sortDirection
        ),
      // Add stale time to prevent unnecessary refetches
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const updateOrderStatusMutation = useMutation<
    ApiResponse<Order>,
    Error,
    { id: string; status: string }
  >({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      toast.error("Failed to update order status");
      console.error("Failed to update order status:", {
        message: error.message,
        details: errorData?.details,
      });
    },
  });

  const exportOrdersMutation = useMutation<
    ApiResponse<void>,
    Error,
    { search: string; status: string | undefined }
  >({
    mutationFn: ({ search, status }) =>
      orderService.exportOrders(search, status),
    onSuccess: () => {
      toast.success("Orders exported successfully");
    },
    onError: (error: Error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      toast.error("Failed to export orders");
      console.error("Failed to export orders:", {
        message: error.message,
        details: errorData?.details,
      });
    },
  });

  return {
    getOrders: getOrdersQuery,
    updateOrderStatus: updateOrderStatusMutation.mutate,
    updateOrderStatusStatus: updateOrderStatusMutation.status,
    updateOrderStatusError: updateOrderStatusMutation.error?.message,
    updateOrderStatusErrorDetails: (
      updateOrderStatusMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,
    exportOrders: exportOrdersMutation.mutate,
    exportOrdersStatus: exportOrdersMutation.status,
    exportOrdersError: exportOrdersMutation.error?.message,
    exportOrdersErrorDetails: (
      exportOrdersMutation.error?.cause as BackendErrorResponse | undefined
    )?.details,
  };
};
