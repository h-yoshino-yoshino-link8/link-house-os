"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Info,
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const savingsData = {
  account: {
    plan: "standard" as const,
    balance: 156000,
    savingsBalance: 124800, // 積立分
    serviceBalance: 31200, // サービス分
    monthlyAmount: 10000,
    savingsRate: 0.8, // 80%積立、20%サービス
    startDate: new Date("2022-04-01"),
    nextPayment: new Date("2025-01-15"),
  },
  transactions: [
    { id: "1", date: new Date("2024-12-15"), type: "deposit", amount: 10000, balance: 156000, description: "月額積立" },
    { id: "2", date: new Date("2024-11-15"), type: "deposit", amount: 10000, balance: 146000, description: "月額積立" },
    { id: "3", date: new Date("2024-10-15"), type: "deposit", amount: 10000, balance: 136000, description: "月額積立" },
    { id: "4", date: new Date("2024-09-20"), type: "withdrawal", amount: -30000, balance: 126000, description: "小修繕（蛇口パッキン交換）" },
    { id: "5", date: new Date("2024-09-15"), type: "deposit", amount: 10000, balance: 156000, description: "月額積立" },
    { id: "6", date: new Date("2024-08-15"), type: "deposit", amount: 10000, balance: 146000, description: "月額積立" },
  ],
  planDetails: {
    light: {
      name: "ライト",
      monthlyAmount: 5000,
      savingsRate: 0.8,
      features: ["年1回 簡易点検", "工事代金 3% OFF", "緊急時優先対応"],
    },
    standard: {
      name: "スタンダード",
      monthlyAmount: 10000,
      savingsRate: 0.8,
      features: [
        "年1回 詳細点検（報告書付き）",
        "小修繕 年3万円まで無料",
        "工事代金 5% OFF",
        "24時間緊急ダイヤル",
        "HOUSE DNA レポート（四半期）",
      ],
    },
    premium: {
      name: "プレミアム",
      monthlyAmount: 20000,
      savingsRate: 0.75,
      features: [
        "年2回 詳細点検",
        "小修繕 年10万円まで無料",
        "工事代金 10% OFF",
        "専任担当者",
        "設備故障時の仮設手配",
        "家族向け住まい相談（無制限）",
      ],
    },
  },
  serviceUsage: {
    smallRepairLimit: 30000,
    smallRepairUsed: 0,
    inspectionDone: true,
    nextInspection: new Date("2025-04-15"),
  },
};

const planColors = {
  light: "bg-gray-100 text-gray-800",
  standard: "bg-blue-100 text-blue-800",
  premium: "bg-purple-100 text-purple-800",
};

export default function PortalSavingsPage() {
  const plan = savingsData.planDetails[savingsData.account.plan];
  const monthsActive = Math.floor(
    (new Date().getTime() - savingsData.account.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">積立口座</h1>
        <p className="text-muted-foreground">
          メンテナンス積立の状況と履歴を確認できます
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={planColors[savingsData.account.plan]}>
                  {plan.name}プラン
                </Badge>
                <span className="text-sm text-muted-foreground">
                  開始から{monthsActive}ヶ月
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">現在の残高</p>
                <p className="text-4xl font-bold text-blue-700">
                  ¥{savingsData.account.balance.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">積立分</p>
                  <p className="font-medium">¥{savingsData.account.savingsBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">サービス分</p>
                  <p className="font-medium">¥{savingsData.account.serviceBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white/80 p-4 text-center">
              <p className="text-sm text-muted-foreground">次回引落日</p>
              <p className="text-2xl font-bold">
                {format(savingsData.account.nextPayment, "M月d日", { locale: ja })}
              </p>
              <p className="text-sm text-muted-foreground">
                ¥{savingsData.account.monthlyAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Usage */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">小修繕無料枠</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>使用済み</span>
                <span>
                  ¥{savingsData.serviceUsage.smallRepairUsed.toLocaleString()} /
                  ¥{savingsData.serviceUsage.smallRepairLimit.toLocaleString()}
                </span>
              </div>
              <Progress
                value={
                  (savingsData.serviceUsage.smallRepairUsed /
                    savingsData.serviceUsage.smallRepairLimit) *
                  100
                }
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                残り ¥{(savingsData.serviceUsage.smallRepairLimit - savingsData.serviceUsage.smallRepairUsed).toLocaleString()} 利用可能
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">定期点検</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                {savingsData.serviceUsage.inspectionDone ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    今年度完了
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">未実施</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">次回予定</p>
                <p className="font-medium">
                  {format(savingsData.serviceUsage.nextInspection, "yyyy年M月", { locale: ja })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {plan.name}プランの特典
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline">プラン変更を相談する</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            入出金履歴
          </CardTitle>
          <CardDescription>積立口座の入出金記録</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>内容</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead className="text-right">残高</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savingsData.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(tx.date, "yyyy/M/d")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tx.type === "deposit" ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                      {tx.description}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}¥{Math.abs(tx.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ¥{tx.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">積立について</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            毎月の積立金は、将来のメンテナンス費用に充てることができます。
            急な修繕が必要になった際も、積立残高から充当することで負担を軽減できます。
          </p>
          <p>
            積立金の{Math.round(savingsData.account.savingsRate * 100)}%は純粋な積立として、
            残り{Math.round((1 - savingsData.account.savingsRate) * 100)}%はサービス利用分として管理されます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
