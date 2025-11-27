"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  User,
  Building,
  Phone,
  Mail,
  FileText,
  Home,
  Crown,
  Award,
  Gem,
  Loader2,
} from "lucide-react";
import { CUSTOMER_RANK } from "@/constants";
import { useCustomers, useCreateCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import type { Customer } from "@/lib/api/types";

const rankIcons: Record<string, React.ReactNode> = {
  member: <User className="h-4 w-4" />,
  silver: <Award className="h-4 w-4 text-slate-500" />,
  gold: <Award className="h-4 w-4 text-yellow-500" />,
  platinum: <Crown className="h-4 w-4 text-cyan-500" />,
  diamond: <Gem className="h-4 w-4 text-purple-500" />,
};

const rankColors: Record<string, string> = {
  member: "bg-gray-100 text-gray-800",
  silver: "bg-slate-100 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-cyan-100 text-cyan-800",
  diamond: "bg-purple-100 text-purple-800",
};

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // ストアからcompanyIdを取得（開発時はデモID）
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  // 顧客一覧を取得
  const { data, isLoading, isError } = useCustomers({
    companyId,
    search: search || undefined,
    rank: rankFilter !== "all" ? rankFilter : undefined,
    page,
    limit: 20,
  });

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  // 統計情報の計算
  const stats = useMemo(() => {
    if (!customers.length) {
      return {
        total: 0,
        vipCount: 0,
        avgTransaction: 0,
      };
    }
    const vipCount = customers.filter(
      (c) => c.rank === "gold" || c.rank === "platinum" || c.rank === "diamond"
    ).length;
    const totalTransaction = customers.reduce((sum, c) => sum + Number(c.totalTransaction), 0);
    return {
      total: pagination?.total ?? customers.length,
      vipCount,
      avgTransaction: totalTransaction / customers.length,
    };
  }, [customers, pagination]);

  // 新規顧客作成ミューテーション
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleCreateCustomer = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const type = formData.get("type") as "individual" | "corporate";
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const tagsStr = formData.get("tags") as string;
    const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()) : [];

    await createCustomer.mutateAsync({
      companyId,
      name,
      type,
      phone: phone || undefined,
      email: email || undefined,
      address: address || undefined,
      tags,
    });
    setIsDialogOpen(false);
  };

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
          <h1 className="text-3xl font-bold">顧客管理</h1>
          <p className="text-muted-foreground">顧客情報の管理・取引履歴の確認</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規顧客登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新規顧客登録</DialogTitle>
              <DialogDescription>
                顧客情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>顧客種別</Label>
                  <Select defaultValue="individual">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">個人</SelectItem>
                      <SelectItem value="corporate">法人</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>氏名/会社名</Label>
                  <Input placeholder="山田太郎" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>電話番号</Label>
                  <Input placeholder="090-1234-5678" />
                </div>
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <Input type="email" placeholder="example@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>住所</Label>
                <Input placeholder="東京都渋谷区○○1-2-3" />
              </div>
              <div className="space-y-2">
                <Label>タグ</Label>
                <Input placeholder="VIP, 紹介, 新規 など（カンマ区切り）" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                登録
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
              総顧客数
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.total}人</div>
                <p className="text-xs text-muted-foreground">登録済み</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              リピート率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42%</div>
            <p className="text-xs text-green-600">+5%（前年比）</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均取引額
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  ¥{(stats.avgTransaction / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">全期間</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP顧客数
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.vipCount}人</div>
                <p className="text-xs text-muted-foreground">ゴールド以上</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>顧客一覧</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="名前・住所で検索..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={rankFilter}
                onValueChange={(value) => {
                  setRankFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ランク" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="diamond">ダイヤモンド</SelectItem>
                  <SelectItem value="platinum">プラチナ</SelectItem>
                  <SelectItem value="gold">ゴールド</SelectItem>
                  <SelectItem value="silver">シルバー</SelectItem>
                  <SelectItem value="member">メンバー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>顧客</TableHead>
                <TableHead>連絡先</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>ランク</TableHead>
                <TableHead className="text-right">累計取引額</TableHead>
                <TableHead className="text-right">ポイント</TableHead>
                <TableHead className="text-center">見積/工事</TableHead>
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
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    顧客が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {customer.type === "corporate" ? (
                              <Building className="h-4 w-4" />
                            ) : (
                              customer.name.slice(0, 2)
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/customers/${customer.id}`}
                            className="font-medium hover:underline"
                          >
                            {customer.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {customer.type === "corporate" ? "法人" : "個人"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={rankColors[customer.rank]}>
                        <span className="flex items-center gap-1">
                          {rankIcons[customer.rank]}
                          {CUSTOMER_RANK[customer.rank as keyof typeof CUSTOMER_RANK]?.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{Number(customer.totalTransaction).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.points.toLocaleString()} pt
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          {customer._count?.estimates ?? 0}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          {customer._count?.projects ?? 0}
                        </span>
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
                            <Link href={`/customers/${customer.id}`}>詳細を見る</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>編集</DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/estimates/new?customerId=${customer.id}`}>見積を作成</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/houses/new?customerId=${customer.id}`}>物件を追加</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("この顧客を削除しますか？")) {
                                deleteCustomer.mutate(customer.id);
                              }
                            }}
                          >
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
