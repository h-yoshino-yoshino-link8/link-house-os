import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/houses/[id]/maintenance - メンテナンス推奨一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeResolved = searchParams.get("includeResolved") === "true";
    const riskLevel = searchParams.get("riskLevel");

    const recommendations = await prisma.maintenanceRecommendation.findMany({
      where: {
        houseId: id,
        ...(includeResolved ? {} : { isResolved: false }),
        ...(riskLevel ? { riskLevel } : {}),
      },
      include: {
        component: {
          select: {
            id: true,
            category: true,
            productName: true,
          },
        },
      },
      orderBy: [
        { riskLevel: "asc" }, // high, medium, low の順
        { createdAt: "desc" },
      ],
    });

    // riskLevelの優先度でソート
    const sortedRecommendations = recommendations.sort((a, b) => {
      const priority: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priority[a.riskLevel] ?? 3) - (priority[b.riskLevel] ?? 3);
    });

    return NextResponse.json({ data: sortedRecommendations });
  } catch (error) {
    console.error("Failed to fetch maintenance recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance recommendations" },
      { status: 500 }
    );
  }
}

// POST /api/houses/[id]/maintenance - メンテナンス推奨作成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      componentId,
      riskLevel,
      description,
      recommendedAction,
      dueDate,
      estimatedCostMin,
      estimatedCostMax,
    } = body;

    if (!description || !riskLevel) {
      return NextResponse.json(
        { error: "description and riskLevel are required" },
        { status: 400 }
      );
    }

    const recommendation = await prisma.maintenanceRecommendation.create({
      data: {
        houseId: id,
        componentId,
        riskLevel,
        description,
        recommendedAction,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedCostMin,
        estimatedCostMax,
      },
    });

    return NextResponse.json({ data: recommendation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create maintenance recommendation:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance recommendation" },
      { status: 500 }
    );
  }
}
