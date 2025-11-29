import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/portal/[token] - ポータルダッシュボードデータ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    // トークンで顧客を検索
    const customer = await prisma.customer.findUnique({
      where: { portalAccessToken: token },
      include: {
        houses: {
          include: {
            components: true,
            maintenanceRecs: {
              where: { isResolved: false },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
        estimates: {
          where: { status: { in: ["submitted", "ordered"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        projects: {
          where: { status: { in: ["in_progress", "completed"] } },
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: {
            workCertificates: true,
          },
        },
        savingsContracts: {
          where: { status: "active" },
        },
        pointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid portal access token" },
        { status: 401 }
      );
    }

    // 健康スコアを計算（物件がある場合）
    const house = customer.houses[0];
    let componentScores: { subject: string; score: number }[] = [];
    if (house && house.components.length > 0) {
      const categoryScores: Record<string, { total: number; count: number }> = {};
      house.components.forEach((comp: { category: string; conditionScore: number }) => {
        if (!categoryScores[comp.category]) {
          categoryScores[comp.category] = { total: 0, count: 0 };
        }
        categoryScores[comp.category].total += comp.conditionScore;
        categoryScores[comp.category].count += 1;
      });

      const categoryLabels: Record<string, string> = {
        roof: "屋根",
        exterior: "外壁",
        interior: "内装",
        equipment: "設備",
        electrical: "電気",
        plumbing: "給排水",
      };

      componentScores = Object.entries(categoryScores).map(([category, data]) => ({
        subject: categoryLabels[category] || category,
        score: Math.round(data.total / data.count),
      }));
    }

    // NFT数をカウント
    const nftCount = customer.projects.reduce(
      (count: number, project: { workCertificates: unknown[] }) => count + project.workCertificates.length,
      0
    );

    // 積立残高を計算
    const savings = customer.savingsContracts[0];

    // レスポンスデータを構築
    const portalData = {
      customer: {
        id: customer.id,
        name: customer.name,
        rank: customer.rank,
        points: customer.points,
      },
      house: house
        ? {
            id: house.id,
            address: house.address,
            healthScore: house.healthScore,
            builtYear: house.builtYear,
            structureType: house.structureType,
            totalArea: house.totalArea ? Number(house.totalArea) : null,
          }
        : null,
      componentScores,
      alerts: house?.maintenanceRecs.map((rec: { id: string; riskLevel: string; description: string; componentId: string | null }) => ({
        id: rec.id,
        level: rec.riskLevel,
        message: rec.description,
        component: rec.componentId,
      })) || [],
      recentEstimates: customer.estimates.map((est: { id: string; estimateNumber: string; title: string; estimateDate: Date; validUntil: Date | null; total: unknown; status: string }) => ({
        id: est.id,
        estimateNumber: est.estimateNumber,
        title: est.title,
        submittedAt: est.estimateDate,
        validUntil: est.validUntil,
        amount: Number(est.total),
        status: est.status,
      })),
      recentProjects: customer.projects.map((proj: { id: string; title: string; status: string; actualEnd: Date | null; workCertificates: unknown[] }) => ({
        id: proj.id,
        title: proj.title,
        status: proj.status,
        completedAt: proj.actualEnd,
        hasNft: proj.workCertificates.length > 0,
      })),
      savings: savings
        ? {
            plan: savings.plan,
            balance: Number(savings.balance),
            bonusBalance: Number(savings.bonusBalance),
            monthlyAmount: Number(savings.monthlyAmount),
          }
        : null,
      nftCount,
    };

    return NextResponse.json({ data: portalData });
  } catch (error) {
    console.error("Failed to fetch portal data:", error);
    return NextResponse.json(
      { error: "Failed to fetch portal data" },
      { status: 500 }
    );
  }
}
