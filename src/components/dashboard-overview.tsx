"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video-card";
import { useVideos } from "@/hooks/use-videos";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  Wallet,
  Play,
  Users,
  TrendingUp,
  Gift,
  ArrowUpRight,
  Target,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function DashboardOverview() {
  const router = useRouter();

  // TanStack Query hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboard();
  const {
    data: videosData,
    isLoading: videosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useVideos();

  // Handle authentication errors
  useEffect(() => {
    if (dashboardError?.status === 401) {
      router.push("/");
    }
  }, [dashboardError, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard</p>
          <Button onClick={() => router.push("/")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const { user, todayProgress, recentTransactions, referralStats } =
    dashboardData;
  const progressPercentage =
    todayProgress.dailyLimit > 0
      ? ((todayProgress.videosWatched || 0) / todayProgress.dailyLimit) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="relative w-8 h-8">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              </div>
              <span className="ml-2 text-lg font-semibold">
                VideoTask Rewards
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Ready to earn rewards by watching videos today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${user.walletBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total earned: ${user.totalEarnings.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Progress
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayProgress.videosWatched || 0}/
                {todayProgress.dailyLimit || 0}
              </div>
              <Progress value={progressPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Earned: ${(todayProgress.earningsToday || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralStats?.totalReferrals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Bonus earned: $
                {(referralStats?.referralEarnings || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progressPercentage >= 100
                  ? "Completed!"
                  : `${Math.round(progressPercentage)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {(todayProgress.dailyLimit || 0) -
                  (todayProgress.videosWatched || 0)}{" "}
                videos remaining
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Video Tasks</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Today's Video Tasks
                </CardTitle>
                <CardDescription>
                  Watch videos to earn rewards. Complete all{" "}
                  {todayProgress.dailyLimit || 0} videos to maximize your daily
                  earnings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(todayProgress.videosWatched || 0) >=
                (todayProgress.dailyLimit || 0) ? (
                  <div className="text-center py-8">
                    <div className="text-green-600 text-6xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-green-600 mb-2">
                      Daily Goal Completed!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Congratulations! You've completed all your video tasks for
                      today.
                    </p>
                    <p className="text-sm text-gray-500">
                      Come back tomorrow for more videos and rewards.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Video Status Section */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Play className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Available Videos</h4>
                          <p className="text-sm text-gray-600">
                            {videosData?.videos
                              ? `${
                                  videosData.videos.length
                                } videos available • ${
                                  videosData.tasksRemaining ?? 0
                                } tasks remaining`
                              : `${Math.max(
                                  0,
                                  (todayProgress?.dailyLimit ?? 0) -
                                    (todayProgress?.videosWatched ?? 0)
                                )} videos remaining today`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Videos Grid */}
                    {videosLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <Card key={i} className="animate-pulse">
                            <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                            <CardContent className="p-4">
                              <div className="h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded mb-3"></div>
                              <div className="flex justify-between">
                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                <div className="h-6 w-12 bg-gray-200 rounded"></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : videosError ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                          Failed to Load Videos
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {videosError.message ||
                            "Unable to fetch videos. Please try again."}
                        </p>
                        <Button
                          onClick={() => refetchVideos()}
                          variant="outline"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    ) : videosData && videosData.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videosData.videos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            disabled={!videosData.canCompleteTask}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-6xl mb-4">📹</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No Videos Available
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {videosData?.canCompleteTask === false
                            ? videosData.reason ||
                              "You have reached your daily limit."
                            : "Check back later for new videos to watch and earn rewards."}
                        </p>
                        {videosData?.currentPosition && (
                          <div className="text-sm text-gray-500">
                            Current Position: {videosData.currentPosition.name}{" "}
                            (Level {videosData.currentPosition.level})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Overview
                </CardTitle>
                <CardDescription>
                  Manage your earnings and view transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Current Balance
                    </h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${user.walletBalance.toFixed(2)}
                    </div>
                    <p className="text-gray-600">Available for withdrawal</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Total Earnings
                    </h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${user.totalEarnings.toFixed(2)}
                    </div>
                    <p className="text-gray-600">Since joining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest earning and withdrawal activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "CREDIT"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {transaction.type === "CREDIT" ? (
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-5 w-5 text-red-600 rotate-180" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString("en-US")}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-right ${
                            transaction.type === "CREDIT"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <p className="font-semibold">
                            {transaction.type === "CREDIT" ? "+" : "-"}$
                            {transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No transactions yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Referral Program
                </CardTitle>
                <CardDescription>
                  Earn bonus rewards by inviting friends to join VideoTask
                  Rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Your Referral Code
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {user.referralCode}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Share this code with your friends to earn referral
                        bonuses
                      </p>
                      <Button variant="outline" className="w-full">
                        Copy Code
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Referral Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Referrals</span>
                        <span className="font-semibold">
                          {referralStats?.totalReferrals || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Referral Earnings</span>
                        <span className="font-semibold text-green-600">
                          ${(referralStats?.referralEarnings || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bonus per Referral</span>
                        <span className="font-semibold">$5.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5" />
                  Withdraw Earnings
                </CardTitle>
                <CardDescription>
                  Withdraw your earnings to your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Available Balance
                    </h3>
                    <div className="text-3xl font-bold text-green-600 mb-4">
                      ${user.walletBalance.toFixed(2)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Minimum withdrawal: $10.00</p>
                      <p>• Weekly withdrawal limit: $100.00</p>
                      <p>• Processing time: 2-3 business days</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Request Withdrawal
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Amount
                        </label>
                        <input
                          type="number"
                          min="10"
                          max={user.walletBalance}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Payment Method
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option>PayPal</option>
                          <option>Bank Transfer</option>
                          <option>Mobile Money</option>
                        </select>
                      </div>
                      <Button
                        className="w-full"
                        disabled={user.walletBalance < 10}
                      >
                        {user.walletBalance < 10
                          ? "Minimum $10 required"
                          : "Request Withdrawal"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
