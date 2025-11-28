"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Star,
  Award,
  Target,
  TrendingUp,
  Clock,
  Lock,
  CheckCircle,
  Sparkles,
  Medal,
  Crown,
  Zap,
} from "lucide-react";
import {
  calculateLevel,
  getLevelRank,
  getLevelRankColor,
  BADGE_DEFINITIONS,
  XP_ACTIONS,
} from "@/lib/gamification";
import { useGamification } from "@/hooks/use-gamification";

// バッジカテゴリ
const BADGE_CATEGORIES = {
  estimate: { label: "見積", icon: Target },
  order: { label: "受注", icon: TrendingUp },
  project: { label: "工事", icon: Award },
  house: { label: "物件管理", icon: Star },
  nft: { label: "NFT", icon: Medal },
  level: { label: "レベル", icon: Crown },
  other: { label: "その他", icon: Trophy },
};

// バッジをカテゴリ分け
function categorizeBadge(code: string): keyof typeof BADGE_CATEGORIES {
  if (code.startsWith("estimate")) return "estimate";
  if (code.startsWith("order") || code.startsWith("first_order")) return "order";
  if (code.startsWith("project")) return "project";
  if (code.startsWith("house")) return "house";
  if (code.startsWith("nft")) return "nft";
  if (code.startsWith("level")) return "level";
  return "other";
}

// バッジアイコンの取得
function getBadgeIcon(code: string) {
  if (code.includes("master") || code.includes("legend")) return Crown;
  if (code.includes("pro") || code.includes("veteran")) return Medal;
  if (code.includes("star")) return Star;
  if (code.includes("pioneer")) return Zap;
  return Award;
}

export default function GamificationPage() {
  const { data, isLoading } = useGamification({ companyId: "demo-company" });
  const stats = data?.data;

  // XP とレベルの計算
  const xp = stats?.xp || 0;
  const levelInfo = calculateLevel(xp);
  const levelRank = getLevelRank(levelInfo.level);
  const levelColor = getLevelRankColor(levelInfo.level);
  const progressPercent = (levelInfo.currentXp / levelInfo.nextLevelXp) * 100;

  // 獲得済みバッジのコードリスト（デモ用）
  const earnedBadgeCodes = stats?.badges?.map((b: { code: string }) => b.code) || [];

  // すべてのバッジ定義にステータスを追加
  const allBadges = BADGE_DEFINITIONS.map((badge) => ({
    ...badge,
    earned: earnedBadgeCodes.includes(badge.code),
    category: categorizeBadge(badge.code),
  }));

  // カテゴリ別にグループ化
  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof allBadges>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          ゲーミフィケーション
        </h1>
        <p className="text-muted-foreground">
          業務を進めてXPを獲得し、バッジをアンロックしましょう
        </p>
      </div>

      {/* Level & XP Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              レベル & XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {levelInfo.level}
                    </span>
                  </div>
                  <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${levelColor}`}>
                    {levelRank}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">現在のXP</span>
                    <span className="text-sm text-muted-foreground">
                      {levelInfo.currentXp.toLocaleString()} / {levelInfo.nextLevelXp.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">総獲得XP</span>
                  <span className="font-bold text-indigo-600">{xp.toLocaleString()} XP</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  次のレベルまであと {(levelInfo.nextLevelXp - levelInfo.currentXp).toLocaleString()} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-amber-500" />
              バッジ獲得状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">
                {earnedBadgeCodes.length}
              </div>
              <p className="text-sm text-muted-foreground">
                / {BADGE_DEFINITIONS.length} バッジ
              </p>
              <Progress
                value={(earnedBadgeCodes.length / BADGE_DEFINITIONS.length) * 100}
                className="mt-4 h-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.round((earnedBadgeCodes.length / BADGE_DEFINITIONS.length) * 100)}% コンプリート
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalEstimates || 0}</p>
              <p className="text-xs text-muted-foreground">見積作成数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              <p className="text-xs text-muted-foreground">受注数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.completedProjects || 0}</p>
              <p className="text-xs text-muted-foreground">完工数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalHouses || 0}</p>
              <p className="text-xs text-muted-foreground">管理物件数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalNfts || 0}</p>
              <p className="text-xs text-muted-foreground">発行NFT数</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="earned">獲得済み</TabsTrigger>
          <TabsTrigger value="locked">未獲得</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {Object.entries(badgesByCategory).map(([category, badges]) => {
              const categoryInfo = BADGE_CATEGORIES[category as keyof typeof BADGE_CATEGORIES];
              const CategoryIcon = categoryInfo?.icon || Trophy;
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CategoryIcon className="h-5 w-5" />
                      {categoryInfo?.label || category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {badges.map((badge) => {
                        const BadgeIcon = getBadgeIcon(badge.code);
                        return (
                          <div
                            key={badge.code}
                            className={`flex items-center gap-4 rounded-lg border p-4 ${
                              badge.earned
                                ? "bg-amber-50 border-amber-200"
                                : "bg-gray-50 border-gray-200 opacity-60"
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                badge.earned
                                  ? "bg-gradient-to-br from-amber-400 to-orange-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              {badge.earned ? (
                                <BadgeIcon className="h-6 w-6 text-white" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{badge.name}</p>
                                {badge.earned && (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {badge.description}
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                +{badge.xpReward} XP
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="earned">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                獲得済みバッジ
              </CardTitle>
              <CardDescription>
                {earnedBadgeCodes.length}個のバッジを獲得しました
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnedBadgeCodes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allBadges
                    .filter((b) => b.earned)
                    .map((badge) => {
                      const BadgeIcon = getBadgeIcon(badge.code);
                      return (
                        <div
                          key={badge.code}
                          className="flex items-center gap-4 rounded-lg border bg-amber-50 border-amber-200 p-4"
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <BadgeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{badge.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  まだバッジを獲得していません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locked">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-500" />
                未獲得バッジ
              </CardTitle>
              <CardDescription>
                条件を達成してアンロックしましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allBadges
                  .filter((b) => !b.earned)
                  .map((badge) => (
                    <div
                      key={badge.code}
                      className="flex items-center gap-4 rounded-lg border bg-gray-50 border-gray-200 p-4 opacity-75"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{badge.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {badge.description}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          +{badge.xpReward} XP
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* XP Actions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            XP獲得アクション一覧
          </CardTitle>
          <CardDescription>
            これらの操作でXPを獲得できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(XP_ACTIONS).map(([key, action]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <span className="text-sm">{action.description}</span>
                <Badge variant="secondary">+{action.xp} XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
