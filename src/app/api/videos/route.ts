import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api/api-auth';
import { db } from '@/lib/db';
import { PositionService } from '@/lib/position-service';

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json(
        { error: 'User Not Found!' },
        { status: 404 }
      );
    }

    // Check user's position and task availability
    const canCompleteTask = await PositionService.canCompleteTask(user.id);
    const userPosition = await PositionService.getUserCurrentPosition(user.id);

    if (!userPosition || !userPosition.position) {
      return NextResponse.json({
        videos: [],
        error: 'No active position found',
        canCompleteTask: false
      });
    }

    const tasksCompletedToday = await PositionService.getDailyTasksCompleted(user.id);
    const position = userPosition.position!;
    const dailyTaskLimit = position.tasksPerDay;



    // If user cannot complete more tasks, return empty array
    if (!canCompleteTask.canComplete) {
      return NextResponse.json({
        videos: [],
        dailyTaskLimit,
        tasksCompletedToday,
        canCompleteTask: false,
        reason: canCompleteTask.reason
      });
    }

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

    // Get available videos that haven't been watched today and match user's position level
    const videos = await db.video.findMany({
      where: {
        isActive: true,
        id: { notIn: watchedVideoIds },
        availableFrom: { lte: new Date() },
        AND: [
          {
            OR: [
              { availableTo: null },
              { availableTo: { gte: new Date() } }
            ]
          },
          {
            OR: [
              { positionLevelId: position.id }, // Videos specifically for this position
              { positionLevelId: null }, // Videos available to all positions
            ]
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: dailyTaskLimit - watchedVideoIds.length
    });



    return NextResponse.json({
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        rewardAmount: position.unitPrice, // Use position-based reward
      })),
      dailyTaskLimit,
      tasksCompletedToday: watchedVideoIds.length,
      canCompleteTask: true,
      tasksRemaining: canCompleteTask.tasksRemaining,
      currentPosition: {
        name: position.name,
        level: position.level,
        unitPrice: position.unitPrice
      }
    });

  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
