import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { TransactionType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get referral reward transactions
    const referralTransactions = await db.walletTransaction.findMany({
      where: {
        userId: user.id,
        type: {
          in: [TransactionType.REFERRAL_REWARD_A, TransactionType.REFERRAL_REWARD_B, TransactionType.REFERRAL_REWARD_C]
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total counts and amounts by tier
    const rewardSummary = await db.walletTransaction.groupBy({
      by: ['type'],
      where: {
        userId: user.id,
        type: {
          in: ['REFERRAL_REWARD_A', 'REFERRAL_REWARD_B', 'REFERRAL_REWARD_C']
        }
      },
      _sum: { amount: true },
      _count: true
    });

    const summaryMap = rewardSummary.reduce((acc, item) => {
      const tier = item.type.replace('REFERRAL_REWARD_', '').toLowerCase();
      acc[tier] = {
        count: item._count,
        totalAmount: item._sum.amount || 0
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    // Format transaction details
    const rewardHistory = referralTransactions.map(transaction => {
      const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {};
      const tier = transaction.type.replace('REFERRAL_REWARD_', '').toLowerCase();

      return {
        id: transaction.id,
        tier,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt,
        referredUserPosition: metadata.newUserPosition || 'Unknown',
        referrerPosition: metadata.referrerPosition || 'Unknown'
      };
    });

    // Calculate totals
    const totalRewards = {
      aLevel: summaryMap.a?.totalAmount || 0,
      bLevel: summaryMap.b?.totalAmount || 0,
      cLevel: summaryMap.c?.totalAmount || 0,
      total: 0
    };

    const totalCounts = {
      aLevel: summaryMap.a?.count || 0,
      bLevel: summaryMap.b?.count || 0,
      cLevel: summaryMap.c?.count || 0,
      total: 0
    };

    totalRewards.total = totalRewards.aLevel + totalRewards.bLevel + totalRewards.cLevel;
    totalCounts.total = totalCounts.aLevel + totalCounts.bLevel + totalCounts.cLevel;

    return NextResponse.json({
      rewardHistory,
      totalRewards,
      totalCounts,
      pagination: {
        limit,
        offset,
        hasMore: referralTransactions.length === limit
      }
    });

  } catch (error) {
    console.error('Get referral rewards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
