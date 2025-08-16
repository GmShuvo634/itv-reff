import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { addAPISecurityHeaders } from "@/lib/security-headers";

// Type definitions for API responses
interface SubscribeSuccessResponse {
  message: string;
  subscription: {
    id: string;
    planName: string;
    startDate: Date;
    endDate: Date;
    amountPaid: number;
    status: string;
  };
}

interface SubscribeErrorResponse {
  error: string;
}

type SubscribeResponse = SubscribeSuccessResponse | SubscribeErrorResponse;

export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const user = await authMiddleware(request);

    if (!user || !user.id) {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "Authentication required" },
        { status: 401 }
      ));
    }

    const body = await request.json();
    const { planId, paymentMethod, paymentDetails } = body;

    if (!planId) {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "Plan ID is required" },
        { status: 400 }
      ));
    }

    // Get the plan
    const plan = await db.plan.findUnique({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "Plan not found" },
        { status: 404 }
      ));
    }

    // Check if user already has an active plan
    const existingPlan = await db.userPlan.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    if (existingPlan) {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "You already have an active plan" },
        { status: 400 }
      ));
    }

    // In a real implementation, you would process the payment here
    // For now, we'll simulate successful payment
    const paymentSuccessful = true;

    if (!paymentSuccessful) {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "Payment failed" },
        { status: 400 }
      ));
    }

    // Calculate plan end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create user plan
    const userPlan = await db.userPlan.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amountPaid: plan.price,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });

    // Ensure user has required properties for transaction
    if (typeof user.walletBalance !== 'number') {
      return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
        { error: "User wallet balance not available" },
        { status: 500 }
      ));
    }

    // Create transaction record
    await db.walletTransaction.create({
      data: {
        userId: user.id,
        type: TransactionType.DEBIT,
        amount: plan.price,
        balanceAfter: user.walletBalance - plan.price,
        description: `Plan subscription: ${plan.name}`,
        referenceId: `PLAN_${userPlan.id}`,
        status: TransactionStatus.COMPLETED,
      },
    });

    // Update user's wallet balance
    await db.user.update({
      where: { id: user.id },
      data: {
        walletBalance: user.walletBalance - plan.price,
      },
    });

    return addAPISecurityHeaders(NextResponse.json<SubscribeSuccessResponse>({
      message: "Subscription successful",
      subscription: {
        id: userPlan.id,
        planName: plan.name,
        startDate: userPlan.startDate,
        endDate: userPlan.endDate,
        amountPaid: userPlan.amountPaid,
        status: userPlan.status,
      },
    }));
  } catch (error) {
    console.error("Subscription error:", error);
    return addAPISecurityHeaders(NextResponse.json<SubscribeErrorResponse>(
      { error: "Internal server error" },
      { status: 500 }
    ));
  }
}
