import { db as prisma } from "@/lib/db";
import {
  AnalyticsData,
  AnalyticsOverview,
  UserIncomeAnalytics,
  VideoViewsAnalytics,
  VideoAnalytics,
  UserAnalytics,
  RevenueBreakdown,
  AnalyticsTimeSeriesData,
} from "@/types/admin";

export class AnalyticsService {
  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(
    dateFrom?: Date,
    dateTo?: Date,
    timePeriod: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
  ): Promise<AnalyticsData> {
    const endDate = dateTo || new Date();
    const startDate = dateFrom || this.getDefaultStartDate(timePeriod);

    const [
      overview,
      userIncome,
      videoViews,
      topVideos,
      topUsers,
      revenueBreakdown,
    ] = await Promise.all([
      this.getOverviewStats(startDate, endDate),
      this.getUserIncomeAnalytics(startDate, endDate),
      this.getVideoViewsAnalytics(startDate, endDate),
      this.getTopVideos(startDate, endDate),
      this.getTopUsers(startDate, endDate),
      this.getRevenueBreakdown(startDate, endDate),
    ]);

    return {
      overview,
      userIncome,
      videoViews,
      topVideos,
      topUsers,
      revenueBreakdown,
    };
  }

  /**
   * Get overview statistics
   */
  private async getOverviewStats(
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsOverview> {
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);

    // Current period stats
    const [
      currentRevenue,
      currentUsers,
      currentVideoViews,
      currentActiveUsers,
    ] = await Promise.all([
      this.getTotalRevenue(startDate, endDate),
      this.getTotalUsers(startDate, endDate),
      this.getTotalVideoViews(startDate, endDate),
      this.getActiveUsers(startDate, endDate),
    ]);

    // Previous period stats for growth calculation
    const [
      previousRevenue,
      previousUsers,
      previousVideoViews,
      previousActiveUsers,
    ] = await Promise.all([
      this.getTotalRevenue(previousPeriod.start, previousPeriod.end),
      this.getTotalUsers(previousPeriod.start, previousPeriod.end),
      this.getTotalVideoViews(previousPeriod.start, previousPeriod.end),
      this.getActiveUsers(previousPeriod.start, previousPeriod.end),
    ]);

    return {
      totalRevenue: currentRevenue,
      revenueGrowth: this.calculateGrowthPercentage(
        currentRevenue,
        previousRevenue,
      ),
      totalUsers: currentUsers,
      userGrowth: this.calculateGrowthPercentage(currentUsers, previousUsers),
      totalVideoViews: currentVideoViews,
      videoViewGrowth: this.calculateGrowthPercentage(
        currentVideoViews,
        previousVideoViews,
      ),
      activeUsers: currentActiveUsers,
      activeUserChange: currentActiveUsers - previousActiveUsers,
    };
  }

  /**
   * Get user income analytics
   */
  private async getUserIncomeAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<UserIncomeAnalytics> {
    const [monthlyData, weeklyData, yearlyData] = await Promise.all([
      this.getUserIncomeByPeriod(startDate, endDate, "month"),
      this.getUserIncomeByPeriod(startDate, endDate, "week"),
      this.getUserIncomeByPeriod(startDate, endDate, "year"),
    ]);

    return {
      monthly: monthlyData,
      weekly: weeklyData,
      yearly: yearlyData,
    };
  }

