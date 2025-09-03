import { getAdminById } from "@/lib/api/auth";
import { addAPISecurityHeaders } from "@/lib/security-headers";
import { SecureTokenManager } from "@/lib/token-manager";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let response: NextResponse = NextResponse.json(
    {
      success: false,
      error: "Authentication failed",
    },
    {
      status: 401,
    }
  );

  try {
    let token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      token = request.cookies.get("access_token")?.value;
    }

    if (!token) {
      response = NextResponse.json(
        {
          success: false,
          error: "No authentication token found",
        },
        {
          status: 401,
        }
      );

      return addAPISecurityHeaders(response);
    }

    const payload = SecureTokenManager.verifyAccessToken(token);

    if (!payload) {
      response = NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
      return addAPISecurityHeaders(response);
    }
    const admin = await getAdminById(payload.userId);

    if (!admin || !admin.id) {
      response = NextResponse.json(
        {
          success: false,
          error: "User not found or inactive",
        },
        {
          status: 401,
        }
      );
      return addAPISecurityHeaders(response);
    }

    response = NextResponse.json({
      success: true,
      message: "Admin retrived Successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

    return addAPISecurityHeaders(response);
  } catch (error) {
    console.error("Auth check error:", error);
    response = NextResponse.json(
      { success: false, error: "Authentication check failed" },
      { status: 500 }
    );
    return addAPISecurityHeaders(response);
  }
}
