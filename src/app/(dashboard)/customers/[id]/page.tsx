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
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Crown,
  Award,
  Gem,
  Star,
  Gift,
  Home,
  FileText,
  FolderKanban,
  Banknote,
  TrendingUp,
  Calendar,
  Edit,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  Users,
  Wallet,
  CreditCard,
  Heart,
} from "lucide-react";
import { CUSTOMER_RANK, PROJECT_STATUS, ESTIMATE_STATUS, SAVINGS_PLANS } from "@/constants";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// デモデータ
const customerData = {
  id: "1",
  type: "individual",
  name: "山田太郎",
  nameKana: "ヤマダタロウ",
  email: "yamada@example.com",
  phone: "090-1234-5678",
  address: "東京都渋谷区○○1-2-3",
  postalCode: "150-0001",
  birthDate: new Date("1975-05-15"),
  tags: ["VIP", "リピーター"],
  rank: "platinum",
  totalTransaction: 5200000,
  points: 24500,
  pointsUsed: 8000,
  level: 28,
  xp: 2850,
  xpToNextLevel: 3000,
  estimateCount: 8,
  projectCount: 5,
  referralCount: 3,
  registeredAt: new Date("2020-04-15"),
  lastTransaction: new Date("2024-10-15"),
  notes: "リフォーム全般に興味あり。毎年点検を実施。紹介にも積極的。",
  savingsPlan: "standard",
  savingsBalance: 156000,
  houses: [
    { id: "1", name: "山田邸（本宅）", address: "東京都渋谷区○○1-2-3", healthScore: 82 },
    { id: "2", name: "山田邸（別荘）", address: "長野県軽井沢町○○4-5", healthScore: 75 },
  ],
  estimates: [
    { id: "EST-2024-045", title: "外壁塗装工事 見積", status: "ordered", amount: 1800000, createdAt: new Date("2024-09-10") },
    { id: "EST-2024-032", title: "屋根補修工事 見積", status: "lost", amount: 450000, createdAt: new Date("2024-07-20") },
    { id: "EST-2023-089", title: "内装リフォーム 見積", status: "ordered", amount: 1200000, createdAt: new Date("2023-11-05") },
    { id: "EST-2022-056", title: "浴室改修工事 見積", status: "ordered", amount: 980000, createdAt: new Date("2022-08-15") },
  ],
  projects: [
    { id: "PRJ-2024-001", title: "外壁塗装工事", status: "in_progress", amount: 1800000, startDate: new Date("2024-10-01") },
    { id: "PRJ-2023-042", title: "内装リフォーム", status: "paid", amount: 1200000, completedAt: new Date("2023-12-20") },
    { id: "PRJ-2022-028", title: "浴室改修工事", status: "paid", amount: 980000, completedAt: new Date("2022-09-30") },
  ],
  pointHistory: [
    { id: "1", type: "earn", amount: 18000, description: "外壁塗装工事 契約ポイント", createdAt: new Date("2024-09-15") },
    { id: "2", type: "use", amount: -5000, description: "ポイント利用（工事代金充当）", createdAt: new Date("2024-09-15") },
    { id: "3", type: "earn", amount: 500, description: "お誕生日ポイント", createdAt: new Date("2024-05-15") },
    { id: "4", type: "earn", amount: 12000, description: "内装リフォーム 契約ポイント", createdAt: new Date("2023-11-10") },
    { id: "5", type: "earn", amount: 3000, description: "紹介成約ボーナス", createdAt: new Date("2023-08-20") },
  ],
  referrals: [
    { id: "1", name: "田中花子", status: "contracted", projectAmount: 1500000, reward: 30000, createdAt: new Date("2023-08-15") },
    { id: "2", name: "佐藤次郎", status: "estimate", projectAmount: 0, reward: 0, createdAt: new Date("2024-06-10") },
    { id: "3", name: "鈴木三郎", status: "contracted", projectAmount: 800000, reward: 16000, createdAt: new Date("2024-02-20") },
  ],
  transactionHistory: [
    { month: "2024-01", amount: 0 },
    { month: "2024-02", amount: 800000 },
    { month: "2024-03", amount: 0 },
    { month: "2024-04", amount: 0 },
    { month: "2024-05", amount: 0 },
    { month: "2024-06", amount: 0 },
    { month: "2024-07", amount: 0 },
    { month: "2024-08", amount: 0 },
    { month: "2024-09", amount: 1800000 },
    { month: "2024-10", amount: 0 },
    { month: "2024-11", amount: 0 },
    { month: "2024-12", amount: 0 },
  ],
};

