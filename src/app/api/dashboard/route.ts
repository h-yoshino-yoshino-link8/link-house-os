import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard - ダッシュボード統計情報取得
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
    // 現在の日付
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 今月のデータ
    const [
      currentMonthProjects,
      lastMonthProjects,
      currentMonthEstimates,
      lastMonthEstimates,
      topCustomers,
      alerts,
      company,
      recentXpTransactions,
    ] = await Promise.all([
      // 今月の完了プロジェクト
      prisma.project.findMany({
        where: {
          companyId,
          status: { in: ["completed", "invoiced", "paid"] },
          actualEnd: { gte: currentMonth },
        },
        select: {
          contractAmount: true,
          costActual: true,
          costBudget: true,
        },
      }),
      // 先月の完了プロジェクト
      prisma.project.findMany({
        where: {
          companyId,
          status: { in: ["completed", "invoiced", "paid"] },
          actualEnd: { gte: lastMonth, lt: currentMonth },
        },
        select: {
          contractAmount: true,
          costActual: true,
          costBudget: true,
        },
      }),
      // 今月の見積
      prisma.estimate.findMany({
        where: {
          companyId,
          createdAt: { gte: currentMonth },
        },
        select: {
          status: true,
          total: true,
        },
      }),
      // 先月の見積
      prisma.estimate.findMany({
        where: {
          companyId,
          createdAt: { gte: lastMonth, lt: currentMonth },
        },
        select: {
          status: true,
          total: true,
        },
      }),
      // トップ顧客（取引額順）
      prisma.customer.findMany({
        where: { companyId },
        orderBy: { totalTransaction: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          totalTransaction: true,
        },
      }),
      // アラート: 期限間近の見積 + 遅延工事
      Promise.all([
        // 期限間近の見積（7日以内）
        prisma.estimate.findMany({
          where: {
            companyId,
            status: { in: ["draft", "submitted", "pending"] },
            validUntil: {
              gte: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
          take: 5,
          select: {
            id: true,
            estimateNumber: true,
            title: true,
            validUntil: true,
            customer: { select: { name: true } },
          },
        }),
        // 遅延工事
        prisma.project.findMany({
          where: {
            companyId,
            status: "in_progress",
            endDate: { lt: now },
          },
          take: 5,
          select: {
            id: true,
            projectNumber: true,
            title: true,
            endDate: true,
            customer: { select: { name: true } },
          },
        }),
        // 入金待ち
        prisma.project.findMany({
          where: {
            companyId,
            status: "invoiced",
          },
          take: 5,
          select: {
            id: true,
            projectNumber: true,
            title: true,
            actualEnd: true,
            customer: { select: { name: true } },
          },
        }),
      ]),
      // 会社情報（ゲーミフィケーション）
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          level: true,
          xp: true,
        },
      }),
      // 最近のXPトランザクション
      prisma.xpTransaction.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          action: true,
          xp: true,
          description: true,
          createdAt: true,
        },
      }),
    ]);

    // KPI計算
    const currentRevenue = currentMonthProjects.reduce(
      (sum, p) => sum + Number(p.contractAmount || 0),
      0
    );
    const lastRevenue = lastMonthProjects.reduce(
      (sum, p) => sum + Number(p.contractAmount || 0),
      0
    );
    const revenueChange = lastRevenue > 0
      ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
      : 0;

    const currentCost = currentMonthProjects.reduce(
      (sum, p) => sum + Number(p.costActual || p.costBudget || 0),
      0
    );
    const currentProfit = currentRevenue - currentCost;
    const lastCost = lastMonthProjects.reduce(
      (sum, p) => sum + Number(p.costActual || p.costBudget || 0),
      0
    );
    const lastProfit = lastRevenue - lastCost;
    const profitChange = lastProfit > 0
      ? ((currentProfit - lastProfit) / lastProfit) * 100
      : 0;

    const currentOrdered = currentMonthEstimates.filter(e => e.status === "ordered").length;
    const currentOrderRate = currentMonthEstimates.length > 0
      ? (currentOrdered / currentMonthEstimates.length) * 100
      : 0;
    const lastOrdered = lastMonthEstimates.filter(e => e.status === "ordered").length;
    const lastOrderRate = lastMonthEstimates.length > 0
      ? (lastOrdered / lastMonthEstimates.length) * 100
      : 0;
    const orderRateChange = currentOrderRate - lastOrderRate;

    const completedCount = currentMonthProjects.length;
    const lastCompletedCount = lastMonthProjects.length;
    const completedChange = completedCount - lastCompletedCount;

    // 売上推移データ（過去5ヶ月）
    const revenueData = await Promise.all(
      Array.from({ length: 5 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - 3 + i, 0);
        return prisma.project.findMany({
          where: {
            companyId,
            status: { in: ["completed", "invoiced", "paid"] },
            actualEnd: { gte: monthStart, lte: monthEnd },
          },
          select: {
            contractAmount: true,
            costActual: true,
            costBudget: true,
          },
        }).then(projects => {
          const revenue = projects.reduce((sum, p) => sum + Number(p.contractAmount || 0), 0);
          const cost = projects.reduce((sum, p) => sum + Number(p.costActual || p.costBudget || 0), 0);
          return {
            month: `${monthStart.getMonth() + 1}月`,
            revenue,
            profit: revenue - cost,
          };
        });
      })
    );

    // アラート整形
    const [expiringEstimates, delayedProjects, pendingPayments] = alerts;
    const formattedAlerts = [
      ...expiringEstimates.map(e => ({
        id: e.id,
        type: "warning" as const,
        title: `見積#${e.estimateNumber} ${e.customer?.name ?? ""}邸`,
        description: `有効期限まで${Math.ceil((new Date(e.validUntil!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}日`,
        link: `/estimates/${e.id}`,
      })),
      ...delayedProjects.map(p => ({
        id: p.id,
        type: "info" as const,
        title: `工事#${p.projectNumber} ${p.customer?.name ?? ""}邸`,
        description: "工程遅延の可能性",
        link: `/projects/${p.id}`,
      })),
      ...pendingPayments.map(p => ({
        id: p.id,
        type: "success" as const,
        title: `請求#${p.projectNumber} ${p.customer?.name ?? ""}邸`,
        description: "入金確認待ち",
        link: `/projects/${p.id}`,
      })),
    ].slice(0, 5);

    // クエスト（簡易版：今日のアクションを確認）
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayXp = recentXpTransactions.filter(
      t => new Date(t.createdAt) >= today
    );
    const hasLoginBonus = todayXp.some(t => t.action === "login");
    const hasEstimateCreated = todayXp.some(t => t.action === "estimate_created");

    const quests = [
      {
        id: "1",
        title: "見積を1件作成する",
        xp: 50,
        completed: hasEstimateCreated,
      },
      {
        id: "2",
        title: "ログインボーナス獲得済み",
        xp: 10,
        completed: hasLoginBonus,
      },
      {
        id: "3",
        title: "顧客フォローアップ",
        xp: 30,
        completed: false,
      },
    ];

    // ハイライト（達成目標など）
    const monthlyTarget = 10000000; // 1000万円目標
    const achievementRate = Math.round((currentRevenue / monthlyTarget) * 100);

    const highlights = {
      targetAchievement: {
        target: monthlyTarget,
        actual: currentRevenue,
        rate: achievementRate,
        achieved: achievementRate >= 100,
      },
      newCustomers: await prisma.customer.count({
        where: {
          companyId,
          createdAt: { gte: currentMonth },
        },
      }),
      completedProjects: completedCount,
    };

    return NextResponse.json({
      data: {
        kpis: {
          revenue: {
            value: currentRevenue,
            change: revenueChange,
            trend: revenueChange >= 0 ? "up" : "down",
          },
          profit: {
            value: currentProfit,
            change: profitChange,
            trend: profitChange >= 0 ? "up" : "down",
          },
          orderRate: {
            value: currentOrderRate,
            change: orderRateChange,
            trend: orderRateChange >= 0 ? "up" : "down",
          },
          completedProjects: {
            value: completedCount,
            change: completedChange,
            trend: completedChange >= 0 ? "up" : "down",
          },
        },
        revenueData,
        topCustomers: topCustomers.map(c => ({
          name: c.name,
          revenue: Number(c.totalTransaction),
        })),
        alerts: formattedAlerts,
        quests,
        highlights,
        gamification: {
          level: company?.level ?? 1,
          xp: company?.xp ?? 0,
          xpToNextLevel: ((company?.level ?? 1) + 1) * 1000 - (company?.xp ?? 0),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
