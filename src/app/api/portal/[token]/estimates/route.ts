import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/portal/[token]/estimates - 顧客の見積一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
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

    // 顧客の見積を取得
    const estimates = await prisma.estimate.findMany({
      where: {
        customerId: customer.id,
        status: { in: ["submitted", "ordered", "pending"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        house: {
          select: {
            id: true,
            address: true,
          },
        },
        details: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      data: estimates.map((est: typeof estimates[number]) => ({
        id: est.id,
        estimateNumber: est.estimateNumber,
        title: est.title,
        estimateDate: est.estimateDate,
        validUntil: est.validUntil,
        subtotal: Number(est.subtotal),
        tax: Number(est.tax),
        total: Number(est.total),
        status: est.status,
        notes: est.notes,
        house: est.house,
        details: est.details.map((d: typeof est.details[number]) => ({
          id: d.id,
          name: d.name,
          specification: d.specification,
          quantity: Number(d.quantity),
          unit: d.unit,
          priceUnit: Number(d.priceUnit),
          priceTotal: Number(d.priceTotal),
          level: d.level,
          isCategory: d.isCategory,
          parentId: d.parentId,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch portal estimates:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimates" },
      { status: 500 }
    );
  }
}
