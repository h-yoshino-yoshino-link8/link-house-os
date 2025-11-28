import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/invoices - 請求書一覧取得
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
      data: DEMO_DATA.invoices,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.invoices.length, totalPages: 1 },
    });
  }

  try {
    const projectId = searchParams.get("projectId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = { companyId };

    if (projectId) {
      where.projectId = projectId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              projectNumber: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    return NextResponse.json({
      data: DEMO_DATA.invoices,
      pagination: { page: 1, limit: 20, total: DEMO_DATA.invoices.length, totalPages: 1 },
    });
  }
}

// POST /api/invoices - 請求書作成
export async function POST(request: NextRequest) {
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available in demo mode" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      companyId,
      projectId,
      customerId,
      title,
      issueDate,
      dueDate,
      taxRate,
      notes,
      internalMemo,
      details,
    } = body;

    if (!companyId || !projectId || !customerId || !title) {
      return NextResponse.json(
        { error: "companyId, projectId, customerId, and title are required" },
        { status: 400 }
      );
    }

    // 請求書番号を生成
    const year = new Date().getFullYear();
    const latestInvoice = await prisma!.invoice.findFirst({
      where: {
        companyId,
        invoiceNumber: {
          startsWith: `INV-${year}`,
        },
      },
      orderBy: { invoiceNumber: "desc" },
    });

    let nextNumber = 1;
    if (latestInvoice) {
      const match = latestInvoice.invoiceNumber.match(/INV-\d{4}-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const invoiceNumber = `INV-${year}-${String(nextNumber).padStart(4, "0")}`;

    // 金額計算
    const detailsData = details || [];
    const subtotal = detailsData.reduce(
      (sum: number, d: { quantity: number; unitPrice: number }) =>
        sum + d.quantity * d.unitPrice,
      0
    );
    const tax = subtotal * ((taxRate || 10) / 100);
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        projectId,
        customerId,
        invoiceNumber,
        title,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status: "draft",
        subtotal,
        taxRate: taxRate || 10,
        tax,
        total,
        remainingAmount: total,
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
        details: true,
        project: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
