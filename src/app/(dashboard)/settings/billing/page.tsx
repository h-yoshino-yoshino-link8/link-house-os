"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Zap,
  Crown,
  Building2,
  CreditCard,
  Download,
  Calendar,
  AlertCircle,
  Loader2,
  Rocket,
  Shield,
  Users,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// 料金プラン定義
const PLANS = [
  {
    id: "free",
    name: "フリー",
    description: "小規模事業者向け",
    price: 0,
    priceYearly: 0,
    icon: Zap,
    popular: false,
    features: [
      "見積作成 月10件",
      "顧客管理 50件",
      "写真管理 1GB",
      "基本レポート",
      "メールサポート",
    ],
    limits: {
      estimates: 10,
      customers: 50,
      storage: 1,
    },
  },
  {
    id: "starter",
    name: "スターター",
    description: "成長中の工務店向け",
    price: 9800,
    priceYearly: 98000,
    icon: Rocket,
    popular: false,
    features: [
      "見積作成 月50件",
      "顧客管理 300件",
      "写真管理 10GB",
      "工程表・ガントチャート",
      "PDF出力",
      "優先サポート",
    ],
    limits: {
      estimates: 50,
      customers: 300,
      storage: 10,
    },
  },
  {
    id: "professional",
    name: "プロフェッショナル",
    description: "中規模工務店向け",
    price: 19800,
    priceYearly: 198000,
    icon: Shield,
    popular: true,
    features: [
      "見積作成 無制限",
      "顧客管理 無制限",
      "写真管理 50GB",
      "HOUSE DNA 基本機能",
      "契約書・電子署名",
      "分析・レポート",
      "API連携",
      "電話サポート",
    ],
    limits: {
      estimates: -1,
      customers: -1,
      storage: 50,
    },
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    description: "大規模・複数拠点向け",
    price: 49800,
    priceYearly: 498000,
    icon: Crown,
    popular: false,
    features: [
      "全機能無制限",
      "写真管理 200GB",
      "HOUSE DNA 完全版",
      "施工証明NFT",
      "複数拠点管理",
      "カスタム連携",
      "専任サポート",
      "SLA保証",
    ],
    limits: {
      estimates: -1,
      customers: -1,
      storage: 200,
    },
  },
];

// デモ用の現在の契約情報
const CURRENT_SUBSCRIPTION = {
  plan: "professional",
  status: "active",
  currentPeriodStart: "2024-01-01",
  currentPeriodEnd: "2024-12-31",
  cancelAtPeriodEnd: false,
};

// デモ用の使用量
const USAGE = {
  estimates: 45,
  customers: 128,
  storage: 12.5,
};

