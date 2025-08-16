import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi, type VideosResponse, type WatchVideoRequest, type WatchVideoResponse } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';

export const VIDEO_QUERY_KEYS = {
  all: ['videos'] as const,
  lists: () => [...VIDEO_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...VIDEO_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VIDEO_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VIDEO_QUERY_KEYS.details(), id] as const,
};

export function useVideos() {
  return useQuery({
    queryKey: VIDEO_QUERY_KEYS.lists(),
    queryFn: videosApi.getVideos,
    staleTime: 2 * 60 * 1000, // 2 minutes - videos don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to check for new videos
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useWatchVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, data }: { videoId: string; data: WatchVideoRequest }) =>
      videosApi.watchVideo(videoId, data),
    onSuccess: (data: WatchVideoResponse, variables) => {
      // Show success message
      toast({
        title: 'Video Watched Successfully!',
        description: `You earned $${data.reward?.toFixed(2) || '0.00'}. ${data.tasksRemaining || 0} tasks remaining today.`,
        variant: 'default',
      });

      // Invalidate and refetch videos to get updated list
      queryClient.invalidateQueries({
        queryKey: VIDEO_QUERY_KEYS.lists(),
      });

      // Also invalidate dashboard data if it exists
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });

      // Invalidate wallet/balance data if it exists
      queryClient.invalidateQueries({
        queryKey: ['wallet'],
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Watch Video',
        description: error.message || 'An error occurred while processing your video watch.',
        variant: 'destructive',
      });
    },
  });
}

// Hook for prefetching videos (useful for preloading)
export function usePrefetchVideos() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: VIDEO_QUERY_KEYS.lists(),
      queryFn: videosApi.getVideos,
      staleTime: 2 * 60 * 1000,
    });
  };
}

// Hook to get cached videos data without triggering a request
export function useVideosCache() {
  const queryClient = useQueryClient();
  
  return queryClient.getQueryData<VideosResponse>(VIDEO_QUERY_KEYS.lists());
}

// Hook to manually refetch videos
export function useRefreshVideos() {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.invalidateQueries({
      queryKey: VIDEO_QUERY_KEYS.lists(),
    });
  };
}
