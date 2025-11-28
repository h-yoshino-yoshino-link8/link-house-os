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
      // 統計情報を取得（実際の実装ではAPIから取得）
      // デモ用にダミーデータを返す
      const stats: GamificationStats = {
        xp: 1250,
        level: 5,
        levelInfo: {
          level: 5,
          currentXp: 150,
          nextLevelXp: 500,
        },
        totalEstimates: 15,
        totalOrders: 8,
        completedProjects: 5,
        totalHouses: 12,
        totalNfts: 3,
        badges: [
          {
            id: "1",
            code: "estimate_beginner",
            name: "見積ビギナー",
            description: "初めての見積書を作成",
            iconUrl: null,
            conditionType: "estimate_count",
            conditionValue: 1,
            xpReward: 50,
          },
          {
            id: "2",
            code: "first_order",
            name: "初受注",
            description: "初めての受注を獲得",
            iconUrl: null,
            conditionType: "order_count",
            conditionValue: 1,
            xpReward: 100,
          },
        ],
      };
      return { data: stats };
    },
    enabled: enabled && !!companyId,
  });
}
