"use client";

import { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";
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
  MessageCircle,
  ChevronDown,
  Home,
  CopyCheck,
  Share,
  GitCompare,
  User,
  LucideProps,
  LucideIcon,
} from "lucide-react";

import { FullPageScrollableLayout } from "./scrollable-layout";
import Link from "next/link";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  id: string;
}

const DashboardHeader = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const languages = [
    {
      name: "English",
      flag: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 32 32"
        >
          <rect
            x="1"
            y="4"
            width="30"
            height="24"
            rx="4"
            ry="4"
            fill="#071b65"
          ></rect>
          <path
            d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z"
            fill="#fff"
          ></path>
          <path
            d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z"
            fill="#b92932"
          ></path>
          <path
            d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z"
            fill="#b92932"
          ></path>
          <path
            d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z"
            fill="#fff"
          ></path>
          <rect x="13" y="4" width="6" height="24" fill="#fff"></rect>
          <rect x="1" y="13" width="30" height="6" fill="#fff"></rect>
          <rect x="14" y="4" width="4" height="24" fill="#b92932"></rect>
          <rect
            x="14"
            y="1"
            width="4"
            height="30"
            transform="translate(32) rotate(90)"
            fill="#b92932"
          ></rect>
          <path
            d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z"
            fill="#b92932"
          ></path>
          <path
            d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z"
            fill="#b92932"
          ></path>
          <path
            d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
            opacity=".15"
          ></path>
          <path
            d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
            fill="#fff"
            opacity=".2"
          ></path>
        </svg>
      ),
    },
    {
      name: "Urdu",
      flag: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 32 32"
        >
          <rect
            x="1"
            y="4"
            width="30"
            height="24"
            rx="4"
            ry="4"
            fill="#173e1b"
          ></rect>
          <path
            d="M10,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4h5V4Z"
            fill="#fff"
          ></path>
          <path
            d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
            opacity=".15"
          ></path>
          <path
            d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
            fill="#fff"
            opacity=".2"
          ></path>
          <path
            d="M26.268,19.09c-2.692,2.393-6.815,2.151-9.209-.542-2.393-2.692-2.151-6.815,.542-9.209,.113-.1,.229-.196,.346-.287-2.87,.917-4.948,3.605-4.948,6.779,0,3.93,3.186,7.116,7.116,7.116,2.878,0,5.357-1.709,6.478-4.168-.104,.106-.213,.21-.326,.311Z"
            fill="#fff"
          ></path>
          <path
            fill="#fff"
            d="M22.984 13.282L23.153 14.997 24.024 13.51 25.708 13.879 24.563 12.591 25.434 11.104 23.855 11.795 22.71 10.507 22.88 12.222 21.301 12.913 22.984 13.282z"
          ></path>
        </svg>
      ),
    },
  ];

  const currentLanguage = languages.find(
    (lang) => lang.name === selectedLanguage
  );

  const handleLanguageSelect = (languageName) => {
    setSelectedLanguage(languageName);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-[48px] bg-black/70 text-white">
      <div className="flex items-center justify-between p-2">
        {/* Language Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 hover:bg-white/10"
          >
            {currentLanguage?.flag}
            <span className="text-sm font-medium">{selectedLanguage}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-[120px]">
              {languages.map((language) => (
                <button
                  key={language.name}
                  onClick={() => handleLanguageSelect(language.name)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md ${
                    selectedLanguage === language.name ? "bg-gray-700" : ""
                  }`}
                >
                  {language.flag}
                  <span className="text-sm">{language.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-lg font-semibold text-center flex-1">iTV</h1>

        <div>
          <Button size="icon" variant="ghost">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

const Menubar = () => {
  const [activeItem, setActiveItem] = useState('home');

  const navItems: NavItemProps[] = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
      id: "home"
    },
    {
      icon: CopyCheck,
      label: "Task",
      href: "/task",
      id: "task"
    },
    {
      icon: Share,
      label: "VIP",
      href: "/vip",
      id: "vip"
    },
    {
      icon: GitCompare,
      label: "Profit",
      href: "/profit",
      id: "profit"
    },
    {
      icon: User,
      label: "My",
      href: "/user",
      id: "my"
    },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <div className="h-[52px] bg-black/70 text-white">
      <nav className="flex items-center justify-between h-full pt-[12px] pl-[14px] pr-[14px]">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;

          return (
           <Link href={item.href} key={item.id}>
            <Button
              variant={'ghost'}
              onClick={() => handleItemClick(item.id)}
              className="transition-colors hover:bg-gray-700/50 flex flex-col items-center"
            >
                <IconComponent size={20} className={`${isActive ? 'text-yellow-400' : 'text-gray-400'} transition-colors`}/>
              <span className={`text-xs ${isActive ? 'text-yellow-400' : 'text-gray-400'} transition-colors`}>
                {item.label}
              </span>
            </Button>
           </Link>
          );
        })}
      </nav>
    </div>
  );
};

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
    <FullPageScrollableLayout menubar={<Menubar />}>
      <DashboardHeader />
      <div className="min-h-screen bg-gray-50">
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
                <CardTitle className="text-sm font-medium">
                  Daily Goal
                </CardTitle>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Video Tasks</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
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
                    {todayProgress.dailyLimit || 0} videos to maximize your
                    daily earnings.
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
                        Congratulations! You've completed all your video tasks
                        for today.
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
                              Current Position:{" "}
                              {videosData.currentPosition.name} (Level{" "}
                              {videosData.currentPosition.level})
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
    </FullPageScrollableLayout>
  );
}
