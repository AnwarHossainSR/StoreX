// hooks/useCurrentUser.ts
import {
  authService,
  BackendErrorResponse,
  ShippingAddress,
  User,
  UserWithAddresses,
} from "@/services/authService";
import {
  keepPreviousData,
  QueryObserverResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// Assuming this is the structure of the API response
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  user?: T;
  [key: string]: any;
}

// Define AuthOptions interface
export interface AuthOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

// Define the return type for the useCurrentUser hook
export interface UseCurrentUserReturn {
  getCurrentUser: () => Promise<QueryObserverResult<ApiResponse<User>, Error>>;
  user: User | null;
  userStatus: "pending" | "success" | "error";
  userError: string | null;
  userErrorDetails: Record<string, any> | null;
  isLoading: boolean;
  isFetchingUser: boolean;
  isAuthenticated: boolean;
  isPublicPath: boolean;
  isProtectedPath: boolean;
  updateOptions: (newOptions: Partial<AuthOptions>) => void;
  clearOptions: () => void;
  getShippingAddress: () => Promise<
    QueryObserverResult<ApiResponse<UserWithAddresses>, Error>
  >;
  shippingAddress: ShippingAddress[] | null;
  shippingAddressStatus: "pending" | "success" | "error";
  shippingAddressError: string | null;
  shippingAddressErrorDetails: Record<string, any> | null;
  isLoadingShippingAddress: boolean;
  isFetchingShippingAddress: boolean;
  createShippingAddress: (
    data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateShippingAddress: (
    id: string,
    data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  deleteShippingAddress: (id: string) => Promise<void>;
  updateUserProfile: (
    data: Partial<Pick<User, "name" | "email" | "phone" | "country">>
  ) => Promise<void>;
  uploadProfileImage: (base64Image: string) => Promise<void>;
  deleteProfileImage: (fileId: string) => Promise<void>;
}

export const useCurrentUser = (
  initialOptions?: AuthOptions
): UseCurrentUserReturn => {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // State for auth options
  const [options, setOptions] = useState<AuthOptions>({
    enabled: initialOptions?.enabled ?? true,
    refetchOnMount: initialOptions?.refetchOnMount ?? true,
  });

  // Define public paths
  const publicPaths = ["/auth/login", "/auth/register"];

  const isPublicPath = publicPaths.some((path) => {
    if (path === "/products" && pathname.startsWith("/products/")) {
      return true;
    }
    return pathname === path;
  });

  const isProtectedPath = pathname.startsWith("/dashboard");

  // Fetch current user
  const userQuery = useQuery({
    queryKey: ["currentUser", options],
    queryFn: () => authService.getCurrentUser(),
    retry: (failureCount, error) => {
      const status = (error as any)?.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: keepPreviousData,
    enabled: options.enabled,
    refetchOnMount: options.refetchOnMount,
    refetchOnWindowFocus: false,
  });

  // Fetch shipping address
  const userShippingAddress = useQuery({
    queryKey: ["userShippingAddress"],
    queryFn: () => authService.getUserShippingAddress(),
  });

  // Create shipping address mutation
  const createShippingAddressMutation = useMutation({
    mutationFn: (
      data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
    ) => authService.createShippingAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userShippingAddress"] });
      toast.success("Shipping address created successfully");
    },
    onError: (error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      const message =
        errorData?.message || error.message || "An error occurred";
      toast.error(message);
    },
  });

  // Update shipping address mutation
  const updateShippingAddressMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">;
    }) => authService.updateShippingAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userShippingAddress"] });
      toast.success("Shipping address updated successfully");
    },
    onError: (error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      const message =
        errorData?.message || error.message || "An error occurred";
      toast.error(message);
    },
  });

  // Delete shipping address mutation
  const deleteShippingAddressMutation = useMutation({
    mutationFn: (id: string) => authService.deleteShippingAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userShippingAddress"] });
    },
  });

  // Option update functions
  const updateOptions = useCallback((newOptions: Partial<AuthOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  const clearOptions = useCallback(() => {
    setOptions({ enabled: true, refetchOnMount: true });
  }, []);

  const updateUserProfileMutation = useMutation({
    mutationFn: (
      data: Partial<Pick<User, "name" | "email" | "phone" | "country">>
    ) => authService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      const message =
        errorData?.message || error.message || "An error occurred";
      toast.error(message);
    },
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: (base64Image: string) =>
      authService.uploadProfileImage(base64Image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile image uploaded successfully");
    },
    onError: (error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      const message =
        errorData?.message || error.message || "Failed to upload image";
      toast.error(message);
    },
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: (fileId: string) => authService.deleteProfileImage(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile image deleted successfully");
    },
    onError: (error) => {
      const errorData = error.cause as BackendErrorResponse | undefined;
      const message =
        errorData?.message || error.message || "Failed to delete image";
      toast.error(message);
    },
  });

  return {
    getCurrentUser: userQuery.refetch,
    user: userQuery.data?.user ?? null,
    userStatus: userQuery.status,
    userError: userQuery.error?.message ?? null,
    userErrorDetails:
      (userQuery.error?.cause as BackendErrorResponse | undefined)?.details ??
      null,
    isLoading: userQuery.isLoading,
    isFetchingUser: userQuery.isFetching,
    isAuthenticated: !!userQuery.data?.user,
    isPublicPath,
    isProtectedPath,
    updateOptions,
    clearOptions,
    getShippingAddress: userShippingAddress.refetch,
    shippingAddress: userShippingAddress.data?.user?.shippingAddresses ?? [],
    shippingAddressStatus: userShippingAddress.status,
    shippingAddressError: userShippingAddress.error?.message ?? null,
    shippingAddressErrorDetails:
      (userShippingAddress.error?.cause as BackendErrorResponse | undefined)
        ?.details ?? null,
    isLoadingShippingAddress: userShippingAddress.isLoading,
    isFetchingShippingAddress: userShippingAddress.isFetching,
    createShippingAddress: async (data) => {
      await createShippingAddressMutation.mutateAsync(data);
    },
    updateShippingAddress: async (id, data) => {
      await updateShippingAddressMutation.mutateAsync({ id, data });
    },
    deleteShippingAddress: async (id) => {
      await deleteShippingAddressMutation.mutateAsync(id);
    },
    updateUserProfile: async (data) => {
      await updateUserProfileMutation.mutateAsync(data);
    },
    uploadProfileImage: async (base64Image) => {
      await uploadProfileImageMutation.mutateAsync(base64Image);
    },
    deleteProfileImage: async (fileId) => {
      await deleteProfileImageMutation.mutateAsync(fileId);
    },
  };
};

// Hook for protected routes
export const useAuthenticatedUser = () => {
  return useCurrentUser({ enabled: true, refetchOnMount: true });
};

// Hook for optional authentication
export const useOptionalAuth = () => {
  return useCurrentUser({ enabled: true, refetchOnMount: false });
};
