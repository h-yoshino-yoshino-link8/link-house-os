import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/estimates/[id] - 見積詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            rank: true,
          },
        },
        house: {
          select: {
            id: true,
            address: true,
            structureType: true,
            builtYear: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        details: {
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            status: true,
          },
        },
      },
    });

    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: estimate });
  } catch (error) {
    console.error("Failed to fetch estimate:", error);
    return NextResponse.json(
      { error: "Failed to fetch estimate" },
      { status: 500 }
    );
  }
}

// PUT /api/estimates/[id] - 見積更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      status,
      validUntil,
      taxRate,
      notes,
      internalMemo,
      details,
    } = body;

    // 明細が更新される場合は合計を再計算
    let updateData: {
      title?: string;
      status?: string;
      validUntil?: Date | null;
      taxRate?: number;
      notes?: string;
      internalMemo?: string;
      subtotal?: number;
      tax?: number;
      total?: number;
      costTotal?: number;
      profit?: number;
      profitRate?: number;
    } = {
      ...(title && { title }),
      ...(status && { status }),
      ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
      ...(taxRate !== undefined && { taxRate }),
      ...(notes !== undefined && { notes }),
      ...(internalMemo !== undefined && { internalMemo }),
    };

    if (details && Array.isArray(details)) {
      let subtotal = 0;
      let costTotal = 0;

      details.forEach((detail: { priceTotal?: number; costTotal?: number }) => {
        subtotal += detail.priceTotal || 0;
        costTotal += detail.costTotal || 0;
      });

      const currentTaxRate = taxRate ?? 10;
      const tax = subtotal * (currentTaxRate / 100);
      const total = subtotal + tax;
      const profit = subtotal - costTotal;
      const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

      updateData = {
        ...updateData,
        subtotal,
        tax,
        total,
        costTotal,
        profit,
        profitRate,
      };

      // 既存の明細を削除して新規作成
      await prisma.estimateDetail.deleteMany({
        where: { estimateId: id },
      });

      await prisma.estimateDetail.createMany({
        data: details.map((detail: {
          sortOrder?: number;
          name: string;
          specification?: string;
          quantity?: number;
          unit?: string;
          costMaterial?: number;
          costLabor?: number;
          costUnit?: number;
          costTotal?: number;
          profitRate?: number;
          priceUnit?: number;
          priceTotal?: number;
          internalMemo?: string;
        }, index: number) => ({
          estimateId: id,
          sortOrder: detail.sortOrder ?? index,
          name: detail.name,
          specification: detail.specification,
          quantity: detail.quantity || 1,
          unit: detail.unit,
          costMaterial: detail.costMaterial || 0,
          costLabor: detail.costLabor || 0,
          costUnit: detail.costUnit || 0,
          costTotal: detail.costTotal || 0,
          profitRate: detail.profitRate || 25,
          priceUnit: detail.priceUnit || 0,
          priceTotal: detail.priceTotal || 0,
          internalMemo: detail.internalMemo,
        })),
      });
    }

    const estimate = await prisma.estimate.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        details: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ data: estimate });
  } catch (error) {
    console.error("Failed to update estimate:", error);
    return NextResponse.json(
      { error: "Failed to update estimate" },
      { status: 500 }
    );
  }
}

// DELETE /api/estimates/[id] - 見積削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.estimate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete estimate:", error);
    return NextResponse.json(
      { error: "Failed to delete estimate" },
      { status: 500 }
    );
  }
}
