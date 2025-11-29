# データベース移行ログ

**作成日**: 2025-11-29
**最終更新**: 2025-11-29 14:30
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
| 状態 | **解除済み (2025-11-29 12:48)** |

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
| 状態 | **有効・テーブル作成済み・初期データ投入済み** |

#### 接続URL

| 用途 | ポート | URL |
|------|--------|-----|
| アプリケーション用 (Pooler) | 6543 | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| マイグレーション用 (Direct) | 5432 | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` |

**重要**:
- Prisma db push/migrate には ポート5432（Direct）を使用
- アプリケーションではポート6543（Pooler）+ `?pgbouncer=true&connection_limit=1` を使用
- `prisma/schema.prisma` に `directUrl` の設定が必要

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

### 3.1 Phase A: 認証設定（完了）

| タスク | 状態 | 日時 |
|--------|------|------|
| Phase A-1: Clerkアカウント作成 | ✅ 完了 | 2025-11-29 |
| Phase A-1: Clerk環境変数設定（Vercel） | ✅ 完了 | 2025-11-29 |
| Phase A-1: middleware.ts設定 | ✅ 完了 | 2025-11-29 |
| Phase A-1: サインイン/サインアップページ | ✅ 完了 | 2025-11-29 |
| Phase A-2: アプリ名「LinK HOUSE OS」に変更 | ✅ 完了 | 2025-11-29 |
| Phase A-2: サポートメール設定 | ✅ 完了 | 2025-11-29 |

### 3.2 Phase B: データベース設定（完了）

| タスク | 状態 | 日時 |
|--------|------|------|
| Phase B-1: Supabaseアカウント作成 | ✅ 完了 | 2025-11-29 |
| Phase B-1: Supabaseプロジェクト作成 | ✅ 完了 | 2025-11-29 |
| Phase B-2: VercelでNeon連携を解除 | ✅ 完了 | 2025-11-29 12:48 |
| Phase B-2: VercelでDATABASE_URLをSupabaseに設定 | ✅ 完了 | 2025-11-29 12:51 |
| Phase B-3: ローカル.envにDATABASE_URL設定 | ✅ 完了 | 2025-11-29 12:56 |
| Phase B-4: Prisma db push実行（テーブル作成） | ✅ 完了 | 2025-11-29 12:58 |
| Phase B-5: 初期データ投入（seed） | ✅ 完了 | 2025-11-29 13:10 |

### 3.3 Phase B-6: Prisma Pooler設定（完了）

Supabase Transaction Poolerを使用する際にPrepared Statementエラーが発生したため、追加設定を実施。

| タスク | 状態 | 日時 |
|--------|------|------|
| エラー調査（prepared statement already exists） | ✅ 完了 | 2025-11-29 13:30 |
| DATABASE_URLに`?pgbouncer=true`追加 | ✅ 完了 | 2025-11-29 13:32 |
| DATABASE_URLに`&connection_limit=1`追加 | ✅ 完了 | 2025-11-29 13:57 |
| prisma/schema.prismaに`directUrl`追加 | ✅ 完了 | 2025-11-29 14:20 |
| VercelにDIRECT_URL環境変数追加 | ✅ 完了 | 2025-11-29 14:24 |
| GitHubにコミット・プッシュ | ✅ 完了 | 2025-11-29 14:20 |

### 3.4 Phase B-7: 本番環境動作確認（完了 🎉）

| タスク | 状態 | 日時 |
|--------|------|------|
| Transaction Pooler + pgbouncer=true設定 | ✅ 完了 | 2025-11-29 15:20 |
| 互換性のない@prisma/adapter-pg削除 | ✅ 完了 | 2025-11-29 15:22 |
| 本番環境でのDB接続確認 | ✅ **成功** | 2025-11-29 15:27 |
| ダッシュボード実データ表示 | ✅ **成功** | 2025-11-29 15:27 |
| 工程表実データ表示 | ✅ **成功** | 2025-11-29 15:27 |

**最終的な設定:**
- DATABASE_URL: `postgresql://...@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
- DIRECT_URL: `postgresql://...@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres`

---

## 4. 環境変数の設定状況

