import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// プラン定義
const PLANS = {
  free: {
    name: "フリー",
    priceMonthly: 0,
    priceYearly: 0,
    limits: { estimates: 10, customers: 50, storage: 1 },
  },
  starter: {
    name: "スターター",
    priceMonthly: 9800,
    priceYearly: 98000,
    limits: { estimates: 50, customers: 300, storage: 10 },
  },
  professional: {
    name: "プロフェッショナル",
    priceMonthly: 19800,
    priceYearly: 198000,
    limits: { estimates: -1, customers: -1, storage: 50 },
  },
  enterprise: {
    name: "エンタープライズ",
    priceMonthly: 49800,
    priceYearly: 498000,
    limits: { estimates: -1, customers: -1, storage: 200 },
  },
};

// GET /api/subscriptions - サブスクリプション情報取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const currentPlan = company.subscriptionPlan || "free";
    const planDetails = PLANS[currentPlan as keyof typeof PLANS] || PLANS.free;

    // 使用量を計算
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [estimateCount, customerCount] = await Promise.all([
      prisma.estimate.count({
        where: {
          companyId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.customer.count({
        where: { companyId },
      }),
    ]);

    // ストレージ使用量（写真の概算）
    const photoCount = await prisma.photo.count({
      where: {
        project: { companyId },
      },
    });
    const estimatedStorageGB = (photoCount * 2) / 1024; // 写真1枚平均2MB想定

    return NextResponse.json({
      data: {
        subscription: {
          plan: currentPlan,
          planName: planDetails.name,
          status: company.subscriptionStatus || "active",
          priceMonthly: planDetails.priceMonthly,
          priceYearly: planDetails.priceYearly,
          limits: planDetails.limits,
          stripeCustomerId: company.stripeCustomerId,
        },
        usage: {
          estimates: {
            used: estimateCount,
            limit: planDetails.limits.estimates,
            percentage: planDetails.limits.estimates === -1
              ? 0
              : Math.round((estimateCount / planDetails.limits.estimates) * 100),
          },
          customers: {
            used: customerCount,
            limit: planDetails.limits.customers,
            percentage: planDetails.limits.customers === -1
              ? 0
              : Math.round((customerCount / planDetails.limits.customers) * 100),
          },
          storage: {
            used: Math.round(estimatedStorageGB * 10) / 10,
            limit: planDetails.limits.storage,
            percentage: Math.round((estimatedStorageGB / planDetails.limits.storage) * 100),
          },
        },
        availablePlans: Object.entries(PLANS).map(([id, plan]) => ({
          id,
          ...plan,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - プラン変更リクエスト
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, planId, billingCycle } = body;

    if (!companyId || !planId) {
      return NextResponse.json(
        { error: "companyId and planId are required" },
        { status: 400 }
      );
    }

    if (!PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // 実際の実装では、ここでStripe Checkout Sessionを作成
    // const session = await stripe.checkout.sessions.create({...})

    // デモ用：直接プランを更新
    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionPlan: planId,
        subscriptionStatus: "active",
      },
    });

    return NextResponse.json({
      data: {
        success: true,
        plan: planId,
        // checkoutUrl: session.url, // Stripe実装時
        message: `プランを${PLANS[planId as keyof typeof PLANS].name}に変更しました`,
      },
    });
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - サブスクリプションキャンセル
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  try {
    // 実際の実装では、Stripeのサブスクリプションをキャンセル
    // await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

    await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionStatus: "canceling",
      },
    });

    return NextResponse.json({
      data: {
        success: true,
        message: "サブスクリプションは期間終了時にキャンセルされます",
      },
    });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
