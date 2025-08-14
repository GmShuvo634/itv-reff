import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get referral statistics
    const referrals = await db.user.findMany({
      where: { referredBy: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        totalEarnings: true,
        walletBalance: true,
      }
    });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.totalEarnings > 0).length;
    const totalReferralEarnings = totalReferrals * 5.00; // $5 per referral

    // Calculate monthly referral stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyReferrals = referrals.filter(r => 
      new Date(r.createdAt) >= currentMonth
    ).length;

    // Get top performers
    const topReferrals = referrals
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        name: r.name || r.email,
        earnings: r.totalEarnings,
        joinedAt: r.createdAt.toISOString(),
      }));

    return NextResponse.json({
      totalReferrals,
      activeReferrals,
      totalReferralEarnings,
      monthlyReferrals,
      topReferrals,
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.name || r.email,
        email: r.email,
        earnings: r.totalEarnings,
        balance: r.walletBalance,
        joinedAt: r.createdAt.toISOString(),
        isActive: r.totalEarnings > 0,
      })),
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}