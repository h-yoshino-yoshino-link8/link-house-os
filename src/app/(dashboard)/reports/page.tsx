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
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  FileSpreadsheet,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useReports } from "@/hooks/use-reports";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const rankColors: Record<string, string> = {
  member: "#9ca3af",
  silver: "#94a3b8",
  gold: "#fbbf24",
  platinum: "#a855f7",
  diamond: "#06b6d4",
};

const rankLabels: Record<string, string> = {
  member: "メンバー",
  silver: "シルバー",
  gold: "ゴールド",
  platinum: "プラチナ",
  diamond: "ダイヤモンド",
};

export default function ReportsPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isExporting, setIsExporting] = useState(false);

  const { data: reportData, isLoading } = useReports({
    companyId,
    year: selectedYear,
  });

  const handleExportCSV = async () => {
    if (!reportData) return;
    setIsExporting(true);
    try {
      const headers = ["月", "売上", "原価", "粗利", "粗利率", "完工数"];
      const rows = reportData.monthlyRevenue.map((m) => [
        m.monthLabel,
        m.revenue,
        m.cost,
        m.profit,
        `${m.profitRate.toFixed(1)}%`,
        m.projectCount,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${selectedYear}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSVファイルをダウンロードしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const summary = reportData?.summary;
  const monthlyRevenue = reportData?.monthlyRevenue || [];
  const estimateStatus = reportData?.estimateStatusDistribution;
  const customerRanks = reportData?.customerRankDistribution;
  const activeProjects = reportData?.activeProjects || [];

  // 見積ステータスの円グラフデータ
  const estimateStatusData = estimateStatus
    ? [
        { name: "下書き", value: estimateStatus.draft, color: "#9ca3af" },
        { name: "提出済", value: estimateStatus.submitted, color: "#3b82f6" },
        { name: "成約", value: estimateStatus.ordered, color: "#22c55e" },
        { name: "失注", value: estimateStatus.lost, color: "#ef4444" },
      ]
    : [];

  // 顧客ランク分布データ
  const customerRankData = customerRanks
    ? Object.entries(customerRanks).map(([rank, count]) => ({
        name: rankLabels[rank] || rank,
        value: count,
        color: rankColors[rank] || "#9ca3af",
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">レポート・分析</h1>
          <p className="text-muted-foreground">経営分析・売上レポート</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            CSV出力
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間売上</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{((summary?.revenue || 0) / 10000).toLocaleString()}万
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {(summary?.revenueGrowth || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={(summary?.revenueGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {(summary?.revenueGrowth || 0) >= 0 ? "+" : ""}
                {summary?.revenueGrowth?.toFixed(1)}%
              </span>
              <span className="ml-1">前年比</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">年間粗利</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ¥{((summary?.profit || 0) / 10000).toLocaleString()}万
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              粗利率: {summary?.profitRate?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">見積成約率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.conversionRate?.toFixed(0)}%</div>
            <Progress value={summary?.conversionRate || 0} className="mt-2 h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {summary?.estimateCount}件中 {estimateStatus?.ordered}件成約
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完工件数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.projectCount}件</div>
            <div className="text-xs text-muted-foreground mt-1">
              顧客数: {summary?.customerCount}社
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            売上分析
          </TabsTrigger>
          <TabsTrigger value="estimates" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            見積分析
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            顧客分析
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            進行中工事
          </TabsTrigger>
        </TabsList>

        {/* 売上分析タブ */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 月別売上推移 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>月別売上・粗利推移</CardTitle>
                <CardDescription>{selectedYear}年の月別売上と粗利の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                      <Tooltip
                        formatter={(v: number) => `¥${v.toLocaleString()}`}
                        labelStyle={{ color: "#000" }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
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

            {/* 月別粗利率 */}
            <Card>
              <CardHeader>
                <CardTitle>月別粗利率推移</CardTitle>
                <CardDescription>各月の粗利率（%）</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                      <Line
                        type="monotone"
                        dataKey="profitRate"
                        name="粗利率"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: "#f59e0b" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 月別完工数 */}
            <Card>
              <CardHeader>
                <CardTitle>月別完工件数</CardTitle>
                <CardDescription>各月の完工プロジェクト数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthLabel" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projectCount" name="完工数" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 見積分析タブ */}
        <TabsContent value="estimates" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 見積ステータス分布 */}
            <Card>
              <CardHeader>
                <CardTitle>見積ステータス分布</CardTitle>
                <CardDescription>見積の状態別件数</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={estimateStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}件`}
                      >
                        {estimateStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 見積KPI */}
            <Card>
              <CardHeader>
                <CardTitle>見積パフォーマンス</CardTitle>
                <CardDescription>見積に関する主要指標</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">総見積数</p>
                      <p className="text-2xl font-bold">{summary?.estimateCount}件</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">成約数</p>
                      <p className="text-2xl font-bold">{estimateStatus?.ordered}件</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {summary?.conversionRate?.toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">検討中</p>
                      <p className="text-2xl font-bold">{estimateStatus?.submitted}件</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">失注</p>
                      <p className="text-2xl font-bold">{estimateStatus?.lost}件</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 顧客分析タブ */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* 顧客ランク分布 */}
            <Card>
              <CardHeader>
                <CardTitle>顧客ランク分布</CardTitle>
                <CardDescription>顧客のランク別分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={customerRankData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}人`}
                      >
                        {customerRankData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 顧客ランク詳細 */}
            <Card>
              <CardHeader>
                <CardTitle>ランク別顧客数</CardTitle>
                <CardDescription>各ランクの顧客数と比率</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerRankData.map((rank) => {
                  const total = customerRankData.reduce((sum, r) => sum + r.value, 0);
                  const percentage = total > 0 ? (rank.value / total) * 100 : 0;
                  return (
                    <div key={rank.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: rank.color }}
                          />
                          <span className="font-medium">{rank.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {rank.value}人 ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 優良顧客ランキング */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>優良顧客ランキング</CardTitle>
                <CardDescription>累計取引額TOP5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.topCustomers?.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name || `顧客 ${customer.id.slice(0, 8)}`}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold">
                        ¥{(customer.totalTransaction / 10000).toLocaleString()}万
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 進行中工事タブ */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>進行中の工事</CardTitle>
              <CardDescription>現在進行中のプロジェクト一覧</CardDescription>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  進行中の工事はありません
                </div>
              ) : (
                <div className="space-y-4">
                  {activeProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          契約額: ¥{(project.contractAmount / 10000).toLocaleString()}万
                        </p>
                      </div>
                      <div className="text-right">
                        {project.daysRemaining !== null && (
                          <Badge
                            variant={project.daysRemaining <= 7 ? "destructive" : "secondary"}
                          >
                            {project.daysRemaining <= 0 ? (
                              <>
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                期限超過
                              </>
                            ) : (
                              <>残り{project.daysRemaining}日</>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
