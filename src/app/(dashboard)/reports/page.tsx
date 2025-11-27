"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  FileSpreadsheet,
  Loader2,
  BarChart3,
  PieChart,
  Activity,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ReportsPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const { data, isLoading } = useDashboard({ companyId });
  const [reportType, setReportType] = useState("monthly");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isExporting, setIsExporting] = useState(false);

  const dashboard = data?.data;

  // 売上構成（デモデータ）
  const revenueByCategory = [
    { name: "新築", value: 45 },
    { name: "リフォーム", value: 30 },
    { name: "メンテナンス", value: 15 },
    { name: "その他", value: 10 },
  ];

  // 顧客別売上（デモデータ）
  const customerRevenue = dashboard?.topCustomers?.map((c, i) => ({
    name: c.name,
    売上: c.revenue,
    fill: COLORS[i % COLORS.length],
  })) || [];

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // CSVデータ生成
      const headers = ["項目", "今月", "前月", "増減"];
      const rows = [
        ["売上", dashboard?.kpis.revenue.value || 0, "-", `${dashboard?.kpis.revenue.change?.toFixed(1) || 0}%`],
        ["粗利", dashboard?.kpis.profit.value || 0, "-", `${dashboard?.kpis.profit.change?.toFixed(1) || 0}%`],
        ["粗利率", `${dashboard?.kpis.profitRate.value?.toFixed(1) || 0}%`, "-", `${dashboard?.kpis.profitRate.change?.toFixed(1) || 0}pt`],
        ["平均単価", dashboard?.kpis.avgPrice.value || 0, "-", `${dashboard?.kpis.avgPrice.change?.toFixed(1) || 0}%`],
        ["受注率", `${dashboard?.kpis.orderRate.value?.toFixed(1) || 0}%`, "-", `${dashboard?.kpis.orderRate.change?.toFixed(1) || 0}pt`],
        ["完工数", dashboard?.kpis.completedProjects.value || 0, "-", `${dashboard?.kpis.completedProjects.change || 0}件`],
      ];

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // BOMを追加してExcelで文字化けしないようにする
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${dateRange.start}_${dateRange.end}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSVファイルをダウンロードしました");
    } catch {
      toast.error("エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF出力機能は開発中です");
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">レポート</h1>
          <p className="text-muted-foreground">経営分析・売上レポート出力</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            CSV出力
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF出力
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">レポート条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>レポート種別</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">月次レポート</SelectItem>
                  <SelectItem value="quarterly">四半期レポート</SelectItem>
                  <SelectItem value="yearly">年次レポート</SelectItem>
                  <SelectItem value="custom">カスタム期間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>開始日</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>終了日</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
            </div>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              適用
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            サマリー
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            売上分析
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            顧客分析
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            協力会社分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* KPI Summary Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">売上高</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ¥{((dashboard?.kpis.revenue.value || 0) / 10000).toLocaleString()}万
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.revenue.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.revenue.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.revenue.change?.toFixed(1)}% 前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">粗利高</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ¥{((dashboard?.kpis.profit.value || 0) / 10000).toLocaleString()}万
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.profit.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.profit.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.profit.change?.toFixed(1)}% 前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">粗利率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboard?.kpis.profitRate.value?.toFixed(1)}%
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.profitRate.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.profitRate.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.profitRate.change?.toFixed(1)}pt 前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">平均単価</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ¥{((dashboard?.kpis.avgPrice.value || 0) / 10000).toLocaleString()}万
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.avgPrice.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.avgPrice.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.avgPrice.change?.toFixed(1)}% 前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">受注率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboard?.kpis.orderRate.value?.toFixed(0)}%
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.orderRate.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.orderRate.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.orderRate.change?.toFixed(0)}pt 前月比
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">完工件数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboard?.kpis.completedProjects.value || 0}件
                </div>
                <div className={`flex items-center text-sm mt-1 ${
                  (dashboard?.kpis.completedProjects.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendingUp className="mr-1 h-4 w-4" />
                  {(dashboard?.kpis.completedProjects.change || 0) >= 0 ? "+" : ""}
                  {dashboard?.kpis.completedProjects.change}件 前月比
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>売上推移</CardTitle>
                <CardDescription>過去5ヶ月の売上・粗利推移</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboard?.revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                      <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" name="売上" fill="#3b82f6" />
                      <Bar dataKey="profit" name="粗利" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>売上構成</CardTitle>
                <CardDescription>カテゴリ別売上比率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Customer Revenue Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>顧客別売上ランキング</CardTitle>
                <CardDescription>取引額TOP5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerRevenue} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                      <Bar dataKey="売上" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>顧客統計</CardTitle>
                <CardDescription>顧客に関する主要指標</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">新規顧客数</p>
                      <p className="text-2xl font-bold">{dashboard?.highlights.newCustomers || 0}件</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">目標達成率</p>
                      <p className="text-2xl font-bold">{dashboard?.highlights.targetAchievement.rate || 0}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="partners">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Partner Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>協力会社別発注ランキング</CardTitle>
                <CardDescription>発注額TOP5</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboard?.topPartners?.map((p, i) => ({
                        name: p.name,
                        発注額: p.revenue,
                        fill: COLORS[i % COLORS.length],
                      })) || []}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                      <Bar dataKey="発注額" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Partner by Category */}
            <Card>
              <CardHeader>
                <CardTitle>協力会社カテゴリ別</CardTitle>
                <CardDescription>業種別の協力会社分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.topPartners?.map((partner, index) => (
                    <div key={partner.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-muted-foreground">{partner.category || "未分類"}</p>
                        </div>
                      </div>
                      <p className="font-medium">¥{(partner.revenue / 10000).toFixed(0)}万</p>
                    </div>
                  ))}
                  {(!dashboard?.topPartners || dashboard.topPartners.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">データがありません</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
