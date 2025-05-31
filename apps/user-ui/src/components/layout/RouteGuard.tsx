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
  const { isLoading, isAuthenticated, isClient } = useCurrentUser();

  useEffect(() => {
    if (!isClient || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const redirectUrl = redirectTo || "/auth/login";
      const loginUrl = `${redirectUrl}?redirect=${encodeURIComponent(
        pathname
      )}`;
      router.push(loginUrl);
    }
  }, [
    isClient,
    isLoading,
    isAuthenticated,
    requireAuth,
    router,
    pathname,
    redirectTo,
  ]);

  // Show loading while checking authentication
  if (!isClient || isLoading) {
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
  const { isAuthenticated, isLoading, isClient } = useCurrentUser();

  useEffect(() => {
    if (isClient && !isLoading && isAuthenticated) {
      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/dashboard";
      router.push(redirectTo);
    }
  }, [isClient, isLoading, isAuthenticated, router]);

  if (!isClient || isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default RouteGuard;
