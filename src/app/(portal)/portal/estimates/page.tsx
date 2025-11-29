"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  FileText,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { usePortalEstimates, useApproveEstimate } from "@/hooks/use-portal";
import { toast } from "sonner";

// デモデータ
const demoEstimates = [
  {
    id: "1",
    estimateNumber: "EST-2024-025",
    title: "バスルームリフォーム",
    estimateDate: new Date("2024-12-01"),
    validUntil: new Date("2024-12-31"),
    subtotal: 1681818,
    tax: 168182,
    total: 1850000,
    status: "submitted",
    notes: "ユニットバス交換、給排水管更新",
    house: { id: "1", address: "東京都渋谷区○○1-2-3" },
    details: [
      { id: "1", name: "ユニットバス本体", specification: "TOTO サザナ", quantity: 1, unit: "式", priceUnit: 800000, priceTotal: 800000, level: 0, isCategory: false, parentId: null },
      { id: "2", name: "設置工事", specification: "", quantity: 1, unit: "式", priceUnit: 300000, priceTotal: 300000, level: 0, isCategory: false, parentId: null },
      { id: "3", name: "給排水工事", specification: "", quantity: 1, unit: "式", priceUnit: 250000, priceTotal: 250000, level: 0, isCategory: false, parentId: null },
      { id: "4", name: "電気工事", specification: "", quantity: 1, unit: "式", priceUnit: 150000, priceTotal: 150000, level: 0, isCategory: false, parentId: null },
      { id: "5", name: "諸経費", specification: "", quantity: 1, unit: "式", priceUnit: 181818, priceTotal: 181818, level: 0, isCategory: false, parentId: null },
    ],
  },
  {
    id: "2",
    estimateNumber: "EST-2024-018",
    title: "キッチン交換工事",
    estimateDate: new Date("2024-09-10"),
    validUntil: new Date("2024-10-10"),
    subtotal: 772727,
    tax: 77273,
    total: 850000,
    status: "ordered",
    notes: "システムキッチン交換",
    house: { id: "1", address: "東京都渋谷区○○1-2-3" },
    details: [],
  },
];

