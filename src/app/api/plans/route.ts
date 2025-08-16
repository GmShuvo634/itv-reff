import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addAPISecurityHeaders } from '@/lib/security-headers';

// Type definitions for API responses
interface PlansSuccessResponse {
  plans: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationDays: number;
    dailyVideoLimit: number;
    rewardPerVideo: number;
    referralBonus: number;
  }>;
}

interface PlansErrorResponse {
  error: string;
}

interface CreatePlanSuccessResponse {
  message: string;
  plan: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationDays: number;
    dailyVideoLimit: number;
    rewardPerVideo: number;
    referralBonus: number;
  };
}

type PlansResponse = PlansSuccessResponse | PlansErrorResponse;
type CreatePlanResponse = CreatePlanSuccessResponse | PlansErrorResponse;

export async function GET(request: NextRequest): Promise<NextResponse<PlansResponse>> {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    return addAPISecurityHeaders(NextResponse.json<PlansSuccessResponse>({
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        dailyVideoLimit: plan.dailyVideoLimit,
        rewardPerVideo: plan.rewardPerVideo,
        referralBonus: plan.referralBonus,
      }))
    }));

  } catch (error) {
    console.error('Get plans error:', error);
    return addAPISecurityHeaders(NextResponse.json<PlansErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreatePlanResponse>> {
  try {
    const body = await request.json();
    const { name, description, price, durationDays, dailyVideoLimit, rewardPerVideo, referralBonus } = body;

    // Validate input
    if (!name || !price || !durationDays || !dailyVideoLimit || !rewardPerVideo) {
      return addAPISecurityHeaders(NextResponse.json<PlansErrorResponse>(
        { error: 'Missing required fields' },
        { status: 400 }
      ));
    }

    const plan = await db.plan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        durationDays: parseInt(durationDays),
        dailyVideoLimit: parseInt(dailyVideoLimit),
        rewardPerVideo: parseFloat(rewardPerVideo),
        referralBonus: parseFloat(referralBonus) || 0,
      }
    });

    return addAPISecurityHeaders(NextResponse.json<CreatePlanSuccessResponse>({
      message: 'Plan created successfully',
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        dailyVideoLimit: plan.dailyVideoLimit,
        rewardPerVideo: plan.rewardPerVideo,
        referralBonus: plan.referralBonus,
      }
    }));

  } catch (error) {
    console.error('Create plan error:', error);
    return addAPISecurityHeaders(NextResponse.json<PlansErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    ));
  }
}