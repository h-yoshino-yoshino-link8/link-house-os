import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";
import { SAVINGS_PLANS } from "@/constants";

// GET /api/savings - 積立契約一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json({
      data: DEMO_DATA.savings,
      stats: {
        totalBalance: 144000,
        activeCount: 1,
        monthlyTotal: 10000,
        byPlan: { light: 0, standard: 1, premium: 0 },
      },
    });
  }

  const customerId = searchParams.get("customerId");
  const status = searchParams.get("status");

  try {
    const where = {
      customer: { companyId },
      ...(customerId && { customerId }),
      ...(status && status !== "all" && { status }),
    };

    const contracts = await prisma.savingsContract.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        house: {
          select: {
            id: true,
            address: true,
          },
        },
        transactions: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 統計計算
    const stats = {
      totalBalance: contracts.reduce((sum: number, c: { balance: unknown; bonusBalance: unknown }) => sum + Number(c.balance) + Number(c.bonusBalance), 0),
      activeCount: contracts.filter((c: { status: string }) => c.status === "active").length,
      monthlyTotal: contracts
        .filter((c: { status: string }) => c.status === "active")
        .reduce((sum: number, c: { monthlyAmount: unknown }) => sum + Number(c.monthlyAmount), 0),
      byPlan: {
        light: contracts.filter((c: { plan: string }) => c.plan === "light").length,
        standard: contracts.filter((c: { plan: string }) => c.plan === "standard").length,
        premium: contracts.filter((c: { plan: string }) => c.plan === "premium").length,
      },
    };

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: contracts.map((c: any) => ({
        id: c.id,
        customerId: c.customerId,
        customerName: c.customer.name,
        houseId: c.houseId,
        houseAddress: c.house.address,
        plan: c.plan,
        planName: SAVINGS_PLANS[c.plan as keyof typeof SAVINGS_PLANS]?.name || c.plan,
        monthlyAmount: Number(c.monthlyAmount),
        savingsAmount: Number(c.savingsAmount),
        serviceAmount: Number(c.serviceAmount),
        balance: Number(c.balance),
        bonusBalance: Number(c.bonusBalance),
        totalBalance: Number(c.balance) + Number(c.bonusBalance),
        startDate: c.startDate,
        status: c.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recentTransactions: c.transactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          balanceAfter: Number(t.balanceAfter),
          description: t.description,
          createdAt: t.createdAt,
        })),
      })),
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch savings contracts:", error);
    return NextResponse.json({
      data: DEMO_DATA.savings,
      stats: {
        totalBalance: 144000,
        activeCount: 1,
        monthlyTotal: 10000,
        byPlan: { light: 0, standard: 1, premium: 0 },
      },
    });
  }
}

// POST /api/savings - 新規積立契約作成
export async function POST(request: NextRequest) {
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available in demo mode" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { customerId, houseId, plan } = body;

    if (!customerId || !houseId || !plan) {
      return NextResponse.json(
        { error: "customerId, houseId, and plan are required" },
        { status: 400 }
      );
    }

    const planDetails = SAVINGS_PLANS[plan as keyof typeof SAVINGS_PLANS];
    if (!planDetails) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // 既存契約チェック
    const existingContract = await prisma.savingsContract.findFirst({
      where: {
        customerId,
        houseId,
        status: { in: ["active", "paused"] },
      },
    });

    if (existingContract) {
      return NextResponse.json(
        { error: "Active contract already exists for this house" },
        { status: 400 }
      );
    }

    const contract = await prisma.savingsContract.create({
      data: {
        customerId,
        houseId,
        plan,
        monthlyAmount: planDetails.monthlyAmount,
        savingsAmount: planDetails.savingsAmount,
        serviceAmount: planDetails.serviceAmount,
        balance: 0,
        bonusBalance: 0,
        startDate: new Date(),
        status: "active",
      },
      include: {
        customer: { select: { name: true } },
        house: { select: { address: true } },
      },
    });

    return NextResponse.json({
      data: {
        id: contract.id,
        customerName: contract.customer.name,
        houseAddress: contract.house.address,
        plan: contract.plan,
        planName: planDetails.name,
        monthlyAmount: Number(contract.monthlyAmount),
        startDate: contract.startDate,
        status: contract.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create savings contract:", error);
    return NextResponse.json(
      { error: "Failed to create savings contract" },
      { status: 500 }
    );
  }
}
