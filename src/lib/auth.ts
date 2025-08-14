import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
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