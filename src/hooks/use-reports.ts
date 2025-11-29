import { useQuery } from "@tanstack/react-query";

interface MonthlyRevenue {
  month: number;
  monthLabel: string;
  revenue: number;
  cost: number;
  profit: number;
  profitRate: number;
  projectCount: number;
}

interface ReportData {
  year: number;
  summary: {
    revenue: number;
    cost: number;
    profit: number;
    profitRate: number;
    projectCount: number;
    estimateCount: number;
    conversionRate: number;
    customerCount: number;
    revenueGrowth: number;
  };
  monthlyRevenue: MonthlyRevenue[];
  estimateStatusDistribution: {
    draft: number;
    submitted: number;
    ordered: number;
    lost: number;
  };
  customerRankDistribution: {
    member: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  activeProjects: {
    id: string;
    title: string;
    contractAmount: number;
    startDate: Date | null;
    endDate: Date | null;
    daysRemaining: number | null;
  }[];
  topCustomers: {
    id: string;
    name?: string;
    totalTransaction: number;
  }[];
}

interface UseReportsParams {
  companyId: string;
  year?: number;
  period?: "month" | "quarter" | "year";
}

export function useReports({ companyId, year, period }: UseReportsParams) {
  const currentYear = year || new Date().getFullYear();

  return useQuery<ReportData>({
    queryKey: ["reports", companyId, currentYear, period],
    queryFn: async () => {
      const params = new URLSearchParams({
        companyId,
        year: currentYear.toString(),
        ...(period && { period }),
      });
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
}
