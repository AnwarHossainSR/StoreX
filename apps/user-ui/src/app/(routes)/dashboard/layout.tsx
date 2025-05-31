"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardGuard } from "@/components/layout/RouteGuard";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardGuard>
  );
}
