'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, DollarSign, Loader2 } from 'lucide-react';
import { useWatchVideo } from '@/hooks/use-videos';
import type { Video } from '@/lib/api/client';

interface VideoCardProps {
  video: Video;
  disabled?: boolean;
}

export function VideoCard({ video, disabled = false }: VideoCardProps) {
  const [isWatching, setIsWatching] = useState(false);
  const watchVideoMutation = useWatchVideo();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleWatchVideo = async () => {
    if (disabled || isWatching) return;

    setIsWatching(true);

    try {
      // Simulate video watching with minimum watch time
      const minimumWatchTime = Math.max(video.duration * 0.8, 30);
      
      // In a real implementation, you would:
      // 1. Open video player modal/page
      // 2. Track actual watch time and user interactions
      // 3. Implement anti-cheat measures
      
      // For demo purposes, we'll simulate watching
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Submit watch completion
      await watchVideoMutation.mutateAsync({
        videoId: video.id,
        data: {
          watchDuration: minimumWatchTime,
          verificationData: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
          },
          userInteractions: [
            { type: 'play', timestamp: Date.now() - minimumWatchTime * 1000 },
            { type: 'pause', timestamp: Date.now() - 1000 },
            { type: 'end', timestamp: Date.now() },
          ],
        },
      });
    } catch (error) {
      console.error('Error watching video:', error);
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${disabled ? 'opacity-50' : ''}`}>
      <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Play className="h-8 w-8 text-gray-400" />
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-white bg-opacity-90 rounded-full p-3">
            <Play className="h-6 w-6 text-gray-800" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200">
            <DollarSign className="h-3 w-3" />
            {video.rewardAmount.toFixed(2)}
          </Badge>
        </div>

        <Button
          onClick={handleWatchVideo}
          disabled={disabled || isWatching || watchVideoMutation.isPending}
          className="w-full"
          size="sm"
        >
          {isWatching || watchVideoMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isWatching ? 'Watching...' : 'Processing...'}
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Watch & Earn
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
