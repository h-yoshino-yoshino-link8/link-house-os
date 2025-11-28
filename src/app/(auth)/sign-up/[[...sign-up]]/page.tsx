"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

// Clerk環境変数が設定されているかチェック
const hasClerkKeys = () => {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!(key && key !== "pk_test_your_key_here" && key.length >= 20);
};

function ClerkSignUp() {
  const { SignUp } = require("@clerk/nextjs");
  return (
    <SignUp
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
          card: "shadow-none",
          headerTitle: "text-xl font-semibold text-gray-900",
          headerSubtitle: "text-sm text-gray-600",
          socialButtonsBlockButton:
            "border border-gray-300 hover:bg-gray-50 text-gray-600",
          formFieldLabel: "text-sm font-medium text-gray-700",
          formFieldInput:
            "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500",
          footerActionLink: "text-blue-600 hover:text-blue-700",
        },
      }}
    />
  );
}

function FallbackSignUp() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Home className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">LinK HOUSE OS</CardTitle>
        <CardDescription>
          デモモードで動作中
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Clerk認証が設定されていません。<br />
          デモモードでダッシュボードにアクセスできます。
        </p>
        <Button asChild className="w-full">
          <Link href="/dashboard">
            ダッシュボードへ
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  const clerkEnabled = hasClerkKeys();

  if (clerkEnabled) {
    return <ClerkSignUp />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <FallbackSignUp />
    </div>
  );
}
