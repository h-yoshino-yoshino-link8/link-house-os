"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  createDemoEstimate,
  getDemoEstimates,
  getDemoEstimate,
  updateDemoEstimate,
  deleteDemoEstimate,
  createDemoProject,
  DemoEstimate,
} from "@/lib/demo-storage";
import type {
  Estimate,
  EstimateDetail,
  PaginatedResponse,
  SingleResponse,
  CreateEstimateRequest,
} from "@/lib/api/types";

// クエリキー
export const estimateKeys = {
  all: ["estimates"] as const,
  lists: () => [...estimateKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...estimateKeys.lists(), filters] as const,
  details: () => [...estimateKeys.all, "detail"] as const,
  detail: (id: string) => [...estimateKeys.details(), id] as const,
};

interface UseEstimatesOptions {
  companyId: string;
  status?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// 見積一覧取得
export function useEstimates({
  companyId,
  status,
  customerId,
  search,
  page = 1,
  limit = 20,
  enabled = true,
}: UseEstimatesOptions) {
  return useQuery({
    queryKey: estimateKeys.list({ companyId, status, customerId, search, page, limit }),
    queryFn: async () => {
      try {
        const result = await apiClient.get<PaginatedResponse<Estimate>>("/estimates", {
          companyId,
          status,
          customerId,
          search,
          page,
          limit,
        });

        // APIから取得したデータにlocalStorageのデモデータをマージ
        const demoEstimates = getDemoEstimates(companyId);
        const mergedData = [...demoEstimates as unknown as Estimate[], ...result.data];

        // 検索フィルタ
        let filtered = mergedData;
        if (search) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(e =>
            e.title.toLowerCase().includes(searchLower) ||
            e.estimateNumber.toLowerCase().includes(searchLower)
          );
        }
        if (status && status !== "all") {
          filtered = filtered.filter(e => e.status === status);
        }
        if (customerId) {
          filtered = filtered.filter(e => e.customerId === customerId);
        }

        return {
          data: filtered,
          pagination: {
            page: 1,
            limit: filtered.length,
            total: filtered.length,
            totalPages: 1,
          },
        };
      } catch {
        // エラー時はデモデータのみ返す
        const demoEstimates = getDemoEstimates(companyId);
        return {
          data: demoEstimates as unknown as Estimate[],
          pagination: {
            page: 1,
            limit: demoEstimates.length,
            total: demoEstimates.length,
            totalPages: 1,
          },
        };
      }
    },
    enabled: enabled && !!companyId,
  });
}

// 見積詳細取得
export function useEstimate(id: string, enabled = true) {
  return useQuery({
    queryKey: estimateKeys.detail(id),
    queryFn: async () => {
      // まずデモデータをチェック
      const demoEstimate = getDemoEstimate(id);
      if (demoEstimate) {
        return { data: demoEstimate as unknown as EstimateDetail };
      }

      // デモデータになければAPIから取得
      return apiClient.get<SingleResponse<EstimateDetail>>(`/estimates/${id}`);
    },
    enabled: enabled && !!id,
  });
}

// 見積作成
export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEstimateRequest) => {
      try {
        // まずAPIを試す
        return await apiClient.post<SingleResponse<Estimate>>("/estimates", data);
      } catch (error) {
        // APIが失敗した場合（デモモード）、localStorageに保存
        console.log("API unavailable, saving to demo storage");
        const estimate = createDemoEstimate({
          companyId: data.companyId,
          customerId: data.customerId,
          houseId: data.houseId,
          title: data.title,
          status: data.status,
          estimateDate: data.estimateDate,
          validUntil: data.validUntil,
          taxRate: data.taxRate,
          notes: data.notes,
          internalMemo: data.internalMemo,
          details: data.details,
        });
        return { data: estimate as unknown as Estimate };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
    },
  });
}

// 見積更新
interface UpdateEstimateData {
  customerId?: string;
  houseId?: string | null;
  title?: string;
  status?: string;
  estimateDate?: string;
  validUntil?: string | null;
  taxRate?: number;
  notes?: string;
  internalMemo?: string;
  details?: CreateEstimateRequest["details"];
}

export function useUpdateEstimate(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEstimateData) => {
      // デモデータかチェック
      const demoEstimate = getDemoEstimate(id);
      if (demoEstimate) {
        const updated = updateDemoEstimate(id, data as Partial<DemoEstimate>);
        if (updated) {
          return { data: updated as unknown as Estimate };
        }
        throw new Error("Failed to update demo estimate");
      }

      return apiClient.put<SingleResponse<Estimate>>(`/estimates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
    },
  });
}

// 見積削除
export function useDeleteEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // デモデータかチェック
      const demoEstimate = getDemoEstimate(id);
      if (demoEstimate) {
        deleteDemoEstimate(id);
        return { success: true };
      }

      return apiClient.delete<{ success: boolean }>(`/estimates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
    },
  });
}

// 受注確定レスポンス型
interface ConfirmOrderResponse {
  data: {
    estimate: {
      id: string;
      status: string;
    };
    project: {
      id: string;
      projectNumber: string;
      title: string;
      status: string;
    };
    message: string;
  };
}

// 受注確定（案件自動作成）
export function useConfirmOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data?: { startDate?: string; endDate?: string }) => {
      // デモデータかチェック
      const demoEstimate = getDemoEstimate(id);
      if (demoEstimate) {
        // 見積ステータスを更新
        updateDemoEstimate(id, { status: "ordered" });

        // 案件を作成
        const project = createDemoProject({
          companyId: demoEstimate.companyId,
          customerId: demoEstimate.customerId,
          estimateId: demoEstimate.id,
          title: demoEstimate.title,
          status: "planning",
          startDate: data?.startDate,
          endDate: data?.endDate,
          contractAmount: demoEstimate.total,
        });

        return {
          data: {
            estimate: { id: demoEstimate.id, status: "ordered" },
            project: {
              id: project.id,
              projectNumber: project.projectNumber,
              title: project.title,
              status: project.status,
            },
            message: "見積が受注確定され、案件が作成されました",
          },
        };
      }

      return apiClient.post<ConfirmOrderResponse>(`/estimates/${id}/confirm-order`, data || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
