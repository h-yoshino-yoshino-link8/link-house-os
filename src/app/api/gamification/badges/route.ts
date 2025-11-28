import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

// GET /api/gamification/badges - バッジ一覧取得
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
    return NextResponse.json({ data: DEMO_DATA.badges });
  }

  try {
    // 獲得済みバッジ
    const earnedBadges = await prisma.userBadge.findMany({
      where: { companyId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: "desc" },
    });

    // 全バッジ定義
    const allBadges = BADGE_DEFINITIONS.map((def) => {
      const earned = earnedBadges.find((eb: { badge: { code: string } }) => eb.badge.code === def.code);
      return {
        ...def,
        earned: !!earned,
        earnedAt: (earned as { earnedAt?: Date } | undefined)?.earnedAt || null,
      };
    });

    return NextResponse.json({
      data: {
        earned: earnedBadges.map((eb: { badge: Record<string, unknown>; earnedAt: Date }) => ({
          ...eb.badge,
          earnedAt: eb.earnedAt,
        })),
        all: allBadges,
        totalEarned: earnedBadges.length,
        totalAvailable: BADGE_DEFINITIONS.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch badges:", error);
    return NextResponse.json({ data: DEMO_DATA.badges });
  }
}

// POST /api/gamification/badges/check - バッジ獲得条件チェック
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
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // 現在の統計を取得
    const [
      estimateCount,
      orderCount,
      completedProjectCount,
      houseCount,
      nftCount,
      savingsCount,
      referralCount,
      company,
    ] = await Promise.all([
      prisma.estimate.count({ where: { companyId } }),
      prisma.estimate.count({ where: { companyId, status: "ordered" } }),
      prisma.project.count({ where: { companyId, status: { in: ["completed", "invoiced", "paid"] } } }),
      prisma.house.count({ where: { companyId } }),
      prisma.workCertificate.count({
        where: { project: { companyId }, nftTokenId: { not: null } },
      }),
      prisma.savingsContract.count({
        where: { customer: { companyId } },
      }),
      prisma.referral.count({
        where: { referrerType: "company", referrerId: companyId, status: "converted" },
      }),
      prisma.company.findUnique({
        where: { id: companyId },
        select: { level: true },
      }),
    ]);

    const stats: Record<string, number> = {
      estimate_count: estimateCount,
      order_count: orderCount,
      completed_project_count: completedProjectCount,
      house_count: houseCount,
      nft_count: nftCount,
      savings_count: savingsCount,
      referral_count: referralCount,
      level: company?.level || 1,
    };

    // 獲得すべきバッジをチェック
    const newBadges: Array<{ code: string; name: string; xpReward: number }> = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      for (const badgeDef of BADGE_DEFINITIONS) {
        const currentValue = stats[badgeDef.conditionType] || 0;

        if (currentValue >= badgeDef.conditionValue) {
          // バッジがDBに存在するか確認
          let badge = await tx.badge.findUnique({
            where: { code: badgeDef.code },
          });

          if (!badge) {
            badge = await tx.badge.create({
              data: {
                code: badgeDef.code,
                name: badgeDef.name,
                description: badgeDef.description,
                conditionType: badgeDef.conditionType,
                conditionValue: badgeDef.conditionValue,
                xpReward: badgeDef.xpReward,
              },
            });
          }

          // 既に獲得済みか確認
          const existingUserBadge = await tx.userBadge.findUnique({
            where: {
              companyId_badgeId: {
                companyId,
                badgeId: badge.id,
              },
            },
          });

          if (!existingUserBadge) {
            // バッジ付与
            await tx.userBadge.create({
              data: {
                companyId,
                badgeId: badge.id,
              },
            });

            // バッジ報酬XPを付与
            if (badge.xpReward > 0) {
              await tx.xpTransaction.create({
                data: {
                  companyId,
                  action: "badge_earned",
                  xp: badge.xpReward,
                  description: `バッジ「${badge.name}」を獲得`,
                },
              });

              await tx.company.update({
                where: { id: companyId },
                data: {
                  xp: { increment: badge.xpReward },
                },
              });
            }

            newBadges.push({
              code: badge.code,
              name: badge.name,
              xpReward: badge.xpReward,
            });
          }
        }
      }
    });

    return NextResponse.json({
      data: {
        newBadges,
        stats,
      },
    });
  } catch (error) {
    console.error("Failed to check badges:", error);
    return NextResponse.json(
      { error: "Failed to check badges" },
      { status: 500 }
    );
  }
}
