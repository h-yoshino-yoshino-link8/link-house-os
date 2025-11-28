"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Home,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Plus,
  ExternalLink,
  FileText,
  Activity,
  Layers,
  Edit,
  Shield,
  RefreshCw,
} from "lucide-react";
import { STRUCTURE_TYPES, COMPONENT_CATEGORIES } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useHouse } from "@/hooks/use-houses";
import { useHouseComponents, useRecalculateHealthScore } from "@/hooks/use-house-components";
import { useMaintenance } from "@/hooks/use-maintenance";

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-lime-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800" };
  if (score >= 70) return { label: "Good", color: "bg-lime-100 text-lime-800" };
  if (score >= 50) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
  if (score >= 30) return { label: "Poor", color: "bg-orange-100 text-orange-800" };
  return { label: "Critical", color: "bg-red-100 text-red-800" };
};

const getConditionStatus = (score: number) => {
  if (score >= 90) return "good";
  if (score >= 70) return "fair";
  if (score >= 50) return "warning";
  return "critical";
};

const statusColors: Record<string, string> = {
  good: "bg-green-100 text-green-800",
  fair: "bg-yellow-100 text-yellow-800",
  warning: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  good: "良好",
  fair: "経過観察",
  warning: "注意",
  critical: "要対応",
};

const categoryToJapanese: Record<string, string> = {
  roof: "屋根",
  exterior: "外壁",
  interior: "内装",
  equipment: "設備",
  electrical: "電気",
  plumbing: "給排水",
};

