import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PortalData {
  customer: {
    id: string;
    name: string;
    rank: string;
    points: number;
  };
  house: {
    id: string;
    address: string;
    healthScore: number;
    builtYear: number | null;
    structureType: string | null;
    totalArea: number | null;
  } | null;
  componentScores: { subject: string; score: number }[];
  alerts: {
    id: string;
    level: string;
    message: string;
    component: string | null;
  }[];
  recentEstimates: {
    id: string;
    estimateNumber: string;
    title: string;
    submittedAt: Date;
    validUntil: Date | null;
    amount: number;
    status: string;
  }[];
  recentProjects: {
    id: string;
    title: string;
    status: string;
    completedAt: Date | null;
    hasNft: boolean;
  }[];
  savings: {
    plan: string;
    balance: number;
    bonusBalance: number;
    monthlyAmount: number;
  } | null;
  nftCount: number;
}

interface PortalEstimate {
  id: string;
  estimateNumber: string;
  title: string;
  estimateDate: Date;
  validUntil: Date | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  notes: string | null;
  house: { id: string; address: string } | null;
  details: {
    id: string;
    name: string;
    specification: string | null;
    quantity: number;
    unit: string | null;
    priceUnit: number;
    priceTotal: number;
    level: number;
    isCategory: boolean;
    parentId: string | null;
  }[];
}

// ポータルダッシュボードデータ取得
export function usePortalData(token: string | null) {
  return useQuery<PortalData>({
    queryKey: ["portal", token],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const response = await fetch(`/api/portal/${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch portal data");
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
}

// ポータル見積一覧取得
export function usePortalEstimates(token: string | null) {
  return useQuery<PortalEstimate[]>({
    queryKey: ["portal", token, "estimates"],
    queryFn: async () => {
      if (!token) throw new Error("No token provided");
      const response = await fetch(`/api/portal/${token}/estimates`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch estimates");
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!token,
  });
}

// 見積承認
export function useApproveEstimate(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      estimateId,
      message,
    }: {
      estimateId: string;
      message?: string;
    }) => {
      if (!token) throw new Error("No token provided");
      const response = await fetch(
        `/api/portal/${token}/estimates/${estimateId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to approve estimate");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal", token] });
      queryClient.invalidateQueries({ queryKey: ["portal", token, "estimates"] });
    },
  });
}

// ポータルトークン生成（管理画面用）
export function useGeneratePortalToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}/portal-token`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate portal token");
      }
      return response.json();
    },
    onSuccess: (data, customerId) => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
}
