import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// POST /api/notifications/generate-alerts - アラート自動生成
export async function POST(request: NextRequest) {
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const notifications: Array<{
      companyId: string;
      type: string;
      priority: string;
      title: string;
      message: string;
      link: string;
      relatedType: string;
      relatedId: string;
      sentAt: Date;
    }> = [];

    // 1. 請求書の支払期限アラート
    const dueSoonInvoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: { notIn: ["paid", "cancelled"] },
        dueDate: {
          lte: sevenDaysFromNow,
        },
      },
      include: {
        project: {
          select: { title: true },
        },
      },
    });

    for (const invoice of dueSoonInvoices) {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = dueDate < now;
      const isDueSoon = dueDate <= threeDaysFromNow;

      // 既存の通知があるかチェック
      const existing = await prisma.notification.findFirst({
        where: {
          companyId,
          relatedType: "invoice",
          relatedId: invoice.id,
          type: isOverdue ? "invoice_overdue" : "invoice_due",
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24時間以内
          },
        },
      });

      if (!existing) {
        notifications.push({
          companyId,
          type: isOverdue ? "invoice_overdue" : "invoice_due",
          priority: isOverdue ? "urgent" : isDueSoon ? "high" : "normal",
          title: isOverdue
            ? `支払期限超過: ${invoice.invoiceNumber}`
            : `支払期限間近: ${invoice.invoiceNumber}`,
          message: isOverdue
            ? `請求書 ${invoice.invoiceNumber} の支払期限が過ぎています。未入金: ¥${Number(invoice.remainingAmount).toLocaleString()}`
            : `請求書 ${invoice.invoiceNumber} の支払期限が近づいています（${dueDate.toLocaleDateString()}）`,
          link: `/projects/${invoice.projectId}?tab=invoices`,
          relatedType: "invoice",
          relatedId: invoice.id,
          sentAt: now,
        });
      }
    }

    // 2. 見積有効期限アラート
    const expiringEstimates = await prisma.estimate.findMany({
      where: {
        companyId,
        status: { in: ["submitted", "pending"] },
        validUntil: {
          lte: sevenDaysFromNow,
          gte: now,
        },
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
    });

    for (const estimate of expiringEstimates) {
      const existing = await prisma.notification.findFirst({
        where: {
          companyId,
          relatedType: "estimate",
          relatedId: estimate.id,
          type: "estimate_expiring",
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!existing && estimate.validUntil) {
        const validUntil = new Date(estimate.validUntil);
        notifications.push({
          companyId,
          type: "estimate_expiring",
          priority: validUntil <= threeDaysFromNow ? "high" : "normal",
          title: `見積有効期限間近: ${estimate.estimateNumber}`,
          message: `${estimate.customer?.name}様への見積 ${estimate.estimateNumber} の有効期限が近づいています（${validUntil.toLocaleDateString()}）`,
          link: `/estimates/${estimate.id}`,
          relatedType: "estimate",
          relatedId: estimate.id,
          sentAt: now,
        });
      }
    }

    // 3. 工事完了予定超過アラート
    const delayedProjects = await prisma.project.findMany({
      where: {
        companyId,
        status: "in_progress",
        endDate: {
          lt: now,
        },
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
    });

    for (const project of delayedProjects) {
      const existing = await prisma.notification.findFirst({
        where: {
          companyId,
          relatedType: "project",
          relatedId: project.id,
          type: "project_delayed",
          createdAt: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (!existing) {
        notifications.push({
          companyId,
          type: "project_delayed",
          priority: "high",
          title: `工期遅延: ${project.projectNumber}`,
          message: `${project.title} の完了予定日を過ぎています`,
          link: `/projects/${project.id}`,
          relatedType: "project",
          relatedId: project.id,
          sentAt: now,
        });
      }
    }

    // 4. 発注書の未払いアラート
    const unpaidOrders = await prisma.purchaseOrder.findMany({
      where: {
        companyId,
        status: { in: ["delivered", "invoiced"] },
        paidAmount: 0,
        orderDate: {
          lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30日以上前
        },
      },
      include: {
        partner: {
          select: { name: true },
        },
      },
    });

    for (const order of unpaidOrders) {
      const existing = await prisma.notification.findFirst({
        where: {
          companyId,
          relatedType: "purchase_order",
          relatedId: order.id,
          type: "payment_reminder",
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7日以内
          },
        },
      });

      if (!existing) {
        notifications.push({
          companyId,
          type: "payment_reminder",
          priority: "normal",
          title: `支払いリマインダー: ${order.orderNumber}`,
          message: `${order.partner?.name}への発注 ${order.orderNumber} の支払いが未完了です`,
          link: `/purchase-orders`,
          relatedType: "purchase_order",
          relatedId: order.id,
          sentAt: now,
        });
      }
    }

    // 通知を一括作成
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return NextResponse.json({
      success: true,
      generatedCount: notifications.length,
      notifications: notifications.map((n) => ({
        type: n.type,
        title: n.title,
      })),
    });
  } catch (error) {
    console.error("Failed to generate alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate alerts" },
      { status: 500 }
    );
  }
}
