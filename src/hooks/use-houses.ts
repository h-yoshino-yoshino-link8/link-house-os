"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  House,
  HouseDetail,
  PaginatedResponse,
  SingleResponse,
  CreateHouseRequest,
  UpdateHouseRequest,
} from "@/lib/api/types";

// クエリキー
export const houseKeys = {
  all: ["houses"] as const,
  lists: () => [...houseKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...houseKeys.lists(), filters] as const,
  details: () => [...houseKeys.all, "detail"] as const,
  detail: (id: string) => [...houseKeys.details(), id] as const,
};

interface UseHousesOptions {
  companyId: string;
  customerId?: string;
  healthScoreMin?: number;
  healthScoreMax?: number;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// 物件一覧取得
export function useHouses({
  companyId,
  customerId,
  healthScoreMin,
  healthScoreMax,
  search,
  page = 1,
  limit = 20,
  enabled = true,
}: UseHousesOptions) {
  return useQuery({
    queryKey: houseKeys.list({
      companyId,
      customerId,
      healthScoreMin,
      healthScoreMax,
      search,
      page,
      limit,
    }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<House>>("/houses", {
        companyId,
        customerId,
        healthScoreMin,
        healthScoreMax,
        search,
        page,
        limit,
      }),
    enabled: enabled && !!companyId,
  });
}

// 物件詳細取得
export function useHouse(id: string, enabled = true) {
  return useQuery({
    queryKey: houseKeys.detail(id),
    queryFn: () =>
      apiClient.get<SingleResponse<HouseDetail>>(`/houses/${id}`),
    enabled: enabled && !!id,
  });
}

// 物件作成
export function useCreateHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHouseRequest) =>
      apiClient.post<SingleResponse<House>>("/houses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: houseKeys.lists() });
    },
  });
}

// 物件更新
export function useUpdateHouse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHouseRequest) =>
      apiClient.put<SingleResponse<House>>(`/houses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: houseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: houseKeys.lists() });
    },
  });
}

// 物件削除
export function useDeleteHouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/houses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: houseKeys.lists() });
    },
  });
}
