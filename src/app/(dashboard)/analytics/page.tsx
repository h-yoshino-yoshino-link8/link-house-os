"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  Banknote,
  Target,
  Award,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// デモデータ - 月別売上・粗利
const monthlyData = [
  { month: "1月", sales: 4200000, cost: 2900000, profit: 1300000, projects: 3 },
  { month: "2月", sales: 3800000, cost: 2600000, profit: 1200000, projects: 2 },
  { month: "3月", sales: 5500000, cost: 3800000, profit: 1700000, projects: 4 },
  { month: "4月", sales: 4800000, cost: 3200000, profit: 1600000, projects: 3 },
  { month: "5月", sales: 6200000, cost: 4200000, profit: 2000000, projects: 5 },
  { month: "6月", sales: 5100000, cost: 3500000, profit: 1600000, projects: 4 },
  { month: "7月", sales: 4500000, cost: 3100000, profit: 1400000, projects: 3 },
  { month: "8月", sales: 3200000, cost: 2200000, profit: 1000000, projects: 2 },
  { month: "9月", sales: 5800000, cost: 3900000, profit: 1900000, projects: 4 },
  { month: "10月", sales: 6500000, cost: 4400000, profit: 2100000, projects: 5 },
  { month: "11月", sales: 5900000, cost: 4000000, profit: 1900000, projects: 4 },
  { month: "12月", sales: 4800000, cost: 3300000, profit: 1500000, projects: 3 },
];

// 顧客ランク分布
const customerRankData = [
  { name: "ダイヤモンド", value: 5, color: "#a855f7" },
  { name: "プラチナ", value: 12, color: "#06b6d4" },
  { name: "ゴールド", value: 28, color: "#eab308" },
  { name: "シルバー", value: 45, color: "#64748b" },
  { name: "メンバー", value: 66, color: "#9ca3af" },
];

// 工事種別売上
const projectTypeData = [
  { type: "外壁塗装", sales: 18500000, count: 12 },
  { type: "屋根工事", sales: 12300000, count: 8 },
  { type: "内装リフォーム", sales: 15800000, count: 15 },
  { type: "水回り", sales: 9200000, count: 10 },
  { type: "外構工事", sales: 5400000, count: 6 },
  { type: "その他", sales: 3100000, count: 5 },
];

// 担当者別パフォーマンス
const staffPerformance = [
  { name: "佐藤", sales: 24500000, projects: 18, profitRate: 32.5, target: 25000000 },
  { name: "田中", sales: 21800000, projects: 15, profitRate: 30.2, target: 22000000 },
  { name: "山本", sales: 18200000, projects: 14, profitRate: 28.8, target: 20000000 },
  { name: "鈴木", sales: 12300000, projects: 9, profitRate: 31.5, target: 15000000 },
];

// 受注率推移
const conversionData = [
  { month: "1月", estimates: 12, orders: 4, rate: 33.3 },
  { month: "2月", estimates: 10, orders: 3, rate: 30.0 },
  { month: "3月", estimates: 15, orders: 6, rate: 40.0 },
  { month: "4月", estimates: 11, orders: 4, rate: 36.4 },
  { month: "5月", estimates: 18, orders: 7, rate: 38.9 },
  { month: "6月", estimates: 14, orders: 5, rate: 35.7 },
  { month: "7月", estimates: 12, orders: 4, rate: 33.3 },
  { month: "8月", estimates: 8, orders: 2, rate: 25.0 },
  { month: "9月", estimates: 16, orders: 6, rate: 37.5 },
  { month: "10月", estimates: 20, orders: 8, rate: 40.0 },
  { month: "11月", estimates: 17, orders: 6, rate: 35.3 },
  { month: "12月", estimates: 13, orders: 4, rate: 30.8 },
];

// KPIデータ
const kpiData = {
  totalSales: 60300000,
  salesGrowth: 12.5,
  totalProfit: 18200000,
  profitRate: 30.2,
  totalProjects: 42,
  projectGrowth: 8.3,
  avgProjectValue: 1435714,
  repeatRate: 42,
  repeatGrowth: 5.2,
  conversionRate: 35.2,
  conversionGrowth: 2.1,
  customerCount: 156,
  newCustomers: 28,
};

