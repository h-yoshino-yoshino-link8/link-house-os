import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/houses/[id] - 物件詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const house = await prisma.house.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        components: {
          orderBy: { category: "asc" },
        },
        maintenanceRecs: {
          where: { isResolved: false },
          orderBy: { riskLevel: "desc" },
        },
        projects: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            projectNumber: true,
            title: true,
            status: true,
            contractAmount: true,
            startDate: true,
            endDate: true,
          },
        },
        workCertificates: {
          orderBy: { issuedAt: "desc" },
        },
        savingsContracts: {
          where: { status: "active" },
        },
        _count: {
          select: {
            components: true,
            maintenanceRecs: true,
            projects: true,
            workCertificates: true,
          },
        },
      },
    });

    if (!house) {
      return NextResponse.json(
        { error: "House not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: house });
  } catch (error) {
    console.error("Failed to fetch house:", error);
    return NextResponse.json(
      { error: "Failed to fetch house" },
      { status: 500 }
    );
  }
}

// PUT /api/houses/[id] - 物件更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      address,
      structureType,
      floors,
      totalArea,
      landArea,
      builtYear,
      builder,
      healthScore,
    } = body;

    const house = await prisma.house.update({
      where: { id },
      data: {
        ...(address && { address }),
        ...(structureType !== undefined && { structureType }),
        ...(floors !== undefined && { floors }),
        ...(totalArea !== undefined && { totalArea }),
        ...(landArea !== undefined && { landArea }),
        ...(builtYear !== undefined && { builtYear }),
        ...(builder !== undefined && { builder }),
        ...(healthScore !== undefined && { healthScore }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: house });
  } catch (error) {
    console.error("Failed to update house:", error);
    return NextResponse.json(
      { error: "Failed to update house" },
      { status: 500 }
    );
  }
}

// DELETE /api/houses/[id] - 物件削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.house.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete house:", error);
    return NextResponse.json(
      { error: "Failed to delete house" },
      { status: 500 }
    );
  }
}
