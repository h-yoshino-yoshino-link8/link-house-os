"use client";

import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import { STRUCTURE_TYPES } from "@/constants";

// デモデータ
const houses = [
  {
    id: "1",
    customerId: "1",
    customerName: "山田太郎 様",
    address: "東京都渋谷区○○1-2-3",
    structureType: "wood",
    floors: 2,
    totalArea: 105.5,
    builtYear: 2010,
    healthScore: 82,
    components: 24,
    projects: 3,
    lastInspection: new Date("2024-06-15"),
    alerts: [
      { level: "high", message: "給湯器：寿命まで残り1-3年" },
    ],
    nftCount: 3,
  },
  {
    id: "2",
    customerId: "2",
    customerName: "佐藤建設 様",
    address: "東京都新宿区○○4-5-6",
    structureType: "rc",
    floors: 3,
    totalArea: 280.0,
    builtYear: 2005,
    healthScore: 68,
    components: 42,
    projects: 5,
    lastInspection: new Date("2024-03-20"),
    alerts: [
      { level: "medium", message: "外壁塗装：2年以内に推奨" },
      { level: "low", message: "屋上防水：点検推奨" },
    ],
    nftCount: 5,
  },
  {
    id: "3",
    customerId: "3",
    customerName: "田中花子 様",
    address: "神奈川県横浜市○○7-8-9",
    structureType: "wood",
    floors: 2,
    totalArea: 92.0,
    builtYear: 2018,
    healthScore: 94,
    components: 18,
    projects: 1,
    lastInspection: new Date("2024-09-01"),
    alerts: [],
    nftCount: 1,
  },
  {
    id: "4",
    customerId: "4",
    customerName: "鈴木一郎 様",
    address: "千葉県船橋市○○10-11",
    structureType: "steel",
    floors: 2,
    totalArea: 125.0,
    builtYear: 2000,
    healthScore: 45,
    components: 28,
    projects: 2,
    lastInspection: new Date("2023-12-01"),
    alerts: [
      { level: "high", message: "屋根葺き替え：早期対応必要" },
      { level: "high", message: "外壁塗装：劣化進行中" },
      { level: "medium", message: "給排水管：点検推奨" },
    ],
    nftCount: 2,
  },
];

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
            <div className="text-2xl font-bold">48件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均健康スコア
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lime-600">72</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              要対応物件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工証明NFT発行数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124件</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="住所・顧客名で検索..." className="pl-9" />
        </div>
        <Select defaultValue="all">
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
      <div className="grid gap-4 md:grid-cols-2">
        {houses.map((house) => {
          const healthLabel = getHealthScoreLabel(house.healthScore);
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
                          {house.customerName}邸
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
                    {STRUCTURE_TYPES[house.structureType as keyof typeof STRUCTURE_TYPES]}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Ruler className="h-3 w-3" />
                    {house.totalArea}㎡
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    築{new Date().getFullYear() - house.builtYear}年
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    NFT {house.nftCount}件
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

                {/* Alerts */}
                {house.alerts.length > 0 && (
                  <div className="space-y-2">
                    {house.alerts.slice(0, 2).map((alert, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 rounded-md p-2 text-xs ${
                          alert.level === "high"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/20"
                            : alert.level === "medium"
                            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/20"
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        {alert.message}
                      </div>
                    ))}
                    {house.alerts.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        他 {house.alerts.length - 2} 件のアラート
                      </p>
                    )}
                  </div>
                )}

                {house.alerts.length === 0 && (
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
    </div>
  );
}
