import { NextRequest, NextResponse } from "next/server";

// Define your route configurations
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/products",
  "/cart",
  "/checkout",
  "/wishlist",
];

const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/inbox",
  "/dashboard/notifications",
  "/dashboard/shipping",
  "/dashboard/change-password",
];

// Routes that should redirect authenticated users away (like login page)
const AUTH_REDIRECT_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    // Handle dynamic routes like /products/[slug]
    if (route === "/products" && pathname.startsWith("/products/")) {
      return true;
    }
    return pathname === route;
  });
}

async function verifyToken(request: NextRequest): Promise<boolean> {
  try {
    // Check for access token in cookies
    const accessToken = request.cookies.get("access_token")?.value;
    if (!accessToken) {
      return false;
    }

    // Verify token with your backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/logged-in-user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

async function refreshTokenIfNeeded(request: NextRequest): Promise<boolean> {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ type: "user" }),
        credentials: "include",
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function shouldRedirectAuthenticatedUser(pathname: string): boolean {
  return AUTH_REDIRECT_ROUTES.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  console.log(`Middleware processing: ${pathname}`);

  // Check if user is authenticated
  let isAuthenticated = await verifyToken(request);

  // If not authenticated, try to refresh the token
  if (!isAuthenticated) {
    isAuthenticated = await refreshTokenIfNeeded(request);
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      console.log(
        `Redirecting unauthenticated user from protected route: ${pathname}`
      );
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth redirect routes (redirect authenticated users away from login/register)
  if (shouldRedirectAuthenticatedUser(pathname) && isAuthenticated) {
    console.log(`Redirecting authenticated user from auth page: ${pathname}`);
    const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // For public routes or successful authentication, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
