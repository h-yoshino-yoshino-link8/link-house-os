import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";
import { createDemoEstimate } from "@/lib/demo-storage";

// GET /api/estimates - 見積一覧取得
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

  // DB接続できない場合はデモデータを返す
  if (!prisma) {
    return NextResponse.json({
      data: DEMO_DATA.estimates,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.estimates.length, totalPages: 1 },
    });
  }

  try {
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(status && status !== "all" ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { estimateNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [estimates, total] = await Promise.all([
      prisma.estimate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          _count: {
            select: {
              details: true,
            },
          },
        },
      }),
      prisma.estimate.count({ where }),
    ]);

    return NextResponse.json({
      data: estimates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch estimates:", error);
    // エラー時もデモデータを返す
    return NextResponse.json({
      data: DEMO_DATA.estimates,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.estimates.length, totalPages: 1 },
    });
  }
}

// POST /api/estimates - 見積作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      customerId,
      houseId,
      title,
      estimateDate,
      validUntil,
      taxRate,
      notes,
      internalMemo,
      createdById,
      details,
    } = body;

    if (!companyId || !customerId || !title) {
      return NextResponse.json(
        { error: "companyId, customerId, and title are required" },
        { status: 400 }
      );
    }

    const prisma = await tryGetPrisma();

    // デモモードの場合
    if (!prisma) {
      const estimate = createDemoEstimate({
        companyId,
        customerId,
        houseId,
        title,
        estimateDate: estimateDate || new Date().toISOString(),
        validUntil,
        taxRate: taxRate || 10,
        notes,
        internalMemo,
        details: details?.map((d: {
          sortOrder?: number;
          parentId?: string | null;
          level?: number;
          isCategory?: boolean;
          name: string;
          specification?: string;
          quantity?: number;
          unit?: string;
          costMaterial?: number;
          costLabor?: number;
          costUnit?: number;
          costTotal?: number;
          profitRate?: number;
          priceUnit?: number;
          priceTotal?: number;
          internalMemo?: string;
        }, index: number) => ({
          sortOrder: d.sortOrder ?? index,
          parentId: d.parentId || null,
          level: d.level ?? 0,
          isCategory: d.isCategory ?? false,
          name: d.name,
          specification: d.specification,
          quantity: d.quantity || 1,
          unit: d.unit,
          costMaterial: d.costMaterial || 0,
          costLabor: d.costLabor || 0,
          costUnit: d.costUnit || 0,
          costTotal: d.costTotal || 0,
          profitRate: d.profitRate || 25,
          priceUnit: d.priceUnit || 0,
          priceTotal: d.priceTotal || 0,
          internalMemo: d.internalMemo,
        })) || [],
      });

      return NextResponse.json({ data: estimate }, { status: 201 });
    }

    // 見積番号を生成
    const year = new Date().getFullYear();
    const count = await prisma.estimate.count({
      where: {
        companyId,
        estimateNumber: { startsWith: `EST-${year}` },
      },
    });
    const estimateNumber = `EST-${year}-${String(count + 1).padStart(3, "0")}`;

    // 明細から合計を計算
    let subtotal = 0;
    let costTotal = 0;

    if (details && Array.isArray(details)) {
      details.forEach((detail: { priceTotal?: number; costTotal?: number }) => {
        subtotal += detail.priceTotal || 0;
        costTotal += detail.costTotal || 0;
      });
    }

    const tax = subtotal * ((taxRate || 10) / 100);
    const total = subtotal + tax;
    const profit = subtotal - costTotal;
    const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

    const estimate = await prisma.estimate.create({
      data: {
        companyId,
        customerId,
        houseId,
        estimateNumber,
        title,
        estimateDate: estimateDate ? new Date(estimateDate) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : undefined,
        taxRate: taxRate || 10,
        subtotal,
        tax,
        total,
        costTotal,
        profit,
        profitRate,
        notes,
        internalMemo,
        createdById,
        details: details
          ? {
              create: details.map((detail: {
                sortOrder?: number;
                parentId?: string | null;
                level?: number;
                isCategory?: boolean;
                name: string;
                specification?: string;
                quantity?: number;
                unit?: string;
                costMaterial?: number;
                costLabor?: number;
                costUnit?: number;
                costTotal?: number;
                profitRate?: number;
                priceUnit?: number;
                priceTotal?: number;
                internalMemo?: string;
              }, index: number) => ({
                sortOrder: detail.sortOrder ?? index,
                parentId: detail.parentId || null,
                level: detail.level ?? 0,
                isCategory: detail.isCategory ?? false,
                name: detail.name,
                specification: detail.specification,
                quantity: detail.quantity || 1,
                unit: detail.unit,
                costMaterial: detail.costMaterial || 0,
                costLabor: detail.costLabor || 0,
                costUnit: detail.costUnit || 0,
                costTotal: detail.costTotal || 0,
                profitRate: detail.profitRate || 25,
                priceUnit: detail.priceUnit || 0,
                priceTotal: detail.priceTotal || 0,
                internalMemo: detail.internalMemo,
              })),
            }
          : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        details: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ data: estimate }, { status: 201 });
  } catch (error) {
    console.error("Failed to create estimate:", error);
    return NextResponse.json(
      { error: "Failed to create estimate" },
      { status: 500 }
    );
  }
}
