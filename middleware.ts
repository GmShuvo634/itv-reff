import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AdminMiddleware } from "@/lib/admin-middleware";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const pathname = req.nextUrl.pathname;

  // Define route patterns
  const isAuthPage =
    pathname === "/" ||
    pathname === "/register" ||
    pathname === "/forgot-password";
  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginPage;
  const protectedPaths = [
    "/dashboard",
    "/settings",
    "/profile",
    "/plans",
    "/positions",
    "/referral",
    "/referrals",
    "/videos",
    "/wallet",
    "/withdraw",
  ];
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminApiRoute =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/auth/getAdmin") ||
    pathname === "/api/auth/admin-test";

  // Handle API routes
  if (isApiRoute) {
    const response = NextResponse.next();
    response.headers.set("X-API-Route", "true");

    // For admin API routes, verify admin authentication
    if (isAdminApiRoute) {
      try {
        const admin = await AdminMiddleware.authenticateAdmin(req);

        if (!admin) {
          return NextResponse.json(
            {
              success: false,
              error: "Admin authentication required",
              redirect: "/admin/login",
            },
            {
              status: 401,
              headers: {
                "X-Redirect-To": "/admin/login",
                "X-API-Route": "true",
              },
            },
          );
        }

        // Add admin info to headers for use in API routes
        response.headers.set("X-Admin-ID", admin.id);
        response.headers.set("X-Admin-Role", admin.role);
      } catch (error) {
        console.error("Admin API authentication error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Authentication verification failed",
            redirect: "/admin/login",
          },
          {
            status: 500,
            headers: {
              "X-Redirect-To": "/admin/login",
              "X-API-Route": "true",
            },
          },
        );
      }
    }

    // For other protected API routes, check regular user token
    if (!token && !pathname.startsWith("/api/auth/") && !isAdminApiRoute) {
      return NextResponse.json(
        { error: "Authentication required", redirect: "/" },
        {
          status: 401,
          headers: {
            "X-Redirect-To": "/",
            "X-API-Route": "true",
          },
        },
      );
    }

    return response;
  }

  // Handle admin routes protection
  if (isAdminRoute) {
    try {
      const admin = await AdminMiddleware.authenticateAdmin(req);

      if (!admin) {
        console.log(
          "No valid admin authentication, redirecting to admin login",
        );
        const response = NextResponse.redirect(
          new URL("/admin/login", req.url),
        );
        response.cookies.set("admin_redirect_after_login", pathname, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        return response;
      }

      // Admin is authenticated, allow access
      console.log(
        `Admin ${admin.email} (${admin.role}) accessing: ${pathname}`,
      );
      return NextResponse.next();
    } catch (error) {
      console.error("Admin route protection error:", error);
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.set("admin_redirect_after_login", pathname, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return response;
    }
  }

  // Handle admin login page (redirect if already authenticated)
  if (isAdminLoginPage && token) {
    try {
      const admin = await AdminMiddleware.authenticateAdmin(req);
      if (admin) {
        console.log("Valid admin token found, redirecting to analytics");
        // Check if there's a redirect path stored
        const redirectPath = req.cookies.get(
          "admin_redirect_after_login",
        )?.value;
        const targetUrl = redirectPath || "/admin/analytics";

        const response = NextResponse.redirect(new URL(targetUrl, req.url));
        // Clear the redirect cookie
        response.cookies.delete("admin_redirect_after_login");
        return response;
      }
    } catch (error) {
      console.error("Admin login page check error:", error);
      // Continue to show login page if there's an error
    }
  }

  // Handle regular user routes
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!token && protectedPaths.some((path) => pathname.startsWith(path))) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("redirect_after_login", pathname, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
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
    "/admin/:path*",
    "/api/:path*",
  ],
};
