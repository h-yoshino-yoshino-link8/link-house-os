import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 会社データ
  const company = await prisma.company.upsert({
    where: { id: "company-demo-001" },
    update: {},
    create: {
      id: "company-demo-001",
      name: "株式会社LinK",
      licenseNumber: "東京都知事許可（般-5）第123456号",
      address: "東京都渋谷区神宮前1-2-3 LinKビル5F",
      phone: "03-1234-5678",
      email: "info@link-house.co.jp",
      referralCode: "LINK-PRO-2024",
      level: 28,
      xp: 2850,
    },
  });
  console.log("✅ Company created:", company.name);

  // ユーザーデータ
  const users = await Promise.all([
    prisma.user.upsert({
      where: { clerkId: "user_demo_admin" },
      update: {},
      create: {
        id: "user-demo-001",
        companyId: company.id,
        clerkId: "user_demo_admin",
        email: "admin@link-house.co.jp",
        name: "山田太郎",
        role: "admin",
      },
    }),
    prisma.user.upsert({
      where: { clerkId: "user_demo_manager" },
      update: {},
      create: {
        id: "user-demo-002",
        companyId: company.id,
        clerkId: "user_demo_manager",
        email: "sato@link-house.co.jp",
        name: "佐藤次郎",
        role: "manager",
      },
    }),
    prisma.user.upsert({
      where: { clerkId: "user_demo_staff" },
      update: {},
      create: {
        id: "user-demo-003",
        companyId: company.id,
        clerkId: "user_demo_staff",
        email: "tanaka@link-house.co.jp",
        name: "田中花子",
        role: "staff",
      },
    }),
  ]);
  console.log("✅ Users created:", users.length);

  // 顧客データ
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "customer-demo-001" },
      update: {},
      create: {
        id: "customer-demo-001",
        companyId: company.id,
        type: "individual",
        name: "山田太郎",
        email: "yamada@example.com",
        phone: "090-1234-5678",
        address: "東京都渋谷区○○1-2-3",
        tags: ["VIP", "リピーター"],
        rank: "platinum",
        totalTransaction: 5200000,
        points: 24500,
        referralCode: "CUS-YAMADA-001",
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-demo-002" },
      update: {},
      create: {
        id: "customer-demo-002",
        companyId: company.id,
        type: "corporate",
        name: "佐藤建設株式会社",
        email: "info@sato-kensetsu.co.jp",
        phone: "03-1234-5678",
        address: "東京都新宿区○○4-5-6",
        tags: ["法人", "大口"],
        rank: "gold",
        totalTransaction: 3800000,
        points: 18000,
        referralCode: "CUS-SATO-002",
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-demo-003" },
      update: {},
      create: {
        id: "customer-demo-003",
        companyId: company.id,
        type: "individual",
        name: "田中花子",
        email: "tanaka@example.com",
        phone: "080-9876-5432",
        address: "神奈川県横浜市○○7-8-9",
        tags: ["紹介"],
        rank: "silver",
        totalTransaction: 1500000,
        points: 7500,
        referralCode: "CUS-TANAKA-003",
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-demo-004" },
      update: {},
      create: {
        id: "customer-demo-004",
        companyId: company.id,
        type: "individual",
        name: "鈴木一郎",
        email: "suzuki@example.com",
        phone: "070-1111-2222",
        address: "千葉県船橋市○○10-11",
        tags: [],
        rank: "member",
        totalTransaction: 450000,
        points: 2250,
        referralCode: "CUS-SUZUKI-004",
      },
    }),
    prisma.customer.upsert({
      where: { id: "customer-demo-005" },
      update: {},
      create: {
        id: "customer-demo-005",
        companyId: company.id,
        type: "corporate",
        name: "高橋商事株式会社",
        email: "contact@takahashi-shoji.co.jp",
        phone: "03-5555-6666",
        address: "東京都港区○○12-13",
        tags: ["新規"],
        rank: "member",
        totalTransaction: 980000,
        points: 4900,
        referralCode: "CUS-TAKAHASHI-005",
      },
    }),
  ]);
  console.log("✅ Customers created:", customers.length);

  // 物件データ（HOUSE DNA）
  const houses = await Promise.all([
    prisma.house.upsert({
      where: { id: "house-demo-001" },
      update: {},
      create: {
        id: "house-demo-001",
        customerId: "customer-demo-001",
        companyId: company.id,
        address: "東京都渋谷区○○1-2-3",
        structureType: "wood",
        floors: 2,
        totalArea: 105.5,
        builtYear: 2010,
        builder: "○○ハウス",
        healthScore: 82,
      },
    }),
    prisma.house.upsert({
      where: { id: "house-demo-002" },
      update: {},
      create: {
        id: "house-demo-002",
        customerId: "customer-demo-002",
        companyId: company.id,
        address: "東京都新宿区○○4-5-6",
        structureType: "rc",
        floors: 3,
        totalArea: 280.0,
        builtYear: 2005,
        builder: "△△建設",
        healthScore: 68,
      },
    }),
    prisma.house.upsert({
      where: { id: "house-demo-003" },
      update: {},
      create: {
        id: "house-demo-003",
        customerId: "customer-demo-003",
        companyId: company.id,
        address: "神奈川県横浜市○○7-8-9",
        structureType: "wood",
        floors: 2,
        totalArea: 92.0,
        builtYear: 2018,
        builder: "□□工務店",
        healthScore: 94,
      },
    }),
    prisma.house.upsert({
      where: { id: "house-demo-004" },
      update: {},
      create: {
        id: "house-demo-004",
        customerId: "customer-demo-004",
        companyId: company.id,
        address: "千葉県船橋市○○10-11",
        structureType: "steel",
        floors: 2,
        totalArea: 125.0,
        builtYear: 2000,
        builder: "◇◇ホーム",
        healthScore: 45,
      },
    }),
  ]);
  console.log("✅ Houses created:", houses.length);

  // 部材データ
  const components = await Promise.all([
    // 山田邸の部材
    prisma.houseComponent.upsert({
      where: { id: "component-demo-001" },
      update: {},
      create: {
        id: "component-demo-001",
        houseId: "house-demo-001",
        category: "roof",
        productName: "コロニアル屋根",
        manufacturer: "ケイミュー",
        installedDate: new Date("2010-04-01"),
        warrantyYears: 10,
        expectedLifespan: 20,
        conditionScore: 75,
        lastInspection: new Date("2024-06-15"),
      },
    }),
    prisma.houseComponent.upsert({
      where: { id: "component-demo-002" },
      update: {},
      create: {
        id: "component-demo-002",
        houseId: "house-demo-001",
        category: "exterior",
        productName: "窯業系サイディング",
        manufacturer: "ニチハ",
        installedDate: new Date("2010-04-01"),
        warrantyYears: 10,
        expectedLifespan: 15,
        conditionScore: 68,
        lastInspection: new Date("2024-06-15"),
      },
    }),
    prisma.houseComponent.upsert({
      where: { id: "component-demo-003" },
      update: {},
      create: {
        id: "component-demo-003",
        houseId: "house-demo-001",
        category: "equipment",
        productName: "ガス給湯器",
        manufacturer: "リンナイ",
        installedDate: new Date("2015-04-01"),
        warrantyYears: 3,
        expectedLifespan: 10,
        conditionScore: 45,
        lastInspection: new Date("2024-06-15"),
      },
    }),
  ]);
  console.log("✅ House components created:", components.length);

  // メンテナンス推奨
  const maintenanceRecs = await Promise.all([
    prisma.maintenanceRecommendation.upsert({
      where: { id: "maintenance-demo-001" },
      update: {},
      create: {
        id: "maintenance-demo-001",
        houseId: "house-demo-001",
        componentId: "component-demo-003",
        riskLevel: "high",
        description: "給湯器：寿命まで残り1-3年（交換推奨）",
        recommendedAction: "新しいエコジョーズへの交換をお勧めします",
        estimatedCostMin: 180000,
        estimatedCostMax: 280000,
      },
    }),
    prisma.maintenanceRecommendation.upsert({
      where: { id: "maintenance-demo-002" },
      update: {},
      create: {
        id: "maintenance-demo-002",
        houseId: "house-demo-001",
        componentId: "component-demo-002",
        riskLevel: "medium",
        description: "外壁塗装：2年以内に再塗装を推奨",
        recommendedAction: "シリコン系塗料での再塗装",
        estimatedCostMin: 800000,
        estimatedCostMax: 1200000,
      },
    }),
  ]);
  console.log("✅ Maintenance recommendations created:", maintenanceRecs.length);

  // 見積データ
  const estimates = await Promise.all([
    prisma.estimate.upsert({
      where: { id: "estimate-demo-001" },
      update: {},
      create: {
        id: "estimate-demo-001",
        companyId: company.id,
        customerId: "customer-demo-001",
        houseId: "house-demo-001",
        estimateNumber: "EST-2024-001",
        title: "山田邸 外壁塗装工事",
        estimateDate: new Date("2024-09-10"),
        validUntil: new Date("2024-10-10"),
        status: "ordered",
        subtotal: 1636364,
        taxRate: 10,
        tax: 163636,
        total: 1800000,
        costTotal: 1200000,
        profit: 436364,
        profitRate: 26.67,
        createdById: "user-demo-001",
      },
    }),
    prisma.estimate.upsert({
      where: { id: "estimate-demo-002" },
      update: {},
      create: {
        id: "estimate-demo-002",
        companyId: company.id,
        customerId: "customer-demo-002",
        houseId: "house-demo-002",
        estimateNumber: "EST-2024-002",
        title: "佐藤ビル 屋根修繕工事",
        estimateDate: new Date("2024-10-15"),
        validUntil: new Date("2024-11-15"),
        status: "submitted",
        subtotal: 3181818,
        taxRate: 10,
        tax: 318182,
        total: 3500000,
        costTotal: 2400000,
        profit: 781818,
        profitRate: 24.57,
        createdById: "user-demo-002",
      },
    }),
    prisma.estimate.upsert({
      where: { id: "estimate-demo-003" },
      update: {},
      create: {
        id: "estimate-demo-003",
        companyId: company.id,
        customerId: "customer-demo-003",
        houseId: "house-demo-003",
        estimateNumber: "EST-2024-003",
        title: "田中邸 浴室リフォーム",
        estimateDate: new Date("2024-07-20"),
        validUntil: new Date("2024-08-20"),
        status: "ordered",
        subtotal: 1090909,
        taxRate: 10,
        tax: 109091,
        total: 1200000,
        costTotal: 800000,
        profit: 290909,
        profitRate: 26.67,
        createdById: "user-demo-003",
      },
    }),
  ]);
  console.log("✅ Estimates created:", estimates.length);

  // 見積明細データ
  const estimateDetails = await Promise.all([
    prisma.estimateDetail.upsert({
      where: { id: "detail-demo-001" },
      update: {},
      create: {
        id: "detail-demo-001",
        estimateId: "estimate-demo-001",
        sortOrder: 1,
        name: "足場設置・解体",
        specification: "ビケ足場",
        quantity: 1,
        unit: "式",
        costMaterial: 0,
        costLabor: 180000,
        costUnit: 180000,
        costTotal: 180000,
        profitRate: 25,
        priceUnit: 240000,
        priceTotal: 240000,
      },
    }),
    prisma.estimateDetail.upsert({
      where: { id: "detail-demo-002" },
      update: {},
      create: {
        id: "detail-demo-002",
        estimateId: "estimate-demo-001",
        sortOrder: 2,
        name: "高圧洗浄",
        specification: "外壁・屋根",
        quantity: 200,
        unit: "㎡",
        costMaterial: 0,
        costLabor: 60000,
        costUnit: 300,
        costTotal: 60000,
        profitRate: 30,
        priceUnit: 429,
        priceTotal: 85800,
      },
    }),
    prisma.estimateDetail.upsert({
      where: { id: "detail-demo-003" },
      update: {},
      create: {
        id: "detail-demo-003",
        estimateId: "estimate-demo-001",
        sortOrder: 3,
        name: "外壁塗装",
        specification: "シリコン系塗料3回塗り",
        quantity: 180,
        unit: "㎡",
        costMaterial: 280000,
        costLabor: 350000,
        costUnit: 3500,
        costTotal: 630000,
        profitRate: 28,
        priceUnit: 4861,
        priceTotal: 874980,
      },
    }),
  ]);
  console.log("✅ Estimate details created:", estimateDetails.length);

  // 案件データ
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: "project-demo-001" },
      update: {},
      create: {
        id: "project-demo-001",
        companyId: company.id,
        customerId: "customer-demo-001",
        houseId: "house-demo-001",
        estimateId: "estimate-demo-001",
        projectNumber: "PRJ-2024-001",
        title: "山田邸 外壁塗装工事",
        status: "in_progress",
        contractAmount: 1800000,
        costBudget: 1200000,
        costActual: 950000,
        startDate: new Date("2024-10-01"),
        endDate: new Date("2024-11-15"),
        actualStart: new Date("2024-10-03"),
      },
    }),
    prisma.project.upsert({
      where: { id: "project-demo-002" },
      update: {},
      create: {
        id: "project-demo-002",
        companyId: company.id,
        customerId: "customer-demo-003",
        houseId: "house-demo-003",
        estimateId: "estimate-demo-003",
        projectNumber: "PRJ-2024-002",
        title: "田中邸 浴室リフォーム",
        status: "paid",
        contractAmount: 1200000,
        costBudget: 800000,
        costActual: 780000,
        startDate: new Date("2024-08-15"),
        endDate: new Date("2024-09-30"),
        actualStart: new Date("2024-08-15"),
        actualEnd: new Date("2024-09-28"),
      },
    }),
  ]);
  console.log("✅ Projects created:", projects.length);

  // 工程データ
  const schedules = await Promise.all([
    prisma.schedule.upsert({
      where: { id: "schedule-demo-001" },
      update: {},
      create: {
        id: "schedule-demo-001",
        projectId: "project-demo-001",
        name: "足場設置",
        assignee: "足場班",
        startDate: new Date("2024-10-01"),
        endDate: new Date("2024-10-03"),
        progress: 100,
      },
    }),
    prisma.schedule.upsert({
      where: { id: "schedule-demo-002" },
      update: {},
      create: {
        id: "schedule-demo-002",
        projectId: "project-demo-001",
        name: "高圧洗浄",
        assignee: "塗装班",
        startDate: new Date("2024-10-04"),
        endDate: new Date("2024-10-05"),
        progress: 100,
      },
    }),
    prisma.schedule.upsert({
      where: { id: "schedule-demo-003" },
      update: {},
      create: {
        id: "schedule-demo-003",
        projectId: "project-demo-001",
        name: "下地処理",
        assignee: "塗装班",
        startDate: new Date("2024-10-07"),
        endDate: new Date("2024-10-12"),
        progress: 100,
      },
    }),
    prisma.schedule.upsert({
      where: { id: "schedule-demo-004" },
      update: {},
      create: {
        id: "schedule-demo-004",
        projectId: "project-demo-001",
        name: "シーラー塗布",
        assignee: "塗装班",
        startDate: new Date("2024-10-14"),
        endDate: new Date("2024-10-16"),
        progress: 100,
      },
    }),
    prisma.schedule.upsert({
      where: { id: "schedule-demo-005" },
      update: {},
      create: {
        id: "schedule-demo-005",
        projectId: "project-demo-001",
        name: "中塗り",
        assignee: "塗装班",
        startDate: new Date("2024-10-17"),
        endDate: new Date("2024-10-22"),
        progress: 80,
      },
    }),
    prisma.schedule.upsert({
      where: { id: "schedule-demo-006" },
      update: {},
      create: {
        id: "schedule-demo-006",
        projectId: "project-demo-001",
        name: "上塗り",
        assignee: "塗装班",
        startDate: new Date("2024-10-24"),
        endDate: new Date("2024-10-30"),
        progress: 0,
      },
    }),
  ]);
  console.log("✅ Schedules created:", schedules.length);

  // 工種マスタ
  const workCategories = await Promise.all([
    prisma.workCategory.upsert({
      where: { id: "category-demo-001" },
      update: {},
      create: {
        id: "category-demo-001",
        companyId: company.id,
        name: "外壁工事",
        code: "EXT",
        sortOrder: 1,
      },
    }),
    prisma.workCategory.upsert({
      where: { id: "category-demo-002" },
      update: {},
      create: {
        id: "category-demo-002",
        companyId: company.id,
        name: "屋根工事",
        code: "ROOF",
        sortOrder: 2,
      },
    }),
    prisma.workCategory.upsert({
      where: { id: "category-demo-003" },
      update: {},
      create: {
        id: "category-demo-003",
        companyId: company.id,
        name: "内装工事",
        code: "INT",
        sortOrder: 3,
      },
    }),
  ]);
  console.log("✅ Work categories created:", workCategories.length);

  // 材料マスタ
  const materials = await Promise.all([
    prisma.material.upsert({
      where: { id: "material-demo-001" },
      update: {},
      create: {
        id: "material-demo-001",
        companyId: company.id,
        categoryId: "category-demo-001",
        name: "シリコン塗料（上塗り）",
        productCode: "MAT-001",
        costPrice: 28000,
        unit: "缶",
        lossRate: 5,
      },
    }),
    prisma.material.upsert({
      where: { id: "material-demo-002" },
      update: {},
      create: {
        id: "material-demo-002",
        companyId: company.id,
        categoryId: "category-demo-001",
        name: "下地シーラー",
        productCode: "MAT-002",
        costPrice: 8500,
        unit: "缶",
        lossRate: 3,
      },
    }),
    prisma.material.upsert({
      where: { id: "material-demo-003" },
      update: {},
      create: {
        id: "material-demo-003",
        companyId: company.id,
        categoryId: "category-demo-001",
        name: "コーキング材",
        productCode: "MAT-003",
        costPrice: 1200,
        unit: "本",
        lossRate: 10,
      },
    }),
  ]);
  console.log("✅ Materials created:", materials.length);

  // 労務マスタ
  const laborTypes = await Promise.all([
    prisma.laborType.upsert({
      where: { id: "labor-demo-001" },
      update: {},
      create: {
        id: "labor-demo-001",
        companyId: company.id,
        categoryId: "category-demo-001",
        name: "塗装工",
        dailyRate: 35000,
        hourlyRate: 4375,
      },
    }),
    prisma.laborType.upsert({
      where: { id: "labor-demo-002" },
      update: {},
      create: {
        id: "labor-demo-002",
        companyId: company.id,
        categoryId: "category-demo-002",
        name: "屋根工",
        dailyRate: 38000,
        hourlyRate: 4750,
      },
    }),
    prisma.laborType.upsert({
      where: { id: "labor-demo-003" },
      update: {},
      create: {
        id: "labor-demo-003",
        companyId: company.id,
        categoryId: "category-demo-003",
        name: "内装工",
        dailyRate: 28000,
        hourlyRate: 3500,
      },
    }),
  ]);
  console.log("✅ Labor types created:", laborTypes.length);

  // ポイント履歴
  const pointTransactions = await Promise.all([
    prisma.pointTransaction.upsert({
      where: { id: "point-demo-001" },
      update: {},
      create: {
        id: "point-demo-001",
        customerId: "customer-demo-001",
        type: "contract",
        points: 18000,
        balanceAfter: 24500,
        description: "外壁塗装工事 契約ポイント",
      },
    }),
    prisma.pointTransaction.upsert({
      where: { id: "point-demo-002" },
      update: {},
      create: {
        id: "point-demo-002",
        customerId: "customer-demo-001",
        type: "birthday",
        points: 500,
        balanceAfter: 6500,
        description: "お誕生日ポイント",
      },
    }),
  ]);
  console.log("✅ Point transactions created:", pointTransactions.length);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
