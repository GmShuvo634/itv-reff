import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, validateVideoWatchRequest } from '@/lib/api/api-auth';
import { db } from '@/lib/db';
import { ReferralService } from '@/lib/referral-service';
import { PositionService } from '@/lib/position-service';
import { TaskManagementBonusService } from '@/lib/task-management-bonus-service';
import { EnhancedReferralService } from '@/lib/enhanced-referral-service';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const videoId = params.id;

    // Security validation
    const isValid = validateVideoWatchRequest(request);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get video details
    const video = await db.video.findFirst({
      where: { id: videoId, isActive: true }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user already watched this video today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTask = await db.userVideoTask.findFirst({
      where: {
        userId: user.id,
        videoId: videoId,
        watchedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingTask) {
      return NextResponse.json(
        { error: 'Video already watched today' },
        { status: 400 }
      );
    }

    // Check user's position and task limits using new position system
    const canCompleteTask = await PositionService.canCompleteTask(user.id);

    if (!canCompleteTask.canComplete) {
      return NextResponse.json(
        { error: canCompleteTask.reason },
        { status: 400 }
      );
    }

    // Get user's current position for reward calculation
    const userPosition = await PositionService.getUserCurrentPosition(user.id);

    if (!userPosition || !userPosition.position) {
      return NextResponse.json(
        { error: 'No active position found' },
        { status: 400 }
      );
    }

    const position = userPosition.position!;
    const rewardPerVideo = position.unitPrice;
    const dailyLimit = position.tasksPerDay;

    // Count today's watched videos
    const todayTasksCount = await PositionService.getDailyTasksCompleted(user.id);

    // Get client IP and device info
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const body = await request.json();
    const { watchDuration, verificationData, userInteractions = [] } = body;

    // Enhanced anti-cheat validation
    const minimumWatchTime = Math.max(video.duration * 0.8, 30); // 80% of video duration or 30 seconds minimum

    if (watchDuration < minimumWatchTime) {
      return NextResponse.json(
        { error: 'Video not watched long enough' },
        { status: 400 }
      );
    }

    // Check for suspicious patterns
    if (watchDuration > video.duration * 2) {
      return NextResponse.json(
        { error: 'Invalid watch duration' },
        { status: 400 }
      );
    }

    // Calculate reward
    const rewardEarned = rewardPerVideo;

    // Create video task record with position information
    const videoTask = await db.userVideoTask.create({
      data: {
        userId: user.id,
        videoId: videoId,
        watchedAt: new Date(),
        watchDuration: watchDuration,
        rewardEarned: rewardEarned,
        positionLevel: position.name,
        ipAddress,
        deviceId: 'web-client',
        isVerified: true
      }
    });

    // Update user's wallet balance and total earnings
    await db.user.update({
      where: { id: user.id },
      data: {
        walletBalance: user.walletBalance + rewardEarned,
        totalEarnings: user.totalEarnings + rewardEarned
      }
    });

    // Create transaction record
    await db.walletTransaction.create({
      data: {
        userId: user.id,
        type: 'TASK_INCOME',
        amount: rewardEarned,
        balanceAfter: user.walletBalance + rewardEarned,
        description: `Task reward: ${video.title} (${position.name})`,
        referenceId: `TASK_${videoTask.id}`,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          videoId: videoId,
          watchDuration: watchDuration,
          positionLevel: position.name,
          verificationData,
          userInteractions,
          ipAddress,
          securityScore: calculateSecurityScore(watchDuration, video.duration, userInteractions)
        })
      }
    });

    // Distribute management bonuses to upline
    const bonusResult = await TaskManagementBonusService.distributeManagementBonuses(
      user.id,
      rewardEarned,
      new Date()
    );

    if (bonusResult.success && bonusResult.totalBonusDistributed > 0) {
      console.log(`Management bonuses distributed: ${bonusResult.totalBonusDistributed} PKR`);
    }

    // Process referral rewards
    const totalVideosWatched = await db.userVideoTask.count({
      where: { userId: user.id }
    });

    // Check for first video referral reward
    if (totalVideosWatched === 1) {
      const firstVideoResult = await ReferralService.processReferralQualification(
        user.id,
        'first_video'
      );

      if (firstVideoResult.success && firstVideoResult.rewardAmount) {
        console.log(`First video referral reward: $${firstVideoResult.rewardAmount} awarded`);
      }
    }

    // Check for weekly activity milestone (7 videos)
    if (totalVideosWatched === 7) {
      await ReferralService.processReferralQualification(user.id, 'weekly_activity');
    }

    // Check for high earner milestone ($50 total earnings)
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      select: { totalEarnings: true }
    });

    if (updatedUser && updatedUser.totalEarnings >= 50 && (updatedUser.totalEarnings - rewardEarned) < 50) {
      await ReferralService.processReferralQualification(user.id, 'high_earner');
    }

    return NextResponse.json({
      message: 'Task completed successfully',
      rewardEarned: rewardEarned,
      newBalance: user.walletBalance + rewardEarned,
      tasksCompletedToday: todayTasksCount + 1,
      dailyTaskLimit: dailyLimit,
      positionLevel: position.name,
      managementBonusDistributed: bonusResult.totalBonusDistributed,
      bonusBreakdown: bonusResult.bonusBreakdown
    });

  } catch (error) {
    console.error('Video watch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate security score
function calculateSecurityScore(
  watchDuration: number,
  videoDuration: number,
  userInteractions: any[]
): number {
  let score = 100;

  // Deduct points for short watch time
  if (watchDuration < videoDuration * 0.8) {
    score -= 30;
  }

  // Deduct points for no user interactions
  if (userInteractions.length === 0) {
    score -= 20;
  }

  // Deduct points for exact duration matches (possible automation)
  if (Math.abs(watchDuration - videoDuration) < 1) {
    score -= 15;
  }

  // Deduct points for excessive watch time
  if (watchDuration > videoDuration * 1.5) {
    score -= 10;
  }

  return Math.max(0, score);
}
