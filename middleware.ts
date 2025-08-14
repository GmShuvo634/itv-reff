import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecureTokenManager } from '@/lib/token-manager';
import { addSecurityHeaders } from '@/lib/security-headers';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to all requests
  const rateLimit = rateLimiter.checkRateLimit(request, RATE_LIMITS.API_GENERAL);
  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      },
      { status: 429 }
    );
    return addSecurityHeaders(response);
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/register', '/forgot-password'];

  // Define auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/', '/register', '/forgot-password'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // Get tokens from cookies
  const accessToken = request.cookies.get('auth-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  // If user has an access token, verify it
  if (accessToken) {
    const payload = SecureTokenManager.verifyAccessToken(accessToken);

    if (payload) {
      // Token is valid
      if (isAuthRoute) {
        // Authenticated user trying to access auth routes, redirect to dashboard
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        return addSecurityHeaders(response);
      }

      // Allow access to protected routes
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    } else if (refreshToken) {
      // Access token invalid, try to refresh
      const refreshPayload = SecureTokenManager.verifyRefreshToken(refreshToken);

      if (refreshPayload) {
        // Refresh token is valid, generate new tokens
        const newTokens = SecureTokenManager.generateTokenPair(refreshPayload.userId, refreshPayload.email);

        const response = isAuthRoute
          ? NextResponse.redirect(new URL('/dashboard', request.url))
          : NextResponse.next();

        // Set new tokens
        response.cookies.set('auth-token', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60, // 15 minutes
        });

        response.cookies.set('refresh-token', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return addSecurityHeaders(response);
      }
    }

    // Both tokens are invalid, clear them
    const response = isPublicRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/', request.url));

    response.cookies.delete('auth-token');
    response.cookies.delete('refresh-token');
    return addSecurityHeaders(response);
  }

  // No access token
  if (!isPublicRoute) {
    // Trying to access protected route without token, redirect to login
    const response = NextResponse.redirect(new URL('/', request.url));
    return addSecurityHeaders(response);
  }

  // Allow access to public routes
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};