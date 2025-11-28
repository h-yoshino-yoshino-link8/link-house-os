import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/houses - 物件一覧取得
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
      data: DEMO_DATA.houses,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.houses.length, totalPages: 1 },
    });
  }

  try {
    const customerId = searchParams.get("customerId");
    const healthScoreMin = searchParams.get("healthScoreMin");
    const healthScoreMax = searchParams.get("healthScoreMax");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(customerId ? { customerId } : {}),
      ...(healthScoreMin || healthScoreMax
        ? {
            healthScore: {
              ...(healthScoreMin ? { gte: parseInt(healthScoreMin) } : {}),
              ...(healthScoreMax ? { lte: parseInt(healthScoreMax) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { address: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [houses, total] = await Promise.all([
      prisma.house.findMany({
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
          _count: {
            select: {
              components: true,
              maintenanceRecs: true,
              projects: true,
              workCertificates: true,
            },
          },
        },
      }),
      prisma.house.count({ where }),
    ]);

    return NextResponse.json({
      data: houses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch houses:", error);
    return NextResponse.json({
      data: DEMO_DATA.houses,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.houses.length, totalPages: 1 },
    });
  }
}

// POST /api/houses - 物件作成
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
    const {
      companyId,
      customerId,
      address,
      structureType,
      floors,
      totalArea,
      landArea,
      builtYear,
      builder,
    } = body;

    if (!companyId || !customerId || !address) {
      return NextResponse.json(
        { error: "companyId, customerId, and address are required" },
        { status: 400 }
      );
    }

    const house = await prisma.house.create({
      data: {
        companyId,
        customerId,
        address,
        structureType,
        floors,
        totalArea,
        landArea,
        builtYear,
        builder,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: house }, { status: 201 });
  } catch (error) {
    console.error("Failed to create house:", error);
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    );
  }
}