// デモ用の請求履歴
const INVOICES = [
  { id: "inv_001", date: "2024-11-01", amount: 19800, status: "paid", pdfUrl: "#" },
  { id: "inv_002", date: "2024-10-01", amount: 19800, status: "paid", pdfUrl: "#" },
  { id: "inv_003", date: "2024-09-01", amount: 19800, status: "paid", pdfUrl: "#" },
  { id: "inv_004", date: "2024-08-01", amount: 19800, status: "paid", pdfUrl: "#" },
  { id: "inv_005", date: "2024-07-01", amount: 19800, status: "paid", pdfUrl: "#" },
];

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = PLANS.find(p => p.id === CURRENT_SUBSCRIPTION.plan);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setIsUpgradeDialogOpen(true);
  };

  const confirmUpgrade = async () => {
    setIsProcessing(true);
    // Stripe checkout へリダイレクト（実装時）
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsUpgradeDialogOpen(false);
    toast.success("プラン変更リクエストを受け付けました");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(`請求書 ${invoiceId} をダウンロードします`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">料金・プラン</h1>
          <p className="text-muted-foreground">サブスクリプションと請求管理</p>
        </div>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans">料金プラン</TabsTrigger>
          <TabsTrigger value="usage">使用状況</TabsTrigger>
          <TabsTrigger value="invoices">請求履歴</TabsTrigger>
          <TabsTrigger value="payment">支払い方法</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Current Plan */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentPlan && <currentPlan.icon className="h-8 w-8 text-primary" />}
                  <div>
                    <CardTitle>現在のプラン: {currentPlan?.name}</CardTitle>
                    <CardDescription>{currentPlan?.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={CURRENT_SUBSCRIPTION.status === "active" ? "default" : "secondary"}>
                  {CURRENT_SUBSCRIPTION.status === "active" ? "有効" : "無効"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>契約期間: {CURRENT_SUBSCRIPTION.currentPeriodStart} 〜 {CURRENT_SUBSCRIPTION.currentPeriodEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>¥{currentPlan?.price.toLocaleString()}/月</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-lg bg-muted p-1">
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setBillingCycle("monthly")}
              >
                月払い
              </button>
              <button
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setBillingCycle("yearly")}
              >
                年払い
                <Badge variant="secondary" className="ml-2">2ヶ月分お得</Badge>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const isCurrentPlan = plan.id === CURRENT_SUBSCRIPTION.plan;
              const price = billingCycle === "monthly" ? plan.price : plan.priceYearly;
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${
                    isCurrentPlan ? "bg-primary/5" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">人気</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-4xl font-bold">
                        ¥{price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingCycle === "monthly" ? "月" : "年"}
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isCurrentPlan ? "現在のプラン" : "このプランに変更"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  見積作成数（今月）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{USAGE.estimates}</div>
                  <div className="text-sm text-muted-foreground">
                    / {currentPlan?.limits.estimates === -1 ? "無制限" : currentPlan?.limits.estimates}
                  </div>
                </div>
                {currentPlan?.limits.estimates !== -1 && (
                  <Progress
                    value={(USAGE.estimates / (currentPlan?.limits.estimates || 1)) * 100}
                    className="mt-3 h-2"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  顧客数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{USAGE.customers}</div>
                  <div className="text-sm text-muted-foreground">
                    / {currentPlan?.limits.customers === -1 ? "無制限" : currentPlan?.limits.customers}
                  </div>
                </div>
                {currentPlan?.limits.customers !== -1 && (
                  <Progress
                    value={(USAGE.customers / (currentPlan?.limits.customers || 1)) * 100}
                    className="mt-3 h-2"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ストレージ使用量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{USAGE.storage}GB</div>
                  <div className="text-sm text-muted-foreground">
                    / {currentPlan?.limits.storage}GB
                  </div>
                </div>
                <Progress
                  value={(USAGE.storage / (currentPlan?.limits.storage || 1)) * 100}
                  className="mt-3 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Usage Warning */}
          {USAGE.storage / (currentPlan?.limits.storage || 1) > 0.8 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="flex items-center gap-4 py-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    ストレージ容量が80%を超えています
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    プランをアップグレードするか、不要なファイルを削除してください。
                  </p>
                </div>
                <Button variant="outline" className="ml-auto" onClick={() => handleUpgrade("enterprise")}>
                  アップグレード
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>請求履歴</CardTitle>
              <CardDescription>過去の請求書と支払い状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {INVOICES.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">請求書 #{invoice.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">¥{invoice.amount.toLocaleString()}</p>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status === "paid" ? "支払済" : "未払い"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>支払い方法</CardTitle>
              <CardDescription>登録済みのクレジットカード</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-800">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium">**** **** **** 4242</p>
                    <p className="text-sm text-muted-foreground">有効期限: 12/25</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>デフォルト</Badge>
                  <Button variant="outline" size="sm">
                    編集
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                新しいカードを追加
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>請求先情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">会社名</p>
                  <p className="font-medium">株式会社サンプル工務店</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">担当者</p>
                  <p className="font-medium">山田 太郎</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">住所</p>
                  <p className="font-medium">東京都渋谷区xxx-xxx</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">メールアドレス</p>
                  <p className="font-medium">billing@example.com</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">請求先情報を編集</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プランを変更</DialogTitle>
            <DialogDescription>
              {selectedPlan && PLANS.find(p => p.id === selectedPlan)?.name}プランに変更します。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span>新しいプラン</span>
                <span className="font-medium">
                  {selectedPlan && PLANS.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>料金</span>
                <span className="font-medium">
                  ¥{selectedPlan && PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()}/月
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>日割り計算で請求されます</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={confirmUpgrade} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              プランを変更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
