// hooks/useCurrentUser.ts
import { authService, BackendErrorResponse } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useCurrentUser = (options?: {
  enabled?: boolean;
  refetchOnMount?: boolean;
}) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Define public paths where we shouldn't try to fetch the user by default
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    // "/auth/forgot-password",
    // "/auth/reset-password",
    // "/products",
    // "/cart",
    // "/checkout",
    // "/wishlist",
  ];

  const isPublicPath = publicPaths.some((path) => {
    if (path === "/products" && pathname.startsWith("/products/")) {
      return true;
    }
    return pathname === path;
  });

  const isProtectedPath = pathname.startsWith("/dashboard");

  // Always enable for protected paths, optionally for public paths
  const shouldFetch =
    options?.enabled !== undefined
      ? options.enabled
      : isProtectedPath || !isPublicPath;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: isClient && shouldFetch,
    refetchOnMount: options?.refetchOnMount ?? true,
    refetchOnWindowFocus: false,
  });

  const user = data?.user;
  const errorMessage = isError
    ? (error?.cause as BackendErrorResponse | undefined)?.message ||
      error?.message ||
      "Failed to fetch user"
    : null;
  const errorDetails = isError
    ? (error?.cause as BackendErrorResponse | undefined)?.details
    : null;

  return {
    user,
    isLoading: isLoading || isFetching,
    isError,
    error: errorMessage,
    errorDetails,
    refetch,
    isAuthenticated: !!user,
    isClient,
    isPublicPath,
    isProtectedPath,
  };
};

// Hook specifically for protected routes
export const useAuthenticatedUser = () => {
  return useCurrentUser({ enabled: true, refetchOnMount: true });
};

// Hook for optional authentication (public routes that can show user info if logged in)
export const useOptionalAuth = () => {
  return useCurrentUser({ enabled: true, refetchOnMount: false });
};
