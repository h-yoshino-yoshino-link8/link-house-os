import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// PUT /api/houses/[id]/maintenance/[recommendationId] - メンテナンス推奨更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recommendationId: string }> }
) {
  try {
    const { recommendationId } = await params;
    const body = await request.json();
    const {
      riskLevel,
      description,
      recommendedAction,
      dueDate,
      estimatedCostMin,
      estimatedCostMax,
      isResolved,
    } = body;

    const recommendation = await prisma.maintenanceRecommendation.update({
      where: { id: recommendationId },
      data: {
        ...(riskLevel !== undefined && { riskLevel }),
        ...(description !== undefined && { description }),
        ...(recommendedAction !== undefined && { recommendedAction }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedCostMin !== undefined && { estimatedCostMin }),
        ...(estimatedCostMax !== undefined && { estimatedCostMax }),
        ...(isResolved !== undefined && {
          isResolved,
          resolvedAt: isResolved ? new Date() : null,
        }),
      },
    });

    return NextResponse.json({ data: recommendation });
  } catch (error) {
    console.error("Failed to update maintenance recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance recommendation" },
      { status: 500 }
    );
  }
}

// DELETE /api/houses/[id]/maintenance/[recommendationId] - メンテナンス推奨削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recommendationId: string }> }
) {
  try {
    const { recommendationId } = await params;

    await prisma.maintenanceRecommendation.delete({
      where: { id: recommendationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete maintenance recommendation:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance recommendation" },
      { status: 500 }
    );
  }
}

// POST /api/houses/[id]/maintenance/[recommendationId]/resolve - 解決済みにする
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recommendationId: string }> }
) {
  try {
    const { recommendationId } = await params;

    const recommendation = await prisma.maintenanceRecommendation.update({
      where: { id: recommendationId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ data: recommendation });
  } catch (error) {
    console.error("Failed to resolve maintenance recommendation:", error);
    return NextResponse.json(
      { error: "Failed to resolve maintenance recommendation" },
      { status: 500 }
    );
  }
}
