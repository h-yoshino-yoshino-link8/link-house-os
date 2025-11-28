import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";

// GET /api/schedules - 工程一覧取得（プロジェクト情報付き）
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
    return NextResponse.json({ data: DEMO_DATA.schedules });
  }

  const projectId = searchParams.get("projectId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    // スケジュールを持つプロジェクトを取得
    const projects = await prisma.project.findMany({
      where: {
        companyId,
        ...(projectId && { id: projectId }),
        schedules: {
          some: {},
        },
      },
      select: {
        id: true,
        projectNumber: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        schedules: {
          where: {
            parentId: null, // トップレベルのスケジュールのみ
            ...(startDate && endDate && {
              OR: [
                {
                  startDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
                {
                  endDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                  },
                },
              ],
            }),
          },
          orderBy: { startDate: "asc" },
          select: {
            id: true,
            name: true,
            assignee: true,
            color: true,
            startDate: true,
            endDate: true,
            progress: true,
            notes: true,
            children: {
              orderBy: { startDate: "asc" },
              select: {
                id: true,
                name: true,
                assignee: true,
                color: true,
                startDate: true,
                endDate: true,
                progress: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // プロジェクトごとの進捗率を計算
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectsWithProgress = projects.map((project: any) => {
      const schedules = project.schedules;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalProgress = schedules.reduce((sum: number, s: any) => sum + s.progress, 0);
      const overallProgress = schedules.length > 0
        ? Math.round(totalProgress / schedules.length)
        : 0;

      return {
        id: project.id,
        projectNumber: project.projectNumber,
        name: project.title,
        customer: project.customer?.name ? `${project.customer.name} 様` : "",
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: overallProgress,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schedules: schedules.map((s: any) => ({
          ...s,
          startDate: s.startDate.toISOString(),
          endDate: s.endDate.toISOString(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children: s.children?.map((c: any) => ({
            ...c,
            startDate: c.startDate.toISOString(),
            endDate: c.endDate.toISOString(),
          })),
        })),
      };
    });

    return NextResponse.json({ data: projectsWithProgress });
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return NextResponse.json({ data: DEMO_DATA.schedules });
  }
}

// POST /api/schedules - 工程作成
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
      projectId,
      parentId,
      name,
      assignee,
      color,
      startDate,
      endDate,
      progress,
      notes,
    } = body;

    if (!projectId || !name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "projectId, name, startDate, endDate are required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        projectId,
        parentId,
        name,
        assignee,
        color: color || "#3b82f6",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        progress: progress || 0,
        notes,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