const statusConfig = {
  submitted: { label: "検討中", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pending: { label: "検討中", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  ordered: { label: "成約済", color: "bg-green-100 text-green-800", icon: CheckCircle },
  lost: { label: "失効", color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
};

export default function PortalEstimatesPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data: apiEstimates, isLoading, error } = usePortalEstimates(token);
  const approveEstimate = useApproveEstimate(token);

  const [selectedEstimate, setSelectedEstimate] = useState<{
    id: string;
    estimateNumber: string;
    title: string;
    total: number;
    validUntil: Date | null;
    notes: string | null;
  } | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // APIデータがあればそれを使用、なければデモデータ
  const estimates = apiEstimates || demoEstimates;

  const pendingEstimates = estimates.filter(e => e.status === "submitted" || e.status === "pending");
  const validUntilSoon = pendingEstimates.filter(e => {
    if (!e.validUntil) return false;
    const daysLeft = Math.ceil((new Date(e.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  });

  const handleApprove = async () => {
    if (!selectedEstimate || !token) return;

    try {
      await approveEstimate.mutateAsync({
        estimateId: selectedEstimate.id,
      });
      toast.success("お見積りを承認しました。工事の準備を開始いたします。");
      setShowApproveDialog(false);
      setSelectedEstimate(null);
    } catch (err) {
      toast.error("承認に失敗しました。もう一度お試しください。");
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">お見積り一覧</h1>
        <p className="text-muted-foreground">
          提出されたお見積りを確認・承認できます
        </p>
      </div>

      {/* Demo Mode Banner */}
      {!token && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800">
              デモモードで表示中です。実際のポータルでは、お見積りの承認や質問ができます。
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Alert */}
      {validUntilSoon.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  有効期限が近いお見積りがあります
                </p>
                <p className="text-sm text-orange-700">
                  {validUntilSoon.length}件のお見積りが7日以内に期限を迎えます
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 text-yellow-600" />
              検討中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingEstimates.length}件
            </div>
            <p className="text-xs text-muted-foreground">
              ¥{pendingEstimates.reduce((sum, e) => sum + e.total, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              成約済
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estimates.filter(e => e.status === "ordered").length}件
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              全件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estimates.length}件
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Estimates with Details */}
      {pendingEstimates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              検討中のお見積り
            </CardTitle>
            <CardDescription>タップで詳細を確認できます</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEstimates.map((estimate) => {
              const isExpanded = expandedDetails[estimate.id];
              const daysLeft = estimate.validUntil
                ? Math.ceil((new Date(estimate.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;

              return (
                <div
                  key={estimate.id}
                  className={`rounded-lg border ${isExpiringSoon ? "border-orange-300 bg-orange-50/50" : ""}`}
                >
                  {/* Estimate Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleDetails(estimate.id)}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 mt-1">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-muted-foreground">
                              {estimate.estimateNumber}
                            </span>
                            {isExpiringSoon && (
                              <Badge variant="destructive" className="text-xs">
                                残り{daysLeft}日
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-lg">{estimate.title}</h3>
                          {estimate.notes && (
                            <p className="text-sm text-muted-foreground">{estimate.notes}</p>
                          )}
                          {estimate.validUntil && (
                            <p className="text-sm text-muted-foreground mt-1">
                              有効期限: {format(new Date(estimate.validUntil), "yyyy年M月d日", { locale: ja })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-9 md:ml-0">
                        <p className="text-2xl font-bold">
                          ¥{estimate.total.toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          {token && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEstimate(estimate);
                                setShowApproveDialog(true);
                              }}
                            >
                              発注する
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estimate Details */}
                  {isExpanded && estimate.details.length > 0 && (
                    <div className="border-t px-4 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>項目</TableHead>
                            <TableHead>仕様</TableHead>
                            <TableHead className="text-right">数量</TableHead>
                            <TableHead className="text-right">単価</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {estimate.details.map((detail) => (
                            <TableRow key={detail.id}>
                              <TableCell className={detail.isCategory ? "font-bold" : ""}>
                                <div style={{ paddingLeft: detail.level * 16 }}>
                                  {detail.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {detail.specification || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.quantity} {detail.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                ¥{detail.priceUnit.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ¥{detail.priceTotal.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex justify-end">
                        <div className="w-64 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">小計</span>
                            <span>¥{estimate.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">消費税</span>
                            <span>¥{estimate.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-1">
                            <span>合計</span>
                            <span>¥{estimate.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Estimates History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            お見積り履歴
          </CardTitle>
          <CardDescription>過去のお見積りを確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>見積番号</TableHead>
                <TableHead>工事内容</TableHead>
                <TableHead>提出日</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>状態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => {
                const status = statusConfig[estimate.status as keyof typeof statusConfig] || statusConfig.submitted;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-mono text-sm">
                      {estimate.estimateNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{estimate.title}</p>
                        {estimate.notes && (
                          <p className="text-xs text-muted-foreground">{estimate.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(estimate.estimateDate), "yyyy/M/d")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{estimate.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Estimate */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-lg">新しいお見積りを依頼</p>
              <p className="text-muted-foreground">
                リフォームや修繕のお見積りをご依頼いただけます
              </p>
            </div>
            <Button>見積を依頼する</Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>お見積りの承認</DialogTitle>
            <DialogDescription>
              このお見積りを承認して発注しますか？
            </DialogDescription>
          </DialogHeader>
          {selectedEstimate && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4">
                <p className="font-mono text-sm text-muted-foreground">
                  {selectedEstimate.estimateNumber}
                </p>
                <p className="font-bold text-lg">{selectedEstimate.title}</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  ¥{selectedEstimate.total.toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                承認後、担当者より工事日程についてご連絡いたします。
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleApprove} disabled={approveEstimate.isPending}>
              {approveEstimate.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              承認して発注する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
