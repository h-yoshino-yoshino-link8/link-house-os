# LinK HOUSE OS セットアップガイド

## 本番利用に向けた設定手順

### 完了した作業
- [x] Phase 0-9 全機能実装完了
- [x] Vercelにデプロイ済み (link-house-os.vercel.app)
- [x] Neon PostgreSQL データベース作成完了 (neon-green-queen)

### 残りの作業
- [ ] 環境変数の設定（DATABASE_URL）
- [ ] Prismaマイグレーション実行
- [ ] 初期データ投入（会社情報、マスターデータ）
- [ ] Clerk認証設定（ユーザーログイン機能）
- [ ] 動作確認

---

## Step 1: データベース作成 ✅ 完了

Vercel Dashboard → Storage → Neon → Create
- Database名: neon-green-queen
- プラン: Free (0.5GB)

## Step 2: 環境変数設定

### ローカル開発用
`.env.local` に以下を設定：

```env
# Neon PostgreSQL（Vercel Storageから取得）
DATABASE_URL="postgresql://..."

# Clerk認証（後で設定）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Vercel本番環境
Vercel Dashboard → Settings → Environment Variables
- `DATABASE_URL` は Neon連携で自動設定済み

## Step 3: Prismaマイグレーション

```bash
cd /Users/yoshinohiroshi/Dev/link-house-os

# マイグレーション実行
npx prisma migrate deploy

# Prismaクライアント生成
npx prisma generate
```

## Step 4: 初期データ投入

```bash
# シードスクリプト実行（会社情報、マスターデータ）
npx prisma db seed
```

## Step 5: Clerk認証設定（オプション）

1. https://clerk.com でアカウント作成
2. アプリケーション作成
3. 環境変数にキーを設定

---

## 使用する機能一覧

| 機能 | パス | 状態 |
|------|------|------|
| 見積管理 | `/estimates` | ✅ |
| 案件管理 | `/projects` | ✅ |
| 顧客管理 | `/customers` | ✅ |
| 工程表 | `/schedules` | ✅ |
| 書類作成 | `/documents` | ✅ |
| 写真管理 | `/photos` | ✅ |
| 請求管理 | `/invoices` | ✅ |
| 会社情報 | `/settings/company` | ✅ |
| ユーザー管理 | `/settings/users` | ✅ |
| マスター管理 | `/settings/masters` | ✅ |

---

## トラブルシューティング

### データベース接続エラー
- Vercel Dashboard → Storage で接続状態を確認
- 環境変数 `DATABASE_URL` が正しいか確認

### マイグレーションエラー
```bash
# リセットして再実行
npx prisma migrate reset
npx prisma migrate deploy
```

---

*最終更新: 2025-11-28*
