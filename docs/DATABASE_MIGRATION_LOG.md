# データベース移行ログ

**作成日**: 2025-11-29
**最終更新**: 2025-11-29 12:59
**担当**: Claude Code + 吉野さん

---

## 概要

LinK HOUSE OSのデータベースをNeon PostgreSQLからSupabaseに移行する作業の記録。

---

## 1. データベース設定情報

### 1.1 Neon PostgreSQL（旧・解除済み）

| 項目 | 値 |
|------|-----|
| プロジェクト名 | neon-green-queen |
| プロバイダー | Neon (Vercel Storage経由) |
| プラン | Free |
| 作成日 | 2025-11-28 |
| リージョン | us-east-1 |
| DATABASE_URL | `postgresql://neondb_owner:***@ep-patient-bread-ahkvo1wl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| 状態 | **解除済み (2025-11-29)** |

### 1.2 Supabase（新・使用中）

| 項目 | 値 |
|------|-----|
| Organization | LinK |
| プロジェクト名 | link-house-os |
| プロバイダー | Supabase |
| プラン | Free |
| 作成日 | 2025-11-29 |
| リージョン | ap-northeast-2 (Seoul, Asia Pacific) |
| プロジェクトRef | himlxosvcassmoytvghe |
| 接続方式 | Transaction pooler (IPv4対応) |
| 状態 | **有効・テーブル作成済み** |

#### 接続URL

| 用途 | ポート | URL |
|------|--------|-----|
| アプリケーション用 (Pooler) | 6543 | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres` |
| マイグレーション用 (Direct) | 5432 | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` |

**重要**: Prisma db push/migrate には ポート5432（Direct）を使用。アプリケーションではポート6543（Pooler）を使用。

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
| PostgreSQL | 500MB | 500MB |
| ストレージ | なし | 1GB |
| リアルタイム | なし | あり |
| 管理画面 | シンプル | 充実 |
| Vercel統合 | 自動 | 手動設定 |

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
| Phase B-2: VercelでNeon連携を解除 | ✅ 完了 | 2025-11-29 12:48 |
| Phase B-2: VercelでDATABASE_URLをSupabaseに設定 | ✅ 完了 | 2025-11-29 12:51 |
| Phase B-3: ローカル.envにDATABASE_URL設定 | ✅ 完了 | 2025-11-29 12:56 |
| Phase B-4: Prisma db push実行（テーブル作成） | ✅ 完了 | 2025-11-29 12:58 |

### 3.2 追加完了した作業

| タスク | 状態 | 日時 |
|--------|------|------|
| Phase B-5: 初期データ投入（seed） | ✅ 完了 | 2025-11-29 13:10 |

### 3.3 残りの作業

| タスク | 状態 |
|--------|------|
| Phase B-6: 本番環境動作確認 | ⬜ 確認中 |

---

## 4. 環境変数の設定状況

### 4.1 Vercel（本番）

| 変数名 | 値 | 状態 |
|--------|-----|------|
| DATABASE_URL | postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | pk_test_... | ✅ 設定済み |
| CLERK_SECRET_KEY | sk_test_... | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_SIGN_IN_URL | /sign-in | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_SIGN_UP_URL | /sign-up | ✅ 設定済み |

### 4.2 ローカル（.env）

```
# Supabase Database (Transaction pooler for application)
DATABASE_URL="postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

---

## 5. データベーステーブル

Prisma db pushで作成されたテーブル（prisma/schema.prismaに基づく）：

- Customer（顧客）
- Project（工事案件）
- Estimate（見積）
- EstimateItem（見積明細）
- Invoice（請求書）
- InvoiceItem（請求明細）
- Schedule（スケジュール）
- Staff（スタッフ）
- その他

---

## 6. 関連ファイル

- `/docs/ROADMAP_DETAILED.md` - 詳細ロードマップ
- `/docs/SETUP_GUIDE.md` - セットアップガイド
- `/prisma/schema.prisma` - データベーススキーマ
- `/prisma/seed.ts` - 初期データ投入スクリプト

---

## 7. サービスダッシュボード

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
