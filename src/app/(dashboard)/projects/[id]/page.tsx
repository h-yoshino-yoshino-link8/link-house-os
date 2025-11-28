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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CircleDot,
  Wallet,
  Phone,
  Mail,
  Loader2,
  Receipt,
  CreditCard,
  Send,
} from "lucide-react";
import { PROJECT_STATUS } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useInvoices, useCreateInvoice, useRecordPayment, Invoice } from "@/hooks/use-invoices";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

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
  const projectId = params.id as string;
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  const { data, isLoading, isError } = useProject(projectId);
  const project = data?.data;

  // 請求書データ取得
  const { data: invoicesData } = useInvoices({
    companyId,
    projectId,
  });
  const invoices = invoicesData?.data ?? [];

  // 請求書作成
  const createInvoice = useCreateInvoice();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");

  // 入金記録
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const recordPayment = useRecordPayment(selectedInvoiceId || "");

  const handleCreateInvoice = async () => {
    if (!project) return;
    try {
      const contractAmount = Number(project.contractAmount || 0);
      await createInvoice.mutateAsync({
        companyId,
        projectId,
        customerId: project.customerId,
        title: invoiceTitle || project.title,
        issueDate: new Date().toISOString(),
        dueDate: invoiceDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: 10,
        details: [{
          name: project.title,
          quantity: 1,
          unitPrice: contractAmount,
        }],
      });
      toast.success("請求書を作成しました");
      setInvoiceDialogOpen(false);
      setInvoiceTitle("");
      setInvoiceDueDate("");
    } catch {
      toast.error("請求書の作成に失敗しました");
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoiceId) return;
    try {
      await recordPayment.mutateAsync({
        paymentDate,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
      });
      toast.success("入金を記録しました");
      setPaymentDialogOpen(false);
      setSelectedInvoiceId(null);
      setPaymentAmount("");
    } catch {
      toast.error("入金記録に失敗しました");
    }
  };

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setPaymentAmount(String(Number(invoice.remainingAmount)));
    setPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">案件データの取得に失敗しました</p>
      </div>
    );
  }

  const contractAmount = Number(project.contractAmount || 0);
  const costBudget = Number(project.costBudget || 0);
  const costActual = Number(project.costActual || 0);
  const profitAmount = contractAmount - costActual;
  const profitRate = contractAmount > 0 ? (profitAmount / contractAmount) * 100 : 0;
  const budgetUsage = costBudget > 0 ? (costActual / costBudget) * 100 : 0;
  const isOverBudget = costActual > costBudget;

  // Calculate overall progress from schedules
  const progress = project.schedules?.length > 0
    ? Math.round(
        project.schedules.reduce((sum, s) => sum + (s.progress || 0), 0) /
          project.schedules.length
      )
    : 0;

  // Group photos by folder
  const photosByFolder = project.photos?.reduce(
    (acc, photo) => {
      const folder = photo.folder || "other";
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(photo);
      return acc;
    },
    {} as Record<string, typeof project.photos>
  );

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
            <div className="text-2xl font-bold">¥{contractAmount.toLocaleString()}</div>
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
              {project.startDate ? formatDate(project.startDate, "M/d") : "-"}
              {project.endDate && ` - ${formatDate(project.endDate, "M/d")}`}
            </div>
            {project.endDate && (
              <p className="text-xs text-muted-foreground">
                残り {Math.max(0, Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} 日
              </p>
            )}
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
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="schedule">工程</TabsTrigger>
          <TabsTrigger value="costs">原価</TabsTrigger>
          <TabsTrigger value="invoices">請求</TabsTrigger>
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
                  {project.customer ? (
                    <Link href={`/customers/${project.customer.id}`} className="font-medium hover:underline">
                      {project.customer.name}
                    </Link>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">電話番号</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    -
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">メール</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    -
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
                  {project.house ? (
                    <Link href={`/houses/${project.house.id}`} className="font-medium hover:underline">
                      {project.customer?.name ?? ""}邸
                    </Link>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <span>{project.house?.address || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">健康スコア</span>
                  <span className="font-bold text-lime-600">-</span>
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
              <p className="text-muted-foreground">{project.title}</p>
            </CardContent>
          </Card>

          {/* Related Estimate */}
          {project.estimate && (
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
                      {project.estimate.estimateNumber} / 作成日: {formatDate(project.estimate.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">¥{Number(project.estimate.total).toLocaleString()}</p>
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
          )}
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
              {project.schedules?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  工程が登録されていません
                </p>
              ) : (
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
                    {project.schedules?.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.name}</TableCell>
                        <TableCell>{schedule.assignee || "-"}</TableCell>
                        <TableCell>
                          {schedule.startDate ? formatDate(schedule.startDate, "M/d") : "-"}
                        </TableCell>
                        <TableCell>
                          {schedule.endDate ? formatDate(schedule.endDate, "M/d") : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={schedule.progress || 0} className="h-2 w-20" />
                            <span className="text-sm text-muted-foreground">{schedule.progress || 0}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                <div className="text-2xl font-bold">¥{costBudget.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">原価実績</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : ""}`}>
                  ¥{costActual.toLocaleString()}
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

          <Card>
            <CardHeader>
              <CardTitle>原価概要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">契約金額</span>
                  <span className="font-medium">¥{contractAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">原価予算</span>
                  <span className="font-medium">¥{costBudget.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">原価実績</span>
                  <span className={`font-medium ${isOverBudget ? "text-red-600" : ""}`}>
                    ¥{costActual.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">粗利</span>
                  <span className={`font-bold ${profitAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ¥{profitAmount.toLocaleString()} ({profitRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Invoice Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">請求総額</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{invoices.reduce((sum, inv) => sum + Number(inv.total), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">入金済</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ¥{invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">未入金</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ¥{invoices.reduce((sum, inv) => sum + Number(inv.remainingAmount), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  請求書一覧
                </CardTitle>
                <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      請求書発行
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>請求書発行</DialogTitle>
                      <DialogDescription>この案件の請求書を作成します</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>請求書タイトル</Label>
                        <Input
                          placeholder={project.title}
                          value={invoiceTitle}
                          onChange={(e) => setInvoiceTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>請求金額</Label>
                        <div className="text-lg font-bold">
                          ¥{contractAmount.toLocaleString()}（税込: ¥{Math.round(contractAmount * 1.1).toLocaleString()}）
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>支払期限</Label>
                        <Input
                          type="date"
                          value={invoiceDueDate}
                          onChange={(e) => setInvoiceDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleCreateInvoice} disabled={createInvoice.isPending}>
                        {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        発行する
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mb-2" />
                  <p>請求書がまだ発行されていません</p>
                  <p className="text-sm">「請求書発行」から作成できます</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>請求番号</TableHead>
                      <TableHead>発行日</TableHead>
                      <TableHead>支払期限</TableHead>
                      <TableHead className="text-right">請求額</TableHead>
                      <TableHead className="text-right">入金済</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{Number(invoice.total).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          ¥{Number(invoice.paidAmount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "partial_paid"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              invoice.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                          >
                            {invoice.status === "draft" && "下書き"}
                            {invoice.status === "issued" && "発行済"}
                            {invoice.status === "sent" && "送付済"}
                            {invoice.status === "partial_paid" && "一部入金"}
                            {invoice.status === "paid" && "入金済"}
                            {invoice.status === "overdue" && "期限超過"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDialog(invoice)}
                            disabled={invoice.status === "paid"}
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            入金記録
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>入金記録</DialogTitle>
                <DialogDescription>入金情報を記録します</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>入金日</Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>入金額</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>入金方法</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">銀行振込</SelectItem>
                      <SelectItem value="cash">現金</SelectItem>
                      <SelectItem value="credit_card">クレジットカード</SelectItem>
                      <SelectItem value="check">小切手</SelectItem>
                      <SelectItem value="other">その他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleRecordPayment} disabled={recordPayment.isPending}>
                  {recordPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  記録する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              {project.photos?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  写真がまだ登録されていません
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {["before", "during", "after"].map((folder) => {
                    const photos = photosByFolder?.[folder] || [];
                    return (
                      <Card key={folder} className="overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <Camera className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {folder === "before" ? "施工前" : folder === "during" ? "施工中" : "施工後"}
                              </p>
                              <p className="text-sm text-muted-foreground">{photos.length}枚</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/photos?project=${project.id}&folder=${folder}`}>
                                見る
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
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
              <p className="text-muted-foreground text-center py-8">
                書類管理機能は準備中です
              </p>
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
              {project.workCertificates?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mb-2" />
                  <p>施工証明NFTはまだ発行されていません</p>
                  <p className="text-sm">工事完了後に発行できます</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {project.workCertificates?.map((nft) => (
                    <Card key={nft.id} className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Shield className="h-16 w-16 text-white/80" />
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{nft.workType || "施工証明"}</p>
                          <Badge variant="outline">
                            <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                            認証済
                          </Badge>
                        </div>
                        {nft.nftTokenId && (
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            Token: {nft.nftTokenId}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
