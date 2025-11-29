import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Partner {
  id: string;
  companyId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  specialty?: string;
  licenseNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  paymentTerms?: string;
  taxRate: number;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PartnersResponse {
  data: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UsePartnersParams {
  companyId: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function usePartners(params: UsePartnersParams) {
  const queryParams = new URLSearchParams({
    companyId: params.companyId,
    ...(params.category && { category: params.category }),
    ...(params.isActive !== undefined && { isActive: String(params.isActive) }),
    ...(params.page && { page: String(params.page) }),
    ...(params.limit && { limit: String(params.limit) }),
  });

  return useQuery<PartnersResponse>({
    queryKey: ["partners", params],
    queryFn: async () => {
      const res = await fetch(`/api/partners?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch partners");
      return res.json();
    },
  });
}

interface CreatePartnerData {
  companyId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  specialty?: string;
  licenseNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  paymentTerms?: string;
  taxRate?: number;
  notes?: string;
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePartnerData) => {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create partner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });
}
