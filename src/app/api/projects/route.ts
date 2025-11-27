import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/projects - 案件一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const where = {
      companyId,
      ...(status && status !== "all" ? { status } : {}),
      ...(customerId ? { customerId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { projectNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          house: {
            select: {
              id: true,
              address: true,
            },
          },
          _count: {
            select: {
              schedules: true,
              photos: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - 案件作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      customerId,
      houseId,
      estimateId,
      title,
      contractAmount,
      costBudget,
      startDate,
      endDate,
    } = body;

    if (!companyId || !customerId || !title) {
      return NextResponse.json(
        { error: "companyId, customerId, and title are required" },
        { status: 400 }
      );
    }

    // 案件番号を生成
    const year = new Date().getFullYear();
    const count = await prisma.project.count({
      where: {
        companyId,
        projectNumber: { startsWith: `PRJ-${year}` },
      },
    });
    const projectNumber = `PRJ-${year}-${String(count + 1).padStart(3, "0")}`;

    const project = await prisma.project.create({
      data: {
        companyId,
        customerId,
        houseId,
        estimateId,
        projectNumber,
        title,
        contractAmount,
        costBudget,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        house: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
