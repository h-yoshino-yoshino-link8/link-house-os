import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/partners - 協力会社一覧取得
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
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  }

  try {
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = { companyId };

    if (category) {
      where.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partner.count({ where }),
    ]);

    return NextResponse.json({
      data: partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

// POST /api/partners - 協力会社作成
export async function POST(request: NextRequest) {
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      companyId,
      name,
      contactPerson,
      email,
      phone,
      address,
      category,
      specialty,
      licenseNumber,
      bankName,
      bankBranch,
      bankAccountType,
      bankAccountNumber,
      bankAccountName,
      paymentTerms,
      taxRate,
      notes,
    } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { error: "companyId and name are required" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        companyId,
        name,
        contactPerson,
        email,
        phone,
        address,
        category,
        specialty,
        licenseNumber,
        bankName,
        bankBranch,
        bankAccountType,
        bankAccountNumber,
        bankAccountName,
        paymentTerms,
        taxRate: taxRate || 10,
        notes,
      },
    });

    return NextResponse.json({ data: partner }, { status: 201 });
  } catch (error) {
    console.error("Failed to create partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
