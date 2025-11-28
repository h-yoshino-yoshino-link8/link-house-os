import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/masters/materials - 材料マスタ一覧取得
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
    return NextResponse.json({ data: DEMO_DATA.materials });
  }

  try {
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = { companyId };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { productCode: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } },
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ data: materials });
  } catch (error) {
    console.error("Failed to fetch materials:", error);
    return NextResponse.json({ data: DEMO_DATA.materials });
  }
}

// POST /api/masters/materials - 材料マスタ作成
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
      categoryId,
      name,
      productCode,
      manufacturer,
      specification,
      costPrice,
      unit,
      lossRate,
      supplierId,
      supplierName,
    } = body;

    if (!companyId || !name || costPrice === undefined || !unit) {
      return NextResponse.json(
        { error: "companyId, name, costPrice, and unit are required" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: {
        companyId,
        categoryId,
        name,
        productCode,
        manufacturer,
        specification,
        costPrice,
        unit,
        lossRate: lossRate ?? 0,
        supplierId,
        supplierName,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({ data: material }, { status: 201 });
  } catch (error) {
    console.error("Failed to create material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
