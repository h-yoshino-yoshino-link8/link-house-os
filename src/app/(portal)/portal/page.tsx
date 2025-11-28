"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

// デモデータ（実際のAPIから取得予定）
const portalData = {
  customer: {
    name: "山田太郎",
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
  upcomingMaintenance: [
    { id: "1", date: new Date("2025-05-10"), description: "屋根定期点検", status: "scheduled" },
    { id: "2", date: new Date("2025-08-20"), description: "外壁塗装", status: "recommended" },
  ],
  recentProjects: [
    { id: "1", title: "内装リフォーム工事", completedAt: new Date("2022-03-15"), hasNft: true },
    { id: "2", title: "屋根塗装工事", completedAt: new Date("2020-05-10"), hasNft: true },
  ],
  savings: {
    plan: "standard",
    balance: 156000,
    monthlyAmount: 5000,
    nextPayment: new Date("2025-01-15"),
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
  const healthLabel = getHealthLabel(portalData.house.healthScore);
  const rankInfo = rankLabels[portalData.customer.rank];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {portalData.customer.name}様のお家
          </h1>
          <p className="text-muted-foreground">
            {portalData.house.address}
          </p>
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
              <span className={`text-3xl font-bold ${getHealthColor(portalData.house.healthScore)}`}>
                {portalData.house.healthScore}
              </span>
              <Badge className={healthLabel.color}>{healthLabel.label}</Badge>
            </div>
            <Progress value={portalData.house.healthScore} className="mt-2 h-2" />
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
              {new Date().getFullYear() - portalData.house.builtYear}年
            </div>
            <p className="text-xs text-muted-foreground">
              {portalData.house.builtYear}年築 / {portalData.house.totalArea}㎡
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
              ¥{portalData.savings.balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              月額¥{portalData.savings.monthlyAmount.toLocaleString()}
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
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              メンテナンス予定
            </CardTitle>
            <CardDescription>今後のメンテナンス予定と推奨</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalData.upcomingMaintenance.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {item.status === "scheduled" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(item.date, "yyyy年M月d日", { locale: ja })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={item.status === "scheduled" ? "default" : "secondary"}
                >
                  {item.status === "scheduled" ? "予約済" : "推奨"}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/portal/maintenance">
                すべて見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
            {portalData.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(project.completedAt, "yyyy年M月d日", { locale: ja })}
                  </p>
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
              <Link href="/portal/certificates">
                施工証明を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">次回引落日</span>
                <span>{format(portalData.savings.nextPayment, "M月d日", { locale: ja })}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              積立履歴を見る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Shield className="h-6 w-6" />
              <span>NFTを確認</span>
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
