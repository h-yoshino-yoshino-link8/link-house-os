"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Home,
  MapPin,
  Calendar,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Shield,
  Wrench,
  Building,
  Loader2,
} from "lucide-react";
import { STRUCTURE_TYPES } from "@/constants";
import { useHouses } from "@/hooks/use-houses";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import type { House } from "@/lib/api/types";

const getHealthScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-lime-600";
  if (score >= 50) return "text-yellow-600";
  if (score >= 30) return "text-orange-600";
  return "text-red-600";
};

const getHealthScoreLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800" };
  if (score >= 70) return { label: "Good", color: "bg-lime-100 text-lime-800" };
  if (score >= 50) return { label: "Fair", color: "bg-yellow-100 text-yellow-800" };
  if (score >= 30) return { label: "Poor", color: "bg-orange-100 text-orange-800" };
  return { label: "Critical", color: "bg-red-100 text-red-800" };
};

export default function HousesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ストアからcompanyIdを取得
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  // 健康スコアフィルター設定
  const getHealthRange = (filter: string) => {
    switch (filter) {
      case "excellent": return { min: 90, max: 100 };
      case "good": return { min: 70, max: 89 };
      case "fair": return { min: 50, max: 69 };
      case "poor": return { min: 30, max: 49 };
      case "critical": return { min: 0, max: 29 };
      default: return { min: undefined, max: undefined };
    }
  };

  const healthRange = getHealthRange(healthFilter);

  // 物件一覧を取得
  const { data, isLoading, isError } = useHouses({
    companyId,
    search: search || undefined,
    healthScoreMin: healthRange.min,
    healthScoreMax: healthRange.max,
    page,
    limit: 20,
  });

  const houses = data?.data ?? [];
  const pagination = data?.pagination;

  // 統計情報の計算
  const stats = useMemo(() => {
    if (!houses.length) {
      return {
        total: pagination?.total ?? 0,
        avgHealthScore: 0,
        criticalCount: 0,
        nftCount: 0,
      };
    }
    const avgHealthScore = houses.reduce((sum, h) => sum + h.healthScore, 0) / houses.length;
    const criticalCount = houses.filter((h) => h.healthScore < 50).length;
    const nftCount = houses.reduce((sum, h) => sum + (h._count?.workCertificates ?? 0), 0);
    return {
      total: pagination?.total ?? houses.length,
      avgHealthScore: Math.round(avgHealthScore),
      criticalCount,
      nftCount,
    };
  }, [houses, pagination]);

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HOUSE DNA</h1>
          <p className="text-muted-foreground">家のデジタルツイン・健康管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規物件登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新規物件登録</DialogTitle>
              <DialogDescription>
                物件情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>顧客</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="顧客を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">山田太郎 様</SelectItem>
                    <SelectItem value="2">佐藤建設 様</SelectItem>
                    <SelectItem value="3">田中花子 様</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>住所</Label>
                <Input placeholder="東京都渋谷区○○1-2-3" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>構造</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STRUCTURE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>階数</Label>
                  <Input type="number" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label>延床面積（㎡）</Label>
                  <Input type="number" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>築年</Label>
                  <Input type="number" placeholder="2010" />
                </div>
                <div className="space-y-2">
                  <Label>建築会社</Label>
                  <Input placeholder="○○ハウス" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                登録
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              管理物件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}件</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均健康スコア
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className={`text-2xl font-bold ${getHealthScoreColor(stats.avgHealthScore)}`}>
                {stats.avgHealthScore}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              要対応物件
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}件</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工証明NFT発行数
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.nftCount}件</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="住所・顧客名で検索..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={healthFilter}
          onValueChange={(value) => {
            setHealthFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="健康状態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="excellent">Excellent (90+)</SelectItem>
            <SelectItem value="good">Good (70-89)</SelectItem>
            <SelectItem value="fair">Fair (50-69)</SelectItem>
            <SelectItem value="poor">Poor (30-49)</SelectItem>
            <SelectItem value="critical">Critical (0-29)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* House Cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : houses.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">物件が見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {houses.map((house) => {
            const healthLabel = getHealthScoreLabel(house.healthScore);
            const maintenanceCount = house._count?.maintenanceRecs ?? 0;
            const nftCount = house._count?.workCertificates ?? 0;
            return (
              <Card key={house.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Home className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <Link href={`/houses/${house.id}`}>
                          <CardTitle className="text-lg hover:underline cursor-pointer">
                            {house.customer?.name ?? "不明"}邸
                          </CardTitle>
                        </Link>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {house.address}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getHealthScoreColor(house.healthScore)}`}>
                        {house.healthScore}
                      </div>
                      <Badge className={healthLabel.color}>{healthLabel.label}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* House Info */}
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {house.structureType ? STRUCTURE_TYPES[house.structureType as keyof typeof STRUCTURE_TYPES] ?? house.structureType : "-"}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      {house.totalArea ? `${Number(house.totalArea)}㎡` : "-"}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {house.builtYear ? `築${new Date().getFullYear() - house.builtYear}年` : "-"}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      NFT {nftCount}件
                    </div>
                  </div>

                  {/* Health Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">健康スコア</span>
                      <span>{house.healthScore}/100</span>
                    </div>
                    <Progress value={house.healthScore} className="h-2" />
                  </div>

                  {/* Maintenance Alerts */}
                  {maintenanceCount > 0 ? (
                    <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-700 dark:bg-yellow-950/20">
                      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                      {maintenanceCount}件のメンテナンス推奨があります
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-xs text-green-700 dark:bg-green-950/20">
                      <CheckCircle className="h-3 w-3" />
                      問題は検出されていません
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/houses/${house.id}`}>詳細を見る</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Wrench className="mr-1 h-3 w-3" />
                      点検予約
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
