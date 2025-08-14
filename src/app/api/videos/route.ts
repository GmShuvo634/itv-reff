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

    // Get today's watched videos
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
      },
      select: { videoId: true }
    });

    const watchedVideoIds = todayTasks.map(task => task.videoId);
    const dailyLimit = userPlan?.plan?.dailyVideoLimit || 10;

    // If user has reached daily limit, return empty array
    if (watchedVideoIds.length >= dailyLimit) {
      return NextResponse.json({
        videos: [],
        dailyLimit,
        videosWatched: watchedVideoIds.length,
        canWatchMore: false
      });
    }

    // Get available videos that haven't been watched today
    const videos = await db.video.findMany({
      where: {
        isActive: true,
        id: { notIn: watchedVideoIds },
        availableFrom: { lte: new Date() },
        OR: [
          { availableTo: null },
          { availableTo: { gte: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: dailyLimit - watchedVideoIds.length
    });

    return NextResponse.json({
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        rewardAmount: video.rewardAmount,
      })),
      dailyLimit,
      videosWatched: watchedVideoIds.length,
      canWatchMore: true
    });

  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}