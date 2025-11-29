import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Company, User } from "@/types";

// 開発用デモ会社ID（本番環境ではClerk認証から取得）
export const DEMO_COMPANY_ID = "company-demo-001";

interface AppState {
  // 現在のユーザー・会社
  user: User | null;
  company: Company | null;
  companyId: string;

  // サイドバー状態
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // 通知
  notifications: Notification[];
  unreadCount: number;

  // ハイドレーション状態
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // アクション
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setCompanyId: (companyId: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      companyId: DEMO_COMPANY_ID,
      sidebarOpen: true,
      sidebarCollapsed: false,
      notifications: [],
      unreadCount: 0,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user) => set({ user }),
      setCompany: (company) => set({ company }),
      setCompanyId: (companyId) => set({ companyId }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: "link-house-os-app",
      storage: createJSONStorage(() => {
        // SSR時はダミーストレージを返す
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
