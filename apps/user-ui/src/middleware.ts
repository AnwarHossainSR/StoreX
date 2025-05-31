import { ApiResponse, authService, User } from "@/services/authService";
import { NextRequest, NextResponse } from "next/server";

// Define public paths that don't require authentication
const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/",
];

// Helper function to check if the path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication check for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Define protected paths explicitly (optional, for clarity)
  const protectedPaths = ["/cart", "/checkout", "/dashboard", "/wishlist"];

  // Check if the path is protected (or assume all non-public paths are protected)
  if (
    protectedPaths.some((path) => pathname.startsWith(path)) ||
    !isPublicPath(pathname)
  ) {
    try {
      console.log("Middleware auth check:", pathname);
      // Call authService.getCurrentUser with cookies
      const response: ApiResponse<User> = await authService.getCurrentUser();
      console.log("Middleware auth response:", response);
      if (!response.user) {
        // Redirect to login if no user is found
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      // Attach user info to headers for downstream use
      const nextResponse = NextResponse.next();
      nextResponse.headers.set("x-user-id", response.user.id);
      nextResponse.headers.set("x-user-email", response.user.email);
      nextResponse.headers.set("x-user-name", response.user.name);
      return nextResponse;
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }
  console.log("Protected path:", pathname);

  // Allow request to proceed for non-protected paths
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    // Apply middleware to all routes except static assets and public files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
