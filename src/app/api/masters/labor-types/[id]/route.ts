import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/masters/labor-types/[id] - 労務マスタ詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const laborType = await prisma.laborType.findUnique({
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

    if (!laborType) {
      return NextResponse.json(
        { error: "Labor type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: laborType });
  } catch (error) {
    console.error("Failed to fetch labor type:", error);
    return NextResponse.json(
      { error: "Failed to fetch labor type" },
      { status: 500 }
    );
  }
}

// PUT /api/masters/labor-types/[id] - 労務マスタ更新
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
      dailyRate,
      hourlyRate,
      productivity,
      isActive,
    } = body;

    const laborType = await prisma.laborType.update({
      where: { id },
      data: {
        categoryId,
        name,
        dailyRate,
        hourlyRate,
        productivity,
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

    return NextResponse.json({ data: laborType });
  } catch (error) {
    console.error("Failed to update labor type:", error);
    return NextResponse.json(
      { error: "Failed to update labor type" },
      { status: 500 }
    );
  }
}

// DELETE /api/masters/labor-types/[id] - 労務マスタ削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 論理削除（isActive = false）
    await prisma.laborType.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete labor type:", error);
    return NextResponse.json(
      { error: "Failed to delete labor type" },
      { status: 500 }
    );
  }
}
