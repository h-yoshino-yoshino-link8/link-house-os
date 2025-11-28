"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ============================================
// Types
// ============================================

export interface Material {
  id: string;
  companyId: string;
  categoryId: string | null;
  name: string;
  productCode: string | null;
  manufacturer: string | null;
  specification: string | null;
  costPrice: number;
  unit: string;
  lossRate: number;
  supplierId: string | null;
  supplierName: string | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

export interface LaborType {
  id: string;
  companyId: string;
  categoryId: string | null;
  name: string;
  dailyRate: number;
  hourlyRate: number | null;
  productivity: number | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

export interface WorkCategory {
  id: string;
  companyId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  sortOrder: number;
  isActive: boolean;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: WorkCategory[];
  materials?: Material[];
  laborTypes?: LaborType[];
}

interface ApiResponse<T> {
  data: T;
}

// ============================================
// Query Keys
// ============================================

export const masterKeys = {
  materials: {
    all: ["masters", "materials"] as const,
    list: (params: Record<string, string | undefined>) =>
      [...masterKeys.materials.all, "list", params] as const,
    detail: (id: string) => [...masterKeys.materials.all, id] as const,
  },
  laborTypes: {
    all: ["masters", "laborTypes"] as const,
    list: (params: Record<string, string | undefined>) =>
      [...masterKeys.laborTypes.all, "list", params] as const,
    detail: (id: string) => [...masterKeys.laborTypes.all, id] as const,
  },
  workCategories: {
    all: ["masters", "workCategories"] as const,
    list: (params: Record<string, string | undefined>) =>
      [...masterKeys.workCategories.all, "list", params] as const,
    detail: (id: string) => [...masterKeys.workCategories.all, id] as const,
  },
};

// ============================================
// Materials Hooks
// ============================================

interface UseMaterialsParams {
  companyId: string;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
}

export function useMaterials(params: UseMaterialsParams) {
  const queryParams = {
    companyId: params.companyId,
    categoryId: params.categoryId,
    search: params.search,
    isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
  };

  return useQuery({
    queryKey: masterKeys.materials.list(queryParams),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Material[]>>("/masters/materials", queryParams);
      return response.data;
    },
    enabled: !!params.companyId,
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: masterKeys.materials.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Material>>(`/masters/materials/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Material, "id" | "isActive" | "category">) => {
      const response = await apiClient.post<ApiResponse<Material>>("/masters/materials", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.materials.all });
    },
  });
}

export function useUpdateMaterial(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Omit<Material, "id" | "companyId" | "category">>) => {
      const response = await apiClient.put<ApiResponse<Material>>(`/masters/materials/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.materials.all });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/masters/materials/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.materials.all });
    },
  });
}

// ============================================
// Labor Types Hooks
// ============================================

interface UseLaborTypesParams {
  companyId: string;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
}

export function useLaborTypes(params: UseLaborTypesParams) {
  const queryParams = {
    companyId: params.companyId,
    categoryId: params.categoryId,
    search: params.search,
    isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
  };

  return useQuery({
    queryKey: masterKeys.laborTypes.list(queryParams),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LaborType[]>>("/masters/labor-types", queryParams);
      return response.data;
    },
    enabled: !!params.companyId,
  });
}

export function useLaborType(id: string) {
  return useQuery({
    queryKey: masterKeys.laborTypes.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<LaborType>>(`/masters/labor-types/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateLaborType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<LaborType, "id" | "isActive" | "category">) => {
      const response = await apiClient.post<ApiResponse<LaborType>>("/masters/labor-types", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.laborTypes.all });
    },
  });
}

export function useUpdateLaborType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Omit<LaborType, "id" | "companyId" | "category">>) => {
      const response = await apiClient.put<ApiResponse<LaborType>>(`/masters/labor-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.laborTypes.all });
    },
  });
}

export function useDeleteLaborType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/masters/labor-types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.laborTypes.all });
    },
  });
}

// ============================================
// Work Categories Hooks
// ============================================

interface UseWorkCategoriesParams {
  companyId: string;
  parentId?: string | null;
  isActive?: boolean;
  flat?: boolean;
}

export function useWorkCategories(params: UseWorkCategoriesParams) {
  const queryParams = {
    companyId: params.companyId,
    parentId: params.parentId !== undefined ? (params.parentId ?? "null") : undefined,
    isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
    flat: params.flat ? "true" : undefined,
  };

  return useQuery({
    queryKey: masterKeys.workCategories.list(queryParams),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WorkCategory[]>>("/masters/work-categories", queryParams);
      return response.data;
    },
    enabled: !!params.companyId,
  });
}

export function useWorkCategory(id: string) {
  return useQuery({
    queryKey: masterKeys.workCategories.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WorkCategory>>(`/masters/work-categories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<WorkCategory, "id" | "isActive" | "parent" | "children" | "materials" | "laborTypes">) => {
      const response = await apiClient.post<ApiResponse<WorkCategory>>("/masters/work-categories", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.workCategories.all });
    },
  });
}

export function useUpdateWorkCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Omit<WorkCategory, "id" | "companyId" | "parent" | "children" | "materials" | "laborTypes">>) => {
      const response = await apiClient.put<ApiResponse<WorkCategory>>(`/masters/work-categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.workCategories.all });
    },
  });
}

export function useDeleteWorkCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/masters/work-categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterKeys.workCategories.all });
    },
  });
}
