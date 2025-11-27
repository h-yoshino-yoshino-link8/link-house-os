import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/houses - 物件一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const customerId = searchParams.get("customerId");
    const healthScoreMin = searchParams.get("healthScoreMin");
    const healthScoreMax = searchParams.get("healthScoreMax");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: "Failed to fetch houses" },
      { status: 500 }
    );
  }
}

// POST /api/houses - 物件作成
export async function POST(request: NextRequest) {
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
