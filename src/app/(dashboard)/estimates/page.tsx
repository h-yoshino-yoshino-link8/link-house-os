"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FileText,
  Copy,
  Trash,
  Send,
  Download,
  Loader2,
} from "lucide-react";
import { ESTIMATE_STATUS } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import { downloadCSV, formatEstimatesForExport } from "@/lib/utils/export";
import { useEstimates, useDeleteEstimate } from "@/hooks/use-estimates";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import type { Estimate } from "@/lib/api/types";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  ordered: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function EstimatesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // ストアからcompanyIdを取得
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  // 見積一覧を取得
  const { data, isLoading, isError } = useEstimates({
    companyId,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: 20,
  });

  const estimates = data?.data ?? [];
  const pagination = data?.pagination;
  const deleteEstimate = useDeleteEstimate();

  // 統計情報の計算
  const stats = useMemo(() => {
    if (!estimates.length) {
      return {
        total: pagination?.total ?? 0,
        totalAmount: 0,
        orderRate: 0,
        avgProfitRate: 0,
      };
    }
    const totalAmount = estimates.reduce((sum, e) => sum + Number(e.total), 0);
    const orderedCount = estimates.filter((e) => e.status === "ordered").length;
    const orderRate = estimates.length > 0 ? (orderedCount / estimates.length) * 100 : 0;
    const avgProfitRate = estimates.reduce((sum, e) => sum + Number(e.profitRate), 0) / estimates.length;
    return {
      total: pagination?.total ?? estimates.length,
      totalAmount,
      orderRate,
      avgProfitRate,
    };
  }, [estimates, pagination]);

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
          <h1 className="text-3xl font-bold">見積管理</h1>
          <p className="text-muted-foreground">見積書の作成・管理・提出</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (estimates.length > 0) {
                downloadCSV(formatEstimatesForExport(estimates), "見積一覧");
              }
            }}
            disabled={estimates.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV出力
          </Button>
          <Button asChild>
            <Link href="/estimates/new">
              <Plus className="mr-2 h-4 w-4" />
              新規見積作成
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              見積件数
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
              見積総額
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">
                ¥{(stats.totalAmount / 1000000).toFixed(1)}M
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              受注率
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.orderRate.toFixed(0)}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均粗利率
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{stats.avgProfitRate.toFixed(1)}%</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>見積一覧</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="検索..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {Object.entries(ESTIMATE_STATUS).map(([key, value]) => (
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
                <TableHead>見積番号</TableHead>
                <TableHead>件名</TableHead>
                <TableHead>顧客</TableHead>
                <TableHead className="text-right">見積金額</TableHead>
                <TableHead className="text-right">粗利率</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>見積日</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : estimates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    見積が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                estimates.map((estimate) => {
                  const profitRate = Number(estimate.profitRate);
                  return (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className="hover:underline"
                        >
                          {estimate.estimateNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{estimate.title}</TableCell>
                      <TableCell>{estimate.customer?.name ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        ¥{Number(estimate.total).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            profitRate >= 30
                              ? "text-green-600"
                              : profitRate >= 20
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {profitRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[estimate.status]}
                        >
                          {ESTIMATE_STATUS[estimate.status as keyof typeof ESTIMATE_STATUS]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(estimate.estimateDate)}
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
                              <Link href={`/estimates/${estimate.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                詳細を見る
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              コピーして作成
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              PDFダウンロード
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              メール送信
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm("この見積を削除しますか？")) {
                                  deleteEstimate.mutate(estimate.id);
                                }
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
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
