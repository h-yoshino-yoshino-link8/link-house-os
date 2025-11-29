import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// GET /api/schedules/[id] - 工程詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
          },
        },
        children: {
          orderBy: { startDate: "asc" },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: schedule });
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}

// PUT /api/schedules/[id] - 工程更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
      name,
      assignee,
      color,
      startDate,
      endDate,
      progress,
      notes,
      parentId,
      dependsOnId,
    } = body;

    // 既存のスケジュールを確認
    const existing = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(assignee !== undefined && { assignee }),
        ...(color !== undefined && { color }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(progress !== undefined && { progress }),
        ...(notes !== undefined && { notes }),
        ...(parentId !== undefined && { parentId }),
        ...(dependsOnId !== undefined && { dependsOnId }),
      },
      include: {
        project: {
          select: {
            id: true,
            projectNumber: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ data: schedule });
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// PATCH /api/schedules/[id] - 工程部分更新（進捗のみなど）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const schedule = await prisma.schedule.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ data: schedule });
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - 工程削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  try {
    // 子スケジュールも含めて削除（PrismaのonDelete: Cascadeで処理される）
    await prisma.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
