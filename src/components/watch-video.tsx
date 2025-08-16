"use client";

import { useWatchVideo } from "@/hooks/use-videos";

interface WatchVideoProps {
  videoId: string;
}

const WatchVideo = ({ videoId }: WatchVideoProps) => {
  const { data: videoUrl, isPending, error } = useWatchVideo();

  console.log(videoUrl);
  return <div>WatchVideo</div>;
};

export default WatchVideo;
