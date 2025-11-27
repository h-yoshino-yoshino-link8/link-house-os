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
  Calendar,
  User,
  Home,
  FileText,
  Camera,
  Banknote,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Plus,
  ExternalLink,
  Shield,
  Wrench,
  CircleDot,
  Wallet,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { PROJECT_STATUS } from "@/constants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const projectData = {
  id: "1",
  projectNumber: "PRJ-2024-001",
  title: "山田邸 外壁塗装工事",
  status: "in_progress",
  contractAmount: 1800000,
  costBudget: 1200000,
  costActual: 950000,
  startDate: new Date("2024-10-01"),
  endDate: new Date("2024-11-15"),
  actualStart: new Date("2024-10-03"),
  actualEnd: null,
  progress: 65,
  assignee: "佐藤",
  description: "外壁の全面塗り替え工事。下地処理、シーラー塗布、中塗り・上塗りを実施。",
  customer: {
    id: "1",
    name: "山田太郎",
    phone: "090-1234-5678",
    email: "yamada@example.com",
    rank: "platinum",
  },
  house: {
    id: "1",
    name: "山田邸",
    address: "東京都渋谷区○○1-2-3",
    structureType: "wood",
    builtYear: 2010,
    healthScore: 82,
  },
  estimate: {
    id: "EST-2024-001",
    title: "山田邸 外壁塗装工事 見積",
    amount: 1800000,
    submittedAt: new Date("2024-09-15"),
  },
  schedules: [
    { id: "1", name: "足場設置", startDate: new Date("2024-10-01"), endDate: new Date("2024-10-03"), progress: 100, assignee: "足場班" },
    { id: "2", name: "高圧洗浄", startDate: new Date("2024-10-04"), endDate: new Date("2024-10-05"), progress: 100, assignee: "塗装班" },
    { id: "3", name: "下地処理", startDate: new Date("2024-10-07"), endDate: new Date("2024-10-12"), progress: 100, assignee: "塗装班" },
    { id: "4", name: "シーラー塗布", startDate: new Date("2024-10-14"), endDate: new Date("2024-10-16"), progress: 100, assignee: "塗装班" },
    { id: "5", name: "中塗り", startDate: new Date("2024-10-17"), endDate: new Date("2024-10-22"), progress: 80, assignee: "塗装班" },
    { id: "6", name: "上塗り", startDate: new Date("2024-10-24"), endDate: new Date("2024-10-30"), progress: 0, assignee: "塗装班" },
    { id: "7", name: "足場解体", startDate: new Date("2024-11-01"), endDate: new Date("2024-11-02"), progress: 0, assignee: "足場班" },
    { id: "8", name: "清掃・検査", startDate: new Date("2024-11-04"), endDate: new Date("2024-11-05"), progress: 0, assignee: "現場監督" },
  ],
  costs: [
    { id: "1", category: "材料費", item: "塗料（シリコン系）", amount: 280000, date: new Date("2024-10-01") },
    { id: "2", category: "材料費", item: "下地材・シーラー", amount: 85000, date: new Date("2024-10-01") },
    { id: "3", category: "外注費", item: "足場設置・解体", amount: 180000, date: new Date("2024-10-03") },
    { id: "4", category: "人件費", item: "塗装工事（10人工）", amount: 350000, date: new Date("2024-10-20") },
    { id: "5", category: "経費", item: "養生材・消耗品", amount: 55000, date: new Date("2024-10-01") },
  ],
  photos: [
    { id: "1", folder: "before", count: 12, thumbnail: "/placeholder-before.jpg" },
    { id: "2", folder: "during", count: 28, thumbnail: "/placeholder-during.jpg" },
    { id: "3", folder: "after", count: 0, thumbnail: null },
  ],
  documents: [
    { id: "1", type: "contract", title: "工事請負契約書", createdAt: new Date("2024-09-20") },
    { id: "2", type: "specification", title: "工事仕様書", createdAt: new Date("2024-09-20") },
    { id: "3", type: "warranty", title: "保証書（下書き）", createdAt: new Date("2024-10-01") },
  ],
  nfts: [],
};

const statusIcons: Record<string, React.ReactNode> = {
  planning: <CircleDot className="h-4 w-4 text-gray-500" />,
  contracted: <FileText className="h-4 w-4 text-blue-500" />,
  in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  invoiced: <Banknote className="h-4 w-4 text-purple-500" />,
  paid: <Wallet className="h-4 w-4 text-emerald-500" />,
};

