import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ClerkProviderWrapper } from "@/components/providers/clerk-provider-wrapper";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LinK HOUSE OS - 建設業向け統合業務管理システム",
  description: "見積・原価管理、工程表、契約書、工事台帳、ダッシュボードを一元管理。家の生涯パートナーを実現する建設DXプラットフォーム。",
  keywords: ["建設業", "見積", "原価管理", "リフォーム", "工事管理", "DX"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <ClerkProviderWrapper>
          <QueryProvider>{children}</QueryProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
