import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/auth';
import { SecureTokenManager } from '@/lib/token-manager';

export async function authMiddleware(request: NextRequest) {
  try {
    // Get token from cookie
    const accessToken = request.cookies.get('auth-token')?.value;
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!accessToken) {
      return null;
    }

    // Verify access token
    let payload = SecureTokenManager.verifyAccessToken(accessToken);

    if (!payload && refreshToken) {
      // Access token expired, try refresh token
      const refreshPayload = SecureTokenManager.verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        // Generate new tokens (this would normally be done in the response)
        payload = refreshPayload;
      }
    }

    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user || !user.id || user.status !== 'ACTIVE') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await authMiddleware(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

export function withAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}