import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/api/api-auth';
import { db } from '@/lib/db';
import { PositionService } from '@/lib/position-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const videoId = params.id;

    // Get user's current position for reward calculation
    const userPosition = await PositionService.getUserCurrentPosition(user.id);

    if (!userPosition || !userPosition.position) {
      return NextResponse.json(
        { error: 'No active position found' },
        { status: 400 }
      );
    }

    const position = userPosition.position!;

    // Get video details
    const video = await db.video.findFirst({
      where: { 
        id: videoId, 
        isActive: true,
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
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found or not available' },
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

    return NextResponse.json({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      rewardAmount: position.unitPrice, // Use position-based reward
    });

  } catch (error) {
    console.error('Get video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
