import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/masters/labor-types - 労務マスタ一覧取得
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
      where.name = { contains: search, mode: "insensitive" };
    }

    const laborTypes = await prisma.laborType.findMany({
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

    return NextResponse.json({ data: laborTypes });
  } catch (error) {
    console.error("Failed to fetch labor types:", error);
    return NextResponse.json(
      { error: "Failed to fetch labor types" },
      { status: 500 }
    );
  }
}

// POST /api/masters/labor-types - 労務マスタ作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      categoryId,
      name,
      dailyRate,
      hourlyRate,
      productivity,
    } = body;

    if (!companyId || !name || dailyRate === undefined) {
      return NextResponse.json(
        { error: "companyId, name, and dailyRate are required" },
        { status: 400 }
      );
    }

    const laborType = await prisma.laborType.create({
      data: {
        companyId,
        categoryId,
        name,
        dailyRate,
        hourlyRate,
        productivity,
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

    return NextResponse.json({ data: laborType }, { status: 201 });
  } catch (error) {
    console.error("Failed to create labor type:", error);
    return NextResponse.json(
      { error: "Failed to create labor type" },
      { status: 500 }
    );
  }
}
