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
import {
  getDemoHouses,
  createDemoHouse,
  DemoHouse,
} from "@/lib/demo-storage";

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
    queryFn: async () => {
      try {
        const result = await apiClient.get<PaginatedResponse<House>>("/houses", {
          companyId,
          customerId,
          healthScoreMin,
          healthScoreMax,
          search,
          page,
          limit,
        });

        // デモデータとマージ
        const demoHouses = getDemoHouses(companyId, customerId);
        const dbIds = new Set(result.data.map(h => h.id));
        const uniqueDemoHouses = demoHouses.filter(
          d => !dbIds.has(d.id)
        ) as unknown as House[];

        let mergedData = [...uniqueDemoHouses, ...result.data];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          mergedData = mergedData.filter(h =>
            h.address.toLowerCase().includes(searchLower)
          );
        }

        // 新しい順にソート
        mergedData.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          data: mergedData,
          pagination: {
            page: 1,
            limit: mergedData.length,
            total: mergedData.length,
            totalPages: 1,
          },
        };
      } catch {
        // エラー時はデモデータのみ
        let demoHouses = getDemoHouses(companyId, customerId) as unknown as House[];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          demoHouses = demoHouses.filter(h =>
            h.address.toLowerCase().includes(searchLower)
          );
        }

        return {
          data: demoHouses,
          pagination: {
            page: 1,
            limit: demoHouses.length,
            total: demoHouses.length,
            totalPages: 1,
          },
        };
      }
    },
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
    mutationFn: async (data: CreateHouseRequest) => {
      try {
        return await apiClient.post<SingleResponse<House>>("/houses", data);
      } catch {
        // APIエラー時はデモストレージに保存
        console.log("API unavailable, saving house to demo storage");
        const house = createDemoHouse({
          companyId: data.companyId,
          customerId: data.customerId,
          address: data.address,
          structureType: data.structureType,
          builtYear: data.builtYear,
          floorArea: data.totalArea,
        });
        return { data: house as unknown as House };
      }
    },
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
