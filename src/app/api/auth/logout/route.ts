import { NextRequest, NextResponse } from "next/server";
import { SecureTokenManager } from "@/lib/token-manager";
import { addAPISecurityHeaders } from "@/lib/security-headers";

// Type definitions for API responses
interface LogoutSuccessResponse {
  success: true;
  message: string;
}

interface LogoutErrorResponse {
  success: false;
  error: string;
}

type LogoutResponse = LogoutSuccessResponse | LogoutErrorResponse;

export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  let response = NextResponse.json<LogoutSuccessResponse>({
    success: true,
    message: "Logged out successfully",
  });

  try {
    // Get tokens from cookies
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh-token")?.value;

    // Revoke tokens if they exist
    if (accessToken) {
      SecureTokenManager.revokeToken(accessToken);
    }

    if (refreshToken) {
      SecureTokenManager.revokeToken(refreshToken);
    }

    // Clear cookies
    response.cookies.delete("access_token");
    response.cookies.delete("refresh-token");

    // Set additional cookie clearing options
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set("refresh-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return addAPISecurityHeaders(response);
  } catch (error) {
    console.error("Logout error:", error);

    return addAPISecurityHeaders(NextResponse.json<LogoutErrorResponse>(
      { success: false, error: "Logout failed" },
      { status: 500 }
    ));
  }
}
