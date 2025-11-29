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
  Home,
  FileText,
  FolderKanban,
  Banknote,
  Edit,
  Plus,
  ExternalLink,
  Users,
  Wallet,
  CreditCard,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { CUSTOMER_RANK, PROJECT_STATUS, ESTIMATE_STATUS, SAVINGS_PLANS } from "@/constants";
import { formatDate } from "@/lib/utils/date";
import { useCustomer } from "@/hooks/use-customers";

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
  const customerId = params.id as string;
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

  const { data, isLoading, isError } = useCustomer(customerId);
  const customer = data?.data;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">顧客データの取得に失敗しました</p>
      </div>
    );
  }

  const totalTransaction = Number(customer.totalTransaction);
  const nextRankThreshold = customer.rank === "platinum" ? 10000000 : 5000000;
  const progressToNextRank = (totalTransaction / nextRankThreshold) * 100;

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
                {customer.type === "corporate" ? "法人" : "個人"} / 登録: {formatDate(customer.createdAt, "yyyy年M月")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {customer.tags?.map((tag) => (
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
            <div className="text-2xl font-bold">¥{totalTransaction.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              最終更新: {formatDate(customer.updatedAt, "yyyy/M/d")}
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
            <div className="text-2xl font-bold">{customer._count?.projects ?? 0}件</div>
            <p className="text-xs text-muted-foreground">
              見積: {customer._count?.estimates ?? 0}件
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                所有物件
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer._count?.houses ?? 0}件</div>
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
              ¥{totalTransaction.toLocaleString()} / ¥{nextRankThreshold.toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(progressToNextRank, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            次のランクまであと ¥{Math.max(nextRankThreshold - totalTransaction, 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="houses">所有物件</TabsTrigger>
          <TabsTrigger value="transactions">取引履歴</TabsTrigger>
          {/* ポイント・積立タブは凍結中 */}
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
                  <span className="text-muted-foreground">氏名</span>
                  <span>{customer.name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">電話番号</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {customer.phone || "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">メール</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {customer.email || "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">住所</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {customer.address || "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  紹介情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">紹介コード</span>
                  <span className="font-mono">{customer.referralCode || "-"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">紹介実績</span>
                  <span>{customer._count?.referrals ?? 0}件</span>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <Button variant="outline" asChild>
                  <Link href={`/houses/new?customerId=${customer.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    物件追加
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customer.houses?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  登録された物件はありません
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {customer.houses?.map((house) => (
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
                                {customer.name}邸
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
              )}
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
              {customer.estimates?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  見積履歴はありません
                </p>
              ) : (
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
                    {customer.estimates?.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell className="font-mono text-sm">{estimate.estimateNumber}</TableCell>
                        <TableCell className="font-medium">{estimate.title}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[estimate.status]}>
                            {ESTIMATE_STATUS[estimate.status as keyof typeof ESTIMATE_STATUS]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(estimate.createdAt, "yyyy/M/d")}</TableCell>
                        <TableCell className="text-right">¥{Number(estimate.total).toLocaleString()}</TableCell>
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
              )}
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
              {customer.projects?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  工事履歴はありません
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>案件番号</TableHead>
                      <TableHead>件名</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>期間</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.projects?.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-sm">{project.projectNumber}</TableCell>
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[project.status]}>
                            {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.startDate
                            ? formatDate(project.startDate, "yyyy/M/d")
                            : "-"}
                          {project.endDate && ` 〜 ${formatDate(project.endDate, "M/d")}`}
                        </TableCell>
                        <TableCell className="text-right">
                          {project.contractAmount
                            ? `¥${Number(project.contractAmount).toLocaleString()}`
                            : "-"}
                        </TableCell>
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
              )}
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
              </div>
            </CardHeader>
            <CardContent>
              {customer.pointTransactions?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  ポイント履歴はありません
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>内容</TableHead>
                      <TableHead className="text-right">ポイント</TableHead>
                      <TableHead className="text-right">残高</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.pointTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.createdAt, "yyyy/M/d")}</TableCell>
                        <TableCell>{transaction.description || transaction.type}</TableCell>
                        <TableCell className={`text-right font-medium ${
                          transaction.points > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.points > 0 ? "+" : ""}{transaction.points.toLocaleString()} pt
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.balanceAfter.toLocaleString()} pt
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                {customer.savingsContracts?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mb-2" />
                    <p>積立プランに未加入です</p>
                    <Button className="mt-4" variant="outline">
                      プランを提案
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.savingsContracts?.map((contract) => (
                      <div key={contract.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-1">
                            {SAVINGS_PLANS[contract.plan as keyof typeof SAVINGS_PLANS]?.name ?? contract.plan}プラン
                          </Badge>
                          <span className="text-2xl font-bold">
                            ¥{Number(contract.monthlyAmount).toLocaleString()}/月
                          </span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">積立残高</span>
                            <span className="font-bold text-green-600">
                              ¥{Number(contract.balance).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Savings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  積立概要
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.savingsContracts?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    積立契約はありません
                  </p>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-green-600">
                      ¥{customer.savingsContracts?.reduce((sum, c) => sum + Number(c.balance), 0).toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mt-2">
                      工事代金に充当可能
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
