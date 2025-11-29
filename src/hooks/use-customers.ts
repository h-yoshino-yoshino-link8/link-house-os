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
import {
  getDemoCustomers,
  getDemoCustomer,
  createDemoCustomer,
  DemoCustomer,
} from "@/lib/demo-storage";

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
    queryFn: async () => {
      try {
        const result = await apiClient.get<PaginatedResponse<Customer>>("/customers", {
          companyId,
          rank,
          search,
          page,
          limit,
        });

        // デモデータとマージ
        const demoCustomers = getDemoCustomers(companyId);
        const dbIds = new Set(result.data.map(c => c.id));
        const uniqueDemoCustomers = demoCustomers.filter(
          d => !dbIds.has(d.id)
        ) as unknown as Customer[];

        let mergedData = [...uniqueDemoCustomers, ...result.data];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          mergedData = mergedData.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.phone?.includes(search)
          );
        }
        if (rank && rank !== "all") {
          mergedData = mergedData.filter(c => c.rank === rank);
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
        let demoCustomers = getDemoCustomers(companyId) as unknown as Customer[];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          demoCustomers = demoCustomers.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower) ||
            c.phone?.includes(search)
          );
        }
        if (rank && rank !== "all") {
          demoCustomers = demoCustomers.filter(c => c.rank === rank);
        }

        return {
          data: demoCustomers,
          pagination: {
            page: 1,
            limit: demoCustomers.length,
            total: demoCustomers.length,
            totalPages: 1,
          },
        };
      }
    },
    enabled: enabled && !!companyId,
  });
}

// 顧客詳細取得
export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      // まずデモデータをチェック
      const demoCustomer = getDemoCustomer(id);
      if (demoCustomer) {
        return { data: demoCustomer as unknown as CustomerDetail };
      }

      return apiClient.get<SingleResponse<CustomerDetail>>(`/customers/${id}`);
    },
    enabled: enabled && !!id,
  });
}

// 顧客作成
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerRequest) => {
      try {
        return await apiClient.post<SingleResponse<Customer>>("/customers", data);
      } catch {
        // APIエラー時はデモストレージに保存
        console.log("API unavailable, saving customer to demo storage");
        const customer = createDemoCustomer({
          companyId: data.companyId,
          name: data.name,
          type: data.type,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
        return { data: customer as unknown as Customer };
      }
    },
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
