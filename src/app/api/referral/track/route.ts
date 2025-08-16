import { NextRequest, NextResponse } from "next/server";
import { ReferralService } from "@/lib/referral-service";
import { addAPISecurityHeaders } from "@/lib/security-headers";

// Type definitions for API responses
interface TrackSuccessResponse {
  success: true;
  message: string;
  activityId: string;
}

interface TrackErrorResponse {
  success: false;
  error: string;
}

type TrackResponse = TrackSuccessResponse | TrackErrorResponse;

export async function POST(
  request: NextRequest
): Promise<NextResponse<TrackResponse>> {
  let response: NextResponse<TrackResponse>;

  try {
    const body = await request.json();
    const { referralCode, source = "link" } = body;

    if (!referralCode) {
      response = NextResponse.json<TrackErrorResponse>(
        { success: false, error: "Referral code is required" },
        { status: 400 }
      );
      return addAPISecurityHeaders(response);
    }

    // Get client information
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Track the referral visit
    const result = await ReferralService.trackReferralVisit({
      referralCode,
      ipAddress,
      userAgent,
      source,
      metadata: {
        timestamp: new Date().toISOString(),
        referer: request.headers.get("referer"),
      },
    });

    if (result.success) {
      response = NextResponse.json<TrackSuccessResponse>({
        success: true,
        message: "Referral tracked successfully",
        activityId: result.activityId as string,
      });
    } else {
      response = NextResponse.json<TrackErrorResponse>(
        { success: false, error: "Invalid referral code" },
        { status: 404 }
      );
    }

    return addAPISecurityHeaders(response);
  } catch (error) {
    console.error("Referral tracking error:", error);
    return addAPISecurityHeaders(
      NextResponse.json<TrackErrorResponse>(
        { success: false, error: "Internal server error" },
        { status: 500 }
      )
    );
  }
}
