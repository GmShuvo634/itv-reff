import { addAPISecurityHeaders } from "@/lib/security-headers";
import { adminAuthMiddleware } from "@/lib/api/api-auth";
import { getAdminById } from "@/lib/api/auth";
import { SecureTokenManager } from "@/lib/token-manager";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("🔍 GetAdmin API called");

  try {
    // Debug: Check token presence
    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = request.cookies.get("access_token")?.value;
    }

    console.log("📝 Token exists:", !!token);
    if (token) {
      console.log("📝 Token (first 20 chars):", token.substring(0, 20) + "...");
    }

    if (!token) {
      console.log("❌ No token found in request");
      const response = NextResponse.json(
        {
          success: false,
          error: "No authentication token found",
        },
        { status: 401 },
      );
      return addAPISecurityHeaders(response);
    }

    // Debug: Verify token manually
    const payload = SecureTokenManager.verifyAccessToken(token);
    console.log("🔓 Token payload:", payload);

    if (!payload) {
      console.log("❌ Token verification failed");
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
        },
        { status: 401 },
      );
      return addAPISecurityHeaders(response);
    }

    // Debug: Check admin in database
    const admin = await getAdminById(payload.userId);
    console.log("👤 Admin from database:", admin);

    if (!admin) {
      console.log("❌ Admin not found in database for userId:", payload.userId);

      // Debug: Check if user exists in AdminUser table
      const adminCount = await db.adminUser.count();
      console.log("📊 Total admin users in database:", adminCount);

      const userExists = await db.adminUser.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      });
      console.log("🔍 User exists check:", userExists);

      const response = NextResponse.json(
        {
          success: false,
          error: "Admin not found or inactive",
          debug: {
            userId: payload.userId,
            adminCount,
            userExists: !!userExists,
          },
        },
        { status: 401 },
      );
      return addAPISecurityHeaders(response);
    }

    console.log("✅ Admin authentication successful");

    const response = NextResponse.json({
      success: true,
      message: "Admin retrieved successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    return addAPISecurityHeaders(response);
  } catch (error) {
    console.error("🚨 Get admin error:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        debug: {
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
    return addAPISecurityHeaders(response);
  }
}
