"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { format, addYears } from "date-fns";
import { ja } from "date-fns/locale";
import { COMPONENT_CATEGORIES } from "@/constants";

// デモデータ
const maintenanceData = {
  components: [
    {
      id: "1",
      category: "roof",
      name: "屋根（コロニアル）",
      score: 75,
      lastMaintenance: new Date("2020-05-10"),
      nextRecommended: new Date("2025-05-10"),
      status: "fair" as const,
    },
    {
      id: "2",
      category: "exterior",
      name: "外壁（サイディング）",
      score: 68,
      lastMaintenance: new Date("2019-08-20"),
      nextRecommended: new Date("2024-08-20"),
      status: "warning" as const,
    },
    {
      id: "3",
      category: "interior",
      name: "内装（クロス）",
      score: 90,
      lastMaintenance: new Date("2022-03-15"),
      nextRecommended: new Date("2032-03-15"),
      status: "good" as const,
    },
    {
      id: "4",
      category: "equipment",
      name: "給湯器",
      score: 45,
      lastMaintenance: new Date("2015-04-01"),
      nextRecommended: new Date("2025-04-01"),
      status: "critical" as const,
    },
    {
      id: "5",
      category: "electrical",
      name: "分電盤",
      score: 88,
      lastMaintenance: new Date("2020-11-10"),
      nextRecommended: new Date("2030-11-10"),
      status: "good" as const,
    },
    {
      id: "6",
      category: "plumbing",
      name: "給排水管",
      score: 72,
      lastMaintenance: new Date("2018-06-20"),
      nextRecommended: new Date("2028-06-20"),
      status: "fair" as const,
    },
  ],
  history: [
    {
      id: "1",
      date: new Date("2022-03-15"),
      category: "interior",
      description: "クロス張替え（全室）",
      cost: 450000,
      contractor: "○○内装",
    },
    {
      id: "2",
      date: new Date("2020-11-10"),
      category: "electrical",
      description: "分電盤交換",
      cost: 180000,
      contractor: "△△電気",
    },
    {
      id: "3",
      date: new Date("2020-05-10"),
      category: "roof",
      description: "屋根塗装",
      cost: 580000,
      contractor: "□□塗装",
    },
    {
      id: "4",
      date: new Date("2019-08-20"),
      category: "exterior",
      description: "外壁塗装",
      cost: 1200000,
      contractor: "□□塗装",
    },
  ],
  recommendations: [
    {
      id: "1",
      level: "high",
      category: "equipment",
      description: "給湯器の交換を推奨します",
      action: "耐用年数を超えています。故障前の計画的な交換をおすすめします。",
      estimatedCost: { min: 150000, max: 300000 },
    },
    {
      id: "2",
      level: "medium",
      category: "exterior",
      description: "外壁塗装を推奨します",
      action: "前回の塗装から5年が経過しています。2年以内の再塗装を計画してください。",
      estimatedCost: { min: 800000, max: 1500000 },
    },
  ],
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

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-lime-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
};

export default function PortalMaintenancePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">メンテナンス管理</h1>
        <p className="text-muted-foreground">
          お家の部材状態とメンテナンス履歴を確認できます
        </p>
      </div>

      {/* Recommendations */}
      {maintenanceData.recommendations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              メンテナンス推奨
            </CardTitle>
            <CardDescription>専門家からの推奨事項</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceData.recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-lg p-4 ${
                  rec.level === "high"
                    ? "bg-red-100"
                    : rec.level === "medium"
                    ? "bg-orange-100"
                    : "bg-yellow-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          rec.level === "high"
                            ? "bg-red-600"
                            : rec.level === "medium"
                            ? "bg-orange-600"
                            : "bg-yellow-600"
                        }
                      >
                        {rec.level === "high"
                          ? "緊急"
                          : rec.level === "medium"
                          ? "推奨"
                          : "情報"}
                      </Badge>
                      <Badge variant="outline">
                        {COMPONENT_CATEGORIES[rec.category as keyof typeof COMPONENT_CATEGORIES]?.label}
                      </Badge>
                    </div>
                    <p className="mt-2 font-medium">{rec.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.action}</p>
                    <p className="mt-2 text-sm font-medium">
                      概算費用: ¥{rec.estimatedCost.min.toLocaleString()} 〜 ¥{rec.estimatedCost.max.toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm">見積を依頼</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">部材状態</TabsTrigger>
          <TabsTrigger value="history">メンテナンス履歴</TabsTrigger>
          <TabsTrigger value="schedule">予定</TabsTrigger>
        </TabsList>

        {/* Component Status */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                部材状態一覧
              </CardTitle>
              <CardDescription>各部材の現在の状態</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>部材名</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>スコア</TableHead>
                    <TableHead>前回メンテ</TableHead>
                    <TableHead>次回推奨</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.components.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {COMPONENT_CATEGORIES[component.category as keyof typeof COMPONENT_CATEGORIES]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[component.status]}>
                          {statusLabels[component.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(component.score)}`}>
                            {component.score}
                          </span>
                          <Progress value={component.score} className="h-2 w-16" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(component.lastMaintenance, "yyyy/M/d")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            component.nextRecommended < new Date()
                              ? "font-medium text-red-600"
                              : ""
                          }
                        >
                          {format(component.nextRecommended, "yyyy/M/d")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                メンテナンス履歴
              </CardTitle>
              <CardDescription>過去のメンテナンス記録</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>施工業者</TableHead>
                    <TableHead className="text-right">費用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceData.history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(item.date, "yyyy/M/d")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {COMPONENT_CATEGORIES[item.category as keyof typeof COMPONENT_CATEGORIES]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.contractor}</TableCell>
                      <TableCell className="text-right">
                        ¥{item.cost.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                メンテナンス予定
              </CardTitle>
              <CardDescription>推奨されるメンテナンスのスケジュール</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceData.components
                  .filter((c) => c.nextRecommended <= addYears(new Date(), 2))
                  .sort((a, b) => a.nextRecommended.getTime() - b.nextRecommended.getTime())
                  .map((component) => (
                    <div
                      key={component.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        {component.nextRecommended < new Date() ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{component.name}</p>
                          <p className="text-sm text-muted-foreground">
                            推奨時期: {format(component.nextRecommended, "yyyy年M月", { locale: ja })}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        見積依頼
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
