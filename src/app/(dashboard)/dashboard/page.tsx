"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";

export default function DashboardPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const { data, isLoading, isError } = useDashboard({ companyId });

  const dashboard = data?.data;

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

  // ローディング中のスケルトン
  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="text-muted-foreground">今月のサマリーと重要な指標</p>
          </div>
          <Button asChild>
            <Link href="/estimates/new">
              <FileText className="mr-2 h-4 w-4" />
              新規見積作成
            </Link>
          </Button>
        </div>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const { kpis, revenueData, topCustomers, alerts, quests, highlights, gamification } = dashboard;

  const completedQuests = quests.filter(q => q.completed).length;
  const questProgress = (completedQuests / quests.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground">今月のサマリーと重要な指標</p>
        </div>
        <Button asChild>
          <Link href="/estimates/new">
            <FileText className="mr-2 h-4 w-4" />
            新規見積作成
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(kpis.revenue.value / 1000000).toFixed(1)}M
            </div>
            <div className={`flex items-center text-xs ${kpis.revenue.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpis.revenue.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {kpis.revenue.change >= 0 ? "+" : ""}{kpis.revenue.change.toFixed(0)}% 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">粗利</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(kpis.profit.value / 1000000).toFixed(1)}M
            </div>
            <div className={`flex items-center text-xs ${kpis.profit.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpis.profit.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {kpis.profit.change >= 0 ? "+" : ""}{kpis.profit.change.toFixed(0)}% 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">受注率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.orderRate.value.toFixed(0)}%</div>
            <div className={`flex items-center text-xs ${kpis.orderRate.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpis.orderRate.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {kpis.orderRate.change >= 0 ? "+" : ""}{kpis.orderRate.change.toFixed(0)}pt 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完工数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completedProjects.value}件</div>
            <div className={`flex items-center text-xs ${kpis.completedProjects.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpis.completedProjects.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {kpis.completedProjects.change >= 0 ? "+" : ""}{kpis.completedProjects.change}件 前月比
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Rankings */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>売上推移</CardTitle>
            <CardDescription>過去5ヶ月の売上と粗利</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => `¥${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="売上"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="粗利"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rankings */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>ランキング</CardTitle>
            <CardDescription>顧客取引額TOP5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  データがありません
                </p>
              ) : (
                topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ¥{(customer.revenue / 10000).toFixed(0)}万
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="link" className="mt-4 w-full" asChild>
              <Link href="/customers">
                すべての顧客を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quests */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              要対応
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                対応が必要な項目はありません
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={alert.link}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    {alert.type === "warning" && (
                      <div className="h-2 w-2 mt-2 rounded-full bg-red-500" />
                    )}
                    {alert.type === "info" && (
                      <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                    )}
                    {alert.type === "success" && (
                      <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Quests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              今日のクエスト
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      quest.completed
                        ? "bg-green-500 border-green-500"
                        : "border-muted-foreground"
                    }`}
                  >
                    {quest.completed && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        quest.completed
                          ? "text-muted-foreground line-through"
                          : "font-medium"
                      }`}
                    >
                      {quest.title}
                    </p>
                  </div>
                  <Badge variant={quest.completed ? "secondary" : "default"}>
                    +{quest.xp} XP
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">今日の進捗</span>
              <span className="font-medium">{completedQuests}/{quests.length} 完了</span>
            </div>
            <Progress value={questProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>月間目標達成状況</CardTitle>
            <CardDescription>目標: ¥{(highlights.targetAchievement.target / 10000).toLocaleString()}万</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {highlights.targetAchievement.rate}%
                </span>
                <span className="text-sm text-muted-foreground">
                  ¥{(highlights.targetAchievement.actual / 10000).toLocaleString()}万 / ¥{(highlights.targetAchievement.target / 10000).toLocaleString()}万
                </span>
              </div>
              <Progress value={Math.min(highlights.targetAchievement.rate, 100)} className="h-3" />
              {highlights.targetAchievement.achieved && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/20 p-3 text-green-700 dark:text-green-400">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">月間目標を達成しました!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月のハイライト</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">新規顧客 {highlights.newCustomers}件獲得</p>
                <p className="text-sm text-muted-foreground">
                  今月の新規登録顧客数
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 p-4">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">{highlights.completedProjects}件完工</p>
                <p className="text-sm text-muted-foreground">
                  今月の完工プロジェクト数
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4">
              <Trophy className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-medium">レベル {gamification.level}</p>
                <p className="text-sm text-muted-foreground">
                  次のレベルまであと {gamification.xpToNextLevel} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
