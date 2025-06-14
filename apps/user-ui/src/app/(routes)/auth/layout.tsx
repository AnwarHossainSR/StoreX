// import { AuthGuard } from "@/components/layout/RouteGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
// return <AuthGuard>{children}</AuthGuard>;
