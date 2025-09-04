import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/admin/analytics-service";
import { ApiResponse } from "@/types/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");
    const timePeriod = (searchParams.get("timePeriod") as "daily" | "weekly" | "monthly" | "yearly") || "monthly";

    // Parse dates
    const dateFrom = dateFromParam ? new Date(dateFromParam) : undefined;
    const dateTo = dateToParam ? new Date(dateToParam) : undefined;

    // Validate dates
    if (dateFromParam && isNaN(dateFrom!.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dateFrom parameter",
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (dateToParam && isNaN(dateTo!.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dateTo parameter",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get analytics data
    const analyticsData = await analyticsService.getAnalyticsData(
      dateFrom,
      dateTo,
      timePeriod
    );

    return NextResponse.json(
      {
        success: true,
        data: analyticsData,
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        message: error instanceof Error ? error.message : "Unknown error",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
