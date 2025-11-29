"use client";

import { useState } from "react";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/use-notifications";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  X,
  ExternalLink,
  Check,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

const typeIcons: Record<string, React.ReactNode> = {
  invoice_due: <CreditCard className="h-5 w-5 text-yellow-500" />,
  invoice_overdue: <AlertTriangle className="h-5 w-5 text-red-500" />,
  estimate_expiring: <FileText className="h-5 w-5 text-orange-500" />,
  project_delayed: <Clock className="h-5 w-5 text-red-500" />,
  payment_reminder: <CreditCard className="h-5 w-5 text-blue-500" />,
  default: <Bell className="h-5 w-5 text-gray-500" />,
};

const priorityLabels: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" }> = {
  urgent: { label: "緊急", variant: "destructive" },
  high: { label: "高", variant: "default" },
  normal: { label: "通常", variant: "secondary" },
  low: { label: "低", variant: "outline" },
};

const priorityColors: Record<string, string> = {
  urgent: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  high: "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20",
  normal: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  low: "border-l-gray-300 bg-gray-50 dark:bg-gray-950/20",
};

export default function NotificationsPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useNotifications({
    companyId,
    unreadOnly: filter === "unread",
    limit: 100,
  });

  const markRead = useMarkNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = (id: string) => {
    markRead.mutate({ companyId, ids: [id], action: "read" });
  };

  const handleDismiss = (id: string) => {
    markRead.mutate({ companyId, ids: [id], action: "dismiss" });
  };

  const handleMarkAllRead = () => {
    markRead.mutate({ companyId, action: "markAllRead" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">通知</h1>
          <p className="text-muted-foreground">
            重要なお知らせとアラートを確認できます
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <Check className="mr-2 h-4 w-4" />
            すべて既読にする
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未読</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">緊急</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.priority === "urgent" && !n.isRead).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支払期限</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {notifications.filter(n => n.type.includes("invoice")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">工期遅延</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.type === "project_delayed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>通知一覧</CardTitle>
              <CardDescription>
                請求書の期限、見積の有効期限、工期遅延などの重要な通知
              </CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
              <TabsList>
                <TabsTrigger value="all">すべて</TabsTrigger>
                <TabsTrigger value="unread">未読のみ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">読み込み中...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-16 w-16 mb-4 text-green-500" />
              <p className="text-lg font-medium">通知はありません</p>
              <p className="text-sm">
                {filter === "unread" ? "未読の通知はありません" : "新しい通知が届くとここに表示されます"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${priorityColors[notification.priority]} ${
                    !notification.isRead ? "font-medium" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {typeIcons[notification.type] || typeIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-base">{notification.title}</p>
                            <Badge variant={priorityLabels[notification.priority]?.variant || "secondary"}>
                              {priorityLabels[notification.priority]?.label || notification.priority}
                            </Badge>
                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notification.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                            {" "}
                            ({formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ja,
                            })})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notification.link && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={notification.link} onClick={() => handleMarkAsRead(notification.id)}>
                                詳細
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="既読にする"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDismiss(notification.id)}
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
