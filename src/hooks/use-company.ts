"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// 型定義
export interface BankInfo {
  bankName: string;
  branchName: string;
  accountType: "ordinary" | "checking";
  accountNumber: string;
  accountHolder: string;
}

export interface DocumentSettings {
  estimatePrefix: string;
  projectPrefix: string;
  invoicePrefix: string;
  defaultPaymentTerms: string;
  estimateValidityDays: number;
}

export interface Company {
  id: string;
  name: string;
  nameKana: string | null;
  representativeName: string | null;
  establishedYear: number | null;
  businessDescription: string | null;
  postalCode: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;
  licenseExpiry: string | null;
  qualifications: string | null;
  insurance: string | null;
  bankInfo: BankInfo | null;
  documentSettings: DocumentSettings | null;
  logoUrl: string | null;
  sealUrl: string | null;
  level: number;
  xp: number;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
}

interface ApiResponse<T> {
  data: T;
}

// クエリキー
export const companyKeys = {
  all: ["companies"] as const,
  detail: (id: string) => [...companyKeys.all, id] as const,
};

// 会社情報取得
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分
  });
}

// 会社情報更新
interface UpdateCompanyData {
  name?: string;
  nameKana?: string;
  representativeName?: string;
  establishedYear?: number;
  businessDescription?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  qualifications?: string;
  insurance?: string;
  bankInfo?: BankInfo;
  documentSettings?: DocumentSettings;
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCompanyData) => {
      const response = await apiClient.put<ApiResponse<Company>>(`/companies/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
    },
  });
}
