"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "available" | "connected" | "coming_soon";
  iconUrl?: string;
}

export interface IntegrationCategory {
  id: string;
  name: string;
}

export interface IntegrationsResponse {
  integrations: Integration[];
  grouped: Record<string, Integration[]>;
  categories: IntegrationCategory[];
}

// クエリキー
export const integrationKeys = {
  all: ["integrations"] as const,
  list: (filters?: { category?: string; status?: string }) =>
    [...integrationKeys.all, "list", filters] as const,
};

// 連携サービス一覧取得
export function useIntegrations(
  filters?: { category?: string; status?: string },
  enabled = true
) {
  return useQuery({
    queryKey: integrationKeys.list(filters),
    queryFn: () =>
      apiClient.get<{ data: IntegrationsResponse }>("/integrations", {
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      }),
    enabled,
  });
}
