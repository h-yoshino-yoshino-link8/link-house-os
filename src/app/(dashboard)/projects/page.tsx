"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  FolderKanban,
  Calendar,
  User,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Camera,
  FileText,
  Clock,
  CheckCircle2,
  CircleDot,
  PauseCircle,
  Wallet,
} from "lucide-react";
import { PROJECT_STATUS } from "@/constants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const projects = [
  {
    id: "1",
    projectNumber: "PRJ-2024-001",
    title: "山田邸 外壁塗装工事",
    customerName: "山田太郎",
    customerId: "1",
    houseName: "山田邸",
    houseId: "1",
    status: "in_progress",
    contractAmount: 1800000,
    costBudget: 1200000,
    costActual: 950000,
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-11-15"),
    progress: 65,
    assignee: "佐藤",
    hasAlert: false,
  },
  {
    id: "2",
    projectNumber: "PRJ-2024-002",
    title: "佐藤ビル 屋根修繕工事",
    customerName: "佐藤建設株式会社",
    customerId: "2",
    houseName: "佐藤ビル",
    houseId: "2",
    status: "contracted",
    contractAmount: 3500000,
    costBudget: 2400000,
    costActual: 0,
    startDate: new Date("2024-11-20"),
    endDate: new Date("2025-01-31"),
    progress: 0,
    assignee: "田中",
    hasAlert: false,
  },
  {
    id: "3",
    projectNumber: "PRJ-2024-003",
    title: "田中邸 浴室リフォーム",
    customerName: "田中花子",
    customerId: "3",
    houseName: "田中邸",
    houseId: "3",
    status: "completed",
    contractAmount: 1200000,
    costBudget: 800000,
    costActual: 780000,
    startDate: new Date("2024-08-15"),
    endDate: new Date("2024-09-30"),
    progress: 100,
    assignee: "山本",
    hasAlert: false,
  },
  {
    id: "4",
    projectNumber: "PRJ-2024-004",
    title: "鈴木邸 キッチン改修",
    customerName: "鈴木一郎",
    customerId: "4",
    houseName: "鈴木邸",
    houseId: "4",
    status: "in_progress",
    contractAmount: 2500000,
    costBudget: 1700000,
    costActual: 1850000,
    startDate: new Date("2024-09-01"),
    endDate: new Date("2024-11-10"),
    progress: 85,
    assignee: "佐藤",
    hasAlert: true,
  },
  {
    id: "5",
    projectNumber: "PRJ-2024-005",
    title: "高橋商事 オフィス内装",
    customerName: "高橋商事株式会社",
    customerId: "5",
    houseName: "高橋商事ビル",
    houseId: "5",
    status: "invoiced",
    contractAmount: 4800000,
    costBudget: 3200000,
    costActual: 3150000,
    startDate: new Date("2024-06-01"),
    endDate: new Date("2024-08-31"),
    progress: 100,
    assignee: "田中",
    hasAlert: false,
  },
  {
    id: "6",
    projectNumber: "PRJ-2024-006",
    title: "渡辺邸 外構工事",
    customerName: "渡辺次郎",
    customerId: "6",
    houseName: "渡辺邸",
    houseId: "6",
    status: "planning",
    contractAmount: 800000,
    costBudget: 550000,
    costActual: 0,
    startDate: new Date("2024-12-01"),
    endDate: new Date("2024-12-20"),
    progress: 0,
    assignee: "山本",
    hasAlert: false,
  },
  {
    id: "7",
    projectNumber: "PRJ-2024-007",
    title: "伊藤邸 全面リノベーション",
    customerName: "伊藤三郎",
    customerId: "7",
    houseName: "伊藤邸",
    houseId: "7",
    status: "paid",
    contractAmount: 12000000,
    costBudget: 8500000,
    costActual: 8200000,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-05-30"),
    progress: 100,
    assignee: "佐藤",
    hasAlert: false,
  },
];

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

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 統計計算
  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
  const totalContractAmount = projects.reduce((sum, p) => sum + p.contractAmount, 0);
  const totalProfit = projects.reduce((sum, p) => {
    if (p.costActual > 0) {
      return sum + (p.contractAmount - p.costActual);
    }
    return sum + (p.contractAmount - p.costBudget);
  }, 0);
  const averageProfitRate = (totalProfit / totalContractAmount) * 100;
  const alertCount = projects.filter((p) => p.hasAlert || p.costActual > p.costBudget).length;

  // フィルター適用
  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">案件管理</h1>
          <p className="text-muted-foreground">工事案件の進捗・収支管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規案件登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新規案件登録</DialogTitle>
              <DialogDescription>
                案件情報を入力してください（通常は見積から自動作成されます）
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>案件番号</Label>
                  <Input placeholder="PRJ-2024-XXX" disabled />
                  <p className="text-xs text-muted-foreground">自動採番されます</p>
                </div>
                <div className="space-y-2">
                  <Label>案件名</Label>
                  <Input placeholder="○○邸 外壁塗装工事" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>顧客</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="顧客を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">山田太郎</SelectItem>
                      <SelectItem value="2">佐藤建設株式会社</SelectItem>
                      <SelectItem value="3">田中花子</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>物件</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="物件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">山田邸</SelectItem>
                      <SelectItem value="2">佐藤ビル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>契約金額</Label>
                  <Input type="number" placeholder="1,000,000" />
                </div>
                <div className="space-y-2">
                  <Label>原価予算</Label>
                  <Input type="number" placeholder="700,000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>着工予定日</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>完工予定日</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>担当者</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sato">佐藤</SelectItem>
                    <SelectItem value="tanaka">田中</SelectItem>
                    <SelectItem value="yamamoto">山本</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>登録</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                総案件数
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}件</div>
            <p className="text-xs text-muted-foreground">
              施工中: {inProgressCount}件
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                総契約金額
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(totalContractAmount / 10000).toLocaleString()}万
            </div>
            <p className="text-xs text-muted-foreground">今年度累計</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                平均粗利率
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {averageProfitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">目標: 30%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                アラート
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${alertCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {alertCount}件
            </div>
            <p className="text-xs text-muted-foreground">原価超過・遅延</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>案件一覧</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="案件名・顧客名で検索..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {Object.entries(PROJECT_STATUS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>案件</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>工期</TableHead>
                <TableHead>進捗</TableHead>
                <TableHead className="text-right">契約金額</TableHead>
                <TableHead className="text-right">原価/予算</TableHead>
                <TableHead className="text-center">担当</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const profitRate =
                  project.costActual > 0
                    ? ((project.contractAmount - project.costActual) / project.contractAmount) * 100
                    : ((project.contractAmount - project.costBudget) / project.contractAmount) * 100;
                const isOverBudget = project.costActual > project.costBudget && project.costBudget > 0;

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(project.hasAlert || isOverBudget) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium hover:underline"
                          >
                            {project.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {project.projectNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/customers/${project.customerId}`}
                        className="text-sm hover:underline"
                      >
                        {project.customerName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcons[project.status]}
                          {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(project.startDate, "M/d", { locale: ja })} - {format(project.endDate, "M/d", { locale: ja })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{project.contractAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        <span className={isOverBudget ? "text-red-600 font-medium" : ""}>
                          ¥{project.costActual > 0 ? project.costActual.toLocaleString() : "-"}
                        </span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-muted-foreground">
                          ¥{project.costBudget.toLocaleString()}
                        </span>
                      </div>
                      <div className={`text-xs ${profitRate >= 30 ? "text-green-600" : profitRate >= 20 ? "text-yellow-600" : "text-red-600"}`}>
                        粗利率: {profitRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{project.assignee}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>詳細を見る</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>編集</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/schedules?project=${project.id}`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              工程表
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/photos?project=${project.id}`}>
                              <Camera className="mr-2 h-4 w-4" />
                              写真管理
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            書類作成
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
