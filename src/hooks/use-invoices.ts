"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ============================================
// Types
// ============================================

export interface InvoiceDetail {
  id: string;
  invoiceId: string;
  sortOrder: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  projectId: string;
  customerId: string;
  invoiceNumber: string;
  title: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  notes: string | null;
  internalMemo: string | null;
  sentAt: string | null;
  sentTo: string | null;
  createdAt: string;
  updatedAt: string;
  details?: InvoiceDetail[];
  payments?: Payment[];
  project?: {
    id: string;
    projectNumber: string;
    title: string;
    customer?: {
      id: string;
      name: string;
      address: string | null;
    };
  };
}

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Query Keys
// ============================================

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: Record<string, string | undefined>) =>
    [...invoiceKeys.lists(), params] as const,
  detail: (id: string) => [...invoiceKeys.all, id] as const,
  payments: (id: string) => [...invoiceKeys.all, id, "payments"] as const,
};

// ============================================
// Hooks
// ============================================

interface UseInvoicesParams {
  companyId: string;
  projectId?: string;
  customerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useInvoices(params: UseInvoicesParams) {
  const queryParams = {
    companyId: params.companyId,
    projectId: params.projectId,
    customerId: params.customerId,
    status: params.status,
    page: params.page?.toString(),
    limit: params.limit?.toString(),
  };

  return useQuery({
    queryKey: invoiceKeys.list(queryParams),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Invoice>>("/invoices", queryParams);
      return response;
    },
    enabled: !!params.companyId,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

interface CreateInvoiceData {
  companyId: string;
  projectId: string;
  customerId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  taxRate?: number;
  notes?: string;
  internalMemo?: string;
  details: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await apiClient.post<ApiResponse<Invoice>>("/invoices", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

interface UpdateInvoiceData {
  title?: string;
  issueDate?: string;
  dueDate?: string;
  status?: string;
  taxRate?: number;
  notes?: string;
  internalMemo?: string;
  details?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
  }>;
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateInvoiceData) => {
      const response = await apiClient.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/invoices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

// ============================================
// Payment Hooks
// ============================================

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.payments(invoiceId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Payment[]>>(`/invoices/${invoiceId}/payments`);
      return response.data;
    },
    enabled: !!invoiceId,
  });
}

interface RecordPaymentData {
  paymentDate: string;
  amount: number;
  method?: string;
  reference?: string;
  notes?: string;
}

export function useRecordPayment(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RecordPaymentData) => {
      const response = await apiClient.post<ApiResponse<{ payment: Payment; invoice: Invoice }>>(
        `/invoices/${invoiceId}/payments`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.payments(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
