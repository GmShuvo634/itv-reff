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

    // Get user's current plan
    const userPlan = await db.userPlan.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true }
    });

    // Default daily limit if no plan
    const dailyLimit = userPlan?.plan?.dailyVideoLimit || 10;
    const rewardPerVideo = userPlan?.plan?.rewardPerVideo || 0.10;

    // Get today's video tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = await db.userVideoTask.findMany({
      where: {
        userId: user.id,
        watchedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const videosWatched = todayTasks.length;
    const earningsToday = todayTasks.reduce((sum, task) => sum + task.rewardEarned, 0);

    // Get recent transactions
    const recentTransactions = await db.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get referral stats
    const referralStats = await db.user.aggregate({
      where: { referredBy: user.id },
      _count: { id: true },
      _sum: { totalEarnings: true }
    });

    const totalReferrals = referralStats._count.id;
    const referralEarnings = totalReferrals * 5.00; // $5 per referral

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        referralCode: user.referralCode,
      },
      todayProgress: {
        videosWatched,
        dailyLimit,
        earningsToday,
      },
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt.toISOString(),
      })),
      referralStats: {
        totalReferrals,
        referralEarnings,
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}