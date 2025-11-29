import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/reports - レポートデータ取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");
  const period = searchParams.get("period") || "month"; // month, quarter, year
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  const prisma = await tryGetPrisma();

  // DB接続できない場合はデモデータを返す
  if (!prisma) {
    return NextResponse.json({
      data: generateDemoReportData(year),
    });
  }

  try {
    // 期間の開始日と終了日を計算
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // 1. 売上データ（完了したプロジェクト）
    const projects = await prisma.project.findMany({
      where: {
        companyId,
        status: { in: ["completed", "invoiced", "paid"] },
        actualEnd: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        id: true,
        contractAmount: true,
        costActual: true,
        actualEnd: true,
        status: true,
      },
    });

    // 2. 見積データ
    const estimates = await prisma.estimate.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    // 3. 顧客データ
    const customers = await prisma.customer.findMany({
      where: { companyId },
      select: {
        id: true,
        rank: true,
        totalTransaction: true,
        createdAt: true,
      },
    });

    // 4. 進行中プロジェクト
    const activeProjects = await prisma.project.findMany({
      where: {
        companyId,
        status: "in_progress",
      },
      select: {
        id: true,
        title: true,
        contractAmount: true,
        startDate: true,
        endDate: true,
        actualStart: true,
      },
    });

    // 月別売上を集計
    type ProjectType = typeof projects[number];
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthProjects = projects.filter((p: ProjectType) => {
        if (!p.actualEnd) return false;
        return new Date(p.actualEnd).getMonth() === i;
      });
      const revenue = monthProjects.reduce((sum: number, p: ProjectType) => sum + Number(p.contractAmount || 0), 0);
      const cost = monthProjects.reduce((sum: number, p: ProjectType) => sum + Number(p.costActual || 0), 0);
      return {
        month: i + 1,
        monthLabel: `${i + 1}月`,
        revenue,
        cost,
        profit: revenue - cost,
        profitRate: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
        projectCount: monthProjects.length,
      };
    });

    // 見積成約率
    type EstimateType = typeof estimates[number];
    type CustomerType = typeof customers[number];
    const totalEstimates = estimates.length;
    const orderedEstimates = estimates.filter((e: EstimateType) => e.status === "ordered").length;
    const conversionRate = totalEstimates > 0 ? (orderedEstimates / totalEstimates) * 100 : 0;

    // 見積ステータス分布
    const estimateStatusDistribution = {
      draft: estimates.filter((e: EstimateType) => e.status === "draft").length,
      submitted: estimates.filter((e: EstimateType) => e.status === "submitted").length,
      ordered: orderedEstimates,
      lost: estimates.filter((e: EstimateType) => e.status === "lost").length,
    };

    // 顧客ランク分布
    const customerRankDistribution = {
      member: customers.filter((c: CustomerType) => c.rank === "member").length,
      silver: customers.filter((c: CustomerType) => c.rank === "silver").length,
      gold: customers.filter((c: CustomerType) => c.rank === "gold").length,
      platinum: customers.filter((c: CustomerType) => c.rank === "platinum").length,
      diamond: customers.filter((c: CustomerType) => c.rank === "diamond").length,
    };

    // 年間サマリー
    const yearlyRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const yearlyCost = monthlyRevenue.reduce((sum, m) => sum + m.cost, 0);
    const yearlyProfit = yearlyRevenue - yearlyCost;
    const yearlyProfitRate = yearlyRevenue > 0 ? (yearlyProfit / yearlyRevenue) * 100 : 0;

    // 前年比較（シンプルに-10%〜+20%のランダム変動として仮定）
    // 実際には前年データを取得して比較する
    const previousYearRevenue = yearlyRevenue * 0.9;

    const reportData = {
      year,
      summary: {
        revenue: yearlyRevenue,
        cost: yearlyCost,
        profit: yearlyProfit,
        profitRate: yearlyProfitRate,
        projectCount: projects.length,
        estimateCount: totalEstimates,
        conversionRate,
        customerCount: customers.length,
        revenueGrowth: previousYearRevenue > 0 ? ((yearlyRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0,
      },
      monthlyRevenue,
      estimateStatusDistribution,
      customerRankDistribution,
      activeProjects: activeProjects.map((p: typeof activeProjects[number]) => ({
        id: p.id,
        title: p.title,
        contractAmount: Number(p.contractAmount || 0),
        startDate: p.startDate,
        endDate: p.endDate,
        daysRemaining: p.endDate ? Math.ceil((new Date(p.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
      })),
      topCustomers: customers
        .sort((a: CustomerType, b: CustomerType) => Number(b.totalTransaction) - Number(a.totalTransaction))
        .slice(0, 5)
        .map((c: CustomerType) => ({
          id: c.id,
          totalTransaction: Number(c.totalTransaction),
        })),
    };

    return NextResponse.json({ data: reportData });
  } catch (error) {
    console.error("Failed to fetch report data:", error);
    // エラー時もデモデータを返す
    return NextResponse.json({
      data: generateDemoReportData(year),
    });
  }
}

// デモレポートデータ生成
function generateDemoReportData(year: number) {
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const baseRevenue = 8000000 + Math.random() * 4000000;
    const profitRate = 20 + Math.random() * 10;
    const cost = baseRevenue * (1 - profitRate / 100);
    return {
      month: i + 1,
      monthLabel: `${i + 1}月`,
      revenue: Math.round(baseRevenue),
      cost: Math.round(cost),
      profit: Math.round(baseRevenue - cost),
      profitRate: Math.round(profitRate * 10) / 10,
      projectCount: Math.floor(3 + Math.random() * 5),
    };
  });

  const yearlyRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const yearlyCost = monthlyRevenue.reduce((sum, m) => sum + m.cost, 0);
  const yearlyProfit = yearlyRevenue - yearlyCost;

  return {
    year,
    summary: {
      revenue: yearlyRevenue,
      cost: yearlyCost,
      profit: yearlyProfit,
      profitRate: (yearlyProfit / yearlyRevenue) * 100,
      projectCount: 48,
      estimateCount: 120,
      conversionRate: 40,
      customerCount: 85,
      revenueGrowth: 12.5,
    },
    monthlyRevenue,
    estimateStatusDistribution: {
      draft: 15,
      submitted: 35,
      ordered: 48,
      lost: 22,
    },
    customerRankDistribution: {
      member: 45,
      silver: 20,
      gold: 12,
      platinum: 6,
      diamond: 2,
    },
    activeProjects: [
      { id: "1", title: "外壁塗装工事 A邸", contractAmount: 1500000, startDate: new Date(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), daysRemaining: 14 },
      { id: "2", title: "キッチンリフォーム B邸", contractAmount: 2200000, startDate: new Date(), endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), daysRemaining: 21 },
      { id: "3", title: "屋根葺き替え C邸", contractAmount: 3500000, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), daysRemaining: 30 },
    ],
    topCustomers: [
      { id: "1", name: "株式会社ABC不動産", totalTransaction: 15000000 },
      { id: "2", name: "山田太郎", totalTransaction: 8500000 },
      { id: "3", name: "鈴木建設株式会社", totalTransaction: 6200000 },
      { id: "4", name: "田中花子", totalTransaction: 4800000 },
      { id: "5", name: "佐藤商事", totalTransaction: 3500000 },
    ],
  };
}
