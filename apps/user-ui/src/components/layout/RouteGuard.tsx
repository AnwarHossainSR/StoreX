"use client";
// components/RouteGuard.tsx
import { AuthLoading, PageLoading } from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  redirectTo,
  fallback,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, isFetchingUser } = useCurrentUser();

  useEffect(() => {
    if (isFetchingUser || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const redirectUrl = redirectTo || "/auth/login";
      const loginUrl = `${redirectUrl}?redirect=${encodeURIComponent(
        pathname
      )}`;
      router.push(loginUrl);
    }
  }, [
    isFetchingUser,
    isLoading,
    isAuthenticated,
    requireAuth,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading while checking authentication
  if (isFetchingUser || isLoading) {
    return fallback || <AuthLoading />;
  }

  // If auth is required but user is not authenticated, show loading
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return fallback || <AuthLoading />;
  }

  return <>{children}</>;
};

// Protected Route Component
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <RouteGuard requireAuth={true} fallback={fallback}>
    {children}
  </RouteGuard>
);

// Dashboard Layout Guard
export const DashboardGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading, isAuthenticated } = useCurrentUser();

  if (isLoading || !isAuthenticated) {
    return <PageLoading />;
  }

  return <>{children}</>;
};

// Auth Page Guard (redirect if already logged in)
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, isFetchingUser } = useCurrentUser();

  useEffect(() => {
    if (!isFetchingUser && !isLoading && isAuthenticated) {
      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/dashboard";
      router.push(redirectTo);
    }
  }, [isFetchingUser, isLoading, isAuthenticated, router]);

  if (isFetchingUser || isLoading) {
    return <AuthLoading />;
  }

  return <>{children}</>;
};

export default RouteGuard;
