import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '@/lib/auth';
import { validateRegistrationRequest } from '@/lib/security-middleware';
import { getClientIP, generateDeviceFingerprint, validateEmail, validatePhone } from '@/lib/security';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    // Security validation
    const securityValidation = await validateRegistrationRequest(request);
    if (!securityValidation.valid) {
      return securityValidation.response!;
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Additional security validation
    if (!validateEmail(validatedData.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (validatedData.phone && !validatePhone(validatedData.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Get client IP and device info for security tracking
    const ipAddress = getClientIP(request);
    const deviceFingerprint = generateDeviceFingerprint(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create user with security information
    const user = await createUser({
      email: validatedData.email,
      name: validatedData.name,
      phone: validatedData.phone,
      password: validatedData.password,
      referralCode: validatedData.referralCode,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Update user with IP and device info
    // Note: You might want to add this to the createUser function or update separately

    // Return success response without sensitive data
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      if (error.message.includes('phone')) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}