  /**
   * Get video views analytics
   */
  private async getVideoViewsAnalytics(
    startDate: Date,
    endDate: Date,
  ): Promise<VideoViewsAnalytics> {
    const [dailyData, weeklyData, monthlyData] = await Promise.all([
      this.getVideoViewsByPeriod(startDate, endDate, "day"),
      this.getVideoViewsByPeriod(startDate, endDate, "week"),
      this.getVideoViewsByPeriod(startDate, endDate, "month"),
    ]);

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
    };
  }

  /**
   * Get user income data grouped by period
   */
  private async getUserIncomeByPeriod(
    startDate: Date,
    endDate: Date,
    period: "day" | "week" | "month" | "year",
  ): Promise<AnalyticsTimeSeriesData[]> {
    const dateFormat = this.getDateFormat(period);

    const results = await prisma.$queryRaw<
      { period: string; total_income: number }[]
    >`
      SELECT
        TO_CHAR(created_at, ${dateFormat}) as period,
        SUM(amount)::FLOAT as total_income
      FROM wallet_transactions
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND type IN ('TASK_INCOME', 'REFERRAL_REWARD_A', 'REFERRAL_REWARD_B', 'REFERRAL_REWARD_C', 'MANAGEMENT_BONUS_A', 'MANAGEMENT_BONUS_B', 'MANAGEMENT_BONUS_C')
        AND status = 'COMPLETED'
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY period;
    `;

    return results.map((row) => ({
      name: row.period,
      value: row.total_income || 0,
      date: row.period,
    }));
  }

  /**
   * Get video views data grouped by period
   */
  private async getVideoViewsByPeriod(
    startDate: Date,
    endDate: Date,
    period: "day" | "week" | "month" | "year",
  ): Promise<AnalyticsTimeSeriesData[]> {
    const dateFormat = this.getDateFormat(period);

    const results = await prisma.$queryRaw<
      { period: string; total_views: number }[]
    >`
      SELECT
        TO_CHAR(watched_at, ${dateFormat}) as period,
        COUNT(*)::INT as total_views
      FROM user_video_tasks
      WHERE watched_at >= ${startDate}
        AND watched_at <= ${endDate}
        AND is_verified = true
      GROUP BY TO_CHAR(watched_at, ${dateFormat})
      ORDER BY period;
    `;

    return results.map((row) => ({
      name: row.period,
      value: row.total_views || 0,
      date: row.period,
    }));
  }

  /**
   * Get top performing videos
   */
  private async getTopVideos(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<VideoAnalytics[]> {
    const results = await prisma.$queryRaw<
      {
        id: string;
        title: string;
        views: number;
        total_rewards_paid: number;
        avg_watch_time: number;
        completion_rate: number;
      }[]
    >`
      SELECT
        v.id,
        v.title,
        COUNT(uvt.id)::INT as views,
        SUM(uvt.reward_earned)::FLOAT as total_rewards_paid,
        AVG(uvt.watch_duration)::FLOAT as avg_watch_time,
        (COUNT(CASE WHEN uvt.watch_duration >= v.duration * 0.8 THEN 1 END)::FLOAT / COUNT(uvt.id)::FLOAT * 100) as completion_rate
      FROM videos v
      LEFT JOIN user_video_tasks uvt ON v.id = uvt.video_id
        AND uvt.watched_at >= ${startDate}
        AND uvt.watched_at <= ${endDate}
        AND uvt.is_verified = true
      WHERE v.is_active = true
      GROUP BY v.id, v.title, v.duration
      ORDER BY views DESC, total_rewards_paid DESC
      LIMIT ${limit};
    `;

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      views: row.views || 0,
      engagement: row.completion_rate || 0,
      totalRewardsPaid: row.total_rewards_paid || 0,
      averageWatchTime: row.avg_watch_time || 0,
      completionRate: row.completion_rate || 0,
    }));
  }

  /**
   * Get top performing users
   */
  private async getTopUsers(
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<UserAnalytics[]> {
    const results = await prisma.$queryRaw<
      {
        id: string;
        name: string;
        email: string;
        total_earnings: number;
        video_tasks_completed: number;
        referral_count: number;
      }[]
    >`
      SELECT
        u.id,
        u.name,
        u.email,
        u.total_earnings,
        COUNT(uvt.id)::INT as video_tasks_completed,
        (SELECT COUNT(*) FROM users ref WHERE ref.referred_by = u.id)::INT as referral_count
      FROM users u
      LEFT JOIN user_video_tasks uvt ON u.id = uvt.user_id
        AND uvt.watched_at >= ${startDate}
        AND uvt.watched_at <= ${endDate}
        AND uvt.is_verified = true
      WHERE u.created_at >= ${startDate} OR uvt.watched_at >= ${startDate}
      GROUP BY u.id, u.name, u.email, u.total_earnings
      ORDER BY u.total_earnings DESC, video_tasks_completed DESC
      LIMIT ${limit};
    `;

    return results.map((row) => ({
      id: row.id,
      name: row.name || "Unknown",
      email: row.email,
      totalEarnings: row.total_earnings || 0,
      videoTasksCompleted: row.video_tasks_completed || 0,
      referralCount: row.referral_count || 0,
      engagement:
        row.video_tasks_completed > 0
          ? Math.min((row.video_tasks_completed / 30) * 100, 100)
          : 0,
    }));
  }

  /**
   * Get revenue breakdown by source
   */
  private async getRevenueBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueBreakdown[]> {
    const results = await prisma.$queryRaw<{ type: string; amount: number }[]>`
      SELECT
        type,
        SUM(amount)::FLOAT as amount
      FROM wallet_transactions
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND status = 'COMPLETED'
        AND type IN ('TASK_INCOME', 'REFERRAL_REWARD_A', 'REFERRAL_REWARD_B', 'REFERRAL_REWARD_C', 'MANAGEMENT_BONUS_A', 'MANAGEMENT_BONUS_B', 'MANAGEMENT_BONUS_C')
      GROUP BY type
      ORDER BY amount DESC;
    `;

    const totalAmount = results.reduce((sum, row) => sum + row.amount, 0);

    return results.map((row) => ({
      source: this.formatTransactionType(row.type),
      amount: row.amount,
      percentage: totalAmount > 0 ? (row.amount / totalAmount) * 100 : 0,
    }));
  }

  /**
   * Helper methods
   */
  private async getTotalRevenue(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "COMPLETED",
        type: {
          in: [
            "TASK_INCOME",
            "REFERRAL_REWARD_A",
            "REFERRAL_REWARD_B",
            "REFERRAL_REWARD_C",
            "MANAGEMENT_BONUS_A",
            "MANAGEMENT_BONUS_B",
            "MANAGEMENT_BONUS_C",
          ],
        },
      },
    });

    return result._sum.amount || 0;
  }

  private async getTotalUsers(startDate: Date, endDate: Date): Promise<number> {
    return await prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });
  }

  private async getTotalVideoViews(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return await prisma.userVideoTask.count({
      where: {
        watchedAt: { gte: startDate, lte: endDate },
        isVerified: true,
      },
    });
  }

  private async getActiveUsers(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return await prisma.user.count({
      where: {
        OR: [
          { lastLoginAt: { gte: startDate, lte: endDate } },
          {
            videoTasks: {
              some: {
                watchedAt: { gte: startDate, lte: endDate },
                isVerified: true,
              },
            },
          },
        ],
      },
    });
  }

  private getDateFormat(period: "day" | "week" | "month" | "year"): string {
    switch (period) {
      case "day":
        return "YYYY-MM-DD";
      case "week":
        return "IYYY-IW";
      case "month":
        return "YYYY-MM";
      case "year":
        return "YYYY";
      default:
        return "YYYY-MM";
    }
  }

  private getDefaultStartDate(timePeriod: string): Date {
    const now = new Date();
    switch (timePeriod) {
      case "daily":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
      case "weekly":
        return new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks
      case "monthly":
        return new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // 12 months
      case "yearly":
        return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getPreviousPeriod(
    startDate: Date,
    endDate: Date,
  ): { start: Date; end: Date } {
    const duration = endDate.getTime() - startDate.getTime();
    return {
      start: new Date(startDate.getTime() - duration),
      end: new Date(startDate.getTime()),
    };
  }

  private calculateGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private formatTransactionType(type: string): string {
    const typeMap: { [key: string]: string } = {
      TASK_INCOME: "Task Rewards",
      REFERRAL_REWARD_A: "Level A Referrals",
      REFERRAL_REWARD_B: "Level B Referrals",
      REFERRAL_REWARD_C: "Level C Referrals",
      MANAGEMENT_BONUS_A: "Level A Management",
      MANAGEMENT_BONUS_B: "Level B Management",
      MANAGEMENT_BONUS_C: "Level C Management",
    };

    return typeMap[type] || type;
  }
}

export const analyticsService = new AnalyticsService();
