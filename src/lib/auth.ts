import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * 現在のユーザーを取得（サーバーサイド）
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
  };
}

/**
 * 現在のユーザーのDB情報を取得
 */
export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { company: true },
  });

  return user;
}

/**
 * 現在のユーザーのcompanyIdを取得
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true },
  });

  return user?.companyId ?? null;
}

/**
 * ユーザーが特定の会社に所属しているかチェック
 */
export async function checkUserCompanyAccess(companyId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { companyId: true },
  });

  return user?.companyId === companyId;
}

/**
 * 認証必須API用のヘルパー
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * 会社アクセス必須API用のヘルパー
 */
export async function requireCompanyAccess(companyId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const hasAccess = await checkUserCompanyAccess(companyId);
  if (!hasAccess) {
    throw new Error("Forbidden: No access to this company");
  }

  return userId;
}

/**
 * 現在のユーザーのcompanyIdを取得（必須）
 */
export async function requireCompanyId(): Promise<string> {
  const companyId = await getCurrentCompanyId();
  if (!companyId) {
    throw new Error("User not associated with any company");
  }
  return companyId;
}
