"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PiggyBank,
  Plus,
  TrendingUp,
  Users,
  Home,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { SAVINGS_PLANS } from "@/constants";
import { toast } from "sonner";

// デモ用積立契約データ
const DEMO_CONTRACTS = [
  {
    id: "sav_001",
    customerName: "田中 一郎",
    houseName: "田中邸",
    plan: "standard",
    monthlyAmount: 10000,
    balance: 156000,
    bonusBalance: 8000,
    startDate: "2023-06-01",
    status: "active",
    lastPayment: "2024-11-01",
  },
  {
    id: "sav_002",
    customerName: "佐藤 花子",
    houseName: "佐藤邸",
    plan: "premium",
    monthlyAmount: 20000,
    balance: 420000,
    bonusBalance: 35000,
    startDate: "2022-04-01",
    status: "active",
    lastPayment: "2024-11-01",
  },
  {
    id: "sav_003",
    customerName: "鈴木 次郎",
    houseName: "鈴木邸",
    plan: "light",
    monthlyAmount: 5000,
    balance: 45000,
    bonusBalance: 2000,
    startDate: "2024-02-01",
    status: "active",
    lastPayment: "2024-11-01",
  },
  {
    id: "sav_004",
    customerName: "高橋 三郎",
    houseName: "高橋邸",
    plan: "standard",
    monthlyAmount: 10000,
    balance: 80000,
    bonusBalance: 4000,
    startDate: "2024-04-01",
    status: "paused",
    lastPayment: "2024-09-01",
  },
];

// デモ用取引履歴
const DEMO_TRANSACTIONS = [
  { id: "txn_001", date: "2024-11-01", type: "deposit", amount: 10000, balance: 156000, description: "月額積立" },
  { id: "txn_002", date: "2024-11-01", type: "bonus", amount: 500, balance: 8000, description: "継続ボーナス" },
  { id: "txn_003", date: "2024-10-01", type: "deposit", amount: 10000, balance: 146000, description: "月額積立" },
  { id: "txn_004", date: "2024-09-15", type: "withdrawal", amount: -30000, balance: 136000, description: "屋根修繕工事充当" },
  { id: "txn_005", date: "2024-09-01", type: "deposit", amount: 10000, balance: 166000, description: "月額積立" },
];

const planColors = {
  light: "bg-blue-100 text-blue-800",
  standard: "bg-green-100 text-green-800",
  premium: "bg-purple-100 text-purple-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  active: "有効",
  paused: "一時停止",
  cancelled: "解約",
};

export default function SavingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newContract, setNewContract] = useState({
    customerId: "",
    houseId: "",
    plan: "standard",
  });

  const filteredContracts = DEMO_CONTRACTS.filter(contract => {
    const matchesSearch = contract.customerName.includes(searchTerm) ||
      contract.houseName.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 統計計算
  const totalBalance = DEMO_CONTRACTS.reduce((sum, c) => sum + c.balance + c.bonusBalance, 0);
  const activeContracts = DEMO_CONTRACTS.filter(c => c.status === "active").length;
  const monthlyTotal = DEMO_CONTRACTS
    .filter(c => c.status === "active")
    .reduce((sum, c) => sum + c.monthlyAmount, 0);

  const handleCreateContract = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsNewContractOpen(false);
    toast.success("積立契約を作成しました");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">積立管理</h1>
          <p className="text-muted-foreground">顧客の積立プラン・残高管理</p>
        </div>
        <Dialog open={isNewContractOpen} onOpenChange={setIsNewContractOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規契約
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新規積立契約</DialogTitle>
              <DialogDescription>
                顧客の積立契約を作成します
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>顧客</Label>
                <Select
                  value={newContract.customerId}
                  onValueChange={(v) => setNewContract({ ...newContract, customerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="顧客を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cus_001">田中 一郎</SelectItem>
                    <SelectItem value="cus_002">佐藤 花子</SelectItem>
                    <SelectItem value="cus_003">鈴木 次郎</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>対象物件</Label>
                <Select
                  value={newContract.houseId}
                  onValueChange={(v) => setNewContract({ ...newContract, houseId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="物件を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house_001">田中邸（東京都xxx）</SelectItem>
                    <SelectItem value="house_002">佐藤邸（神奈川県xxx）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>プラン</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(SAVINGS_PLANS).map(([key, plan]) => (
                    <div
                      key={key}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        newContract.plan === key ? "border-primary bg-primary/5" : "hover:bg-muted"
                      }`}
                      onClick={() => setNewContract({ ...newContract, plan: key })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{plan.name}</span>
                        {newContract.plan === key && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-2xl font-bold">¥{plan.monthlyAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        積立: ¥{plan.savingsAmount.toLocaleString()} / サービス: ¥{plan.serviceAmount.toLocaleString()}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.slice(0, 2).map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewContractOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleCreateContract} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                契約作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総積立残高</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{(totalBalance / 10000).toFixed(1)}万</div>
            <p className="text-xs text-muted-foreground">
              全契約の積立残高合計
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">契約件数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts}件</div>
            <p className="text-xs text-muted-foreground">
              有効な積立契約
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月額積立合計</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              毎月の積立収入
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均継続期間</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.2ヶ月</div>
            <p className="text-xs text-muted-foreground">
              契約の平均継続月数
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">契約一覧</TabsTrigger>
          <TabsTrigger value="transactions">取引履歴</TabsTrigger>
          <TabsTrigger value="plans">プラン詳細</TabsTrigger>
        </TabsList>

        {/* Contracts List */}
        <TabsContent value="contracts" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="顧客名・物件名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">有効</SelectItem>
                <SelectItem value="paused">一時停止</SelectItem>
                <SelectItem value="cancelled">解約</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>顧客</TableHead>
                  <TableHead>プラン</TableHead>
                  <TableHead>月額</TableHead>
                  <TableHead>積立残高</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>開始日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.customerName}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {contract.houseName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={planColors[contract.plan as keyof typeof planColors]}>
                        {SAVINGS_PLANS[contract.plan as keyof typeof SAVINGS_PLANS]?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>¥{contract.monthlyAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">¥{contract.balance.toLocaleString()}</p>
                        <p className="text-xs text-green-600">
                          +¥{contract.bonusBalance.toLocaleString()} ボーナス
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[contract.status as keyof typeof statusColors]}>
                        {statusLabels[contract.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>{contract.startDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近の取引</CardTitle>
              <CardDescription>積立・引き出し履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEMO_TRANSACTIONS.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        txn.type === "withdrawal" ? "bg-red-100" : "bg-green-100"
                      }`}>
                        {txn.type === "withdrawal" ? (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{txn.description}</p>
                        <p className="text-sm text-muted-foreground">{txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${txn.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                        {txn.amount > 0 ? "+" : ""}¥{Math.abs(txn.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        残高: ¥{txn.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Detail */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(SAVINGS_PLANS).map(([key, plan]) => (
              <Card key={key} className={key === "standard" ? "border-primary" : ""}>
                {key === "standard" && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    人気No.1
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">¥{plan.monthlyAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">積立分</span>
                      <span className="font-medium">¥{plan.savingsAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">サービス分</span>
                      <span className="font-medium">¥{plan.serviceAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={key === "standard" ? "default" : "outline"}>
                    このプランで契約
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
