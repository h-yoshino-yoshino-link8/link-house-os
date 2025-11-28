"use client";

import { useState, useEffect, ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

// Clerk環境変数が有効かチェック
function isClerkEnabled() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(
    publishableKey &&
    publishableKey !== "pk_test_your_key_here" &&
    publishableKey.length >= 20
  );
}

// 動的にロードされるClerkProvider
function DynamicClerkProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ClerkComponents, setClerkComponents] = useState<{
    ClerkProvider: any;
    jaJP: any;
  } | null>(null);

  useEffect(() => {
    // 動的にClerkモジュールをロード
    Promise.all([
      import("@clerk/nextjs"),
      import("@clerk/localizations"),
    ])
      .then(([clerk, localizations]) => {
        setClerkComponents({
          ClerkProvider: clerk.ClerkProvider,
          jaJP: localizations.jaJP,
        });
      })
      .catch((error) => {
        console.log("Clerk not available:", error);
      });
  }, []);

  // Clerkがまだロードされていない場合は子要素のみ表示
  if (!ClerkComponents) {
    return <>{children}</>;
  }

  const { ClerkProvider, jaJP } = ClerkComponents;
  return <ClerkProvider localization={jaJP}>{children}</ClerkProvider>;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // キーが無効またはプレースホルダーの場合はClerkなしでレンダリング
  if (!isClerkEnabled()) {
    return <>{children}</>;
  }

  return <DynamicClerkProvider>{children}</DynamicClerkProvider>;
}
