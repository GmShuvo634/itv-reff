import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/api/auth';
import { SecureTokenManager } from '@/lib/token-manager';
import { addAPISecurityHeaders } from '@/lib/security-headers';

// Type definitions for API responses
interface MeSuccessResponse {
  success: true;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    referralCode: string;
    status: string;
    walletBalance: number;
    totalEarnings: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface MeErrorResponse {
  success: false;
  error: string;
}

type MeResponse = MeSuccessResponse | MeErrorResponse;

export async function GET(request: NextRequest): Promise<NextResponse<MeResponse>> {
  let response: NextResponse<MeResponse>;

  try {
    // Get token from Authorization header or cookie
    let token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      token = request.cookies.get('access_token')?.value;
    }

    if (!token) {
      response = NextResponse.json<MeErrorResponse>(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      );
      return addAPISecurityHeaders(response);
    }

    // Verify token using SecureTokenManager
    const payload = SecureTokenManager.verifyAccessToken(token);
    if (!payload) {
      response = NextResponse.json<MeErrorResponse>(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
      return addAPISecurityHeaders(response);
    }

    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user || !user.id || user.status !== 'ACTIVE') {
      response = NextResponse.json<MeErrorResponse>(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      );
      return addAPISecurityHeaders(response);
    }

    // Return user data (excluding sensitive information)
    response = NextResponse.json<MeSuccessResponse>({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        referralCode: user.referralCode,
        status: user.status,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });

    return addAPISecurityHeaders(response);

  } catch (error) {
    console.error('Auth check error:', error);
    return addAPISecurityHeaders(NextResponse.json<MeErrorResponse>(
      { success: false, error: 'Authentication check failed' },
      { status: 500 }
    ));
  }
}
