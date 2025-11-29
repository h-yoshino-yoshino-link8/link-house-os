"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Banknote,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { useInvoices } from "@/hooks/use-invoices";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { useState } from "react";

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

export default function InvoicesPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: invoicesData, isLoading } = useInvoices({
    companyId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const invoices = invoicesData?.data ?? [];

  // フィルタリング
  const filteredInvoices = invoices.filter((invoice) =>
    search
      ? invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        invoice.title.toLowerCase().includes(search.toLowerCase())
      : true
  );

  // 集計
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const unpaidAmount = invoices.reduce((sum, inv) => sum + Number(inv.remainingAmount), 0);
  const overdueCount = invoices.filter(
    (inv) => inv.status !== "paid" && new Date(inv.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">請求管理</h1>
          <p className="text-muted-foreground">請求書の発行・入金管理</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              請求総額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{invoices.length}件の請求書</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              入金済
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">¥{paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4 text-orange-600" />
              未入金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">¥{unpaidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              期限超過
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}件</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>請求書一覧</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="請求番号・タイトルで検索"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="issued">発行済</SelectItem>
                  <SelectItem value="sent">送付済</SelectItem>
                  <SelectItem value="partial_paid">一部入金</SelectItem>
                  <SelectItem value="paid">入金済</SelectItem>
                  <SelectItem value="overdue">期限超過</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4" />
              <p>請求書がありません</p>
              <p className="text-sm">案件詳細から請求書を発行できます</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>請求番号</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>案件</TableHead>
                  <TableHead>発行日</TableHead>
                  <TableHead>支払期限</TableHead>
                  <TableHead className="text-right">請求額</TableHead>
                  <TableHead className="text-right">入金済</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const isOverdue =
                    invoice.status !== "paid" && new Date(invoice.dueDate) < new Date();
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">{invoice.title}</TableCell>
                      <TableCell>
                        {invoice.project ? (
                          <Link
                            href={`/projects/${invoice.projectId}`}
                            className="hover:underline text-primary"
                          >
                            {invoice.project.projectNumber}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell className={isOverdue ? "text-red-600" : ""}>
                        {formatDate(invoice.dueDate)}
                        {isOverdue && <AlertCircle className="inline ml-1 h-3 w-3" />}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{Number(invoice.total).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ¥{Number(invoice.paidAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>
                          {statusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/invoices/${invoice.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
