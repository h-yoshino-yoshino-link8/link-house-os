import { NextResponse } from "next/server";

// デモモード用の会社情報
const DEMO_COMPANY = {
  id: "demo-company",
  name: "株式会社LinK（デモ）",
  role: "admin",
};

export async function GET() {
  try {
    // Clerkキーが設定されているか確認
    const hasClerkKeys = !!(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY
    );

    if (!hasClerkKeys) {
      // デモモード
      return NextResponse.json({ data: DEMO_COMPANY });
    }

    // Clerk/Prisma を動的インポート
    const { getCurrentDbUser } = await import("@/lib/auth");
    const user = await getCurrentDbUser();

    if (!user) {
      // ユーザーが見つからない場合もデモデータを返す
      return NextResponse.json({ data: DEMO_COMPANY });
    }

    return NextResponse.json({
      data: {
        id: user.companyId,
        name: user.company.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    // エラー時もデモデータを返す
    return NextResponse.json({ data: DEMO_COMPANY });
  }
}
