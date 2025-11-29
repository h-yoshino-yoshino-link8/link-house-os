import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// POST /api/portal/[token]/estimates/[id]/approve - 見積を承認（発注）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  const { token, id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    // トークンで顧客を検索
    const customer = await prisma.customer.findUnique({
      where: { portalAccessToken: token },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid portal access token" },
        { status: 401 }
      );
    }

    // 見積を取得
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        house: true,
      },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // 顧客の見積かチェック
    if (estimate.customerId !== customer.id) {
      return NextResponse.json(
        { error: "You don't have permission to approve this estimate" },
        { status: 403 }
      );
    }

    // 既に発注済みかチェック
    if (estimate.status === "ordered") {
      return NextResponse.json(
        { error: "This estimate has already been ordered" },
        { status: 400 }
      );
    }

    // 有効期限チェック
    if (estimate.validUntil && new Date(estimate.validUntil) < new Date()) {
      return NextResponse.json(
        { error: "This estimate has expired" },
        { status: 400 }
      );
    }

    // リクエストボディを取得
    const body = await request.json().catch(() => ({}));
    const { message } = body;

    // トランザクションで見積ステータス更新とプロジェクト作成
    const result = await prisma.$transaction(async (tx: typeof prisma) => {
      // 見積ステータスを更新
      const updatedEstimate = await tx.estimate.update({
        where: { id },
        data: { status: "ordered" },
      });

      // プロジェクト番号を生成
      const year = new Date().getFullYear();
      const count = await tx.project.count({
        where: {
          companyId: estimate.companyId,
          projectNumber: { startsWith: `PRJ-${year}` },
        },
      });
      const projectNumber = `PRJ-${year}-${String(count + 1).padStart(3, "0")}`;

      // プロジェクトを作成
      const project = await tx.project.create({
        data: {
          companyId: estimate.companyId,
          customerId: customer.id,
          houseId: estimate.houseId,
          estimateId: estimate.id,
          projectNumber,
          title: estimate.title,
          status: "contracted",
          contractAmount: estimate.total,
          costBudget: estimate.costTotal,
        },
      });

      // 顧客の累計取引額を更新
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalTransaction: {
            increment: estimate.total,
          },
        },
      });

      return { estimate: updatedEstimate, project };
    });

    return NextResponse.json({
      data: {
        estimateId: result.estimate.id,
        projectId: result.project.id,
        projectNumber: result.project.projectNumber,
        message: "見積が承認され、プロジェクトが作成されました",
      },
    });
  } catch (error) {
    console.error("Failed to approve estimate:", error);
    return NextResponse.json(
      { error: "Failed to approve estimate" },
      { status: 500 }
    );
  }
}
