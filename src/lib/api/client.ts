import axios, { AxiosError, AxiosResponse } from 'axios';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number;
  rewardAmount: number;
}

export interface VideosResponse {
  videos: Video[];
  dailyTaskLimit: number;
  tasksCompletedToday: number;
  canCompleteTask: boolean;
  tasksRemaining?: number;
  reason?: string;
  currentPosition?: {
    name: string;
    level: number;
    unitPrice: number;
  };
}

export interface WatchVideoRequest {
  watchDuration: number;
  verificationData?: any;
  userInteractions?: any[];
}

export interface WatchVideoResponse {
  success: boolean;
  message: string;
  reward?: number;
  newBalance?: number;
  tasksRemaining?: number;
}

const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? '' : process.env.BACKEND_URL || '',
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Token will be automatically included via cookies
    // But we can also add it to headers if needed
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      apiError.message = errorData.error || errorData.message || apiError.message;
      apiError.code = errorData.code;
    } else if (error.message) {
      apiError.message = error.message;
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      apiError.message = 'Authentication required. Please log in again.';
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return Promise.reject(apiError);
  }
);

export const videosApi = {
  getVideos: async (): Promise<VideosResponse> => {
    const response = await apiClient.get<VideosResponse>('/api/videos');
    return response.data;
  },

  watchVideo: async (videoId: string, data: WatchVideoRequest): Promise<WatchVideoResponse> => {
    const response = await apiClient.post<WatchVideoResponse>(`/api/videos/${videoId}/watch`, data);
    return response.data;
  },
};

export default apiClient;
