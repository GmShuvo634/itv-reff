import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { db } from '@/lib/db';
import { validateVideoWatchRequest } from '@/lib/security-middleware';

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
    const securityValidation = await validateVideoWatchRequest(request, user.id, videoId);
    if (!securityValidation.valid) {
      return securityValidation.response!;
    }

    // Get video details
    const video = await db.video.findUnique({
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

    // Get user's current plan and check daily limit
    const userPlan = await db.userPlan.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true }
    });

    const dailyLimit = userPlan?.plan?.dailyVideoLimit || 10;
    const rewardPerVideo = userPlan?.plan?.rewardPerVideo || video.rewardAmount;

    // Count today's watched videos
    const todayTasksCount = await db.userVideoTask.count({
      where: {
        userId: user.id,
        watchedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todayTasksCount >= dailyLimit) {
      return NextResponse.json(
        { error: 'Daily video limit reached' },
        { status: 400 }
      );
    }

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

    // Create video task record with enhanced security data
    const videoTask = await db.userVideoTask.create({
      data: {
        userId: user.id,
        videoId: videoId,
        watchedAt: new Date(),
        watchDuration: watchDuration,
        rewardEarned: rewardEarned,
        ipAddress,
        deviceId: 'web-client', // In real app, this would be from device fingerprinting
        isVerified: true // In real app, this would be based on verification checks
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

    // Create transaction record with security metadata
    await db.walletTransaction.create({
      data: {
        userId: user.id,
        type: 'CREDIT',
        amount: rewardEarned,
        balanceAfter: user.walletBalance + rewardEarned,
        description: `Video reward: ${video.title}`,
        referenceId: `VIDEO_${videoTask.id}`,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          videoId: videoId,
          watchDuration: watchDuration,
          verificationData,
          userInteractions,
          ipAddress,
          securityScore: calculateSecurityScore(watchDuration, video.duration, userInteractions)
        })
      }
    });

    // Check for referral bonus if this is user's first video
    const totalVideosWatched = await db.userVideoTask.count({
      where: { userId: user.id }
    });

    if (totalVideosWatched === 1 && user.referredBy) {
      // Award referral bonus to referrer
      const referralBonus = 5.00; // $5 referral bonus
      
      await db.user.update({
        where: { id: user.referredBy },
        data: { 
          walletBalance: { increment: referralBonus },
          totalEarnings: { increment: referralBonus }
        }
      });

      // Create referral bonus transaction
      await db.walletTransaction.create({
        data: {
          userId: user.referredBy,
          type: 'CREDIT',
          amount: referralBonus,
          balanceAfter: await db.user.findUnique({ where: { id: user.referredBy } }).then(u => u!.walletBalance + referralBonus),
          description: `Referral bonus: ${user.name || user.email} started watching videos`,
          referenceId: `REFERRAL_${user.id}_${videoTask.id}`,
          status: 'COMPLETED'
        }
      });
    }

    return NextResponse.json({
      message: 'Video completed successfully',
      rewardEarned: rewardEarned,
      newBalance: user.walletBalance + rewardEarned,
      videosWatchedToday: todayTasksCount + 1,
      dailyLimit: dailyLimit
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