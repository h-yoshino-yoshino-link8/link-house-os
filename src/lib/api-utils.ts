import { NextResponse } from "next/server";

// DB接続を試みる
export async function tryGetPrisma() {
  try {
    // どちらのパスでもOK
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaModule: any = await import("@/lib/db/prisma").catch(() => import("@/lib/prisma"));
    const prisma = prismaModule.default || prismaModule.prisma;
    // 接続テスト
    await prisma.$queryRaw`SELECT 1`;
    return prisma;
  } catch (error) {
    console.log("[API] Database not available:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

// デモデータレスポンスを返す
export function demoResponse<T>(data: T) {
  return NextResponse.json({ data });
}

// エラーレスポンス
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

// ============================================
// デモデータ定義
// ============================================

export const DEMO_DATA = {
  // 顧客一覧
  customers: [
    {
      id: "demo-customer-1",
      companyId: "demo-company",
      name: "田中 太郎",
      nameKana: "タナカ タロウ",
      email: "tanaka@example.com",
      phone: "090-1234-5678",
      postalCode: "150-0001",
      prefecture: "東京都",
      city: "渋谷区",
      address: "神宮前1-2-3",
      rank: "gold",
      totalTransaction: 5500000,
      points: 55000,
      referralCode: "TANAKA001",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-customer-2",
      companyId: "demo-company",
      name: "山田 花子",
      nameKana: "ヤマダ ハナコ",
      email: "yamada@example.com",
      phone: "090-2345-6789",
      postalCode: "160-0022",
      prefecture: "東京都",
      city: "新宿区",
      address: "新宿3-4-5",
      rank: "silver",
      totalTransaction: 2800000,
      points: 28000,
      referralCode: "YAMADA002",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-customer-3",
      companyId: "demo-company",
      name: "佐藤 一郎",
      nameKana: "サトウ イチロウ",
      email: "sato@example.com",
      phone: "090-3456-7890",
      postalCode: "170-0013",
      prefecture: "東京都",
      city: "豊島区",
      address: "東池袋5-6-7",
      rank: "member",
      totalTransaction: 980000,
      points: 9800,
      referralCode: "SATO003",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  // 見積一覧
  estimates: [
    {
      id: "demo-estimate-1",
      companyId: "demo-company",
      customerId: "demo-customer-1",
      estimateNumber: "EST-2024-001",
      title: "キッチンリフォーム",
      status: "submitted",
      subtotal: 2500000,
      taxRate: 10,
      tax: 250000,
      total: 2750000,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "システムキッチン交換、床張替え",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-1", name: "田中 太郎" },
    },
    {
      id: "demo-estimate-2",
      companyId: "demo-company",
      customerId: "demo-customer-2",
      estimateNumber: "EST-2024-002",
      title: "外壁塗装工事",
      status: "ordered",
      subtotal: 1800000,
      taxRate: 10,
      tax: 180000,
      total: 1980000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "シリコン塗装、足場設置含む",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-2", name: "山田 花子" },
    },
    {
      id: "demo-estimate-3",
      companyId: "demo-company",
      customerId: "demo-customer-3",
      estimateNumber: "EST-2024-003",
      title: "浴室リフォーム",
      status: "draft",
      subtotal: 1200000,
      taxRate: 10,
      tax: 120000,
      total: 1320000,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "ユニットバス交換",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-3", name: "佐藤 一郎" },
    },
  ],

  // 案件一覧
  projects: [
    {
      id: "demo-project-1",
      companyId: "demo-company",
      customerId: "demo-customer-1",
      estimateId: "demo-estimate-1",
      projectNumber: "PRJ-2024-001",
      title: "田中邸 キッチンリフォーム",
      status: "in_progress",
      contractAmount: 2750000,
      costBudget: 1925000,
      costActual: 1500000,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      actualStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-1", name: "田中 太郎" },
    },
    {
      id: "demo-project-2",
      companyId: "demo-company",
      customerId: "demo-customer-2",
      estimateId: "demo-estimate-2",
      projectNumber: "PRJ-2024-002",
      title: "山田邸 外壁塗装工事",
      status: "completed",
      contractAmount: 1980000,
      costBudget: 1386000,
      costActual: 1320000,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      actualStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      actualEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-2", name: "山田 花子" },
    },
  ],

  // HOUSE DNA
  houses: [
    {
      id: "demo-house-1",
      companyId: "demo-company",
      customerId: "demo-customer-1",
      name: "田中邸",
      postalCode: "150-0001",
      prefecture: "東京都",
      city: "渋谷区",
      address: "神宮前1-2-3",
      buildYear: 2010,
      structureType: "wood",
      floorArea: 120.5,
      floors: 2,
      healthScore: 85,
      lastInspection: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-1", name: "田中 太郎" },
    },
    {
      id: "demo-house-2",
      companyId: "demo-company",
      customerId: "demo-customer-2",
      name: "山田邸",
      postalCode: "160-0022",
      prefecture: "東京都",
      city: "新宿区",
      address: "新宿3-4-5",
      buildYear: 2015,
      structureType: "wood",
      floorArea: 98.2,
      floors: 2,
      healthScore: 92,
      lastInspection: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-2", name: "山田 花子" },
    },
  ],

  // 請求書
  invoices: [
    {
      id: "demo-invoice-1",
      companyId: "demo-company",
      projectId: "demo-project-2",
      customerId: "demo-customer-2",
      invoiceNumber: "INV-2024-001",
      title: "山田邸 外壁塗装工事",
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      status: "issued",
      subtotal: 1800000,
      taxRate: 10,
      tax: 180000,
      total: 1980000,
      paidAmount: 0,
      remainingAmount: 1980000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      project: { id: "demo-project-2", projectNumber: "PRJ-2024-002" },
    },
  ],

  // スケジュール（プロジェクトごとにネストされた構造）
  schedules: [
    {
      id: "demo-project-1",
      projectNumber: "PRJ-2024-001",
      name: "田中邸 キッチンリフォーム",
      customer: "田中 太郎 様",
      status: "in_progress",
      progress: 60,
      schedules: [
        {
          id: "demo-schedule-1",
          name: "キッチン解体",
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "山田工務店",
          color: "#ef4444",
        },
        {
          id: "demo-schedule-2",
          name: "給排水工事",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "佐藤設備",
          color: "#3b82f6",
        },
        {
          id: "demo-schedule-3",
          name: "キッチン設置",
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 50,
          assignee: "田中建設",
          color: "#22c55e",
        },
        {
          id: "demo-schedule-4",
          name: "電気工事",
          startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          assignee: "電工社",
          color: "#eab308",
        },
        {
          id: "demo-schedule-5",
          name: "検査・引渡し",
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          assignee: "田中建設",
          color: "#64748b",
        },
      ],
    },
    {
      id: "demo-project-2",
      projectNumber: "PRJ-2024-002",
      name: "山田邸 外壁塗装工事",
      customer: "山田 花子 様",
      status: "completed",
      progress: 100,
      schedules: [
        {
          id: "demo-schedule-6",
          name: "足場設置",
          startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "足場工業",
          color: "#64748b",
        },
        {
          id: "demo-schedule-7",
          name: "高圧洗浄",
          startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "山田塗装",
          color: "#3b82f6",
        },
        {
          id: "demo-schedule-8",
          name: "下塗り・中塗り",
          startDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "山田塗装",
          color: "#a855f7",
        },
        {
          id: "demo-schedule-9",
          name: "上塗り・仕上げ",
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "山田塗装",
          color: "#22c55e",
        },
        {
          id: "demo-schedule-10",
          name: "足場解体・清掃",
          startDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 100,
          assignee: "足場工業",
          color: "#64748b",
        },
      ],
    },
  ],

  // 積立
  savings: [
    {
      id: "demo-savings-1",
      companyId: "demo-company",
      customerId: "demo-customer-1",
      houseId: "demo-house-1",
      planType: "standard",
      monthlyAmount: 10000,
      savingsBalance: 120000,
      serviceBalance: 24000,
      status: "active",
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { id: "demo-customer-1", name: "田中 太郎" },
      house: { id: "demo-house-1", name: "田中邸" },
    },
  ],

  // ゲーミフィケーション - XP情報
  xpInfo: {
    id: "demo-company",
    name: "株式会社LinK",
    level: 42,
    xp: 8420,
    levelInfo: {
      level: 42,
      currentXp: 420,
      nextLevelXp: 1000,
    },
    recentTransactions: [
      { id: "1", companyId: "demo-company", action: "login", xp: 10, description: "ログインボーナス", createdAt: new Date().toISOString() },
      { id: "2", companyId: "demo-company", action: "estimate_created", xp: 50, description: "見積作成", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },

  // ゲーミフィケーション - バッジ
  badges: {
    earned: [
      { id: "1", code: "first_estimate", name: "初めての見積", description: "最初の見積を作成", iconUrl: null, conditionType: "count", conditionValue: 1, xpReward: 100, earned: true, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "2", code: "first_order", name: "初受注", description: "最初の受注を獲得", iconUrl: null, conditionType: "count", conditionValue: 1, xpReward: 200, earned: true, earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    all: [
      { id: "1", code: "first_estimate", name: "初めての見積", description: "最初の見積を作成", iconUrl: null, conditionType: "count", conditionValue: 1, xpReward: 100, earned: true, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "2", code: "first_order", name: "初受注", description: "最初の受注を獲得", iconUrl: null, conditionType: "count", conditionValue: 1, xpReward: 200, earned: true, earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "3", code: "ten_estimates", name: "見積マスター", description: "10件の見積を作成", iconUrl: null, conditionType: "count", conditionValue: 10, xpReward: 500, earned: false, earnedAt: null },
    ],
    totalEarned: 2,
    totalAvailable: 3,
  },

  // マスタデータ
  materials: [
    { id: "1", companyId: "demo-company", name: "フローリング材", category: "床材", unit: "m2", unitPrice: 8500, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", companyId: "demo-company", name: "壁紙クロス", category: "内装", unit: "m2", unitPrice: 1200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  laborTypes: [
    { id: "1", companyId: "demo-company", name: "大工工事", unit: "人工", unitPrice: 25000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", companyId: "demo-company", name: "電気工事", unit: "人工", unitPrice: 28000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  workCategories: [
    { id: "1", companyId: "demo-company", name: "キッチンリフォーム", description: "キッチン関連工事", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "2", companyId: "demo-company", name: "浴室リフォーム", description: "浴室関連工事", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
};
