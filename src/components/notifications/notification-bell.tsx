"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import { useNotifications, useMarkNotificationsRead, useGenerateAlerts } from "@/hooks/use-notifications";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useEffect } from "react";

const typeIcons: Record<string, React.ReactNode> = {
  invoice_due: <CreditCard className="h-4 w-4 text-yellow-500" />,
  invoice_overdue: <AlertTriangle className="h-4 w-4 text-red-500" />,
  estimate_expiring: <FileText className="h-4 w-4 text-orange-500" />,
  project_delayed: <Clock className="h-4 w-4 text-red-500" />,
  payment_reminder: <CreditCard className="h-4 w-4 text-blue-500" />,
  default: <Bell className="h-4 w-4 text-gray-500" />,
};

const priorityColors: Record<string, string> = {
  urgent: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  high: "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20",
  normal: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  low: "border-l-gray-300 bg-gray-50 dark:bg-gray-950/20",
};

export function NotificationBell() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, refetch } = useNotifications({
    companyId,
    limit: 10,
  });

  const markRead = useMarkNotificationsRead();
  const generateAlerts = useGenerateAlerts();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // ポップオーバーを開いたときにアラートを生成
  useEffect(() => {
    if (isOpen) {
      generateAlerts.mutate(companyId);
    }
  }, [isOpen, companyId]);

  const handleMarkAsRead = (id: string) => {
    markRead.mutate({ companyId, ids: [id], action: "read" });
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markRead.mutate({ companyId, ids: [id], action: "dismiss" });
  };

  const handleMarkAllRead = () => {
    markRead.mutate({ companyId, action: "markAllRead" });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-4">
          <h4 className="font-semibold">通知</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              すべて既読にする
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">読み込み中...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-2 text-green-500" />
              <p>通知はありません</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${priorityColors[notification.priority]} ${
                    !notification.isRead ? "font-medium" : "opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {typeIcons[notification.type] || typeIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm truncate">{notification.title}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => {
                              handleMarkAsRead(notification.id);
                              setIsOpen(false);
                            }}
                            className="flex items-center text-xs text-primary hover:underline"
                          >
                            詳細を見る
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications" onClick={() => setIsOpen(false)}>
              すべての通知を見る
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
