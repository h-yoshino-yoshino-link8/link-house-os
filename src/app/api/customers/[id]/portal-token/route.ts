import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";
import { randomBytes } from "crypto";

// POST /api/customers/[id]/portal-token - ポータルアクセストークンを生成/更新
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    // 顧客が存在するか確認
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // 新しいトークンを生成（32バイト = 64文字の16進数）
    const newToken = randomBytes(32).toString("hex");

    // トークンを更新
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { portalAccessToken: newToken },
    });

    // ポータルURLを構築
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const portalUrl = `${baseUrl}/portal?token=${newToken}`;

    return NextResponse.json({
      data: {
        token: newToken,
        portalUrl,
        customerId: updatedCustomer.id,
        customerName: updatedCustomer.name,
      },
    });
  } catch (error) {
    console.error("Failed to generate portal token:", error);
    return NextResponse.json(
      { error: "Failed to generate portal token" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id]/portal-token - ポータルアクセストークンを無効化
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    await prisma.customer.update({
      where: { id },
      data: { portalAccessToken: null },
    });

    return NextResponse.json({
      data: { message: "Portal access token revoked" },
    });
  } catch (error) {
    console.error("Failed to revoke portal token:", error);
    return NextResponse.json(
      { error: "Failed to revoke portal token" },
      { status: 500 }
    );
  }
}
