import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { User } from '@prisma/client';
import { SecureTokenManager, TokenPair, generateToken, verifyToken } from '@/lib/token-manager';
import crypto from 'crypto';

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthResult {
  success: boolean;
  user?: Partial<User>;
  tokens?: TokenPair;
  error?: string;
  remainingAttempts?: number;
  lockoutUntil?: Date;
}

// Password security functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Account lockout functions
export async function checkAccountLockout(email: string): Promise<{ locked: boolean; lockoutUntil?: Date; attempts: number }> {
  const user = await db.user.findUnique({
    where: { email },
    select: {
      failedLoginAttempts: true,
      lastFailedLogin: true,
      lockedUntil: true
    }
  });

  if (!user) {
    return { locked: false, attempts: 0 };
  }

  const now = new Date();

  // Check if account is currently locked
  if (user.lockedUntil && user.lockedUntil > now) {
    return {
      locked: true,
      lockoutUntil: user.lockedUntil,
      attempts: user.failedLoginAttempts || 0
    };
  }

  return {
    locked: false,
    attempts: user.failedLoginAttempts || 0
  };
}

export async function recordFailedLogin(email: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, failedLoginAttempts: true }
  });

  if (!user) return;

  const attempts = (user.failedLoginAttempts || 0) + 1;
  const now = new Date();

  const updateData: any = {
    failedLoginAttempts: attempts,
    lastFailedLogin: now
  };

  // Lock account if max attempts reached
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    updateData.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION);
  }

  await db.user.update({
    where: { id: user.id },
    data: updateData
  });
}

export async function resetFailedLogins(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      lockedUntil: null
    }
  });
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  name?: string;
  phone?: string;
  password: string;
  referralCode?: string;
}): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    // Generate unique referral code
    const referralCode = generateReferralCode();
    
    // Check if user was referred by someone
    let referredBy: string | null = null;
    if (userData.referralCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: userData.referralCode },
      });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const user = await db.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        password: hashedPassword,
        referralCode,
        referredBy,
        ipAddress: '', // Will be set from request
        deviceId: '', // Will be set from request
      },
    });

    return user;
  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function getUserById(id: string): Promise<Partial<User> | null> {
  try {
    return await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        password: true,
        emailVerified: true,
        phoneVerified: true,
        referralCode: true,
        referredBy: true,
        status: true,
        ipAddress: true,
        deviceId: true,
        walletBalance: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}