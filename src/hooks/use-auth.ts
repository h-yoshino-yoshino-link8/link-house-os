"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface CompanyInfo {
  id: string;
  name: string;
  role: string;
}

/**
 * 認証フック - Clerk認証情報とアプリケーション固有の情報を統合
 */
export function useAuth() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();

  // ユーザーの会社情報を取得
  const {
    data: companyData,
    isLoading: isCompanyLoading,
  } = useQuery({
    queryKey: ["current-company"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: CompanyInfo }>("/auth/company");
      return response.data;
    },
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000, // 5分
  });

  return {
    // Clerk user info
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          imageUrl: user.imageUrl,
        }
      : null,
    isSignedIn,
    isLoaded: isUserLoaded && !isCompanyLoading,

    // Company info
    company: companyData,
    companyId: companyData?.id,

    // Auth helpers
    getToken,
  };
}

/**
 * 会社ID取得フック
 */
export function useCompanyId() {
  const { companyId, isLoaded } = useAuth();
  return { companyId, isLoaded };
}
