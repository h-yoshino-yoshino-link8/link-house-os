import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/customers - 顧客一覧取得
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
      data: DEMO_DATA.customers,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.customers.length, totalPages: 1 },
    });
  }

  try {
    const rank = searchParams.get("rank");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(rank && rank !== "all" ? { rank } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { address: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              estimates: true,
              projects: true,
              houses: true,
            },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({
      data: DEMO_DATA.customers,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.customers.length, totalPages: 1 },
    });
  }
}

// POST /api/customers - 顧客作成
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
      type,
      name,
      email,
      phone,
      address,
      tags,
      customFields,
    } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { error: "companyId and name are required" },
        { status: 400 }
      );
    }

    const referralCode = `CUS-${Date.now().toString(36).toUpperCase()}`;

    const customer = await prisma.customer.create({
      data: {
        companyId,
        type: type || "individual",
        name,
        email,
        phone,
        address,
        tags: tags || [],
        customFields,
        referralCode,
      },
      include: {
        _count: {
          select: {
            estimates: true,
            projects: true,
            houses: true,
          },
        },
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
