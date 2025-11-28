"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // ビルド時にはClerkをスキップ
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // キーが無効またはプレースホルダーの場合はClerkなしでレンダリング
  if (
    !publishableKey ||
    publishableKey === "pk_test_your_key_here" ||
    publishableKey.length < 20
  ) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider localization={jaJP}>
      {children}
    </ClerkProvider>
  );
}
