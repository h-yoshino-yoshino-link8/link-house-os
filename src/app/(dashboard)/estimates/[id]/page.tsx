"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Home,
  Calendar,
  Edit,
  Send,
  Copy,
  Trash,
  MoreHorizontal,
  TrendingUp,
  Banknote,
  Calculator,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Mail,
} from "lucide-react";
import { ESTIMATE_STATUS } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import { useEstimate, useUpdateEstimate, useDeleteEstimate, useConfirmOrder } from "@/hooks/use-estimates";
import { useEstimateStore } from "@/stores/estimate-store";
import { PDFDownloadButton } from "@/components/estimates/pdf-download-button";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  ordered: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = params.id as string;
  const estimateStore = useEstimateStore();

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { data, isLoading, isError } = useEstimate(estimateId);
  const estimate = data?.data;
  const updateEstimate = useUpdateEstimate(estimateId);
  const deleteEstimate = useDeleteEstimate();
  const confirmOrder = useConfirmOrder(estimateId);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEstimate.mutateAsync({ status: newStatus });
      toast.success("ステータスを更新しました");
    } catch {
      toast.error("ステータスの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!confirm("この見積を削除しますか？")) return;
    try {
      await deleteEstimate.mutateAsync(estimateId);
      toast.success("見積を削除しました");
      router.push("/estimates");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  // コピーして作成
  const handleCopy = () => {
    if (!estimate) return;

    interface EstimateDetailFromAPI {
      id: string;
      name: string;
      specification?: string | null;
      quantity: number;
      unit?: string | null;
      costMaterial: number | string;
      costLabor: number | string;
      profitRate: number | string;
      internalMemo?: string | null;
    }

    const details = (estimate.details || []) as EstimateDetailFromAPI[];

    estimateStore.loadFromEstimate({
      customerId: estimate.customerId,
      houseId: estimate.houseId,
      title: estimate.title,
      notes: estimate.notes,
      internalMemo: estimate.internalMemo,
      taxRate: estimate.taxRate,
      details: details.map((d) => ({
        name: d.name,
        specification: d.specification,
        quantity: Number(d.quantity),
        unit: d.unit,
        costMaterial: Number(d.costMaterial),
        costLabor: Number(d.costLabor),
        profitRate: Number(d.profitRate),
        internalMemo: d.internalMemo,
      })),
    });

    toast.success("見積データをコピーしました");
    router.push("/estimates/new");
  };

  // メール送信ダイアログを開く
  const openEmailDialog = () => {
    if (!estimate) return;

    setEmailTo(estimate.customer?.email || "");
    setEmailSubject(`【御見積書】${estimate.title} - ${estimate.estimateNumber}`);
    setEmailBody(
      `${estimate.customer?.name || "お客"} 様\n\n` +
      `いつもお世話になっております。\n\n` +
      `ご依頼いただきました「${estimate.title}」の御見積書をお送りいたします。\n\n` +
      `■ 見積番号: ${estimate.estimateNumber}\n` +
      `■ 御見積金額: ¥${Number(estimate.total).toLocaleString()}（税込）\n` +
      `■ 有効期限: ${estimate.validUntil ? formatDate(estimate.validUntil, "yyyy年M月d日") : "なし"}\n\n` +
      `ご不明な点がございましたら、お気軽にお問い合わせください。\n\n` +
      `何卒よろしくお願い申し上げます。`
    );
    setIsEmailDialogOpen(true);
  };

  // メール送信（実際の実装ではAPIを呼び出す）
  const handleSendEmail = async () => {
    if (!emailTo) {
      toast.error("送信先メールアドレスを入力してください");
      return;
    }

    setIsSendingEmail(true);
    try {
      // TODO: 実際のメール送信API実装
      // await fetch("/api/send-email", { ... });

      // デモ用：成功として扱う
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("メールを送信しました（デモ）");
      setIsEmailDialogOpen(false);
    } catch {
      toast.error("メール送信に失敗しました");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !estimate) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">見積データの取得に失敗しました</p>
      </div>
    );
  }

  // Type for estimate detail items from API
  interface EstimateDetailItem {
    id: string;
    sortOrder: number;
    name: string;
    specification?: string | null;
    quantity: number;
    unit?: string | null;
    costMaterial: number;
    costLabor: number;
    costUnit: number;
    costTotal: number;
    profitRate: number;
    priceUnit: number;
    priceTotal: number;
    internalMemo?: string | null;
    children?: EstimateDetailItem[];
  }

  // 明細を再計算（DBに¥0で保存されている場合でも正しく表示）
  const calculatePriceFromCost = (cost: number, profitRate: number): number => {
    if (profitRate >= 100) return cost;
    return cost / (1 - profitRate / 100);
  };

  const rawDetails = (estimate.details || []) as EstimateDetailItem[];
  const details = rawDetails.map(d => {
    const costMaterial = Number(d.costMaterial || 0);
    const costLabor = Number(d.costLabor || 0);
    const quantity = Number(d.quantity || 1);
    const profitRate = Number(d.profitRate || 25);

    const costUnit = costMaterial + costLabor;
    const costTotal = costUnit * quantity;
    const priceUnit = calculatePriceFromCost(costUnit, profitRate);
    const priceTotal = priceUnit * quantity;

    return {
      ...d,
      costMaterial,
      costLabor,
      costUnit,
      costTotal,
      profitRate,
      priceUnit,
      priceTotal,
    };
  });

  // 合計を再計算
  const costTotal = details.reduce((sum, d) => sum + d.costTotal, 0);
  const subtotal = details.reduce((sum, d) => sum + d.priceTotal, 0);
  const tax = Math.floor(subtotal * (Number(estimate.taxRate || 10) / 100));
  const total = subtotal + tax;
  const profit = subtotal - costTotal;
  const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/estimates">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{estimate.title}</h1>
              <Badge className={statusColors[estimate.status]}>
                {ESTIMATE_STATUS[estimate.status as keyof typeof ESTIMATE_STATUS]?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{estimate.estimateNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/estimates/${estimateId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
          <PDFDownloadButton
            estimate={{
              estimateNumber: estimate.estimateNumber,
              title: estimate.title,
              estimateDate: estimate.estimateDate,
              validUntil: estimate.validUntil,
              subtotal,
              taxRate: estimate.taxRate,
              tax,
              total,
              costTotal,
              profit,
              profitRate,
              notes: estimate.notes,
              customer: estimate.customer,
              details: details.map((d) => ({
                id: d.id,
                name: d.name,
                specification: d.specification,
                quantity: d.quantity,
                unit: d.unit,
                costMaterial: Number(d.costMaterial),
                costLabor: Number(d.costLabor),
                costTotal: Number(d.costTotal),
                profitRate: Number(d.profitRate),
                priceUnit: Number(d.priceUnit),
                priceTotal: Number(d.priceTotal),
              })),
            }}
          />
          <Select
            value={estimate.status}
            onValueChange={handleStatusChange}
            disabled={updateEstimate.isPending}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="ステータス変更" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ESTIMATE_STATUS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                コピーして作成
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openEmailDialog}>
                <Send className="mr-2 h-4 w-4" />
                メール送信
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                <Trash className="mr-2 h-4 w-4" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                見積金額（税込）
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              税抜: ¥{subtotal.toLocaleString()} / 消費税: ¥{tax.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                原価合計
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{costTotal.toLocaleString()}</div>
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
              ¥{profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                粗利率
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitRate >= 30 ? "text-green-600" : profitRate >= 20 ? "text-yellow-600" : "text-red-600"}`}>
              {profitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              目標: 25%以上
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              顧客情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">顧客名</span>
              {estimate.customer ? (
                <Link href={`/customers/${estimate.customer.id}`} className="font-medium hover:underline">
                  {estimate.customer.name}
                </Link>
              ) : (
                <span>-</span>
              )}
            </div>
            {estimate.customer?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">電話番号</span>
                <span>{estimate.customer.phone}</span>
              </div>
            )}
            {estimate.customer?.email && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">メール</span>
                <span>{estimate.customer.email}</span>
              </div>
            )}
            {estimate.customer?.address && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">住所</span>
                <span className="text-right max-w-[180px] truncate">{estimate.customer.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* House Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4" />
              物件情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {estimate.house ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <Link href={`/houses/${estimate.house.id}`} className="font-medium hover:underline text-right max-w-[180px] truncate">
                    {estimate.house.address}
                  </Link>
                </div>
                {estimate.house.structureType && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">構造</span>
                    <span>{estimate.house.structureType}</span>
                  </div>
                )}
                {estimate.house.builtYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">築年</span>
                    <span>{estimate.house.builtYear}年</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">物件情報なし</p>
            )}
          </CardContent>
        </Card>

        {/* Estimate Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              見積情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">見積日</span>
              <span>{formatDate(estimate.estimateDate)}</span>
            </div>
            {estimate.validUntil && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">有効期限</span>
                <span>{formatDate(estimate.validUntil)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">税率</span>
              <span>{estimate.taxRate}%</span>
            </div>
            {estimate.project && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">関連案件</span>
                <Link href={`/projects/${estimate.project.id}`} className="font-medium hover:underline flex items-center gap-1">
                  {estimate.project.projectNumber}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estimate Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>見積明細</CardTitle>
          <CardDescription>明細 {details.length}件</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">No.</TableHead>
                <TableHead>項目名</TableHead>
                <TableHead>仕様</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>単位</TableHead>
                <TableHead className="text-right">原価単価</TableHead>
                <TableHead className="text-right">原価計</TableHead>
                <TableHead className="text-right">粗利率</TableHead>
                <TableHead className="text-right">単価</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    明細がありません
                  </TableCell>
                </TableRow>
              ) : (
                details.map((detail, index) => (
                  <TableRow key={detail.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{detail.name}</TableCell>
                    <TableCell className="text-muted-foreground">{detail.specification || "-"}</TableCell>
                    <TableCell className="text-right">{detail.quantity}</TableCell>
                    <TableCell>{detail.unit || "-"}</TableCell>
                    <TableCell className="text-right">¥{Number(detail.costUnit).toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥{Number(detail.costTotal).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={Number(detail.profitRate) >= 25 ? "text-green-600" : "text-yellow-600"}>
                        {Number(detail.profitRate).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">¥{Number(detail.priceUnit).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">¥{Number(detail.priceTotal).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">小計（税抜）</TableCell>
                <TableCell className="text-right">¥{costTotal.toLocaleString()}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-bold">¥{subtotal.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">消費税（{estimate.taxRate}%）</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">¥{tax.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-medium">合計（税込）</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right font-bold text-lg">¥{total.toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {(estimate.notes || estimate.internalMemo) && (
        <div className="grid gap-4 md:grid-cols-2">
          {estimate.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">備考</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{estimate.notes}</p>
              </CardContent>
            </Card>
          )}
          {estimate.internalMemo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">社内メモ</CardTitle>
                <CardDescription>この内容は顧客には表示されません</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{estimate.internalMemo}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {estimate.status === "draft" && (
                <Button onClick={() => handleStatusChange("submitted")}>
                  <Send className="mr-2 h-4 w-4" />
                  提出する
                </Button>
              )}
              {estimate.status === "submitted" && (
                <>
                  <Button
                    onClick={async () => {
                      try {
                        const result = await confirmOrder.mutateAsync({});
                        toast.success(result.data.message);
                        // 作成された案件ページへ遷移
                        router.push(`/projects/${result.data.project.id}`);
                      } catch {
                        toast.error("受注確定に失敗しました");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={confirmOrder.isPending}
                  >
                    {confirmOrder.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    受注確定
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange("lost")}>
                    失注
                  </Button>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              作成: {estimate.createdBy?.name || "-"} / 最終更新: {formatDate(estimate.updatedAt, "yyyy/MM/dd HH:mm")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              見積書をメール送信
            </DialogTitle>
            <DialogDescription>
              見積書をPDF添付してメールを送信します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>送信先メールアドレス *</Label>
              <Input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>件名</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>本文</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              送信
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
