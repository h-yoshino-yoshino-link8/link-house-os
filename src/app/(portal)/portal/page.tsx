"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Activity,
  AlertTriangle,
  Calendar,
  FileText,
  Shield,
  Wrench,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { usePortalData } from "@/hooks/use-portal";

// デモデータ（トークンがない場合のフォールバック）
const demoData = {
  customer: {
    id: "demo",
    name: "デモ太郎",
    rank: "gold",
    points: 2500,
  },
  house: {
    id: "1",
    address: "東京都渋谷区○○1-2-3",
    healthScore: 82,
    builtYear: 2010,
    structureType: "wood",
    totalArea: 105.5,
  },
  componentScores: [
    { subject: "屋根", score: 75 },
    { subject: "外壁", score: 68 },
    { subject: "内装", score: 90 },
    { subject: "設備", score: 45 },
    { subject: "電気", score: 88 },
    { subject: "給排水", score: 72 },
  ],
  alerts: [
    { id: "1", level: "high", message: "給湯器：交換時期が近づいています", component: "設備" },
    { id: "2", level: "medium", message: "外壁塗装：2年以内に再塗装を推奨", component: "外壁" },
  ],
  recentEstimates: [
    { id: "1", estimateNumber: "EST-2024-025", title: "バスルームリフォーム", submittedAt: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), amount: 1850000, status: "submitted" },
  ],
  recentProjects: [
    { id: "1", title: "内装リフォーム工事", status: "completed", completedAt: new Date("2022-03-15"), hasNft: true },
    { id: "2", title: "屋根塗装工事", status: "completed", completedAt: new Date("2020-05-10"), hasNft: true },
  ],
  savings: {
    plan: "standard",
    balance: 156000,
    bonusBalance: 5000,
    monthlyAmount: 5000,
  },
  nftCount: 3,
};

const getHealthColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-lime-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
};

const getHealthLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800" };
  if (score >= 70) return { label: "Good", color: "bg-lime-100 text-lime-800" };
  if (score >= 50) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
  if (score >= 30) return { label: "Poor", color: "bg-orange-100 text-orange-800" };
  return { label: "Critical", color: "bg-red-100 text-red-800" };
};

const rankLabels: Record<string, { label: string; color: string }> = {
  member: { label: "メンバー", color: "bg-gray-100 text-gray-800" },
  silver: { label: "シルバー", color: "bg-slate-200 text-slate-800" },
  gold: { label: "ゴールド", color: "bg-amber-100 text-amber-800" },
  platinum: { label: "プラチナ", color: "bg-purple-100 text-purple-800" },
  diamond: { label: "ダイヤモンド", color: "bg-cyan-100 text-cyan-800" },
};

export default function PortalDashboard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data: apiData, isLoading, error } = usePortalData(token);

  // APIデータがあればそれを使用、なければデモデータ
  const portalData = apiData || demoData;

  const healthLabel = getHealthLabel(portalData.house?.healthScore || 0);
  const rankInfo = rankLabels[portalData.customer.rank] || rankLabels.member;

  // トークン付きリンク
  const getHref = (href: string) => token ? `${href}?token=${token}` : href;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error && token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">アクセスエラー</h2>
        <p className="text-muted-foreground mb-4">
          ポータルへのアクセスに問題があります。<br />
          リンクが正しいかご確認ください。
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          再読み込み
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {!token && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">デモモードで表示中</p>
                <p className="text-sm text-blue-700">
                  実際のポータルは、工務店から送られるリンクからアクセスできます
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {portalData.customer.name}様のお家
          </h1>
          {portalData.house && (
            <p className="text-muted-foreground">
              {portalData.house.address}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge className={rankInfo.color}>{rankInfo.label}</Badge>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">ポイント:</span>
            <span className="font-bold text-primary">{portalData.customer.points.toLocaleString()}pt</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {portalData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              お知らせ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {portalData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-md p-3 ${
                  alert.level === "high"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                <span>{alert.message}</span>
                <Button variant="ghost" size="sm">
                  詳細
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              健康スコア
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${getHealthColor(portalData.house?.healthScore || 0)}`}>
                {portalData.house?.healthScore || 0}
              </span>
              <Badge className={healthLabel.color}>{healthLabel.label}</Badge>
            </div>
            <Progress value={portalData.house?.healthScore || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Home className="h-4 w-4" />
              築年数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portalData.house?.builtYear
                ? `${new Date().getFullYear() - portalData.house.builtYear}年`
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {portalData.house?.builtYear ? `${portalData.house.builtYear}年築` : ""}
              {portalData.house?.totalArea ? ` / ${portalData.house.totalArea}㎡` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" />
              施工証明NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portalData.nftCount}件</div>
            <p className="text-xs text-muted-foreground">ブロックチェーン記録済</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" />
              積立残高
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(portalData.savings?.balance || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              月額¥{(portalData.savings?.monthlyAmount || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Health Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              部材別健康状態
            </CardTitle>
            <CardDescription>各部材の状態をレーダーチャートで表示</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {portalData.componentScores.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={portalData.componentScores}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="スコア"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  部材データがありません
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Estimates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              最新のお見積り
            </CardTitle>
            <CardDescription>検討中のお見積り</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalData.recentEstimates.length > 0 ? (
              <>
                {portalData.recentEstimates.slice(0, 3).map((estimate) => (
                  <div
                    key={estimate.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{estimate.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {estimate.estimateNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">¥{estimate.amount.toLocaleString()}</p>
                      <Badge variant={estimate.status === "submitted" ? "default" : "secondary"}>
                        {estimate.status === "submitted" ? "検討中" : "成約済"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={getHref("/portal/estimates")}>
                    すべて見る
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                お見積りはまだありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              最近の工事
            </CardTitle>
            <CardDescription>完了した工事履歴</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalData.recentProjects.length > 0 ? (
              <>
                {portalData.recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{project.title}</p>
                      {project.completedAt && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(project.completedAt), "yyyy年M月d日", { locale: ja })}
                        </p>
                      )}
                    </div>
                    {project.hasNft && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Shield className="mr-1 h-3 w-3" />
                        NFT発行済
                      </Badge>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={getHref("/portal/certificates")}>
                    施工証明を見る
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                工事履歴はまだありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              積立状況
            </CardTitle>
            <CardDescription>メンテナンス積立の状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalData.savings ? (
              <>
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">現在の残高</span>
                    <span className="text-2xl font-bold text-blue-700">
                      ¥{portalData.savings.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">プラン</span>
                    <Badge variant="outline">
                      {portalData.savings.plan === "light" ? "ライト" :
                       portalData.savings.plan === "standard" ? "スタンダード" : "プレミアム"}
                    </Badge>
                  </div>
                  {portalData.savings.bonusBalance > 0 && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ボーナス残高</span>
                      <span className="text-green-600">+¥{portalData.savings.bonusBalance.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={getHref("/portal/savings")}>
                    積立履歴を見る
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                積立契約はまだありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Wrench className="h-6 w-6" />
              <span>点検を予約</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <FileText className="h-6 w-6" />
              <span>見積を依頼</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <Link href={getHref("/portal/certificates")}>
                <Shield className="h-6 w-6" />
                <span>NFTを確認</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Home className="h-6 w-6" />
              <span>お問い合わせ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
