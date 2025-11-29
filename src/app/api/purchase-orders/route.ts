import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/purchase-orders - 発注書一覧取得
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
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  }

  try {
    const projectId = searchParams.get("projectId");
    const partnerId = searchParams.get("partnerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = { companyId };

    if (projectId) {
      where.projectId = projectId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              title: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          details: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch purchase orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase orders" },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders - 発注書作成
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
      projectId,
      partnerId,
      title,
      orderDate,
      deliveryDate,
      taxRate,
      notes,
      internalMemo,
      details,
    } = body;

    if (!companyId || !projectId || !partnerId || !title) {
      return NextResponse.json(
        { error: "companyId, projectId, partnerId, and title are required" },
        { status: 400 }
      );
    }

    // 発注番号を生成
    const year = new Date().getFullYear();
    const latestOrder = await prisma.purchaseOrder.findFirst({
      where: {
        companyId,
        orderNumber: {
          startsWith: `PO-${year}`,
        },
      },
      orderBy: { orderNumber: "desc" },
    });

    let nextNumber = 1;
    if (latestOrder) {
      const match = latestOrder.orderNumber.match(/PO-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const orderNumber = `PO-${year}-${String(nextNumber).padStart(4, "0")}`;

    // 金額計算
    const detailsData = details || [];
    const subtotal = detailsData.reduce(
      (sum: number, d: { quantity: number; unitPrice: number }) =>
        sum + d.quantity * d.unitPrice,
      0
    );
    const tax = subtotal * ((taxRate || 10) / 100);
    const total = subtotal + tax;

    const order = await prisma.purchaseOrder.create({
      data: {
        companyId,
        projectId,
        partnerId,
        orderNumber,
        title,
        orderDate: new Date(orderDate),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: "draft",
        subtotal,
        taxRate: taxRate || 10,
        tax,
        total,
        notes,
        internalMemo,
        details: {
          create: detailsData.map(
            (
              d: {
                name: string;
                specification?: string;
                quantity: number;
                unit?: string;
                unitPrice: number;
                notes?: string;
              },
              i: number
            ) => ({
              sortOrder: i,
              name: d.name,
              specification: d.specification,
              quantity: d.quantity,
              unit: d.unit,
              unitPrice: d.unitPrice,
              amount: d.quantity * d.unitPrice,
              notes: d.notes,
            })
          ),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        details: true,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("Failed to create purchase order:", error);
    return NextResponse.json(
      { error: "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
