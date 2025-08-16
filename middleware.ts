import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname === "/" || pathname === "/register" || pathname === "/forgot-password";
  const protectedPaths = ["/dashboard", "/settings", "/profile", "/plans", "/positions", "/referral", "/referrals", "/videos", "/wallet", "/withdraw"];

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
    "/withdraw/:path*"
  ]
};
