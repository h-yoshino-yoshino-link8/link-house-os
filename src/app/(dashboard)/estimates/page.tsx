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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Copy,
  Trash,
  Send,
  Download,
} from "lucide-react";
import { ESTIMATE_STATUS } from "@/constants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const estimates = [
  {
    id: "1",
    estimateNumber: "EST-2024-001",
    title: "キッチンリフォーム工事",
    customerName: "山田太郎 様",
    total: 1633857,
    costTotal: 679000,
    profitRate: 54.3,
    status: "submitted",
    estimateDate: new Date("2024-11-20"),
    validUntil: new Date("2024-12-20"),
  },
  {
    id: "2",
    estimateNumber: "EST-2024-002",
    title: "外壁塗装工事",
    customerName: "佐藤建設 様",
    total: 1250000,
    costTotal: 875000,
    profitRate: 30.0,
    status: "ordered",
    estimateDate: new Date("2024-11-15"),
    validUntil: new Date("2024-12-15"),
  },
  {
    id: "3",
    estimateNumber: "EST-2024-003",
    title: "浴室リフォーム工事",
    customerName: "田中工務店 様",
    total: 980000,
    costTotal: 686000,
    profitRate: 30.0,
    status: "draft",
    estimateDate: new Date("2024-11-25"),
    validUntil: new Date("2024-12-25"),
  },
  {
    id: "4",
    estimateNumber: "EST-2024-004",
    title: "屋根葺き替え工事",
    customerName: "鈴木邸",
    total: 2500000,
    costTotal: 1750000,
    profitRate: 30.0,
    status: "lost",
    estimateDate: new Date("2024-11-10"),
    validUntil: new Date("2024-12-10"),
  },
  {
    id: "5",
    estimateNumber: "EST-2024-005",
    title: "内装リノベーション",
    customerName: "高橋商事 様",
    total: 4500000,
    costTotal: 3150000,
    profitRate: 30.0,
    status: "pending",
    estimateDate: new Date("2024-11-22"),
    validUntil: new Date("2024-12-22"),
  },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  ordered: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function EstimatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">見積管理</h1>
          <p className="text-muted-foreground">見積書の作成・管理・提出</p>
        </div>
        <Button asChild>
          <Link href="/estimates/new">
            <Plus className="mr-2 h-4 w-4" />
            新規見積作成
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月の見積件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              見積総額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥24.5M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              受注率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均粗利率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>見積一覧</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="検索..." className="pl-9" />
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
              {estimates.map((estimate) => (
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
                  <TableCell>{estimate.customerName}</TableCell>
                  <TableCell className="text-right">
                    ¥{estimate.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        estimate.profitRate >= 30
                          ? "text-green-600"
                          : estimate.profitRate >= 20
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {estimate.profitRate.toFixed(1)}%
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
                    {format(estimate.estimateDate, "yyyy/MM/dd", { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          詳細を見る
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
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
