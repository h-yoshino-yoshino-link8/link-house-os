"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plug,
  ExternalLink,
  CheckCircle,
  Clock,
  Settings,
  Link2,
  Link2Off,
  CreditCard,
  FileText,
  Users,
  MessageSquare,
  HardDrive,
  Calendar,
  Zap,
  Calculator,
} from "lucide-react";
import { useState } from "react";
import { useIntegrations } from "@/hooks/use-integrations";
import { toast } from "sonner";

// カテゴリアイコンマッピング
const CATEGORY_ICONS: Record<string, typeof Plug> = {
  accounting: Calculator,
  crm: Users,
  contract: FileText,
  payment: CreditCard,
  communication: MessageSquare,
  storage: HardDrive,
  calendar: Calendar,
  automation: Zap,
};

// ステータスバッジの色
const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  connected: "bg-blue-100 text-blue-800",
  coming_soon: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<string, string> = {
  available: "利用可能",
  connected: "接続済み",
  coming_soon: "近日公開",
};

export default function IntegrationsPage() {
  const { data, isLoading } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const integrations = data?.data?.integrations || [];
  const categories = data?.data?.categories || [];
  const grouped = data?.data?.grouped || {};

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(true);
    try {
      // デモ用：接続処理のシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("連携を設定しました（デモ）");
      setSelectedIntegration(null);
      setApiKey("");
    } catch {
      toast.error("連携に失敗しました");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("この連携を解除しますか？")) return;
    toast.success("連携を解除しました（デモ）");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="h-6 w-6" />
          外部連携
        </h1>
        <p className="text-muted-foreground">
          会計ソフト、CRM、決済サービスなど外部サービスとの連携を管理します
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {integrations.filter((i) => i.status === "connected").length}
                </p>
                <p className="text-sm text-muted-foreground">接続中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Link2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {integrations.filter((i) => i.status === "available").length}
                </p>
                <p className="text-sm text-muted-foreground">利用可能</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gray-100">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {integrations.filter((i) => i.status === "coming_soon").length}
                </p>
                <p className="text-sm text-muted-foreground">近日公開予定</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-6">
            {categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category.id] || Plug;
              const categoryIntegrations = grouped[category.id] || [];

              if (categoryIntegrations.length === 0) return null;

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CategoryIcon className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryIntegrations.map((integration) => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={() => setSelectedIntegration(integration.id)}
                          onDisconnect={() => handleDisconnect(integration.id)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map((category) => {
          const categoryIntegrations = grouped[category.id] || [];
          return (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardContent className="pt-6">
                  {categoryIntegrations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryIntegrations.map((integration) => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onConnect={() => setSelectedIntegration(integration.id)}
                          onDisconnect={() => handleDisconnect(integration.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      このカテゴリの連携サービスはありません
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Connection Dialog */}
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              連携設定
            </DialogTitle>
            <DialogDescription>
              外部サービスと接続するための認証情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>APIキー / シークレットキー</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_xxxxx"
              />
              <p className="text-xs text-muted-foreground">
                連携先サービスの設定画面からAPIキーを取得してください
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>自動同期</Label>
                <p className="text-xs text-muted-foreground">
                  データを自動で同期します
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
              キャンセル
            </Button>
            <Button
              onClick={() => handleConnect(selectedIntegration!)}
              disabled={isConnecting || !apiKey}
            >
              {isConnecting ? "接続中..." : "接続"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook URL</CardTitle>
          <CardDescription>
            外部サービスからのWebhook通知を受け取るURLです
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value="https://your-domain.com/api/webhooks"
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText("https://your-domain.com/api/webhooks");
                toast.success("コピーしました");
              }}
            >
              コピー
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            このURLを外部サービスのWebhook設定に登録してください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Integration Card Component
interface IntegrationCardProps {
  integration: {
    id: string;
    name: string;
    description: string;
    status: string;
    iconUrl?: string;
  };
  onConnect: () => void;
  onDisconnect: () => void;
}

function IntegrationCard({ integration, onConnect, onDisconnect }: IntegrationCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        {integration.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={integration.iconUrl}
            alt={integration.name}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <Plug className="h-6 w-6 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{integration.name}</p>
          <Badge className={STATUS_COLORS[integration.status]}>
            {STATUS_LABELS[integration.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {integration.description}
        </p>
      </div>
      <div className="flex-shrink-0">
        {integration.status === "connected" ? (
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            <Link2Off className="h-4 w-4" />
          </Button>
        ) : integration.status === "available" ? (
          <Button size="sm" onClick={onConnect}>
            接続
          </Button>
        ) : (
          <Button size="sm" disabled variant="outline">
            準備中
          </Button>
        )}
      </div>
    </div>
  );
}