const statusColors: Record<string, string> = {
  planning: "bg-gray-100 text-gray-800",
  contracted: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  invoiced: "bg-purple-100 text-purple-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const project = projectData;

  const profitAmount = project.contractAmount - project.costActual;
  const profitRate = (profitAmount / project.contractAmount) * 100;
  const budgetUsage = (project.costActual / project.costBudget) * 100;
  const isOverBudget = project.costActual > project.costBudget;

  const costByCategory = project.costs.reduce((acc, cost) => {
    acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <Badge className={statusColors[project.status]}>
                <span className="flex items-center gap-1">
                  {statusIcons[project.status]}
                  {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}
                </span>
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.projectNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Select defaultValue={project.status}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ステータス変更" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                契約金額
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{project.contractAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                粗利
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitRate >= 30 ? "text-green-600" : profitRate >= 20 ? "text-yellow-600" : "text-red-600"}`}>
              ¥{profitAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">粗利率: {profitRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                工期
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(project.startDate, "M/d", { locale: ja })} - {format(project.endDate, "M/d", { locale: ja })}
            </div>
            <p className="text-xs text-muted-foreground">
              残り {Math.ceil((project.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 日
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                進捗
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="schedule">工程</TabsTrigger>
          <TabsTrigger value="costs">原価</TabsTrigger>
          <TabsTrigger value="photos">写真</TabsTrigger>
          <TabsTrigger value="documents">書類</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  顧客情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">顧客名</span>
                  <Link href={`/customers/${project.customer.id}`} className="font-medium hover:underline">
                    {project.customer.name}
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">電話番号</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {project.customer.phone}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">メール</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {project.customer.email}
                  </span>
                </div>
              </CardContent>
            </Card>

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
                  <span className="text-muted-foreground">物件名</span>
                  <Link href={`/houses/${project.house.id}`} className="font-medium hover:underline">
                    {project.house.name}
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <span>{project.house.address}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">健康スコア</span>
                  <span className="font-bold text-lime-600">{project.house.healthScore}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>工事概要</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          {/* Related Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                関連見積
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{project.estimate.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.estimate.id} / 提出日: {format(project.estimate.submittedAt, "yyyy/MM/dd")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">¥{project.estimate.amount.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/estimates/${project.estimate.id}`}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      見積を見る
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>工程表</CardTitle>
                <Button variant="outline" asChild>
                  <Link href={`/schedules?project=${project.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    ガントチャートで見る
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>工程</TableHead>
                    <TableHead>担当</TableHead>
                    <TableHead>開始日</TableHead>
                    <TableHead>終了日</TableHead>
                    <TableHead>進捗</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>{schedule.assignee}</TableCell>
                      <TableCell>{format(schedule.startDate, "M/d", { locale: ja })}</TableCell>
                      <TableCell>{format(schedule.endDate, "M/d", { locale: ja })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={schedule.progress} className="h-2 w-20" />
                          <span className="text-sm text-muted-foreground">{schedule.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          {/* Cost Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">原価予算</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{project.costBudget.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">原価実績</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : ""}`}>
                  ¥{project.costActual.toLocaleString()}
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    予算超過
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">予算消化率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${budgetUsage > 100 ? "text-red-600" : budgetUsage > 80 ? "text-yellow-600" : "text-green-600"}`}>
                  {budgetUsage.toFixed(1)}%
                </div>
                <Progress value={Math.min(budgetUsage, 100)} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Cost by Category */}
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ別原価</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(costByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span>{category}</span>
                    </div>
                    <span className="font-medium">¥{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>原価明細</CardTitle>
                <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      原価追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>原価追加</DialogTitle>
                      <DialogDescription>原価明細を追加します</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>カテゴリ</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="選択" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="material">材料費</SelectItem>
                            <SelectItem value="labor">人件費</SelectItem>
                            <SelectItem value="outsource">外注費</SelectItem>
                            <SelectItem value="expense">経費</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>項目名</Label>
                        <Input placeholder="塗料（シリコン系）" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>金額</Label>
                          <Input type="number" placeholder="100000" />
                        </div>
                        <div className="space-y-2">
                          <Label>日付</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>備考</Label>
                        <Textarea placeholder="備考があれば入力" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCostDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={() => setIsCostDialogOpen(false)}>追加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>項目</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.costs.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{format(cost.date, "M/d", { locale: ja })}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cost.category}</Badge>
                      </TableCell>
                      <TableCell>{cost.item}</TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{cost.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>工事写真</CardTitle>
                <Button asChild>
                  <Link href={`/photos?project=${project.id}`}>
                    <Camera className="mr-2 h-4 w-4" />
                    写真管理を開く
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {project.photos.map((folder) => (
                  <Card key={folder.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">
                            {folder.folder === "before" ? "施工前" : folder.folder === "during" ? "施工中" : "施工後"}
                          </p>
                          <p className="text-sm text-muted-foreground">{folder.count}枚</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/photos?project=${project.id}&folder=${folder.folder}`}>
                            見る
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>関連書類</CardTitle>
                <Button asChild>
                  <Link href={`/documents/new?project=${project.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    書類作成
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>書類名</TableHead>
                    <TableHead>種類</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {doc.type === "contract" ? "契約書" : doc.type === "specification" ? "仕様書" : "保証書"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(doc.createdAt, "yyyy/MM/dd")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* NFT Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    施工証明NFT
                  </CardTitle>
                  <CardDescription>ブロックチェーンに記録された施工証明</CardDescription>
                </div>
                <Button variant="outline" disabled={project.status !== "completed"}>
                  <Shield className="mr-2 h-4 w-4" />
                  NFT発行
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.nfts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mb-2" />
                  <p>施工証明NFTはまだ発行されていません</p>
                  <p className="text-sm">工事完了後に発行できます</p>
                </div>
              ) : (
                <div>NFT一覧</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
