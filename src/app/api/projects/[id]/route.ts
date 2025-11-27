import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/projects/[id] - 案件詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rank: true,
          },
        },
        house: {
          select: {
            id: true,
            address: true,
            structureType: true,
            builtYear: true,
            healthScore: true,
          },
        },
        estimate: {
          select: {
            id: true,
            estimateNumber: true,
            title: true,
            total: true,
            createdAt: true,
          },
        },
        schedules: {
          orderBy: { startDate: "asc" },
        },
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        workCertificates: true,
        _count: {
          select: {
            schedules: true,
            photos: true,
            workCertificates: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - 案件更新
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
      contractAmount,
      costBudget,
      costActual,
      startDate,
      endDate,
      actualStart,
      actualEnd,
    } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(contractAmount !== undefined && { contractAmount }),
        ...(costBudget !== undefined && { costBudget }),
        ...(costActual !== undefined && { costActual }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(actualStart !== undefined && { actualStart: actualStart ? new Date(actualStart) : null }),
        ...(actualEnd !== undefined && { actualEnd: actualEnd ? new Date(actualEnd) : null }),
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

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - 案件削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
