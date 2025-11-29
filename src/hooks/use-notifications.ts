import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  companyId: string;
  userId?: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  link?: string;
  relatedType?: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  isDismissed: boolean;
  dismissedAt?: string;
  scheduledFor?: string;
  sentAt?: string;
  emailSent: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

interface UseNotificationsParams {
  companyId: string;
  unreadOnly?: boolean;
  limit?: number;
}

export function useNotifications(params: UseNotificationsParams) {
  const queryParams = new URLSearchParams({
    companyId: params.companyId,
    ...(params.unreadOnly && { unreadOnly: "true" }),
    ...(params.limit && { limit: String(params.limit) }),
  });

  return useQuery<NotificationsResponse>({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    refetchInterval: 60000, // 1分ごとに自動更新
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      ids,
      action = "read",
    }: {
      companyId: string;
      ids?: string[];
      action?: "read" | "dismiss" | "markAllRead";
    }) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ids, action }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useGenerateAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const res = await fetch("/api/notifications/generate-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error("Failed to generate alerts");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
