import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/masters/materials/[id] - 材料マスタ詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const material = await prisma.material.findUnique({
      where: { id },
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

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: material });
  } catch (error) {
    console.error("Failed to fetch material:", error);
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 }
    );
  }
}

// PUT /api/masters/materials/[id] - 材料マスタ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
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
      isActive,
    } = body;

    const material = await prisma.material.update({
      where: { id },
      data: {
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
        isActive,
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

    return NextResponse.json({ data: material });
  } catch (error) {
    console.error("Failed to update material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

// DELETE /api/masters/materials/[id] - 材料マスタ削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 論理削除（isActive = false）
    await prisma.material.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