### 4.1 Vercel（本番）

| 変数名 | 値 | 状態 |
|--------|-----|------|
| DATABASE_URL | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | ✅ 設定済み |
| DIRECT_URL | `postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres` | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | pk_test_... | ✅ 設定済み |
| CLERK_SECRET_KEY | sk_test_... | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_SIGN_IN_URL | /sign-in | ✅ 設定済み |
| NEXT_PUBLIC_CLERK_SIGN_UP_URL | /sign-up | ✅ 設定済み |

### 4.2 ローカル（.env）

```
# Supabase Database
# Transaction pooler for application (port 6543)
DATABASE_URL="postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection for migrations (port 5432)
DIRECT_URL="postgresql://postgres.himlxosvcassmoytvghe:[PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
```

---

## 5. トラブルシューティング

### 5.1 Prepared Statement エラー

**エラー内容:**
```
prepared statement "s4" already exists
prepared statement "s5" does not exist
```

**原因:**
Supabase Transaction Pooler (PgBouncer) はprepared statementsをサポートしないため、Prismaのデフォルト動作と競合する。

**解決策:**
1. DATABASE_URLに`?pgbouncer=true&connection_limit=1`を追加
2. `prisma/schema.prisma`に`directUrl`を追加
3. VercelにDIRECT_URL環境変数を追加

**修正したファイル:**
- `prisma/schema.prisma` - directUrlの追加
- `.env` - DATABASE_URLとDIRECT_URLの設定
- Vercel環境変数 - DATABASE_URLとDIRECT_URLの設定

---

## 6. データベーステーブル

Prisma db pushで作成されたテーブル（prisma/schema.prismaに基づく）：

### コアテーブル
- Company（会社）
- User（ユーザー）
- Customer（顧客）
- House（物件）
- HouseComponent（物件部材）

### 見積・工事
- Estimate（見積）
- EstimateDetail（見積明細）
- Project（工事案件）
- Schedule（工程）
- Photo（写真）

### 請求・入金
- Invoice（請求書）
- InvoiceDetail（請求明細）
- Payment（入金）

### マスタ
- WorkCategory（工事カテゴリ）
- Material（材料）
- LaborType（労務）

### その他
- MaintenanceRecommendation（メンテナンス推奨）
- WorkCertificate（施工証明）
- SavingsContract（積立契約）
- SavingsTransaction（積立取引）
- PointTransaction（ポイント取引）
- Referral（紹介）
- Badge（バッジ）
- UserBadge（ユーザーバッジ）
- XpTransaction（XP取引）

---

## 7. 初期投入データ

`prisma/seed.ts`で投入されたデータ：

- 会社: 株式会社LinK
- 顧客: 5件（田中太郎、山田花子、佐藤一郎、鈴木美咲、高橋健一）
- 物件: 4件
- 見積: 3件
- 案件: 2件
- 工程: 6件
- 工事カテゴリ: 10件
- 材料マスタ: 10件
- 労務マスタ: 5件

---

## 8. 関連ファイル

- `/docs/ROADMAP_DETAILED.md` - 詳細ロードマップ
- `/docs/SETUP_GUIDE.md` - セットアップガイド
- `/prisma/schema.prisma` - データベーススキーマ
- `/prisma/seed.ts` - 初期データ投入スクリプト
- `/src/lib/prisma.ts` - Prismaクライアント設定

---

## 9. サービスダッシュボード

| サービス | URL |
|----------|-----|
| Vercel | https://vercel.com/yoshinos-projects-ea06de60/link-house-os |
| Supabase | https://supabase.com/dashboard (LinK > link-house-os) |
| Clerk | https://dashboard.clerk.com |
| GitHub | https://github.com/h-yoshino-yoshino-link8/link-house-os |

### 本番サイト

- https://link-house-os.vercel.app

---

## 10. 次のステップ

1. **本番環境動作確認** - デプロイ完了後、ダッシュボードでデータベースからの実データ表示を確認
2. **デモデータからの切り替え** - 確認後、デモデータのフォールバックを削除
3. **Phase C以降** - 詳細機能の実装

---

*このドキュメントは作業の進捗に応じて更新してください*
