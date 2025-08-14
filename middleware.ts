import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/register', '/forgot-password'];

  // Define auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/', '/register', '/forgot-password'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // If user has a token, verify it
  if (token) {
    try {
      const payload = verifyToken(token);
      if (payload) {
        const user = await getUserById(payload.userId);

        // If user is authenticated and tries to access auth routes, redirect to dashboard
        if (user && user.status === 'ACTIVE' && isAuthRoute) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // If user is authenticated but not on public route, allow access
        if (user && user.status === 'ACTIVE') {
          return NextResponse.next();
        }
      }
    } catch (error) {
      // Token is invalid, clear it and continue
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // If no token and trying to access protected route, redirect to login
  if (!isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow access to public routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};