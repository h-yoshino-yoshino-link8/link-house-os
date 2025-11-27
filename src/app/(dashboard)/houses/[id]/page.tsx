"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Home,
  MapPin,
  Calendar,
  User,
  Building,
  Ruler,
  Shield,
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
  Camera,
} from "lucide-react";
import { STRUCTURE_TYPES, COMPONENT_CATEGORIES } from "@/constants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// デモデータ
const houseData = {
  id: "1",
  customerId: "1",
  customerName: "山田太郎",
  address: "東京都渋谷区○○1-2-3",
  structureType: "wood",
  floors: 2,
  totalArea: 105.5,
  builtYear: 2010,
  builder: "○○ハウス",
  healthScore: 82,
  lastInspection: new Date("2024-06-15"),
  nextInspection: new Date("2025-06-15"),
  createdAt: new Date("2022-04-01"),
  components: [
    { id: "1", category: "roof", name: "屋根（コロニアル）", score: 75, lastMaintenance: new Date("2020-05-10"), nextMaintenance: new Date("2025-05-10"), status: "fair" },
    { id: "2", category: "exterior", name: "外壁（サイディング）", score: 68, lastMaintenance: new Date("2019-08-20"), nextMaintenance: new Date("2024-08-20"), status: "warning" },
    { id: "3", category: "interior", name: "内装（クロス）", score: 90, lastMaintenance: new Date("2022-03-15"), nextMaintenance: new Date("2032-03-15"), status: "good" },
    { id: "4", category: "equipment", name: "給湯器", score: 45, lastMaintenance: new Date("2015-04-01"), nextMaintenance: new Date("2025-04-01"), status: "critical" },
    { id: "5", category: "electrical", name: "分電盤", score: 88, lastMaintenance: new Date("2020-11-10"), nextMaintenance: new Date("2030-11-10"), status: "good" },
    { id: "6", category: "plumbing", name: "給排水管", score: 72, lastMaintenance: new Date("2018-06-20"), nextMaintenance: new Date("2028-06-20"), status: "fair" },
  ],
  alerts: [
    { id: "1", level: "high", category: "equipment", message: "給湯器：寿命まで残り1-3年（交換推奨）", createdAt: new Date("2024-06-15") },
    { id: "2", level: "medium", category: "exterior", message: "外壁塗装：2年以内に再塗装を推奨", createdAt: new Date("2024-06-15") },
  ],
  maintenanceHistory: [
    { id: "1", date: new Date("2022-03-15"), type: "interior", description: "クロス張替え（全室）", cost: 450000, contractor: "○○内装" },
    { id: "2", date: new Date("2020-11-10"), type: "electrical", description: "分電盤交換", cost: 180000, contractor: "△△電気" },
    { id: "3", date: new Date("2020-05-10"), type: "roof", description: "屋根塗装", cost: 580000, contractor: "□□塗装" },
    { id: "4", date: new Date("2019-08-20"), type: "exterior", description: "外壁塗装", cost: 1200000, contractor: "□□塗装" },
  ],
  projects: [
    { id: "1", projectNumber: "PRJ-2022-015", title: "内装リフォーム工事", status: "paid", amount: 450000, completedAt: new Date("2022-03-15") },
    { id: "2", projectNumber: "PRJ-2020-042", title: "屋根・外壁塗装工事", status: "paid", amount: 1780000, completedAt: new Date("2020-05-15") },
  ],
  nfts: [
    { id: "1", tokenId: "0x1234...5678", workType: "内装リフォーム", workDate: new Date("2022-03-15"), contractor: "○○内装" },
    { id: "2", tokenId: "0x2345...6789", workType: "屋根塗装", workDate: new Date("2020-05-10"), contractor: "□□塗装" },
    { id: "3", tokenId: "0x3456...7890", workType: "外壁塗装", workDate: new Date("2019-08-20"), contractor: "□□塗装" },
  ],
};

// レーダーチャート用データ
const radarData = [
  { subject: "屋根", score: 75, fullMark: 100 },
  { subject: "外壁", score: 68, fullMark: 100 },
  { subject: "内装", score: 90, fullMark: 100 },
  { subject: "設備", score: 45, fullMark: 100 },
  { subject: "電気", score: 88, fullMark: 100 },
  { subject: "給排水", score: 72, fullMark: 100 },
];

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

export default function HouseDetailPage() {
  const params = useParams();
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const house = houseData;
  const healthLabel = getScoreLabel(house.healthScore);

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
              <h1 className="text-2xl font-bold">{house.customerName}邸</h1>
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
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Wrench className="mr-2 h-4 w-4" />
                点検予約
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>点検予約</DialogTitle>
                <DialogDescription>定期点検を予約します</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>点検種別</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">簡易点検（30分）</SelectItem>
                      <SelectItem value="detailed">詳細点検（60分）</SelectItem>
                      <SelectItem value="full">総合点検（半日）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>希望日</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>備考</Label>
                  <Textarea placeholder="特に気になる箇所など" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsInspectionDialogOpen(false)}>予約</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              {new Date().getFullYear() - house.builtYear}年
            </div>
            <p className="text-xs text-muted-foreground">
              {house.builtYear}年築
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              前回点検
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(house.lastInspection, "yyyy/M/d")}
            </div>
            <p className="text-xs text-muted-foreground">
              次回: {format(house.nextInspection, "yyyy/M/d")}
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
            <div className="text-2xl font-bold">{house.nfts.length}件</div>
            <p className="text-xs text-muted-foreground">
              ブロックチェーン記録済
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {house.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              アラート（{house.alerts.length}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {house.alerts.map((alert) => (
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
          <TabsTrigger value="history">メンテナンス履歴</TabsTrigger>
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
                    {house.customerName} 様
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
                  <span>{STRUCTURE_TYPES[house.structureType as keyof typeof STRUCTURE_TYPES]}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">階数</span>
                  <span>{house.floors}階建て</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">延床面積</span>
                  <span>{house.totalArea}㎡</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">築年</span>
                  <span>{house.builtYear}年</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">建築会社</span>
                  <span>{house.builder}</span>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>部材名</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>スコア</TableHead>
                    <TableHead>前回メンテ</TableHead>
                    <TableHead>次回推奨</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {house.components.map((component) => (
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
                      <TableCell>{format(component.lastMaintenance, "yyyy/M/d")}</TableCell>
                      <TableCell>
                        <span className={component.nextMaintenance < new Date() ? "text-red-600 font-medium" : ""}>
                          {format(component.nextMaintenance, "yyyy/M/d")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          詳細
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                メンテナンス履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead>施工業者</TableHead>
                    <TableHead className="text-right">費用</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {house.maintenanceHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{format(history.date, "yyyy/M/d")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {COMPONENT_CATEGORIES[history.type as keyof typeof COMPONENT_CATEGORIES]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{history.description}</TableCell>
                      <TableCell>{history.contractor}</TableCell>
                      <TableCell className="text-right">¥{history.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                        <Badge className="bg-emerald-100 text-emerald-800">入金済</Badge>
                      </TableCell>
                      <TableCell>{format(project.completedAt, "yyyy/M/d")}</TableCell>
                      <TableCell className="text-right">¥{project.amount.toLocaleString()}</TableCell>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {house.nfts.map((nft) => (
                  <Card key={nft.id} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Shield className="h-16 w-16 text-white/80" />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{nft.workType}</p>
                        <Badge variant="outline">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                          認証済
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        施工日: {format(nft.workDate, "yyyy/M/d")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        施工業者: {nft.contractor}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        Token: {nft.tokenId}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        ブロックチェーンで確認
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
