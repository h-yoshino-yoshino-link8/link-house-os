import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/masters/work-categories - 工事カテゴリマスタ一覧取得
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
    return NextResponse.json({ data: DEMO_DATA.workCategories });
  }

  try {
    const parentId = searchParams.get("parentId");
    const isActive = searchParams.get("isActive");
    const flat = searchParams.get("flat"); // flat=true でツリー構造なしで返す

    const where: Record<string, unknown> = { companyId };

    if (parentId !== null && parentId !== undefined) {
      where.parentId = parentId === "null" ? null : parentId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (flat === "true") {
      // フラット構造で返す
      const categories = await prisma.workCategory.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      return NextResponse.json({ data: categories });
    }

    // ルートカテゴリのみ取得（親がない）
    const rootCategories = await prisma.workCategory.findMany({
      where: {
        ...where,
        parentId: null,
      },
      include: {
        children: {
          where: {
            isActive: isActive === "false" ? false : true,
          },
          include: {
            children: {
              where: {
                isActive: isActive === "false" ? false : true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ data: rootCategories });
  } catch (error) {
    console.error("Failed to fetch work categories:", error);
    return NextResponse.json({ data: DEMO_DATA.workCategories });
  }
}

// POST /api/masters/work-categories - 工事カテゴリマスタ作成
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
    const { companyId, parentId, name, code, sortOrder } = body;

    if (!companyId || !name) {
      return NextResponse.json(
        { error: "companyId and name are required" },
        { status: 400 }
      );
    }

    const category = await prisma.workCategory.create({
      data: {
        companyId,
        parentId,
        name,
        code,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Failed to create work category:", error);
    return NextResponse.json(
      { error: "Failed to create work category" },
      { status: 500 }
    );
  }
}
