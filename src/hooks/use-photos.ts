"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// 型定義
export interface Photo {
  id: string;
  projectId: string;
  projectName: string;
  projectNumber: string;
  customerName?: string;
  url: string;
  thumbnailUrl?: string | null;
  folder: string | null;
  category: string | null;
  tags: string[];
  title: string;
  caption: string | null;
  takenAt: string | null;
  uploadedAt: string;
  hasAnnotations: boolean;
  annotations: unknown;
}

interface PhotosResponse {
  data: Photo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    annotated: number;
    byFolder: Record<string, number>;
  };
}

// クエリキー
export const photoKeys = {
  all: ["photos"] as const,
  lists: () => [...photoKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...photoKeys.lists(), filters] as const,
  detail: (id: string) => [...photoKeys.all, "detail", id] as const,
};

interface UsePhotosOptions {
  companyId: string;
  projectId?: string;
  folder?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// 写真一覧取得
export function usePhotos({
  companyId,
  projectId,
  folder,
  page = 1,
  limit = 20,
  enabled = true,
}: UsePhotosOptions) {
  return useQuery({
    queryKey: photoKeys.list({ companyId, projectId, folder, page, limit }),
    queryFn: () =>
      apiClient.get<PhotosResponse>("/photos", {
        companyId,
        projectId,
        folder,
        page: String(page),
        limit: String(limit),
      }),
    enabled: enabled && !!companyId,
  });
}

// 写真作成（メタデータ保存）
interface CreatePhotoRequest {
  projectId: string;
  url: string;
  thumbnailUrl?: string;
  folder?: string;
  tags?: string[];
  caption?: string;
  takenAt?: string;
}

export function useCreatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhotoRequest) =>
      apiClient.post<{ data: Photo }>("/photos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}

// 写真更新（注釈など）
interface UpdatePhotoRequest {
  folder?: string;
  tags?: string[];
  caption?: string;
  annotations?: unknown;
}

export function useUpdatePhoto(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePhotoRequest) =>
      apiClient.put<{ data: Photo }>(`/photos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: photoKeys.detail(id) });
    },
  });
}

// 写真削除
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/photos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}

// 複数写真削除
export function useDeletePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.post<{ success: boolean; deleted: number }>("/photos/bulk-delete", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
    },
  });
}
