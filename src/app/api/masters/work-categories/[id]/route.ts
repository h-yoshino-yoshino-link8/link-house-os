import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/masters/work-categories/[id] - 工事カテゴリマスタ詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await prisma.workCategory.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        materials: {
          where: { isActive: true },
          take: 10,
        },
        laborTypes: {
          where: { isActive: true },
          take: 10,
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Work category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Failed to fetch work category:", error);
    return NextResponse.json(
      { error: "Failed to fetch work category" },
      { status: 500 }
    );
  }
}

// PUT /api/masters/work-categories/[id] - 工事カテゴリマスタ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { parentId, name, code, sortOrder, isActive } = body;

    const category = await prisma.workCategory.update({
      where: { id },
      data: {
        parentId,
        name,
        code,
        sortOrder,
        isActive,
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

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("Failed to update work category:", error);
    return NextResponse.json(
      { error: "Failed to update work category" },
      { status: 500 }
    );
  }
}

// DELETE /api/masters/work-categories/[id] - 工事カテゴリマスタ削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 子カテゴリも含めて論理削除
    await prisma.$transaction(async (tx) => {
      // 子カテゴリを論理削除
      await tx.workCategory.updateMany({
        where: { parentId: id },
        data: { isActive: false },
      });

      // 親カテゴリを論理削除
      await tx.workCategory.update({
        where: { id },
        data: { isActive: false },
      });
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete work category:", error);
    return NextResponse.json(
      { error: "Failed to delete work category" },
      { status: 500 }
    );
  }
}
