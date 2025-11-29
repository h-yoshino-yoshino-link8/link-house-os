"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// 型定義
export interface ScheduleItem {
  id: string;
  name: string;
  assignee: string | null;
  color: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  notes?: string | null;
  children?: ScheduleItem[];
}

export interface ProjectWithSchedules {
  id: string;
  projectNumber: string;
  name: string;
  customer: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  schedules: ScheduleItem[];
}

interface SchedulesResponse {
  data: ProjectWithSchedules[];
}

// クエリキー
export const scheduleKeys = {
  all: ["schedules"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...scheduleKeys.lists(), filters] as const,
};

interface UseSchedulesOptions {
  companyId: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

// 工程一覧取得（プロジェクト情報付き）
export function useSchedules({
  companyId,
  projectId,
  startDate,
  endDate,
  enabled = true,
}: UseSchedulesOptions) {
  return useQuery({
    queryKey: scheduleKeys.list({ companyId, projectId, startDate, endDate }),
    queryFn: () =>
      apiClient.get<SchedulesResponse>("/schedules", {
        companyId,
        projectId,
        startDate,
        endDate,
      }),
    enabled: enabled && !!companyId,
  });
}

// 工程作成
interface CreateScheduleRequest {
  projectId: string;
  parentId?: string;
  name: string;
  assignee?: string;
  color?: string;
  startDate: string;
  endDate: string;
  progress?: number;
  notes?: string;
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleRequest) =>
      apiClient.post<{ data: ScheduleItem }>("/schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}

// 工程更新
interface UpdateScheduleRequest {
  name?: string;
  assignee?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  notes?: string;
}

export function useUpdateSchedule(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateScheduleRequest) =>
      apiClient.put<{ data: ScheduleItem }>(`/schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}

// 工程削除
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}

// 工程進捗更新（部分更新）
export function useUpdateScheduleProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      apiClient.put<{ data: ScheduleItem }>(`/schedules/${id}`, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() });
    },
  });
}
