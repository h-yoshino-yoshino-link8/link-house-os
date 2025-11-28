import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/houses/[id]/components - 部材一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    const components = await prisma.houseComponent.findMany({
      where: {
        houseId: id,
        ...(category ? { category } : {}),
      },
      orderBy: [
        { category: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ data: components });
  } catch (error) {
    console.error("Failed to fetch components:", error);
    return NextResponse.json(
      { error: "Failed to fetch components" },
      { status: 500 }
    );
  }
}

// POST /api/houses/[id]/components - 部材作成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      category,
      subcategory,
      productName,
      manufacturer,
      modelNumber,
      installedDate,
      warrantyYears,
      expectedLifespan,
      replacementCost,
      conditionScore,
      photos,
      documents,
    } = body;

    if (!category) {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 }
      );
    }

    // 保証期限を計算
    let warrantyExpires = null;
    if (installedDate && warrantyYears) {
      const installed = new Date(installedDate);
      warrantyExpires = new Date(installed);
      warrantyExpires.setFullYear(warrantyExpires.getFullYear() + warrantyYears);
    }

    const component = await prisma.houseComponent.create({
      data: {
        houseId: id,
        category,
        subcategory,
        productName,
        manufacturer,
        modelNumber,
        installedDate: installedDate ? new Date(installedDate) : null,
        warrantyYears,
        warrantyExpires,
        expectedLifespan,
        replacementCost,
        conditionScore: conditionScore ?? 100,
        photos: photos ?? [],
        documents: documents ?? [],
      },
    });

    return NextResponse.json({ data: component }, { status: 201 });
  } catch (error) {
    console.error("Failed to create component:", error);
    return NextResponse.json(
      { error: "Failed to create component" },
      { status: 500 }
    );
  }
}
