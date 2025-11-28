import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { calculateHealthScore } from "@/lib/health-score";

// POST /api/houses/[id]/health-score - 健康スコアを再計算
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 物件と部材を取得
    const house = await prisma.house.findUnique({
      where: { id },
      include: {
        components: true,
      },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    // 健康スコアを計算
    const result = calculateHealthScore({
      components: house.components.map((c) => ({
        category: c.category,
        conditionScore: c.conditionScore,
        installedDate: c.installedDate,
        expectedLifespan: c.expectedLifespan,
        warrantyExpires: c.warrantyExpires,
        lastInspection: c.lastInspection,
      })),
      builtYear: house.builtYear,
      structureType: house.structureType,
    });

    // 物件の健康スコアを更新
    const updatedHouse = await prisma.house.update({
      where: { id },
      data: {
        healthScore: result.overallScore,
      },
    });

    // メンテナンス推奨を自動生成（既存の未解決分は維持）
    for (const recommendation of result.recommendations) {
      // 同じ説明の未解決推奨がないか確認
      const existing = await prisma.maintenanceRecommendation.findFirst({
        where: {
          houseId: id,
          description: recommendation,
          isResolved: false,
        },
      });

      if (!existing) {
        await prisma.maintenanceRecommendation.create({
          data: {
            houseId: id,
            riskLevel: result.overallScore < 50 ? "high" : result.overallScore < 70 ? "medium" : "low",
            description: recommendation,
          },
        });
      }
    }

    return NextResponse.json({
      data: {
        healthScore: result.overallScore,
        categoryScores: result.categoryScores,
        ageDeduction: result.ageDeduction,
        structureBonus: result.structureBonus,
        recommendations: result.recommendations,
      },
    });
  } catch (error) {
    console.error("Failed to calculate health score:", error);
    return NextResponse.json(
      { error: "Failed to calculate health score" },
      { status: 500 }
    );
  }
}
