import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Webhook受信エンドポイント
// 将来的に外部サービス（会計ソフト、CRM等）との連携に使用

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-webhook-signature");

    // TODO: 署名検証を実装
    // const isValid = verifySignature(body, signature, WEBHOOK_SECRET);
    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { event, payload, source } = body;

    // イベントタイプに応じた処理
    switch (event) {
      case "payment.completed":
        await handlePaymentCompleted(payload);
        break;

      case "invoice.created":
        await handleInvoiceCreated(payload);
        break;

      case "customer.updated":
        await handleCustomerUpdated(payload);
        break;

      case "external.sync":
        await handleExternalSync(payload);
        break;

      default:
        console.log(`Unknown webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// 支払い完了ハンドラ
async function handlePaymentCompleted(payload: {
  projectId?: string;
  amount: number;
  externalId?: string;
}) {
  const { projectId, amount, externalId } = payload;

  if (projectId) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "paid",
        costActual: amount,
      },
    });
  }

  console.log(`Payment completed: ${amount} for project ${projectId}`);
}

// 請求書作成ハンドラ
async function handleInvoiceCreated(payload: {
  projectId?: string;
  invoiceNumber?: string;
  amount: number;
}) {
  const { projectId, invoiceNumber, amount } = payload;

  if (projectId) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "invoiced",
      },
    });
  }

  console.log(`Invoice created: ${invoiceNumber} for project ${projectId}`);
}

// 顧客更新ハンドラ
async function handleCustomerUpdated(payload: {
  customerId: string;
  data: {
    email?: string;
    phone?: string;
    address?: string;
  };
}) {
  const { customerId, data } = payload;

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...(data.email && { email: data.email }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
    },
  });

  console.log(`Customer updated: ${customerId}`);
}

// 外部同期ハンドラ
async function handleExternalSync(payload: {
  type: string;
  data: Record<string, unknown>;
}) {
  const { type, data } = payload;
  console.log(`External sync: ${type}`, data);

  // TODO: 外部サービスとの同期処理を実装
}
