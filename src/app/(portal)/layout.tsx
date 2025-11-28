import Link from "next/link";
import { Home, FileText, Wrench, Shield, User, LogOut } from "lucide-react";

// 施主ポータル用レイアウト（認証なしでアクセス可能）
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/portal" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold">My Home Portal</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/portal"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              ダッシュボード
            </Link>
            <Link
              href="/portal/maintenance"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Wrench className="h-4 w-4" />
              メンテナンス
            </Link>
            <Link
              href="/portal/certificates"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Shield className="h-4 w-4" />
              施工証明
            </Link>
            <Link
              href="/portal/documents"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              書類
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/portal/profile"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">マイページ</span>
            </Link>
          </div>
        </div>
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
  );
}
