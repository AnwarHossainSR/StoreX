"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/RouteGuard";
import Loading from "@/components/ui/loading";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute fallback={<Loading fullScreen size="xl" />}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
