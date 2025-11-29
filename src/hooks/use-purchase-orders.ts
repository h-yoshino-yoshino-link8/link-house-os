import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PurchaseOrderDetail {
  id: string;
  sortOrder: number;
  name: string;
  specification?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  amount: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  projectId: string;
  partnerId: string;
  orderNumber: string;
  title: string;
  orderDate: string;
  deliveryDate?: string;
  status: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paidAmount: number;
  paidDate?: string;
  notes?: string;
  internalMemo?: string;
  project?: {
    id: string;
    projectNumber: string;
    title: string;
  };
  partner?: {
    id: string;
    name: string;
    category?: string;
  };
  details: PurchaseOrderDetail[];
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrdersResponse {
  data: PurchaseOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsePurchaseOrdersParams {
  companyId: string;
  projectId?: string;
  partnerId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function usePurchaseOrders(params: UsePurchaseOrdersParams) {
  const queryParams = new URLSearchParams({
    companyId: params.companyId,
    ...(params.projectId && { projectId: params.projectId }),
    ...(params.partnerId && { partnerId: params.partnerId }),
    ...(params.status && { status: params.status }),
    ...(params.page && { page: String(params.page) }),
    ...(params.limit && { limit: String(params.limit) }),
  });

  return useQuery<PurchaseOrdersResponse>({
    queryKey: ["purchaseOrders", params],
    queryFn: async () => {
      const res = await fetch(`/api/purchase-orders?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch purchase orders");
      return res.json();
    },
  });
}

interface CreatePurchaseOrderData {
  companyId: string;
  projectId: string;
  partnerId: string;
  title: string;
  orderDate: string;
  deliveryDate?: string;
  taxRate?: number;
  notes?: string;
  internalMemo?: string;
  details: Array<{
    name: string;
    specification?: string;
    quantity: number;
    unit?: string;
    unitPrice: number;
    notes?: string;
  }>;
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderData) => {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create purchase order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
}
