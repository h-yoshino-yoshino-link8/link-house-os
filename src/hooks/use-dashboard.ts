"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ダッシュボード統計レスポンス型
export interface DashboardData {
  kpis: {
    revenue: KpiValue;
    profit: KpiValue;
    profitRate: KpiValue;
    avgPrice: KpiValue;
    orderRate: KpiValue;
    completedProjects: KpiValue;
  };
  revenueData: RevenueDataPoint[];
  topCustomers: TopCustomer[];
  topPartners: TopPartner[];
  alerts: DashboardAlert[];
  quests: Quest[];
  highlights: Highlights;
  gamification: Gamification;
}

export interface KpiValue {
  value: number;
  change: number;
  trend: "up" | "down";
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  profit: number;
}

export interface TopCustomer {
  name: string;
  revenue: number;
}

export interface TopPartner {
  name: string;
  revenue: number;
  category: string | null;
}

export interface DashboardAlert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  link: string;
}

export interface Quest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
}

export interface Highlights {
  targetAchievement: {
    target: number;
    actual: number;
    rate: number;
    achieved: boolean;
  };
  newCustomers: number;
  completedProjects: number;
}

export interface Gamification {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface SingleResponse<T> {
  data: T;
}

// クエリキー
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: (companyId: string) => [...dashboardKeys.all, "stats", companyId] as const,
};

interface UseDashboardOptions {
  companyId: string;
  enabled?: boolean;
}

// ダッシュボード統計取得
export function useDashboard({ companyId, enabled = true }: UseDashboardOptions) {
  return useQuery({
    queryKey: dashboardKeys.stats(companyId),
    queryFn: () =>
      apiClient.get<SingleResponse<DashboardData>>("/dashboard", {
        companyId,
      }),
    enabled: enabled && !!companyId,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動更新
  });
}
