export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6 px-4">
        {/* ロゴ */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            LinK HOUSE OS
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            建設業向け統合業務管理システム
          </p>
        </div>

        {/* 認証フォーム */}
        <div className="rounded-xl bg-white p-6 shadow-lg">
          {children}
        </div>

        {/* フッター */}
        <p className="text-center text-xs text-gray-500">
          © 2024 LinK Co., Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
