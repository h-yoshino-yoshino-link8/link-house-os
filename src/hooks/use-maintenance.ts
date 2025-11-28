"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { SingleResponse } from "@/lib/api/types";

export interface MaintenanceRecommendation {
  id: string;
  houseId: string;
  componentId: string | null;
  riskLevel: "high" | "medium" | "low";
  description: string;
  recommendedAction: string | null;
  dueDate: string | null;
  estimatedCostMin: number | null;
  estimatedCostMax: number | null;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  component?: {
    id: string;
    category: string;
    productName: string | null;
  };
}

export interface CreateMaintenanceRequest {
  componentId?: string;
  riskLevel: "high" | "medium" | "low";
  description: string;
  recommendedAction?: string;
  dueDate?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
}

export interface UpdateMaintenanceRequest extends Partial<CreateMaintenanceRequest> {
  isResolved?: boolean;
}

// クエリキー
export const maintenanceKeys = {
  all: ["maintenance"] as const,
  lists: () => [...maintenanceKeys.all, "list"] as const,
  list: (houseId: string, filters?: { includeResolved?: boolean; riskLevel?: string }) =>
    [...maintenanceKeys.lists(), houseId, filters] as const,
};

// メンテナンス推奨一覧取得
export function useMaintenance(
  houseId: string,
  options?: { includeResolved?: boolean; riskLevel?: string },
  enabled = true
) {
  return useQuery({
    queryKey: maintenanceKeys.list(houseId, options),
    queryFn: () =>
      apiClient.get<{ data: MaintenanceRecommendation[] }>(`/houses/${houseId}/maintenance`, {
        ...(options?.includeResolved !== undefined ? { includeResolved: options.includeResolved.toString() } : {}),
        ...(options?.riskLevel ? { riskLevel: options.riskLevel } : {}),
      }),
    enabled: enabled && !!houseId,
  });
}

// メンテナンス推奨作成
export function useCreateMaintenance(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceRequest) =>
      apiClient.post<SingleResponse<MaintenanceRecommendation>>(`/houses/${houseId}/maintenance`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

// メンテナンス推奨更新
export function useUpdateMaintenance(houseId: string, recommendationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMaintenanceRequest) =>
      apiClient.put<SingleResponse<MaintenanceRecommendation>>(
        `/houses/${houseId}/maintenance/${recommendationId}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

// メンテナンス推奨削除
export function useDeleteMaintenance(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recommendationId: string) =>
      apiClient.delete<{ success: boolean }>(`/houses/${houseId}/maintenance/${recommendationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}

// メンテナンス推奨を解決済みにする
export function useResolveMaintenance(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recommendationId: string) =>
      apiClient.post<SingleResponse<MaintenanceRecommendation>>(
        `/houses/${houseId}/maintenance/${recommendationId}`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
  });
}
