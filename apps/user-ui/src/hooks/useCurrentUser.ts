import {
  ApiResponse,
  authService,
  BackendErrorResponse,
  User,
} from "@/services/authService";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
  const { data, isLoading, isError, error, refetch } = useQuery<
    ApiResponse<User>,
    Error
  >({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes before marking as stale
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes
    retry: 1, // Retry once on failure (apiClient handles 401 retries)
    enabled: true, // Always fetch on mount
  });

  const user = data?.user;
  const errorMessage = isError
    ? (error?.cause as BackendErrorResponse | undefined)?.message ||
      "Failed to fetch user"
    : null;
  const errorDetails = isError
    ? (error?.cause as BackendErrorResponse | undefined)?.details
    : null;

  return {
    user, // User data: { id, name, email }
    isLoading, // Loading state
    isError, // Error state
    error: errorMessage, // Error message
    errorDetails, // Additional error details
    refetch, // Function to manually revalidate
  };
};
