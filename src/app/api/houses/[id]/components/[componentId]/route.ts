import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// GET /api/houses/[id]/components/[componentId] - 部材詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { componentId } = await params;

    const component = await prisma.houseComponent.findUnique({
      where: { id: componentId },
      include: {
        maintenanceRecs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: component });
  } catch (error) {
    console.error("Failed to fetch component:", error);
    return NextResponse.json(
      { error: "Failed to fetch component" },
      { status: 500 }
    );
  }
}

// PUT /api/houses/[id]/components/[componentId] - 部材更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { componentId } = await params;
    const body = await request.json();
    const {
      category,
      subcategory,
      productName,
      manufacturer,
      modelNumber,
      installedDate,
      warrantyYears,
      expectedLifespan,
      replacementCost,
      conditionScore,
      lastInspection,
      photos,
      documents,
    } = body;

    // 保証期限を計算
    let warrantyExpires = undefined;
    if (installedDate !== undefined && warrantyYears !== undefined) {
      if (installedDate && warrantyYears) {
        const installed = new Date(installedDate);
        warrantyExpires = new Date(installed);
        warrantyExpires.setFullYear(warrantyExpires.getFullYear() + warrantyYears);
      } else {
        warrantyExpires = null;
      }
    }

    const component = await prisma.houseComponent.update({
      where: { id: componentId },
      data: {
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(productName !== undefined && { productName }),
        ...(manufacturer !== undefined && { manufacturer }),
        ...(modelNumber !== undefined && { modelNumber }),
        ...(installedDate !== undefined && { installedDate: installedDate ? new Date(installedDate) : null }),
        ...(warrantyYears !== undefined && { warrantyYears }),
        ...(warrantyExpires !== undefined && { warrantyExpires }),
        ...(expectedLifespan !== undefined && { expectedLifespan }),
        ...(replacementCost !== undefined && { replacementCost }),
        ...(conditionScore !== undefined && { conditionScore }),
        ...(lastInspection !== undefined && { lastInspection: lastInspection ? new Date(lastInspection) : null }),
        ...(photos !== undefined && { photos }),
        ...(documents !== undefined && { documents }),
      },
    });

    return NextResponse.json({ data: component });
  } catch (error) {
    console.error("Failed to update component:", error);
    return NextResponse.json(
      { error: "Failed to update component" },
      { status: 500 }
    );
  }
}

// DELETE /api/houses/[id]/components/[componentId] - 部材削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const { componentId } = await params;

    await prisma.houseComponent.delete({
      where: { id: componentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete component:", error);
    return NextResponse.json(
      { error: "Failed to delete component" },
      { status: 500 }
    );
  }
}
