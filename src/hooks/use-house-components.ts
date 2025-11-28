"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { SingleResponse } from "@/lib/api/types";

export interface HouseComponent {
  id: string;
  houseId: string;
  category: string;
  subcategory: string | null;
  productName: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  installedDate: string | null;
  warrantyYears: number | null;
  warrantyExpires: string | null;
  expectedLifespan: number | null;
  replacementCost: number | null;
  conditionScore: number;
  lastInspection: string | null;
  photos: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateComponentRequest {
  category: string;
  subcategory?: string;
  productName?: string;
  manufacturer?: string;
  modelNumber?: string;
  installedDate?: string;
  warrantyYears?: number;
  expectedLifespan?: number;
  replacementCost?: number;
  conditionScore?: number;
  photos?: string[];
  documents?: string[];
}

export interface UpdateComponentRequest extends Partial<CreateComponentRequest> {
  lastInspection?: string;
}

// クエリキー
export const componentKeys = {
  all: ["components"] as const,
  lists: () => [...componentKeys.all, "list"] as const,
  list: (houseId: string, category?: string) =>
    [...componentKeys.lists(), houseId, category] as const,
  details: () => [...componentKeys.all, "detail"] as const,
  detail: (id: string) => [...componentKeys.details(), id] as const,
};

// 部材一覧取得
export function useHouseComponents(houseId: string, category?: string, enabled = true) {
  return useQuery({
    queryKey: componentKeys.list(houseId, category),
    queryFn: () =>
      apiClient.get<{ data: HouseComponent[] }>(`/houses/${houseId}/components`, {
        ...(category ? { category } : {}),
      }),
    enabled: enabled && !!houseId,
  });
}

// 部材詳細取得
export function useHouseComponent(houseId: string, componentId: string, enabled = true) {
  return useQuery({
    queryKey: componentKeys.detail(componentId),
    queryFn: () =>
      apiClient.get<SingleResponse<HouseComponent>>(`/houses/${houseId}/components/${componentId}`),
    enabled: enabled && !!houseId && !!componentId,
  });
}

// 部材作成
export function useCreateComponent(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComponentRequest) =>
      apiClient.post<SingleResponse<HouseComponent>>(`/houses/${houseId}/components`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
  });
}

// 部材更新
export function useUpdateComponent(houseId: string, componentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateComponentRequest) =>
      apiClient.put<SingleResponse<HouseComponent>>(`/houses/${houseId}/components/${componentId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.detail(componentId) });
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
  });
}

// 部材削除
export function useDeleteComponent(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (componentId: string) =>
      apiClient.delete<{ success: boolean }>(`/houses/${houseId}/components/${componentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() });
    },
  });
}

// 健康スコア再計算
export function useRecalculateHealthScore(houseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{
        data: {
          healthScore: number;
          categoryScores: Record<string, number>;
          ageDeduction: number;
          structureBonus: number;
          recommendations: string[];
        };
      }>(`/houses/${houseId}/health-score`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["houses", "detail", houseId] });
    },
  });
}