export default function HouseDetailPage() {
  const params = useParams();
  const houseId = params.id as string;

  // API hooks
  const { data: houseData, isLoading: houseLoading, error: houseError } = useHouse(houseId);
  const { data: componentsData, isLoading: componentsLoading } = useHouseComponents(houseId);
  const { data: maintenanceData, isLoading: maintenanceLoading } = useMaintenance(houseId);
  const recalculateMutation = useRecalculateHealthScore(houseId);

  const house = houseData?.data;
  const components = componentsData?.data || [];
  const maintenanceRecs = maintenanceData?.data || [];

  // Generate radar chart data from components
  const radarData = useMemo(() => {
    const categoryScores: Record<string, { total: number; count: number }> = {};

    components.forEach((comp) => {
      if (!categoryScores[comp.category]) {
        categoryScores[comp.category] = { total: 0, count: 0 };
      }
      categoryScores[comp.category].total += comp.conditionScore;
      categoryScores[comp.category].count += 1;
    });

    return Object.entries(categoryScores).map(([category, { total, count }]) => ({
      subject: categoryToJapanese[category] || category,
      score: Math.round(total / count),
      fullMark: 100,
    }));
  }, [components]);

  // Map alerts from maintenance recommendations
  const alerts = useMemo(() => {
    return maintenanceRecs
      .filter((rec) => !rec.isResolved)
      .map((rec) => ({
        id: rec.id,
        level: rec.riskLevel,
        category: rec.component?.category || "general",
        message: rec.description,
        createdAt: new Date(rec.createdAt),
      }));
  }, [maintenanceRecs]);

  if (houseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (houseError || !house) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">物件が見つかりません</h2>
        <p className="text-muted-foreground mb-4">指定された物件は存在しないか、アクセス権限がありません。</p>
        <Button asChild>
          <Link href="/houses">物件一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  const healthLabel = getScoreLabel(house.healthScore);
  const builtYear = house.builtYear || new Date().getFullYear();
  const age = new Date().getFullYear() - builtYear;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/houses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{house.customer?.name || "不明"}邸</h1>
              <Badge className={healthLabel.color}>
                {healthLabel.label}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {house.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${recalculateMutation.isPending ? "animate-spin" : ""}`} />
            スコア再計算
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              健康スコア
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(house.healthScore)}`}>
              {house.healthScore}
            </div>
            <Progress value={house.healthScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              築年数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {age}年
            </div>
            <p className="text-xs text-muted-foreground">
              {builtYear}年築
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              部材数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {house._count?.components || components.length}
            </div>
            <p className="text-xs text-muted-foreground">
              登録済み部材
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工証明NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{house._count?.workCertificates || 0}件</div>
            <p className="text-xs text-muted-foreground">
              ブロックチェーン記録済
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              アラート（{alerts.length}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-md p-3 ${
                  alert.level === "high"
                    ? "bg-red-100 text-red-800"
                    : alert.level === "medium"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{alert.message}</span>
                </div>
                <Button variant="ghost" size="sm">
                  対応する
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="components">部材状態</TabsTrigger>
          <TabsTrigger value="projects">工事履歴</TabsTrigger>
          <TabsTrigger value="nfts">施工証明NFT</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* House Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  物件情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">所有者</span>
                  <Link href={`/customers/${house.customerId}`} className="font-medium hover:underline">
                    {house.customer?.name || "不明"} 様
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <span>{house.address}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">構造</span>
                  <span>{house.structureType ? STRUCTURE_TYPES[house.structureType as keyof typeof STRUCTURE_TYPES] || house.structureType : "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">階数</span>
                  <span>{house.floors ? `${house.floors}階建て` : "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">延床面積</span>
                  <span>{house.totalArea ? `${house.totalArea}㎡` : "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">築年</span>
                  <span>{house.builtYear ? `${house.builtYear}年` : "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">建築会社</span>
                  <span>{house.builder || "-"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Health Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  部材別健康スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                {componentsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                  </div>
                ) : radarData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
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
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    部材が登録されていません
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    部材状態一覧
                  </CardTitle>
                  <CardDescription>各部材の健康状態とメンテナンス予定</CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  部材追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {componentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : components.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead>部材名</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>スコア</TableHead>
                      <TableHead>設置日</TableHead>
                      <TableHead>保証期限</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {components.map((component) => {
                      const status = getConditionStatus(component.conditionScore);
                      return (
                        <TableRow key={component.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {COMPONENT_CATEGORIES[component.category as keyof typeof COMPONENT_CATEGORIES]?.label || component.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {component.productName || component.subcategory || component.category}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[status]}>
                              {statusLabels[status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${getScoreColor(component.conditionScore)}`}>
                                {component.conditionScore}
                              </span>
                              <Progress value={component.conditionScore} className="h-2 w-16" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {component.installedDate
                              ? formatDate(component.installedDate, "yyyy/M/d")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {component.warrantyExpires ? (
                              <span
                                className={
                                  new Date(component.warrantyExpires) < new Date()
                                    ? "text-red-600 font-medium"
                                    : ""
                                }
                              >
                                {formatDate(component.warrantyExpires, "yyyy/M/d")}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  部材が登録されていません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                工事履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              {house.projects && house.projects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>案件番号</TableHead>
                      <TableHead>工事名</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>完了日</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {house.projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-sm">{project.projectNumber}</TableCell>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              project.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : project.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {project.status === "paid"
                              ? "入金済"
                              : project.status === "completed"
                              ? "完了"
                              : project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.endDate ? formatDate(project.endDate, "yyyy/M/d") : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {project.contractAmount
                            ? `¥${project.contractAmount.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  工事履歴がありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NFTs Tab */}
        <TabsContent value="nfts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                施工証明NFT
              </CardTitle>
              <CardDescription>ブロックチェーンに記録された施工証明</CardDescription>
            </CardHeader>
            <CardContent>
              {house.workCertificates && house.workCertificates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {house.workCertificates.map((cert) => (
                    <Card key={cert.id} className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Shield className="h-16 w-16 text-white/80" />
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{cert.workType}</p>
                          <Badge variant="outline">
                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                            認証済
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          施工日: {formatDate(cert.workDate, "yyyy/M/d")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          施工業者: {cert.contractorName}
                        </p>
                        {cert.nftTokenId && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            Token: {cert.nftTokenId}
                          </p>
                        )}
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-3 w-3" />
                          ブロックチェーンで確認
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  施工証明NFTがありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
