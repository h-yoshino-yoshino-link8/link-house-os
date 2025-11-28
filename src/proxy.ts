import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 一時的にすべてのリクエストをパススルー（デバッグ用）
// Clerk認証は後で追加
export default function proxy(request: NextRequest) {
  // ログ出力（Vercel Runtime Logsで確認可能）
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
