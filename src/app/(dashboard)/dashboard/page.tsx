"use client";

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
  Clock,
  ArrowRight,
  Trophy,
  Target,
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

// デモデータ
const revenueData = [
  { month: "7月", revenue: 8500000, profit: 2100000 },
  { month: "8月", revenue: 9200000, profit: 2400000 },
  { month: "9月", revenue: 11000000, profit: 2800000 },
  { month: "10月", revenue: 10500000, profit: 2700000 },
  { month: "11月", revenue: 12400000, profit: 3200000 },
];

const topCustomers = [
  { name: "山田太郎 様", revenue: 2400000 },
  { name: "佐藤建設 様", revenue: 1800000 },
  { name: "田中工務店 様", revenue: 1200000 },
  { name: "鈴木邸", revenue: 980000 },
  { name: "高橋商事 様", revenue: 850000 },
];

const topPartners = [
  { name: "ABC塗装", amount: 1500000 },
  { name: "山本電気工事", amount: 1200000 },
  { name: "中村設備", amount: 980000 },
  { name: "大和クロス", amount: 750000 },
  { name: "佐々木建材", amount: 620000 },
];

const alerts = [
  { id: 1, type: "warning", title: "見積#1234 山田邸", description: "有効期限まで2日", link: "/estimates/1234" },
  { id: 2, type: "info", title: "工事#5678 佐藤邸", description: "工程遅延の可能性", link: "/projects/5678" },
  { id: 3, type: "success", title: "請求#9012 田中邸", description: "入金確認待ち", link: "/projects/9012" },
];

const quests = [
  { id: 1, title: "見積を1件作成する", xp: 50, completed: false },
  { id: 2, title: "ログインボーナス獲得済み", xp: 10, completed: true },
  { id: 3, title: "顧客フォローアップ", xp: 30, completed: false },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground">今月のサマリーと重要な指標</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          新規見積作成
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
            <div className="text-2xl font-bold">¥12.4M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +18% 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">粗利</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥3.2M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12% 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">受注率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +5pt 前月比
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完工数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8件</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2件 前月比
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
            <CardDescription>今月の顧客TOP5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
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
              ))}
            </div>
            <Button variant="link" className="mt-4 w-full">
              すべてのランキングを見る
              <ArrowRight className="ml-2 h-4 w-4" />
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
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
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
                </div>
              ))}
            </div>
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
              <span className="font-medium">1/3 完了</span>
            </div>
            <Progress value={33} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Partner Rankings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>協力会社ランキング</CardTitle>
            <CardDescription>今月の発注金額TOP5</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPartners} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                    className="text-xs"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
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
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今月のハイライト</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium">月間受注目標達成！</p>
                <p className="text-sm text-muted-foreground">
                  目標1,000万円に対して1,240万円（124%）
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">新規顧客3件獲得</p>
                <p className="text-sm text-muted-foreground">
                  紹介経由2件、Web問合せ1件
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 p-4">
              <CheckCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">顧客満足度 4.8</p>
                <p className="text-sm text-muted-foreground">
                  今月完工した8件の平均評価
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
