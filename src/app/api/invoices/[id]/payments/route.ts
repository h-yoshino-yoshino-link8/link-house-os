import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/invoices/[id]/payments - 入金一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payments = await prisma.payment.findMany({
      where: { invoiceId: id },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/invoices/[id]/payments - 入金記録
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentDate, amount, method, reference, notes } = body;

    if (!paymentDate || amount === undefined) {
      return NextResponse.json(
        { error: "paymentDate and amount are required" },
        { status: 400 }
      );
    }

    // 請求書を取得
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // 入金番号を生成
    const year = new Date().getFullYear();
    const latestPayment = await prisma.payment.findFirst({
      where: {
        paymentNumber: {
          startsWith: `PAY-${year}`,
        },
      },
      orderBy: { paymentNumber: "desc" },
    });

    let nextNumber = 1;
    if (latestPayment) {
      const match = latestPayment.paymentNumber.match(/PAY-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const paymentNumber = `PAY-${year}-${String(nextNumber).padStart(4, "0")}`;

    // トランザクションで入金記録と請求書更新
    const result = await prisma.$transaction(async (tx) => {
      // 入金を記録
      const payment = await tx.payment.create({
        data: {
          invoiceId: id,
          paymentNumber,
          paymentDate: new Date(paymentDate),
          amount,
          method,
          reference,
          notes,
        },
      });

      // 請求書の入金額を更新
      const newPaidAmount = Number(invoice.paidAmount) + amount;
      const newRemainingAmount = Number(invoice.total) - newPaidAmount;

      // ステータス判定
      let newStatus = invoice.status;
      if (newRemainingAmount <= 0) {
        newStatus = "paid";
      } else if (newPaidAmount > 0) {
        newStatus = "partial_paid";
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
        },
      });

      // 案件のステータスも更新（完全入金の場合）
      if (newStatus === "paid" && invoice.projectId) {
        await tx.project.update({
          where: { id: invoice.projectId },
          data: { status: "paid" },
        });
      }

      return { payment, invoice: updatedInvoice };
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to record payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
