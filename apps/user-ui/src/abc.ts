import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-secret-key";

export async function middleware(req: NextRequest) {
  const protectedPaths = ["/dashboard", "/profile"];

  // Check if the request is for a protected route
  const isProtectedRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute) {
    const accessToken = req.cookies.get("access_token")?.value;

    if (!accessToken) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
      // Verify token validity
      verify(accessToken, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired; rely on Axios interceptor to refresh
      return NextResponse.next(); // Proceed, as interceptor will handle refresh
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
