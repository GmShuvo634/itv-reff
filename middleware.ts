import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname === "/" || pathname === "/register" || pathname === "/forgot-password";
  const protectedPaths = ["/dashboard", "/settings", "/profile", "/plans", "/positions", "/referral", "/referrals", "/videos", "/wallet", "/withdraw"];
  const isApiRoute = pathname.startsWith("/api/");

  // Handle API routes - add headers for 401 redirect handling
  if (isApiRoute) {
    const response = NextResponse.next();

    // Add custom header to indicate this is an API route
    response.headers.set("X-API-Route", "true");

    // If no token for protected API routes, return 401
    if (!token && !pathname.startsWith("/api/auth/")) {
      return NextResponse.json(
        { error: "Authentication required", redirect: "/" },
        {
          status: 401,
          headers: {
            "X-Redirect-To": "/",
            "X-API-Route": "true"
          }
        }
      );
    }

    return response;
  }

  // Handle page routes
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("redirect_after_login", pathname, { path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/plans/:path*",
    "/positions/:path*",
    "/referral/:path*",
    "/referrals/:path*",
    "/videos/:path*",
    "/wallet/:path*",
    "/withdraw/:path*",
    "/api/:path*"
  ]
};
