import { NextRequest, NextResponse } from "next/server";

// デモデータを返す（DB接続なしでも動作）
function getDemoData() {
  return {
    data: {
      kpis: {
        revenue: { value: 12500000, change: 15.2, trend: "up" as const },
        profit: { value: 3750000, change: 12.8, trend: "up" as const },
        profitRate: { value: 30, change: 2.1, trend: "up" as const },
        avgPrice: { value: 2500000, change: 5.3, trend: "up" as const },
        orderRate: { value: 68, change: 3, trend: "up" as const },
        completedProjects: { value: 5, change: 2, trend: "up" as const },
      },
      revenueData: [
        { month: "7月", revenue: 8500000, profit: 2550000 },
        { month: "8月", revenue: 9200000, profit: 2760000 },
        { month: "9月", revenue: 10800000, profit: 3240000 },
        { month: "10月", revenue: 11500000, profit: 3450000 },
        { month: "11月", revenue: 12500000, profit: 3750000 },
      ],
      topCustomers: [
        { name: "田中様邸", revenue: 3500000 },
        { name: "山田様邸", revenue: 2800000 },
        { name: "佐藤様邸", revenue: 2200000 },
        { name: "鈴木様邸", revenue: 1800000 },
        { name: "高橋様邸", revenue: 1500000 },
      ],
      topPartners: [
        { name: "山田電気工事", revenue: 1500000, category: "電気工事" },
        { name: "佐藤設備", revenue: 1200000, category: "設備工事" },
        { name: "鈴木建材", revenue: 980000, category: "建材販売" },
        { name: "田中塗装", revenue: 750000, category: "塗装工事" },
        { name: "高橋工務店", revenue: 600000, category: "大工工事" },
      ],
      alerts: [
        {
          id: "1",
          type: "warning" as const,
          title: "見積#EST-2024-001 田中様邸",
          description: "有効期限まで3日",
          link: "/estimates",
        },
        {
          id: "2",
          type: "info" as const,
          title: "工事#PRJ-2024-003 山田様邸",
          description: "工程遅延の可能性",
          link: "/projects",
        },
        {
          id: "3",
          type: "success" as const,
          title: "請求#PRJ-2024-001 佐藤様邸",
          description: "入金確認待ち",
          link: "/invoices",
        },
      ],
      quests: [
        { id: "1", title: "見積を1件作成する", xp: 50, completed: false },
        { id: "2", title: "ログインボーナス獲得済み", xp: 10, completed: true },
        { id: "3", title: "顧客フォローアップ", xp: 30, completed: false },
      ],
      highlights: {
        targetAchievement: {
          target: 10000000,
          actual: 12500000,
          rate: 125,
          achieved: true,
        },
        newCustomers: 3,
        completedProjects: 5,
      },
      gamification: {
        level: 42,
        xp: 8420,
        xpToNextLevel: 580,
      },
    },
  };
}

// DB接続を試みる
async function tryGetPrisma() {
  try {
    const { prisma } = await import("@/lib/prisma");
    // 接続テスト
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch {
    return null;
  }
}

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

  // DB接続を試みる
  const prisma = await tryGetPrisma();

  // DB接続できない場合はデモデータを返す
  if (!prisma) {
    console.log("[Dashboard API] Database not available, returning demo data");
    return NextResponse.json(getDemoData());
  }

  try {
    // 現在の日付
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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

    // 粗利率計算
    const currentProfitRate = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
    const lastProfitRate = lastRevenue > 0 ? (lastProfit / lastRevenue) * 100 : 0;
    const profitRateChange = currentProfitRate - lastProfitRate;

    // 平均単価計算
    const currentAvgPrice = currentMonthProjects.length > 0 ? currentRevenue / currentMonthProjects.length : 0;
    const lastAvgPrice = lastMonthProjects.length > 0 ? lastRevenue / lastMonthProjects.length : 0;
    const avgPriceChange = lastAvgPrice > 0 ? ((currentAvgPrice - lastAvgPrice) / lastAvgPrice) * 100 : 0;

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

    // 協力会社ランキング（デモデータ - Partnerモデルが実装されたら実データに切り替え）
    const topPartners = [
      { id: "1", name: "山田電気工事", totalTransaction: 1500000, category: "電気工事" },
      { id: "2", name: "佐藤設備", totalTransaction: 1200000, category: "設備工事" },
      { id: "3", name: "鈴木建材", totalTransaction: 980000, category: "建材販売" },
      { id: "4", name: "田中塗装", totalTransaction: 750000, category: "塗装工事" },
      { id: "5", name: "高橋工務店", totalTransaction: 600000, category: "大工工事" },
    ];

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
          profitRate: {
            value: currentProfitRate,
            change: profitRateChange,
            trend: profitRateChange >= 0 ? "up" : "down",
          },
          avgPrice: {
            value: currentAvgPrice,
            change: avgPriceChange,
            trend: avgPriceChange >= 0 ? "up" : "down",
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
        topPartners: topPartners.map(p => ({
          name: p.name,
          revenue: Number(p.totalTransaction),
          category: p.category,
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
    // エラー時もデモデータを返す
    console.log("[Dashboard API] Error occurred, returning demo data");
    return NextResponse.json(getDemoData());
  }
}
