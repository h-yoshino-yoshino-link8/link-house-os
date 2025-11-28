import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/masters/materials - 材料マスタ一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

// POST /api/masters/materials - 材料マスタ作成
export async function POST(request: NextRequest) {
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
