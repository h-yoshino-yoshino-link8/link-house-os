import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/customers/[id] - 顧客詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        houses: {
          select: {
            id: true,
            address: true,
            healthScore: true,
            structureType: true,
            builtYear: true,
          },
        },
        estimates: {
          select: {
            id: true,
            estimateNumber: true,
            title: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        projects: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
            status: true,
            contractAmount: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        savingsContracts: {
          where: { status: "active" },
          select: {
            id: true,
            plan: true,
            balance: true,
            monthlyAmount: true,
          },
        },
        pointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        referredBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            estimates: true,
            projects: true,
            houses: true,
            referrals: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - 顧客更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      type,
      name,
      email,
      phone,
      address,
      tags,
      customFields,
      rank,
    } = body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(tags && { tags }),
        ...(customFields !== undefined && { customFields }),
        ...(rank && { rank }),
      },
      include: {
        _count: {
          select: {
            estimates: true,
            projects: true,
            houses: true,
          },
        },
      },
    });

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - 顧客削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
