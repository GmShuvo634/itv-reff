import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/lib/auth';
import { securityMiddleware } from '@/lib/security-middleware';

export async function authMiddleware(request: NextRequest) {
  try {
    // Apply security checks
    const securityResult = await securityMiddleware(request, {
      requireAuth: true,
      rateLimit: {
        maxRequests: 100,
        windowMs: 60 * 60 * 1000 // 1 hour
      },
      checkSuspiciousActivity: true
    });

    if (!securityResult.allowed) {
      return null;
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
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