import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api/api-auth';
import { ReferralService } from '@/lib/referral-service';
import { addAPISecurityHeaders } from '@/lib/security-headers';
import { db } from '@/lib/db';

// Type definitions for API responses
interface ReferralStatsSuccessResponse {
  success: boolean;
  referralCode: string;
  referralLink: string;
  socialLinks: Record<string, string>;
  stats: {
    totalReferrals: number;
    registeredReferrals: number;
    qualifiedReferrals: number;
    rewardedReferrals: number;
    totalEarnings: number;
    monthlyReferrals: number;
    activities: Array<{
      id: string;
      status: string;
      source: string;
      rewardAmount: number;
      createdAt: string;
      rewardPaidAt: string | null;
    }>;
  };
  totalReferrals: number;
  activeReferrals: number;
  totalReferralEarnings: number;
  monthlyReferrals: number;
  topReferrals: Array<any>;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    earnings: number;
    balance: number;
    joinedAt: string;
    isActive: boolean;
  }>;
}

interface ReferralStatsErrorResponse {
  error: string;
}

type ReferralStatsResponse = ReferralStatsSuccessResponse | ReferralStatsErrorResponse;

export async function GET(request: NextRequest): Promise<NextResponse<ReferralStatsResponse>> {
  let response: NextResponse<ReferralStatsResponse>;

  try {
    // Authenticate user
    const user = await authMiddleware(request);
    if (!user || !user.id) {
      response = NextResponse.json<ReferralStatsErrorResponse>(
        { error: 'Authentication required' },
        { status: 401 }
      );
      return addAPISecurityHeaders(response);
    }

    // Get enhanced referral statistics
    const enhancedStats = await ReferralService.getReferralStats(user.id);

    // Get legacy referral data for backward compatibility
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

    // Calculate legacy stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.totalEarnings > 0).length;

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

    // Generate referral links
    const socialLinks = ReferralService.generateSocialLinks(user.referralCode || '');

    // Combine enhanced stats with legacy stats for complete data
    const combinedStats = enhancedStats || {
      totalReferrals: 0,
      registeredReferrals: 0,
      qualifiedReferrals: 0,
      rewardedReferrals: 0,
      totalEarnings: 0,
      monthlyReferrals: 0,
      activities: []
    };

    response = NextResponse.json<ReferralStatsSuccessResponse>({
      success: true,
      referralCode: user.referralCode,
      referralLink: ReferralService.generateReferralLink(user.referralCode || ''),
      socialLinks,

      // Main stats object that the component expects
      stats: {
        totalReferrals: Math.max(combinedStats.totalReferrals, totalReferrals),
        registeredReferrals: combinedStats.registeredReferrals,
        qualifiedReferrals: combinedStats.qualifiedReferrals,
        rewardedReferrals: combinedStats.rewardedReferrals,
        totalEarnings: combinedStats.totalEarnings,
        monthlyReferrals: combinedStats.monthlyReferrals,
        activities: combinedStats.activities || []
      },

      // Legacy stats for backward compatibility
      totalReferrals,
      activeReferrals,
      totalReferralEarnings: combinedStats.totalEarnings || (totalReferrals * 5.00),
      monthlyReferrals: combinedStats.monthlyReferrals || 0,
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

    return addAPISecurityHeaders(response);

  } catch (error) {
    console.error('Get referral stats error:', error);
    return addAPISecurityHeaders(NextResponse.json<ReferralStatsErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}
