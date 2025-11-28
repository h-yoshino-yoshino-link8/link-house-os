"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { ErrorBoundary } from "@/components/error-boundary";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ハイドレーション完了を待つ
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSRとクライアントの不一致を避けるため、マウント前はローディング表示
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ErrorBoundary>
            <Header />
          </ErrorBoundary>
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
