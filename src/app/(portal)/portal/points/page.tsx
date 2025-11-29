"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Gift,
  Star,
  Award,
  TrendingUp,
  Share2,
  MessageSquare,
  Heart,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const pointsData = {
  account: {
    currentPoints: 2500,
    lifetimePoints: 8500,
    rank: "gold" as const,
    nextRank: "platinum" as const,
    pointsToNextRank: 1500,
    rankProgress: 62.5,
  },
  history: [
    { id: "1", date: new Date("2024-11-20"), type: "earn", amount: 500, description: "工事完了ボーナス", balance: 2500 },
    { id: "2", date: new Date("2024-10-15"), type: "earn", amount: 100, description: "アンケート回答", balance: 2000 },
    { id: "3", date: new Date("2024-09-01"), type: "redeem", amount: -1000, description: "工事代金値引き", balance: 1900 },
    { id: "4", date: new Date("2024-08-10"), type: "earn", amount: 1000, description: "紹介成約ボーナス", balance: 2900 },
    { id: "5", date: new Date("2024-06-15"), type: "earn", amount: 300, description: "レビュー投稿", balance: 1900 },
    { id: "6", date: new Date("2024-05-01"), type: "earn", amount: 500, description: "お誕生日ボーナス", balance: 1600 },
  ],
  rewards: [
    {
      id: "1",
      name: "工事代金 1,000円引き",
      points: 1000,
      description: "次回工事時に使用可能",
      category: "discount",
    },
    {
      id: "2",
      name: "工事代金 3,000円引き",
      points: 2500,
      description: "次回工事時に使用可能",
      category: "discount",
    },
    {
      id: "3",
      name: "ハウスクリーニング",
      points: 5000,
      description: "水回り3点セット",
      category: "service",
    },
    {
      id: "4",
      name: "エアコンクリーニング",
      points: 3000,
      description: "1台分",
      category: "service",
    },
  ],
  earnMethods: [
    { icon: Star, title: "工事契約", description: "契約金額の1%", example: "100万円で1,000pt" },
    { icon: Share2, title: "ご紹介", description: "成約金額の2%", example: "100万円で2,000pt" },
    { icon: MessageSquare, title: "レビュー投稿", description: "写真付きで", example: "300〜500pt" },
    { icon: Heart, title: "アンケート回答", description: "簡単なアンケート", example: "100pt" },
  ],
};

const rankConfig = {
  member: { label: "メンバー", color: "bg-gray-100 text-gray-800", icon: Star, minPoints: 0 },
  silver: { label: "シルバー", color: "bg-slate-200 text-slate-800", icon: Award, minPoints: 1000 },
  gold: { label: "ゴールド", color: "bg-amber-100 text-amber-800", icon: Award, minPoints: 3000 },
  platinum: { label: "プラチナ", color: "bg-purple-100 text-purple-800", icon: Crown, minPoints: 5000 },
  diamond: { label: "ダイヤモンド", color: "bg-cyan-100 text-cyan-800", icon: Crown, minPoints: 10000 },
};

export default function PortalPointsPage() {
  const currentRank = rankConfig[pointsData.account.rank];
  const nextRank = rankConfig[pointsData.account.nextRank];
  const RankIcon = currentRank.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ポイント・特典</h1>
        <p className="text-muted-foreground">
          貯めたポイントでお得な特典と交換できます
        </p>
      </div>

      {/* Points Balance */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={currentRank.color}>
                  <RankIcon className="mr-1 h-3 w-3" />
                  {currentRank.label}会員
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">保有ポイント</p>
                <p className="text-4xl font-bold text-amber-700">
                  {pointsData.account.currentPoints.toLocaleString()}
                  <span className="text-lg font-normal ml-1">pt</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                累計獲得: {pointsData.account.lifetimePoints.toLocaleString()}pt
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-4 min-w-[200px]">
              <p className="text-sm text-muted-foreground mb-2">
                次のランク: {nextRank.label}
              </p>
              <Progress value={pointsData.account.rankProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground text-right">
                あと {pointsData.account.pointsToNextRank.toLocaleString()}pt
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ポイントの貯め方
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pointsData.earnMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border p-4 text-center hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                  <p className="font-medium">{method.title}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                  <p className="text-xs text-amber-600 mt-1">{method.example}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            交換できる特典
          </CardTitle>
          <CardDescription>ポイントを使ってお得な特典と交換</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {pointsData.rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">{reward.points.toLocaleString()}pt</p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pointsData.account.currentPoints < reward.points}
                  >
                    交換する
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Share2 className="h-10 w-10 text-green-600" />
              <div>
                <p className="font-bold text-green-800">お友達紹介キャンペーン</p>
                <p className="text-sm text-green-700">
                  ご紹介で成約すると、成約金額の2%をポイントでプレゼント！
                </p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              紹介コードを発行
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Point History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            ポイント履歴
          </CardTitle>
          <CardDescription>獲得・利用の履歴</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="text-right">ポイント</TableHead>
                <TableHead className="text-right">残高</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointsData.history.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(tx.date, "yyyy/M/d")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "earn" ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                      {tx.description}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}pt
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.balance.toLocaleString()}pt
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rank Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ランク別特典</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(rankConfig).map(([key, rank]) => {
              const Icon = rank.icon;
              const isCurrentRank = key === pointsData.account.rank;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-3 text-center ${
                    isCurrentRank ? "border-amber-400 bg-amber-50" : ""
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-1 ${isCurrentRank ? "text-amber-600" : "text-muted-foreground"}`} />
                  <Badge className={rank.color}>{rank.label}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rank.minPoints.toLocaleString()}pt〜
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
