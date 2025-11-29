"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const invoicesData = {
  summary: {
    totalPaid: 2450000,
    unpaidAmount: 150000,
    overdueAmount: 0,
  },
  invoices: [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      projectTitle: "内装リフォーム工事",
      issueDate: new Date("2024-11-01"),
      dueDate: new Date("2024-12-01"),
      amount: 150000,
      paidAmount: 0,
      status: "unpaid" as const,
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      projectTitle: "キッチン交換工事",
      issueDate: new Date("2024-09-15"),
      dueDate: new Date("2024-10-15"),
      amount: 850000,
      paidAmount: 850000,
      status: "paid" as const,
    },
    {
      id: "3",
      invoiceNumber: "INV-2023-015",
      projectTitle: "外壁塗装工事",
      issueDate: new Date("2023-06-10"),
      dueDate: new Date("2023-07-10"),
      amount: 1200000,
      paidAmount: 1200000,
      status: "paid" as const,
    },
    {
      id: "4",
      invoiceNumber: "INV-2022-008",
      projectTitle: "屋根塗装工事",
      issueDate: new Date("2022-03-01"),
      dueDate: new Date("2022-04-01"),
      amount: 400000,
      paidAmount: 400000,
      status: "paid" as const,
    },
  ],
};

const statusConfig = {
  paid: { label: "支払済", color: "bg-green-100 text-green-800", icon: CheckCircle },
  unpaid: { label: "未払", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  overdue: { label: "期限超過", color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function PortalInvoicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        <p className="text-muted-foreground">
          工事費用の請求書を確認できます
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-600" />
              支払済総額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ¥{invoicesData.summary.totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 text-yellow-600" />
              未払金額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ¥{invoicesData.summary.unpaidAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              期限超過金額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ¥{invoicesData.summary.overdueAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices Alert */}
      {invoicesData.summary.unpaidAmount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">未払いの請求書があります</p>
                <p className="text-sm text-yellow-700">
                  お支払い期限までにお振込みをお願いいたします
                </p>
              </div>
            </div>
            <Button>お支払い方法を確認</Button>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            請求書履歴
          </CardTitle>
          <CardDescription>過去の請求書を確認・ダウンロードできます</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求番号</TableHead>
                <TableHead>工事内容</TableHead>
                <TableHead>発行日</TableHead>
                <TableHead>支払期限</TableHead>
                <TableHead className="text-right">請求金額</TableHead>
                <TableHead>状態</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesData.invoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.projectTitle}
                    </TableCell>
                    <TableCell>
                      {format(invoice.issueDate, "yyyy/M/d")}
                    </TableCell>
                    <TableCell>
                      {format(invoice.dueDate, "yyyy/M/d")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{invoice.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            お支払い方法
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-medium">銀行振込</p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>○○銀行 △△支店 普通 1234567</p>
              <p>口座名義: カ）リンク</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            ※お振込み手数料はお客様ご負担となります
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
