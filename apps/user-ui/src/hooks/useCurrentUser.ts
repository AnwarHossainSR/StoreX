import { authService, BackendErrorResponse } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

export const useCurrentUser = () => {
  const pathname = usePathname();

  // Define public paths where we shouldn't try to fetch the user by default
  const isPublicPath = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/products",
    "/products/[slug]",
  ].includes(pathname);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !isPublicPath, // Don't run on public paths by default
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
    user,
    isLoading,
    isError,
    error: errorMessage,
    errorDetails,
    refetch,
    isAuthenticated: !!user,
  };
};