const rankIcons: Record<string, React.ReactNode> = {
  member: <User className="h-5 w-5" />,
  silver: <Award className="h-5 w-5 text-slate-500" />,
  gold: <Award className="h-5 w-5 text-yellow-500" />,
  platinum: <Crown className="h-5 w-5 text-cyan-500" />,
  diamond: <Gem className="h-5 w-5 text-purple-500" />,
};

const rankColors: Record<string, string> = {
  member: "bg-gray-100 text-gray-800",
  silver: "bg-slate-100 text-slate-800",
  gold: "bg-yellow-100 text-yellow-800",
  platinum: "bg-cyan-100 text-cyan-800",
  diamond: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  ordered: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  planning: "bg-gray-100 text-gray-800",
  contracted: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  invoiced: "bg-purple-100 text-purple-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const customer = customerData;

  const nextRankThreshold = customer.rank === "platinum" ? 10000000 : 5000000;
  const progressToNextRank = (customer.totalTransaction / nextRankThreshold) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {customer.type === "corporate" ? (
                  <Building className="h-8 w-8" />
                ) : (
                  customer.name.slice(0, 2)
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                <Badge className={rankColors[customer.rank]}>
                  <span className="flex items-center gap-1">
                    {rankIcons[customer.rank]}
                    {CUSTOMER_RANK[customer.rank as keyof typeof CUSTOMER_RANK]?.label}
                  </span>
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {customer.type === "corporate" ? "法人" : "個人"} / 登録: {format(customer.registeredAt, "yyyy年M月", { locale: ja })}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button asChild>
            <Link href={`/estimates/new?customer=${customer.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              見積作成
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                累計取引額
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{customer.totalTransaction.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              最終取引: {format(customer.lastTransaction, "yyyy/M/d")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                ポイント
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{customer.points.toLocaleString()} pt</div>
            <p className="text-xs text-muted-foreground">
              利用済: {customer.pointsUsed.toLocaleString()} pt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                取引件数
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.projectCount}件</div>
            <p className="text-xs text-muted-foreground">
              見積: {customer.estimateCount}件
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                紹介実績
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.referralCount}件</div>
            <p className="text-xs text-muted-foreground">
              獲得報酬: ¥{customer.referrals.reduce((sum, r) => sum + r.reward, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge className={rankColors[customer.rank]}>
                {rankIcons[customer.rank]}
                {CUSTOMER_RANK[customer.rank as keyof typeof CUSTOMER_RANK]?.label}
              </Badge>
              <span className="text-sm text-muted-foreground">→</span>
              <Badge variant="outline">
                <Gem className="h-4 w-4 mr-1 text-purple-500" />
                ダイヤモンド
              </Badge>
            </div>
            <span className="text-sm font-medium">
              ¥{customer.totalTransaction.toLocaleString()} / ¥{nextRankThreshold.toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(progressToNextRank, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            次のランクまであと ¥{(nextRankThreshold - customer.totalTransaction).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="houses">所有物件</TabsTrigger>
          <TabsTrigger value="transactions">取引履歴</TabsTrigger>
          <TabsTrigger value="points">ポイント</TabsTrigger>
          <TabsTrigger value="savings">積立</TabsTrigger>
          <TabsTrigger value="referrals">紹介</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">氏名（フリガナ）</span>
                  <span>{customer.nameKana}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">電話番号</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {customer.phone}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">メール</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {customer.email}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {customer.address}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">生年月日</span>
                  <span>{format(customer.birthDate, "yyyy年M月d日")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>メモ・備考</CardTitle>
                  <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>メモ編集</DialogTitle>
                        <DialogDescription>顧客に関するメモを編集します</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Textarea
                          defaultValue={customer.notes}
                          rows={5}
                          placeholder="顧客に関するメモを入力..."
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={() => setIsNoteDialogOpen(false)}>保存</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {customer.notes || "メモはありません"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Chart */}
          <Card>
            <CardHeader>
              <CardTitle>取引推移</CardTitle>
              <CardDescription>月別の取引金額</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={customer.transactionHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) => value.split("-")[1] + "月"}
                    />
                    <YAxis tickFormatter={(value) => `${value / 10000}万`} />
                    <Tooltip
                      formatter={(value: number) => [`¥${value.toLocaleString()}`, "取引額"]}
                      labelFormatter={(label) => label.replace("-", "年") + "月"}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Houses Tab */}
        <TabsContent value="houses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    所有物件
                  </CardTitle>
                  <CardDescription>HOUSE DNAに登録された物件</CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  物件追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {customer.houses.map((house) => (
                  <Card key={house.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Home className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <Link
                              href={`/houses/${house.id}`}
                              className="font-medium hover:underline"
                            >
                              {house.name}
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {house.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            house.healthScore >= 80 ? "text-green-600" :
                            house.healthScore >= 60 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {house.healthScore}
                          </div>
                          <p className="text-xs text-muted-foreground">健康スコア</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={house.healthScore} className="h-2" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/houses/${house.id}`}>詳細</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          点検予約
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Estimates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                見積履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>見積番号</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.estimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-mono text-sm">{estimate.id}</TableCell>
                      <TableCell className="font-medium">{estimate.title}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[estimate.status]}>
                          {ESTIMATE_STATUS[estimate.status as keyof typeof ESTIMATE_STATUS]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(estimate.createdAt, "yyyy/M/d")}</TableCell>
                      <TableCell className="text-right">¥{estimate.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/estimates/${estimate.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                工事履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>案件番号</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.id}</TableCell>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[project.status]}>
                          {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.completedAt
                          ? format(project.completedAt, "yyyy/M/d")
                          : format(project.startDate!, "yyyy/M/d") + "〜"}
                      </TableCell>
                      <TableCell className="text-right">¥{project.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/projects/${project.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Tab */}
        <TabsContent value="points">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    ポイント履歴
                  </CardTitle>
                  <CardDescription>
                    現在のポイント: {customer.points.toLocaleString()} pt
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Gift className="mr-2 h-4 w-4" />
                  ポイント付与
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="text-right">ポイント</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.pointHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{format(history.createdAt, "yyyy/M/d")}</TableCell>
                      <TableCell>{history.description}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        history.type === "earn" ? "text-green-600" : "text-red-600"
                      }`}>
                        {history.type === "earn" ? "+" : ""}{history.amount.toLocaleString()} pt
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  加入プラン
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.savingsPlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-1">
                        {SAVINGS_PLANS[customer.savingsPlan as keyof typeof SAVINGS_PLANS].name}プラン
                      </Badge>
                      <span className="text-2xl font-bold">
                        ¥{SAVINGS_PLANS[customer.savingsPlan as keyof typeof SAVINGS_PLANS].monthlyAmount.toLocaleString()}/月
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">特典内容</p>
                      <ul className="space-y-1">
                        {SAVINGS_PLANS[customer.savingsPlan as keyof typeof SAVINGS_PLANS].features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mb-2" />
                    <p>積立プランに未加入です</p>
                    <Button className="mt-4" variant="outline">
                      プランを提案
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Savings Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  積立残高
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-green-600">
                    ¥{customer.savingsBalance.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground mt-2">
                    工事代金に充当可能
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">月額積立</span>
                    <span>¥{SAVINGS_PLANS[customer.savingsPlan as keyof typeof SAVINGS_PLANS]?.savingsAmount.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">サービス料</span>
                    <span>¥{SAVINGS_PLANS[customer.savingsPlan as keyof typeof SAVINGS_PLANS]?.serviceAmount.toLocaleString() || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    紹介履歴
                  </CardTitle>
                  <CardDescription>
                    紹介成約: {customer.referrals.filter(r => r.status === "contracted").length}件 /
                    獲得報酬: ¥{customer.referrals.reduce((sum, r) => sum + r.reward, 0).toLocaleString()}
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  紹介登録
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>紹介日</TableHead>
                    <TableHead>紹介先</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">契約金額</TableHead>
                    <TableHead className="text-right">紹介報酬</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{format(referral.createdAt, "yyyy/M/d")}</TableCell>
                      <TableCell className="font-medium">{referral.name}</TableCell>
                      <TableCell>
                        <Badge className={referral.status === "contracted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {referral.status === "contracted" ? "成約" : "見積中"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {referral.projectAmount > 0 ? `¥${referral.projectAmount.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {referral.reward > 0 ? `¥${referral.reward.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
