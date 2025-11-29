# データベース移行ログ

**作成日**: 2025-11-29
**最終更新**: 2025-11-29
**担当**: Claude Code + 吉野さん

---

## 概要

LinK HOUSE OSのデータベースをNeon PostgreSQLからSupabaseに移行する作業の記録。

---

## 1. データベース設定情報

### 1.1 Neon PostgreSQL（旧・無効化予定）

| 項目 | 値 |
|------|-----|
| プロジェクト名 | neon-green-queen |
| プロバイダー | Neon (Vercel Storage経由) |
| プラン | Free |
| 作成日 | 2025-11-28 |
| リージョン | us-east-1 |
| DATABASE_URL | `postgresql://neondb_owner:***@ep-patient-bread-ahkvo1wl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| 状態 | **無効化予定** |

#### Neonで自動生成された環境変数（Vercel）
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL_NON_POOLING`
- `PGHOST`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 1.2 Supabase（新・使用予定）

| 項目 | 値 |
|------|-----|
| Organization | LinK |
| プロジェクト名 | link-house-os |
| プロバイダー | Supabase |
| プラン | Free |
| 作成日 | 2025-11-29 |
| リージョン | ap-northeast-2 (Asia Pacific) |
| DATABASE_URL | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres` |
| 接続方式 | Transaction pooler (IPv4対応) |
| 状態 | **設定中** |

#### Supabaseの追加機能
- Storage: 1GB（写真保存用）
- Authentication: あり（Clerkを使用するため未使用）
- Realtime: あり（将来利用可能）
- Edge Functions: あり

---

## 2. なぜNeonからSupabaseに移行するのか

### 2.1 経緯

1. 当初、Vercel StorageでNeon PostgreSQLを自動設定
2. Phase B（データベース設定）でSupabaseを提案
3. LinK HOUSE OSには**写真管理機能**があり、Supabaseの**Storage機能**が有用

### 2.2 比較表

| 機能 | Neon | Supabase |
|------|------|----------|
| PostgreSQL | ✅ 500MB | ✅ 500MB |
| ストレージ | ❌ なし | ✅ 1GB |
| リアルタイム | ❌ なし | ✅ あり |
| 管理画面 | シンプル | 充実 |
| Vercel統合 | ✅ 自動 | 手動設定 |

### 2.3 移行の理由

- **写真管理機能**: LinK HOUSE OSには工事写真のアップロード・管理機能がある
- **Supabase Storage**: 写真を保存できる1GBのストレージが無料で利用可能
- **将来の拡張性**: リアルタイム機能、Edge Functionsなど

---

## 3. 移行作業の進捗

### 3.1 完了した作業

| タスク | 状態 | 日時 |
|--------|------|------|
| Phase A-1: Clerkアカウント作成 | ✅ 完了 | 2025-11-29 |
| Phase A-1: Clerk環境変数設定（Vercel） | ✅ 完了 | 2025-11-29 |
| Phase A-1: middleware.ts設定 | ✅ 完了 | 2025-11-29 |
| Phase A-1: サインイン/サインアップページ | ✅ 完了 | 2025-11-29 |
| Phase A-2: アプリ名「LinK HOUSE OS」に変更 | ✅ 完了 | 2025-11-29 |
| Phase A-2: サポートメール設定 | ✅ 完了 | 2025-11-29 |
| Phase B-1: Supabaseアカウント作成 | ✅ 完了 | 2025-11-29 |
| Phase B-1: Supabaseプロジェクト作成 | ✅ 完了 | 2025-11-29 |

### 3.2 進行中の作業

| タスク | 状態 | 備考 |
|--------|------|------|
| Phase B-2: VercelのDATABASE_URLをSupabaseに更新 | 🔄 進行中 | Neon連携の解除が必要 |

### 3.3 残りの作業

| タスク | 状態 |
|--------|------|
| Phase B-2: Neon連携の解除 | ⬜ 未着手 |
| Phase B-2: DATABASE_URLをSupabaseに設定 | ⬜ 未着手 |
| Phase B-3: ローカル.env.localにDATABASE_URL設定 | ⬜ 未着手 |
| Phase B-4: Prismaマイグレーション実行 | ⬜ 未着手 |
| Phase B-5: 初期データ投入（seed） | ⬜ 未着手 |

---

## 4. 現在の問題点

### 4.1 Neon連携の解除が必要

- VercelのEnvironment VariablesでDATABASE_URLを編集しようとすると、Neon連携により「Edit」ではなく「Manage Connection」が表示される
- Neon連携を解除しないと、DATABASE_URLを手動で設定できない

### 4.2 解決方法

1. Vercel Storage画面でNeonデータベース（neon-green-queen）を選択
2. 「Disconnect」オプションを探して接続を解除
3. その後、Environment VariablesでDATABASE_URLを手動で設定

---

## 5. 環境変数の設定値（次回作業用）

### 5.1 Vercelに設定する環境変数

```
DATABASE_URL=postgresql://postgres.himlxosvcassmoytvghe:[YOUR_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```

**注意**: `[YOUR_PASSWORD]`はSupabaseプロジェクト作成時に生成したパスワードに置き換える

### 5.2 ローカル.env.localに設定する環境変数

```
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.himlxosvcassmoytvghe:[YOUR_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

# Clerk認証（既に設定済み）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

---

## 6. 次回作業の手順

### Step 1: Neon連携を解除

1. Vercelダッシュボードを開く
2. link-house-osプロジェクト → Storage
3. neon-green-queenをクリック
4. 「Disconnect」または「Remove」を探してクリック
5. 確認ダイアログで承認

### Step 2: DATABASE_URLを設定

1. Settings → Environment Variables
2. 「Create new」で新規追加
3. Key: `DATABASE_URL`
4. Value: Supabaseの接続文字列（パスワード置き換え済み）
5. Save

### Step 3: ローカル環境設定

```bash
cd /Users/yoshinohiroshi/Dev/link-house-os
# .env.localファイルを編集してDATABASE_URLを追加
```

### Step 4: Prismaマイグレーション

```bash
cd /Users/yoshinohiroshi/Dev/link-house-os
npx prisma migrate deploy
npx prisma generate
```

### Step 5: 初期データ投入

```bash
npx prisma db seed
```

---

## 7. 関連ファイル

- `/docs/ROADMAP_DETAILED.md` - 詳細ロードマップ
- `/docs/SETUP_GUIDE.md` - セットアップガイド
- `/prisma/schema.prisma` - データベーススキーマ
- `/prisma/seed.ts` - 初期データ投入スクリプト

---

## 8. 連絡先・参考情報

### サービスダッシュボード

| サービス | URL |
|----------|-----|
| Vercel | https://vercel.com/yoshinos-projects-ea06de60/link-house-os |
| Supabase | https://supabase.com/dashboard (LinK > link-house-os) |
| Clerk | https://dashboard.clerk.com |
| GitHub | https://github.com/h-yoshino-yoshino-link8/link-house-os |

### 本番サイト

- https://link-house-os.vercel.app

---

*このドキュメントは作業の進捗に応じて更新してください*
