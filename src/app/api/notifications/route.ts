import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/notifications - 通知一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json({ data: [], unreadCount: 0 });
  }

  try {
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: Record<string, unknown> = {
      companyId,
      isDismissed: false,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      }),
      prisma.notification.count({
        where: {
          companyId,
          isRead: false,
          isDismissed: false,
        },
      }),
    ]);

    return NextResponse.json({
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - 通知作成
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
    const {
      companyId,
      userId,
      type,
      priority,
      title,
      message,
      link,
      relatedType,
      relatedId,
      scheduledFor,
    } = body;

    if (!companyId || !type || !title || !message) {
      return NextResponse.json(
        { error: "companyId, type, title, and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        companyId,
        userId,
        type,
        priority: priority || "normal",
        title,
        message,
        link,
        relatedType,
        relatedId,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        sentAt: scheduledFor ? null : new Date(),
      },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - 複数の通知を既読にする
export async function PATCH(request: NextRequest) {
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { ids, action, companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    if (action === "markAllRead") {
      await prisma.notification.updateMany({
        where: {
          companyId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } else if (ids && ids.length > 0) {
      if (action === "read") {
        await prisma.notification.updateMany({
          where: {
            id: { in: ids },
            companyId,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });
      } else if (action === "dismiss") {
        await prisma.notification.updateMany({
          where: {
            id: { in: ids },
            companyId,
          },
          data: {
            isDismissed: true,
            dismissedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
