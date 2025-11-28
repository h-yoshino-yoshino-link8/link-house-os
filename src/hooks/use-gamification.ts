"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface XpInfo {
  id: string;
  name: string;
  level: number;
  xp: number;
  levelInfo: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
  };
  recentTransactions: XpTransaction[];
}

export interface XpTransaction {
  id: string;
  companyId: string;
  action: string;
  xp: number;
  description: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  earned?: boolean;
  earnedAt?: string | null;
}

export interface BadgeInfo {
  earned: Badge[];
  all: Array<Badge & { earned: boolean; earnedAt: string | null }>;
  totalEarned: number;
  totalAvailable: number;
}

// クエリキー
export const gamificationKeys = {
  all: ["gamification"] as const,
  xp: (companyId: string) => [...gamificationKeys.all, "xp", companyId] as const,
  badges: (companyId: string) => [...gamificationKeys.all, "badges", companyId] as const,
};

// XP情報取得
export function useXpInfo(companyId: string, enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.xp(companyId),
    queryFn: () =>
      apiClient.get<{ data: XpInfo }>("/gamification/xp", { companyId }),
    enabled: enabled && !!companyId,
  });
}

// バッジ情報取得
export function useBadges(companyId: string, enabled = true) {
  return useQuery({
    queryKey: gamificationKeys.badges(companyId),
    queryFn: () =>
      apiClient.get<{ data: BadgeInfo }>("/gamification/badges", { companyId }),
    enabled: enabled && !!companyId,
  });
}

// XP付与
export function useAwardXp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { companyId: string; action: string; customXp?: number; customDescription?: string }) =>
      apiClient.post<{
        data: {
          xpTransaction: XpTransaction;
          company: { id: string; level: number; xp: number };
          levelInfo: { level: number; currentXp: number; nextLevelXp: number };
          leveledUp: boolean;
        };
      }>("/gamification/xp", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.xp(variables.companyId) });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.badges(variables.companyId) });
    },
  });
}

// バッジチェック
export function useCheckBadges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) =>
      apiClient.post<{
        data: {
          newBadges: Array<{ code: string; name: string; xpReward: number }>;
          stats: Record<string, number>;
        };
      }>("/gamification/badges/check", { companyId }),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: gamificationKeys.xp(companyId) });
      queryClient.invalidateQueries({ queryKey: gamificationKeys.badges(companyId) });
    },
  });
}

// 統合ゲーミフィケーション情報取得
interface GamificationStats {
  xp: number;
  level: number;
  levelInfo: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
  };
  totalEstimates: number;
  totalOrders: number;
  completedProjects: number;
  totalHouses: number;
  totalNfts: number;
  badges: Badge[];
}

export function useGamification({ companyId }: { companyId: string }, enabled = true) {
  return useQuery({
    queryKey: [...gamificationKeys.all, "combined", companyId],
    queryFn: async () => {
      // XP情報とバッジ情報を並列取得
      const [xpRes, badgesRes] = await Promise.all([
        apiClient.get<{ data: XpInfo }>("/gamification/xp", { companyId }).catch(() => null),
        apiClient.get<{ data: BadgeInfo }>("/gamification/badges", { companyId }).catch(() => null),
      ]);

      // ダッシュボードから統計を取得
      const dashboardRes = await apiClient
        .get<{
          data: {
            estimates?: { total?: number };
            projects?: { total?: number; completed?: number };
            houses?: { total?: number };
          };
        }>("/dashboard", { companyId })
        .catch(() => null);

      const xpInfo = xpRes?.data;
      const badgeInfo = badgesRes?.data;
      const dashboardData = dashboardRes?.data;

      const stats: GamificationStats = {
        xp: xpInfo?.xp ?? 0,
        level: xpInfo?.level ?? 1,
        levelInfo: xpInfo?.levelInfo ?? {
          level: 1,
          currentXp: 0,
          nextLevelXp: 200,
        },
        totalEstimates: dashboardData?.estimates?.total ?? 0,
        totalOrders: dashboardData?.projects?.total ?? 0,
        completedProjects: dashboardData?.projects?.completed ?? 0,
        totalHouses: dashboardData?.houses?.total ?? 0,
        totalNfts: 0,
        badges: badgeInfo?.earned ?? [],
      };
      return { data: stats };
    },
    enabled: enabled && !!companyId,
  });
}
