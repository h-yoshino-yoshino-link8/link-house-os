"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Customer,
  CustomerDetail,
  PaginatedResponse,
  SingleResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/lib/api/types";

// クエリキー
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

interface UseCustomersOptions {
  companyId: string;
  rank?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// 顧客一覧取得
export function useCustomers({
  companyId,
  rank,
  search,
  page = 1,
  limit = 20,
  enabled = true,
}: UseCustomersOptions) {
  return useQuery({
    queryKey: customerKeys.list({ companyId, rank, search, page, limit }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Customer>>("/customers", {
        companyId,
        rank,
        search,
        page,
        limit,
      }),
    enabled: enabled && !!companyId,
  });
}

// 顧客詳細取得
export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () =>
      apiClient.get<SingleResponse<CustomerDetail>>(`/customers/${id}`),
    enabled: enabled && !!id,
  });
}

// 顧客作成
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      apiClient.post<SingleResponse<Customer>>("/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// 顧客更新
export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerRequest) =>
      apiClient.put<SingleResponse<Customer>>(`/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// 顧客削除
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
