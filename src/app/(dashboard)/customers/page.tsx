"use client";

import Link from "next/link";
import { useState } from "react";
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
  MapPin,
  FileText,
  Home,
  Crown,
  Award,
  Gem,
} from "lucide-react";
import { CUSTOMER_RANK } from "@/constants";

// デモデータ
const customers = [
  {
    id: "1",
    type: "individual",
    name: "山田太郎",
    email: "yamada@example.com",
    phone: "090-1234-5678",
    address: "東京都渋谷区○○1-2-3",
    tags: ["VIP", "リピーター"],
    rank: "platinum",
    totalTransaction: 5200000,
    points: 24500,
    estimateCount: 8,
    projectCount: 5,
    lastTransaction: new Date("2024-10-15"),
  },
  {
    id: "2",
    type: "corporate",
    name: "佐藤建設株式会社",
    email: "info@sato-kensetsu.co.jp",
    phone: "03-1234-5678",
    address: "東京都新宿区○○4-5-6",
    tags: ["法人", "大口"],
    rank: "gold",
    totalTransaction: 3800000,
    points: 18000,
    estimateCount: 12,
    projectCount: 8,
    lastTransaction: new Date("2024-11-01"),
  },
  {
    id: "3",
    type: "individual",
    name: "田中花子",
    email: "tanaka@example.com",
    phone: "080-9876-5432",
    address: "神奈川県横浜市○○7-8-9",
    tags: ["紹介"],
    rank: "silver",
    totalTransaction: 1500000,
    points: 7500,
    estimateCount: 3,
    projectCount: 2,
    lastTransaction: new Date("2024-09-20"),
  },
  {
    id: "4",
    type: "individual",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    phone: "070-1111-2222",
    address: "千葉県船橋市○○10-11",
    tags: [],
    rank: "member",
    totalTransaction: 450000,
    points: 2250,
    estimateCount: 2,
    projectCount: 1,
    lastTransaction: new Date("2024-08-15"),
  },
  {
    id: "5",
    type: "corporate",
    name: "高橋商事株式会社",
    email: "contact@takahashi-shoji.co.jp",
    phone: "03-5555-6666",
    address: "東京都港区○○12-13",
    tags: ["新規"],
    rank: "member",
    totalTransaction: 980000,
    points: 4900,
    estimateCount: 4,
    projectCount: 1,
    lastTransaction: new Date("2024-11-10"),
  },
];

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
            <div className="text-2xl font-bold">156人</div>
            <p className="text-xs text-muted-foreground">+12人（今月）</p>
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
            <div className="text-2xl font-bold">¥1.2M</div>
            <p className="text-xs text-muted-foreground">全期間</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP顧客数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18人</div>
            <p className="text-xs text-muted-foreground">ゴールド以上</p>
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
                <Input placeholder="名前・住所で検索..." className="pl-9" />
              </div>
              <Select defaultValue="all">
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
              {customers.map((customer) => (
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
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {customer.tags.map((tag) => (
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
                    ¥{customer.totalTransaction.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.points.toLocaleString()} pt
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        {customer.estimateCount}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="flex items-center gap-1">
                        <Home className="h-3 w-3 text-muted-foreground" />
                        {customer.projectCount}
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
                        <DropdownMenuItem>詳細を見る</DropdownMenuItem>
                        <DropdownMenuItem>編集</DropdownMenuItem>
                        <DropdownMenuItem>見積を作成</DropdownMenuItem>
                        <DropdownMenuItem>物件を追加</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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
