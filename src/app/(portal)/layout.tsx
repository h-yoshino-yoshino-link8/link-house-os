"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, createContext, useContext, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Home,
  FileText,
  Wrench,
  Shield,
  User,
  CreditCard,
  PiggyBank,
  Gift,
  Menu,
  X,
} from "lucide-react";

// ポータルトークンコンテキスト
const PortalTokenContext = createContext<string | null>(null);

export function usePortalToken() {
  return useContext(PortalTokenContext);
}

const portalNavigation = [
  { title: "ホーム", href: "/portal", icon: Home },
  { title: "お見積り", href: "/portal/estimates", icon: FileText },
  { title: "請求書", href: "/portal/invoices", icon: CreditCard },
  { title: "メンテナンス", href: "/portal/maintenance", icon: Wrench },
  { title: "施工証明", href: "/portal/certificates", icon: Shield },
  { title: "積立口座", href: "/portal/savings", icon: PiggyBank },
  { title: "ポイント", href: "/portal/points", icon: Gift },
];

// QueryClient for React Query
const queryClient = new QueryClient();

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // トークン付きのリンクを生成
  const getHref = (href: string) => {
    return token ? `${href}?token=${token}` : href;
  };

  return (
    <PortalTokenContext.Provider value={token}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href={getHref("/portal")} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Home className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">My Home Portal</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {portalNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={getHref(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href={getHref("/portal/profile")}
                className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <User className="h-4 w-4" />
                <span>マイページ</span>
              </Link>
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden border-t bg-white">
              <div className="container mx-auto px-4 py-2 space-y-1">
                {portalNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={getHref(item.href)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  );
                })}
                <div className="border-t pt-2 mt-2">
                  <Link
                    href={getHref("/portal/profile")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"
                  >
                    <User className="h-5 w-5" />
                    マイページ
                  </Link>
                </div>
              </div>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>LinK HOUSE OS - 家の生涯パートナー</p>
            <p className="mt-2">お困りの際はお気軽にお問い合わせください</p>
          </div>
        </footer>
      </div>
    </PortalTokenContext.Provider>
  );
}

// 施主ポータル用レイアウト（認証なしでアクセス可能）
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
        <PortalLayoutContent>{children}</PortalLayoutContent>
      </Suspense>
    </QueryClientProvider>
  );
}
