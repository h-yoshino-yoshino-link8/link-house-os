"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
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
  Wallet,
  Loader2,
} from "lucide-react";
import { PROJECT_STATUS } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import { useProjects, useDeleteProject, useCreateProject } from "@/hooks/use-projects";
import { useCustomers } from "@/hooks/use-customers";
import { useHouses } from "@/hooks/use-houses";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import type { Project } from "@/lib/api/types";

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
  const [page, setPage] = useState(1);

  // 新規案件フォームの状態
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    houseId: "",
    contractAmount: "",
    costBudget: "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ストアからcompanyIdを取得
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  // 案件一覧を取得
  const { data, isLoading, isError } = useProjects({
    companyId,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 20,
  });

  // 顧客一覧を取得（セレクト用）
  const { data: customersData } = useCustomers({
    companyId,
    limit: 100,
  });
  const customers = customersData?.data ?? [];

  // 物件一覧を取得（セレクト用）
  const { data: housesData } = useHouses({
    companyId,
    customerId: formData.customerId || undefined,
    limit: 100,
  });
  const houses = housesData?.data ?? [];

  const projects = data?.data ?? [];
  const pagination = data?.pagination;
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();

  // フォームリセット
  const resetForm = () => {
    setFormData({
      title: "",
      customerId: "",
      houseId: "",
      contractAmount: "",
      costBudget: "",
      startDate: "",
      endDate: "",
    });
  };

  // 案件登録処理
  const handleSubmit = async () => {
    if (!formData.title || !formData.customerId) {
      alert("案件名と顧客は必須です");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject.mutateAsync({
        companyId,
        customerId: formData.customerId,
        houseId: formData.houseId || undefined,
        title: formData.title,
        contractAmount: formData.contractAmount ? Number(formData.contractAmount) : undefined,
        costBudget: formData.costBudget ? Number(formData.costBudget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      setIsDialogOpen(false);
      resetForm();
      alert("案件を登録しました");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("案件の登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 統計計算
  const stats = useMemo(() => {
    if (!projects.length) {
      return {
        totalProjects: pagination?.total ?? 0,
        inProgressCount: 0,
        totalContractAmount: 0,
        averageProfitRate: 0,
        alertCount: 0,
      };
    }

    const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
    const totalContractAmount = projects.reduce((sum, p) => sum + Number(p.contractAmount ?? 0), 0);
    const totalProfit = projects.reduce((sum, p) => {
      const costActual = Number(p.costActual ?? 0);
      const costBudget = Number(p.costBudget ?? 0);
      const contractAmount = Number(p.contractAmount ?? 0);
      if (costActual > 0) {
        return sum + (contractAmount - costActual);
      }
      return sum + (contractAmount - costBudget);
    }, 0);
    const averageProfitRate = totalContractAmount > 0 ? (totalProfit / totalContractAmount) * 100 : 0;
    const alertCount = projects.filter((p) => {
      const costActual = Number(p.costActual ?? 0);
      const costBudget = Number(p.costBudget ?? 0);
      return costActual > costBudget && costBudget > 0;
    }).length;

    return {
      totalProjects: pagination?.total ?? projects.length,
      inProgressCount,
      totalContractAmount,
      averageProfitRate,
      alertCount,
    };
  }, [projects, pagination]);

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
                  <Label>案件名 <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="○○邸 外壁塗装工事"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>顧客 <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value, houseId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="顧客を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.length === 0 ? (
                        <SelectItem value="_" disabled>顧客がありません</SelectItem>
                      ) : (
                        customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>物件</Label>
                  <Select
                    value={formData.houseId}
                    onValueChange={(value) => setFormData({ ...formData, houseId: value })}
                    disabled={!formData.customerId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.customerId ? "物件を選択" : "先に顧客を選択"} />
                    </SelectTrigger>
                    <SelectContent>
                      {houses.length === 0 ? (
                        <SelectItem value="_" disabled>物件がありません</SelectItem>
                      ) : (
                        houses.map((house) => (
                          <SelectItem key={house.id} value={house.id}>
                            {house.address}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>契約金額</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={formData.contractAmount}
                    onChange={(e) => setFormData({ ...formData, contractAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>原価予算</Label>
                  <Input
                    type="number"
                    placeholder="700000"
                    value={formData.costBudget}
                    onChange={(e) => setFormData({ ...formData, costBudget: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>着工予定日</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>完工予定日</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  "登録"
                )}
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
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                総案件数
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalProjects}件</div>
                <p className="text-xs text-muted-foreground">
                  施工中: {stats.inProgressCount}件
                </p>
              </>
            )}
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
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ¥{(stats.totalContractAmount / 10000).toLocaleString()}万
                </div>
                <p className="text-xs text-muted-foreground">今年度累計</p>
              </>
            )}
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
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {stats.averageProfitRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">目標: 30%</p>
              </>
            )}
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
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className={`text-2xl font-bold ${stats.alertCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {stats.alertCount}件
                </div>
                <p className="text-xs text-muted-foreground">原価超過・遅延</p>
              </>
            )}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    案件が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const costActual = Number(project.costActual ?? 0);
                  const costBudget = Number(project.costBudget ?? 0);
                  const contractAmount = Number(project.contractAmount ?? 0);
                  const profitRate = contractAmount > 0
                    ? costActual > 0
                      ? ((contractAmount - costActual) / contractAmount) * 100
                      : ((contractAmount - costBudget) / contractAmount) * 100
                    : 0;
                  const isOverBudget = costActual > costBudget && costBudget > 0;

                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOverBudget && (
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
                          {project.customer?.name ?? "-"}
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
                          {project.startDate && project.endDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {formatDate(project.startDate, "M/d")} - {formatDate(project.endDate, "M/d")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">未定</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{contractAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm">
                          <span className={isOverBudget ? "text-red-600 font-medium" : ""}>
                            ¥{costActual > 0 ? costActual.toLocaleString() : "-"}
                          </span>
                          <span className="text-muted-foreground"> / </span>
                          <span className="text-muted-foreground">
                            ¥{costBudget.toLocaleString()}
                          </span>
                        </div>
                        <div className={`text-xs ${profitRate >= 30 ? "text-green-600" : profitRate >= 20 ? "text-yellow-600" : "text-red-600"}`}>
                          粗利率: {profitRate.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">-</span>
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
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm("この案件を削除しますか？")) {
                                  deleteProject.mutate(project.id);
                                }
                              }}
                            >
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
