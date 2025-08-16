'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, DollarSign } from 'lucide-react';
import type { Video } from '@/lib/api/client';
import Link from 'next/link';

interface VideoCardProps {
  video: Video;
  disabled?: boolean;
}

export function VideoCard({ video, disabled = false }: VideoCardProps) {

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };



  return (
    <Link href={`/videos/${video.id}/watch`}>
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
      </CardContent>
    </Card>
    </Link>
  );
}
