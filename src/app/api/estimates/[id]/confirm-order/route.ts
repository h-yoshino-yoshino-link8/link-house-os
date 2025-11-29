import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";
import {
  getDemoEstimate,
  updateDemoEstimate,
  createDemoProject,
} from "@/lib/demo-storage";

// POST /api/estimates/[id]/confirm-order - 見積を受注確定して案件を自動作成
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { startDate, endDate } = body;

    const prisma = await tryGetPrisma();

    // デモモードの場合
    if (!prisma) {
      const demoEstimate = getDemoEstimate(id);
      if (!demoEstimate) {
        return NextResponse.json(
          { error: "Estimate not found" },
          { status: 404 }
        );
      }

      // 既に受注済みの場合
      if (demoEstimate.status === "ordered") {
        return NextResponse.json({
          data: {
            estimate: {
              id: demoEstimate.id,
              status: demoEstimate.status,
            },
            project: null,
            message: "既に受注済みです",
          },
        });
      }

      // 見積を受注済みに更新
      const updatedEstimate = updateDemoEstimate(id, { status: "ordered" });

      // 案件を作成
      const project = createDemoProject({
        companyId: demoEstimate.companyId,
        customerId: demoEstimate.customerId,
        estimateId: id,
        title: demoEstimate.title,
        status: "contracted",
        startDate: startDate || null,
        endDate: endDate || null,
        contractAmount: demoEstimate.total,
      });

      return NextResponse.json({
        data: {
          estimate: {
            id: updatedEstimate?.id || id,
            status: "ordered",
          },
          project,
          message: "受注確定しました。案件を作成しました。（デモモード）",
        },
      });
    }

    // 見積を取得
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        customer: true,
        house: true,
      },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // 既に受注済みの場合はエラー
    if (estimate.status === "ordered") {
      // 既存の案件を取得して返す
      const existingProject = await prisma.project.findFirst({
        where: { estimateId: id },
      });

      if (existingProject) {
        return NextResponse.json({
          data: {
            estimate: {
              id: estimate.id,
              status: estimate.status,
            },
            project: existingProject,
            message: "既に受注済みです",
          },
        });
      }
    }

    // 案件番号を生成
    const year = new Date().getFullYear();
    const latestProject = await prisma.project.findFirst({
      where: {
        projectNumber: {
          startsWith: `PRJ-${year}`,
        },
      },
      orderBy: { projectNumber: "desc" },
    });

    let nextNumber = 1;
    if (latestProject) {
      const match = latestProject.projectNumber.match(/PRJ-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const projectNumber = `PRJ-${year}-${String(nextNumber).padStart(3, "0")}`;

    // トランザクションで見積更新と案件作成を同時実行
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // 見積を受注済みに更新
      const updatedEstimate = await tx.estimate.update({
        where: { id },
        data: { status: "ordered" },
      });

      // 案件を作成
      const project = await tx.project.create({
        data: {
          companyId: estimate.companyId,
          customerId: estimate.customerId,
          houseId: estimate.houseId,
          estimateId: id,
          projectNumber,
          title: estimate.title,
          status: "contracted",
          contractAmount: estimate.total,
          costBudget: estimate.costTotal,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Note: ゲーミフィケーション機能は将来的にXP付与を実装予定
      // 現在はXP付与処理をスキップ

      return { estimate: updatedEstimate, project };
    });

    return NextResponse.json({
      data: {
        estimate: {
          id: result.estimate.id,
          status: result.estimate.status,
        },
        project: result.project,
        message: "受注確定しました。案件を作成しました。",
      },
    });
  } catch (error) {
    console.error("Failed to confirm order:", error);
    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 }
    );
  }
}
