"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
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
    queryFn: () =>
      apiClient.get<PaginatedResponse<Estimate>>("/estimates", {
        companyId,
        status,
        customerId,
        search,
        page,
        limit,
      }),
    enabled: enabled && !!companyId,
  });
}

// 見積詳細取得
export function useEstimate(id: string, enabled = true) {
  return useQuery({
    queryKey: estimateKeys.detail(id),
    queryFn: () =>
      apiClient.get<SingleResponse<EstimateDetail>>(`/estimates/${id}`),
    enabled: enabled && !!id,
  });
}

// 見積作成
export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEstimateRequest) =>
      apiClient.post<SingleResponse<Estimate>>("/estimates", data),
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
    mutationFn: (data: UpdateEstimateData) =>
      apiClient.put<SingleResponse<Estimate>>(`/estimates/${id}`, data),
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
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/estimates/${id}`),
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
    mutationFn: (data?: { startDate?: string; endDate?: string }) =>
      apiClient.post<ConfirmOrderResponse>(`/estimates/${id}/confirm-order`, data || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: estimateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
