import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser, generateToken } from '@/lib/auth';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Get client IP
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Authenticate user
    const user = await authenticateUser(validatedData.email, validatedData.password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is suspended or banned' },
        { status: 403 }
      );
    }

    // Update last login IP
    await db.user.update({
      where: { id: user.id },
      data: { ipAddress },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Set HTTP-only cookie with token
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
      },
    });

    // Set cookie with appropriate expiration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: validatedData.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 1 day
    };

    response.cookies.set('auth-token', token, cookieOptions);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}