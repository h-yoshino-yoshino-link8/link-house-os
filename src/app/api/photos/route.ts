import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// GET /api/photos - 写真一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");
  const projectId = searchParams.get("projectId");
  const folder = searchParams.get("folder");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    );
  }

  try {
    const where = {
      project: {
        companyId,
      },
      ...(projectId && { projectId }),
      ...(folder && folder !== "all" && { folder }),
    };

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          folder: true,
          tags: true,
          caption: true,
          takenAt: true,
          annotations: true,
          sortOrder: true,
          createdAt: true,
          project: {
            select: {
              id: true,
              projectNumber: true,
              title: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.photo.count({ where }),
    ]);

    // 統計情報
    const stats = await prisma.photo.groupBy({
      by: ["folder"],
      where: {
        project: {
          companyId,
        },
      },
      _count: true,
    });

    const annotatedCount = await prisma.photo.count({
      where: {
        project: { companyId },
        NOT: { annotations: { equals: Prisma.JsonNull } },
      },
    });

    return NextResponse.json({
      data: photos.map((photo) => ({
        id: photo.id,
        projectId: photo.project.id,
        projectName: photo.project.title,
        projectNumber: photo.project.projectNumber,
        customerName: photo.project.customer?.name,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        folder: photo.folder,
        category: photo.folder, // UI互換性
        tags: photo.tags,
        title: photo.caption || "無題",
        caption: photo.caption,
        takenAt: photo.takenAt,
        uploadedAt: photo.createdAt,
        hasAnnotations: !!photo.annotations,
        annotations: photo.annotations,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        annotated: annotatedCount,
        byFolder: stats.reduce((acc, s) => {
          acc[s.folder || "other"] = s._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST /api/photos - 写真アップロード（メタデータ保存）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      url,
      thumbnailUrl,
      folder,
      tags,
      caption,
      takenAt,
    } = body;

    if (!projectId || !url) {
      return NextResponse.json(
        { error: "projectId and url are required" },
        { status: 400 }
      );
    }

    const photo = await prisma.photo.create({
      data: {
        projectId,
        url,
        thumbnailUrl,
        folder: folder || "during",
        tags: tags || [],
        caption,
        takenAt: takenAt ? new Date(takenAt) : null,
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

    return NextResponse.json({ data: photo }, { status: 201 });
  } catch (error) {
    console.error("Failed to create photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}
