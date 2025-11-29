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
import {
  getDemoProjects,
  getDemoProject,
  createDemoProject,
  updateDemoProject,
  DemoProject,
} from "@/lib/demo-storage";

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
    queryFn: async () => {
      try {
        const result = await apiClient.get<PaginatedResponse<Project>>("/projects", {
          companyId,
          status,
          customerId,
          search,
          page,
          limit,
        });

        // APIから取得したデータにlocalStorageのデモデータをマージ
        const demoProjects = getDemoProjects(companyId);
        const dbIds = new Set(result.data.map(p => p.id));
        const uniqueDemoProjects = demoProjects.filter(
          d => !dbIds.has(d.id)
        ) as unknown as Project[];

        let mergedData = [...uniqueDemoProjects, ...result.data];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          mergedData = mergedData.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            p.projectNumber.toLowerCase().includes(searchLower)
          );
        }
        if (status && status !== "all") {
          mergedData = mergedData.filter(p => p.status === status);
        }
        if (customerId) {
          mergedData = mergedData.filter(p => p.customerId === customerId);
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
        // エラー時はデモデータのみ返す
        let demoProjects = getDemoProjects(companyId) as unknown as Project[];

        // フィルタリング
        if (search) {
          const searchLower = search.toLowerCase();
          demoProjects = demoProjects.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            p.projectNumber.toLowerCase().includes(searchLower)
          );
        }
        if (status && status !== "all") {
          demoProjects = demoProjects.filter(p => p.status === status);
        }
        if (customerId) {
          demoProjects = demoProjects.filter(p => p.customerId === customerId);
        }

        return {
          data: demoProjects,
          pagination: {
            page: 1,
            limit: demoProjects.length,
            total: demoProjects.length,
            totalPages: 1,
          },
        };
      }
    },
    enabled: enabled && !!companyId,
  });
}

// 案件詳細取得
export function useProject(id: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      // まずデモデータをチェック
      const demoProject = getDemoProject(id);
      if (demoProject) {
        return { data: demoProject as unknown as ProjectDetail };
      }

      // デモデータになければAPIから取得
      return apiClient.get<SingleResponse<ProjectDetail>>(`/projects/${id}`);
    },
    enabled: enabled && !!id,
  });
}

// 案件作成
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectRequest) => {
      try {
        return await apiClient.post<SingleResponse<Project>>("/projects", data);
      } catch {
        // APIが失敗した場合、デモストレージに保存
        console.log("API unavailable, saving project to demo storage");
        const project = createDemoProject({
          companyId: data.companyId,
          customerId: data.customerId,
          estimateId: data.estimateId,
          title: data.title,
          status: "planning",
          startDate: data.startDate,
          endDate: data.endDate,
          contractAmount: data.contractAmount,
        });
        return { data: project as unknown as Project };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// 案件更新
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProjectRequest) => {
      // デモデータかチェック
      const demoProject = getDemoProject(id);
      if (demoProject) {
        const updated = updateDemoProject(id, data as Partial<DemoProject>);
        if (updated) {
          return { data: updated as unknown as Project };
        }
        throw new Error("Failed to update demo project");
      }

      return apiClient.put<SingleResponse<Project>>(`/projects/${id}`, data);
    },
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
