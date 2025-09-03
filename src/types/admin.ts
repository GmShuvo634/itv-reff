
export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registrationDate: string;
  lastLogin: string;
  status: "active" | "blocked";
  engagement: number;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  uploadDate: string;
  views: number;
  engagement: number;
};

export type AnalyticsData = {
  userIncome: {
    monthly: number[];
    weekly: number[];
    yearly: number[];
  };
  videoStats: {
    views: number;
    engagement: number;
  };
  userGrowth: {
    totalUsers: number;
    newUsers: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
  };
};
