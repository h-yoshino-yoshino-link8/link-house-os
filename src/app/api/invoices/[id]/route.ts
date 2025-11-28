import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/invoices/[id] - 請求書詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        details: {
          orderBy: { sortOrder: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
        project: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
            customer: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - 請求書更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      issueDate,
      dueDate,
      status,
      taxRate,
      notes,
      internalMemo,
      details,
    } = body;

    // 既存の請求書を取得
    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { details: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // 金額再計算
    const detailsData = details || [];
    const subtotal = detailsData.reduce(
      (sum: number, d: { quantity: number; unitPrice: number }) =>
        sum + d.quantity * d.unitPrice,
      0
    );
    const effectiveTaxRate = taxRate ?? existing.taxRate;
    const tax = subtotal * (Number(effectiveTaxRate) / 100);
    const total = subtotal + tax;
    const remainingAmount = total - Number(existing.paidAmount);

    // トランザクションで更新
    const invoice = await prisma.$transaction(async (tx) => {
      // 既存の明細を削除
      await tx.invoiceDetail.deleteMany({
        where: { invoiceId: id },
      });

      // 請求書を更新
      return tx.invoice.update({
        where: { id },
        data: {
          title,
          issueDate: issueDate ? new Date(issueDate) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          status,
          taxRate: effectiveTaxRate,
          subtotal,
          tax,
          total,
          remainingAmount,
          notes,
          internalMemo,
          details: {
            create: detailsData.map(
              (
                d: {
                  name: string;
                  description?: string;
                  quantity: number;
                  unit?: string;
                  unitPrice: number;
                },
                i: number
              ) => ({
                sortOrder: i,
                name: d.name,
                description: d.description,
                quantity: d.quantity,
                unit: d.unit,
                unitPrice: d.unitPrice,
                amount: d.quantity * d.unitPrice,
              })
            ),
          },
        },
        include: {
          details: {
            orderBy: { sortOrder: "asc" },
          },
          project: {
            select: {
              id: true,
              projectNumber: true,
              title: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - 請求書削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
