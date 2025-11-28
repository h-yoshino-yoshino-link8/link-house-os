import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma, DEMO_DATA } from "@/lib/api-utils";
import { XP_ACTIONS, calculateLevel, BADGE_DEFINITIONS } from "@/lib/gamification";

// GET /api/gamification/xp - XP情報取得
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
    return NextResponse.json({ data: DEMO_DATA.xpInfo });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
      },
    });

    if (!company) {
      return NextResponse.json({ data: DEMO_DATA.xpInfo });
    }

    const levelInfo = calculateLevel(company.xp);

    // 最近のXP履歴
    const recentTransactions = await prisma.xpTransaction.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      data: {
        ...company,
        levelInfo,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Failed to fetch XP info:", error);
    return NextResponse.json({ data: DEMO_DATA.xpInfo });
  }
}

// POST /api/gamification/xp - XP付与
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
    const { companyId, action, customXp, customDescription } = body;

    if (!companyId || !action) {
      return NextResponse.json(
        { error: "companyId and action are required" },
        { status: 400 }
      );
    }

    // アクションからXPを取得
    const actionDef = XP_ACTIONS[action];
    const xpAmount = customXp || actionDef?.xp || 0;
    const description = customDescription || actionDef?.description || action;

    if (xpAmount === 0) {
      return NextResponse.json(
        { error: "Invalid action or xp amount" },
        { status: 400 }
      );
    }

    // トランザクションで実行
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // XPトランザクション記録
      const xpTransaction = await tx.xpTransaction.create({
        data: {
          companyId,
          action,
          xp: xpAmount,
          description,
        },
      });

      // 会社のXPを更新
      const company = await tx.company.update({
        where: { id: companyId },
        data: {
          xp: { increment: xpAmount },
        },
      });

      // レベルアップチェック
      const newLevelInfo = calculateLevel(company.xp);
      let leveledUp = false;

      if (newLevelInfo.level > company.level) {
        await tx.company.update({
          where: { id: companyId },
          data: { level: newLevelInfo.level },
        });
        leveledUp = true;

        // レベルアップバッジをチェック
        await checkAndAwardLevelBadges(tx, companyId, newLevelInfo.level);
      }

      return {
        xpTransaction,
        company: { ...company, level: newLevelInfo.level },
        levelInfo: newLevelInfo,
        leveledUp,
      };
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error("Failed to award XP:", error);
    return NextResponse.json(
      { error: "Failed to award XP" },
      { status: 500 }
    );
  }
}

// レベルバッジの付与チェック
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAndAwardLevelBadges(
  tx: any,
  companyId: string,
  level: number
) {
  const levelBadges = BADGE_DEFINITIONS.filter(
    (b) => b.conditionType === "level" && b.conditionValue <= level
  );

  for (const badgeDef of levelBadges) {
    // バッジがDBに存在するか確認、なければ作成
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
    }
  }
}
