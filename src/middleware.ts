import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 認証が必要なルート
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/customers(.*)",
  "/houses(.*)",
  "/estimates(.*)",
  "/projects(.*)",
  "/schedules(.*)",
  "/photos(.*)",
  "/documents(.*)",
  "/analytics(.*)",
  "/settings(.*)",
  "/invoices(.*)",
  "/reports(.*)",
  "/savings(.*)",
  "/gamification(.*)",
]);

// 公開ルート（認証不要）
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
