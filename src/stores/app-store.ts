import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, User } from "@/types";

interface AppState {
  // 現在のユーザー・会社
  user: User | null;
  company: Company | null;

  // サイドバー状態
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // 通知
  notifications: Notification[];
  unreadCount: number;

  // アクション
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
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
      sidebarOpen: true,
      sidebarCollapsed: false,
      notifications: [],
      unreadCount: 0,

      setUser: (user) => set({ user }),
      setCompany: (company) => set({ company }),

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
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
