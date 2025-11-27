"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  Project,
  ProjectDetail,
  PaginatedResponse,
  SingleResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/lib/api/types";

// クエリキー
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

interface UseProjectsOptions {
  companyId: string;
  status?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// 案件一覧取得
export function useProjects({
  companyId,
  status,
  customerId,
  search,
  page = 1,
  limit = 20,
  enabled = true,
}: UseProjectsOptions) {
  return useQuery({
    queryKey: projectKeys.list({ companyId, status, customerId, search, page, limit }),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Project>>("/projects", {
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

// 案件詳細取得
export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () =>
      apiClient.get<SingleResponse<ProjectDetail>>(`/projects/${id}`),
    enabled: enabled && !!id,
  });
}

// 案件作成
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      apiClient.post<SingleResponse<Project>>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// 案件更新
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      apiClient.put<SingleResponse<Project>>(`/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// 案件削除
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