const COLORS = ["#a855f7", "#06b6d4", "#eab308", "#64748b", "#9ca3af"];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("year");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">分析ダッシュボード</h1>
          <p className="text-muted-foreground">経営指標・パフォーマンス分析</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="期間" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">今月</SelectItem>
              <SelectItem value="quarter">四半期</SelectItem>
              <SelectItem value="year">今年度</SelectItem>
              <SelectItem value="all">全期間</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            期間指定
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                総売上
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(kpiData.totalSales / 10000).toLocaleString()}万
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{kpiData.salesGrowth}% 前年比</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                粗利率
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpiData.profitRate}%</div>
            <div className="text-xs text-muted-foreground">
              粗利額: ¥{(kpiData.totalProfit / 10000).toLocaleString()}万
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                完工件数
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalProjects}件</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{kpiData.projectGrowth}% 前年比</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                受注率
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.conversionRate}%</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{kpiData.conversionGrowth}% 前年比</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均受注単価
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">¥{kpiData.avgProjectValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              リピート率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">{kpiData.repeatRate}%</div>
              <Badge variant="outline" className="text-green-600">
                +{kpiData.repeatGrowth}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              顧客数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{kpiData.customerCount}人</div>
            <p className="text-xs text-muted-foreground">新規: +{kpiData.newCustomers}人</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">売上・粗利</TabsTrigger>
          <TabsTrigger value="conversion">受注分析</TabsTrigger>
          <TabsTrigger value="customers">顧客分析</TabsTrigger>
          <TabsTrigger value="staff">担当者分析</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Monthly Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>月別売上・粗利推移</CardTitle>
                <CardDescription>売上と粗利の月次推移</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value / 10000}万`} />
                      <Tooltip
                        formatter={(value: number) => [`¥${value.toLocaleString()}`, ""]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="売上"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name="粗利"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Count Chart */}
            <Card>
              <CardHeader>
                <CardTitle>月別完工件数</CardTitle>
                <CardDescription>月ごとの完工案件数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projects" name="完工件数" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Type Sales */}
          <Card>
            <CardHeader>
              <CardTitle>工事種別売上</CardTitle>
              <CardDescription>工事種別ごとの売上と件数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `${value / 10000}万`} />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip
                      formatter={(value: number) => [`¥${value.toLocaleString()}`, "売上"]}
                    />
                    <Bar dataKey="sales" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Conversion Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>受注率推移</CardTitle>
                <CardDescription>見積から受注への転換率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 50]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value: number) => [`${value}%`, "受注率"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        name="受注率"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: "#22c55e" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Estimates vs Orders */}
            <Card>
              <CardHeader>
                <CardTitle>見積・受注件数</CardTitle>
                <CardDescription>月別の見積件数と受注件数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="estimates" name="見積件数" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="orders" name="受注件数" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Customer Rank Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>顧客ランク分布</CardTitle>
                <CardDescription>ランク別の顧客数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerRankData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}人`}
                      >
                        {customerRankData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}人`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>顧客指標</CardTitle>
                <CardDescription>顧客関連の重要指標</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">リピート率</span>
                    <span className="font-bold">{kpiData.repeatRate}%</span>
                  </div>
                  <Progress value={kpiData.repeatRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">紹介率</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">積立加入率</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">顧客満足度</span>
                    <span className="font-bold">4.6 / 5.0</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>担当者別パフォーマンス</CardTitle>
              <CardDescription>担当者ごとの売上・目標達成状況</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>担当者</TableHead>
                    <TableHead className="text-right">売上</TableHead>
                    <TableHead className="text-right">目標</TableHead>
                    <TableHead>達成率</TableHead>
                    <TableHead className="text-right">完工件数</TableHead>
                    <TableHead className="text-right">平均粗利率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffPerformance.map((staff) => {
                    const achievementRate = (staff.sales / staff.target) * 100;
                    return (
                      <TableRow key={staff.name}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{staff.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{(staff.sales / 10000).toLocaleString()}万
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ¥{(staff.target / 10000).toLocaleString()}万
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(achievementRate, 100)}
                              className="h-2 w-20"
                            />
                            <span
                              className={`text-sm font-medium ${
                                achievementRate >= 100
                                  ? "text-green-600"
                                  : achievementRate >= 80
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {achievementRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{staff.projects}件</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              staff.profitRate >= 30
                                ? "text-green-600"
                                : staff.profitRate >= 25
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {staff.profitRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Staff Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>担当者別売上比較</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value / 10000}万`} />
                    <Tooltip
                      formatter={(value: number) => [`¥${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="sales" name="売上実績" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="目標" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
