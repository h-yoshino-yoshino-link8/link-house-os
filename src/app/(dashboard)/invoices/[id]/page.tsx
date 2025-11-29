"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  Printer,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Banknote,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { useInvoice, useRecordPayment, useUpdateInvoice, useDeleteInvoice } from "@/hooks/use-invoices";
import { InvoicePrintPreview } from "@/components/invoices/invoice-print-preview";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  draft: "下書き",
  issued: "発行済",
  sent: "送付済",
  partial_paid: "一部入金",
  paid: "入金済",
  overdue: "期限超過",
  cancelled: "キャンセル",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  issued: "bg-blue-100 text-blue-800",
  sent: "bg-cyan-100 text-cyan-800",
  partial_paid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const paymentMethods: Record<string, string> = {
  bank_transfer: "銀行振込",
  credit_card: "クレジットカード",
  cash: "現金",
  check: "小切手",
  other: "その他",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading } = useInvoice(id);
  const recordPayment = useRecordPayment(id);
  const updateInvoice = useUpdateInvoice(id);
  const deleteInvoice = useDeleteInvoice();

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    method: "bank_transfer",
    reference: "",
    notes: "",
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoice ? `請求書_${invoice.invoiceNumber}` : "請求書",
  });

  const handleRecordPayment = async () => {
    if (!paymentData.amount) return;

    try {
      await recordPayment.mutateAsync({
        paymentDate: paymentData.paymentDate,
        amount: Number(paymentData.amount),
        method: paymentData.method,
        reference: paymentData.reference || undefined,
        notes: paymentData.notes || undefined,
      });
      toast.success("入金を記録しました");
      setShowPaymentDialog(false);
      setPaymentData({
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        method: "bank_transfer",
        reference: "",
        notes: "",
      });
    } catch {
      toast.error("入金の記録に失敗しました");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateInvoice.mutateAsync({ status: newStatus });
      toast.success("ステータスを更新しました");
    } catch {
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success("請求書を削除しました");
      router.push("/invoices");
    } catch {
      toast.error("請求書の削除に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">請求書が見つかりません</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            請求書一覧に戻る
          </Link>
        </Button>
      </div>
    );
  }

  const isOverdue = invoice.status !== "paid" && new Date(invoice.dueDate) < new Date();
  const progressPercentage = invoice.total > 0
    ? (Number(invoice.paidAmount) / Number(invoice.total)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
              <Badge className={statusColors[invoice.status]}>
                {statusLabels[invoice.status]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  期限超過
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "draft" && (
            <Select value={invoice.status} onValueChange={handleUpdateStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="issued">発行済</SelectItem>
                <SelectItem value="sent">送付済</SelectItem>
              </SelectContent>
            </Select>
          )}
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <Button onClick={() => setShowPaymentDialog(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              入金記録
            </Button>
          )}
          <Button variant="outline" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" />
            印刷
          </Button>
          {invoice.status === "draft" && (
            <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                請求書情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">顧客</p>
                  <p className="font-medium">{invoice.project?.customer?.name || "-"}</p>
                  {invoice.project?.customer?.address && (
                    <p className="text-sm text-muted-foreground">{invoice.project.customer.address}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">関連案件</p>
                  {invoice.project ? (
                    <Link
                      href={`/projects/${invoice.projectId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {invoice.project.projectNumber} - {invoice.project.title}
                    </Link>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">発行日</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">支払期限</p>
                  <p className={`font-medium flex items-center gap-2 ${isOverdue ? "text-red-600" : ""}`}>
                    <Calendar className="h-4 w-4" />
                    {formatDate(invoice.dueDate)}
                    {isOverdue && <AlertCircle className="h-4 w-4" />}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>明細</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">No.</TableHead>
                    <TableHead>品名</TableHead>
                    <TableHead>摘要</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-center">単位</TableHead>
                    <TableHead className="text-right">単価</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.details?.map((detail, index) => (
                    <TableRow key={detail.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{detail.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {detail.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">{Number(detail.quantity)}</TableCell>
                      <TableCell className="text-center">{detail.unit || "式"}</TableCell>
                      <TableCell className="text-right">
                        ¥{Number(detail.unitPrice).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{Number(detail.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">小計</span>
                    <span>¥{Number(invoice.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">消費税（{Number(invoice.taxRate)}%）</span>
                    <span>¥{Number(invoice.tax).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>合計</span>
                    <span>¥{Number(invoice.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  入金履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>入金番号</TableHead>
                      <TableHead>入金日</TableHead>
                      <TableHead>方法</TableHead>
                      <TableHead>参照情報</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono">{payment.paymentNumber}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>
                          {payment.method ? paymentMethods[payment.method] || payment.method : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.reference || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ¥{Number(payment.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(invoice.notes || invoice.internalMemo) && (
            <Card>
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">顧客向け備考</p>
                    <p className="whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
                {invoice.internalMemo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">社内メモ</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">{invoice.internalMemo}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                入金状況
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">進捗</span>
                  <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">請求額</span>
                  <span className="font-medium">¥{Number(invoice.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>入金済</span>
                  <span className="font-medium">¥{Number(invoice.paidAmount).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-orange-600 font-bold">
                  <span>残額</span>
                  <span>¥{Number(invoice.remainingAmount).toLocaleString()}</span>
                </div>
              </div>

              {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                <Button className="w-full" onClick={() => setShowPaymentDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  入金を記録
                </Button>
              )}

              {invoice.status === "paid" && (
                <div className="flex items-center justify-center gap-2 text-green-600 py-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">完済</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => handlePrint()}>
                <Printer className="mr-2 h-4 w-4" />
                印刷 / PDF出力
              </Button>
              {invoice.project && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/projects/${invoice.projectId}`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    案件を確認
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Print Preview */}
      <div className="hidden">
        <InvoicePrintPreview
          ref={printRef}
          invoice={{
            invoiceNumber: invoice.invoiceNumber,
            title: invoice.title,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            subtotal: Number(invoice.subtotal),
            taxRate: Number(invoice.taxRate),
            tax: Number(invoice.tax),
            total: Number(invoice.total),
            paidAmount: Number(invoice.paidAmount),
            remainingAmount: Number(invoice.remainingAmount),
            notes: invoice.notes,
            customer: invoice.project?.customer ? {
              name: invoice.project.customer.name,
              address: invoice.project.customer.address,
            } : undefined,
            project: invoice.project ? {
              projectNumber: invoice.project.projectNumber,
              title: invoice.project.title,
            } : undefined,
            details: (invoice.details || []).map((d) => ({
              id: d.id,
              name: d.name,
              description: d.description,
              quantity: Number(d.quantity),
              unit: d.unit,
              unitPrice: Number(d.unitPrice),
              amount: Number(d.amount),
            })),
          }}
        />
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>入金を記録</DialogTitle>
            <DialogDescription>
              請求書 {invoice.invoiceNumber} への入金を記録します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>残額</span>
                <span className="font-bold text-orange-600">
                  ¥{Number(invoice.remainingAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentDate">入金日 *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">金額 *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentData({
                    ...paymentData,
                    amount: String(Number(invoice.remainingAmount))
                  })}
                >
                  残額全額を入力
                </Button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">入金方法</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(value) => setPaymentData({ ...paymentData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">銀行振込</SelectItem>
                    <SelectItem value="credit_card">クレジットカード</SelectItem>
                    <SelectItem value="cash">現金</SelectItem>
                    <SelectItem value="check">小切手</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reference">参照情報（振込名義等）</Label>
                <Input
                  id="reference"
                  placeholder="例: カ）ABC商事"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">メモ</Label>
                <Textarea
                  id="notes"
                  placeholder="入金に関するメモ"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              キャンセル
            </Button>
            <Button
              onClick={handleRecordPayment}
              disabled={!paymentData.amount || recordPayment.isPending}
            >
              {recordPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              記録する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>請求書を削除</DialogTitle>
            <DialogDescription>
              請求書 {invoice.invoiceNumber} を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
