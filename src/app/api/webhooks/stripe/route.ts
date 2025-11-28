import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Stripe Webhook シークレットキー（環境変数から取得）
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe SDKを使用する場合はインポート
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  // Webhook署名検証（Stripe SDK使用時）
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
  // } catch (err) {
  //   console.error('Webhook signature verification failed:', err);
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  // }

  // デモ用：直接JSONパース
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      // サブスクリプション作成完了
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }

      // サブスクリプション更新
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // サブスクリプションキャンセル
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // 支払い成功
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      // 支払い失敗
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      // 積立決済成功
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handleSavingsPayment(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Checkout完了時の処理
async function handleCheckoutComplete(session: Record<string, unknown>) {
  const companyId = session.client_reference_id as string;
  const metadata = session.metadata as Record<string, string> | undefined;
  const planId = metadata?.plan_id;

  if (!companyId || !planId) {
    console.error("Missing companyId or planId in checkout session");
    return;
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      stripeCustomerId: session.customer as string,
      subscriptionPlan: planId,
      subscriptionStatus: "active",
    },
  });

  console.log(`Company ${companyId} subscribed to ${planId}`);
}

// サブスクリプション更新時の処理
async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  const customerId = subscription.customer as string;

  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!company) {
    console.error(`Company not found for Stripe customer: ${customerId}`);
    return;
  }

  const status = subscription.status as string;
  const items = subscription.items as { data?: Array<{ price?: { lookup_key?: string } }> } | undefined;
  const planId = items?.data?.[0]?.price?.lookup_key;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      subscriptionStatus: status,
      ...(planId && { subscriptionPlan: planId }),
    },
  });

  console.log(`Company ${company.id} subscription updated: ${status}`);
}

// サブスクリプション削除時の処理
async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  const customerId = subscription.customer as string;

  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!company) {
    console.error(`Company not found for Stripe customer: ${customerId}`);
    return;
  }

  await prisma.company.update({
    where: { id: company.id },
    data: {
      subscriptionPlan: "free",
      subscriptionStatus: "canceled",
    },
  });

  console.log(`Company ${company.id} subscription canceled`);
}

// 支払い成功時の処理
async function handlePaymentSucceeded(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string;
  const amount = invoice.amount_paid as number;

  console.log(`Payment succeeded for ${customerId}: ¥${amount}`);

  // 請求履歴の保存やメール通知などの処理
}

// 支払い失敗時の処理
async function handlePaymentFailed(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string;
  const attemptCount = invoice.attempt_count as number;

  console.log(`Payment failed for ${customerId}, attempt: ${attemptCount}`);

  // 支払い失敗通知の送信
  // 3回失敗でサブスクリプション一時停止など
}

// 積立決済成功時の処理
async function handleSavingsPayment(paymentIntent: Record<string, unknown>) {
  const piMetadata = paymentIntent.metadata as Record<string, string> | undefined;
  const contractId = piMetadata?.contract_id;
  const amount = paymentIntent.amount as number;

  if (!contractId) {
    console.log("No contract_id in payment intent metadata");
    return;
  }

  // 積立トランザクションを記録
  const contract = await prisma.savingsContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    console.error(`SavingsContract not found: ${contractId}`);
    return;
  }

  const newBalance = Number(contract.balance) + (amount / 100);

  await prisma.$transaction([
    // 残高更新
    prisma.savingsContract.update({
      where: { id: contractId },
      data: { balance: newBalance },
    }),
    // トランザクション記録
    prisma.savingsTransaction.create({
      data: {
        contractId,
        type: "deposit",
        amount: amount / 100,
        balanceAfter: newBalance,
        description: "月額積立",
      },
    }),
  ]);

  console.log(`Savings deposit recorded: ${contractId}, amount: ¥${amount / 100}`);
}

// GETは許可しない
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
