# LinK HOUSE OS

**建設業向け統合業務管理システム - 家の生涯パートナープラットフォーム**

## 概要

LinK HOUSE OS は、建設・リフォーム業界向けの統合業務管理システムです。見積・原価管理から工事台帳、顧客管理まで、業務を一元管理し、建設業界の透明化とDX推進を実現します。

## 主な機能

### 見積・原価管理
- 原価入力 → 粗利率設定 → 客出し単価の自動逆算
- 粗利シミュレーター（スライダーでリアルタイム計算）
- マスタ管理（材料・労務・工事カテゴリ）
- PDF出力（通常版・オープンプライス版）

### 工程表
- ガントチャート表示
- ドラッグ&ドロップ操作
- 進捗管理・遅延アラート

### 契約書作成
- 2025年民法改正対応テンプレート
- 見積からの自動連携
- 電子契約対応

### 工事台帳・写真管理
- 写真アップロード・整理
- 注釈機能（矢印・円・テキスト）
- 工事台帳PDF自動生成

### HOUSE DNA（家のデジタルツイン）
- 家の健康スコア算出
- 部材・施工履歴管理
- メンテナンス推奨
- 施工証明NFT（ブロックチェーン）

### ダッシュボード・分析
- 売上・粗利推移グラフ
- 顧客・協力会社ランキング
- KPIモニタリング

### ゲーミフィケーション
- XP・レベルシステム
- バッジ・実績
- 紹介報酬プログラム

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **状態管理**: Zustand, TanStack Query
- **データベース**: PostgreSQL, Prisma ORM
- **グラフ**: Recharts
- **認証**: Clerk (予定)
- **決済**: Stripe (予定)
- **ブロックチェーン**: Polygon (予定)

## セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/h-yoshino-yoshino-link8/link-house-os.git
cd link-house-os

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集

# Prisma クライアント生成
npx prisma generate

# 開発サーバー起動
npm run dev
```

## 環境変数

`.env.local` に以下の環境変数を設定してください：

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 開発フェーズ

- [x] Phase 0: 基盤構築
- [x] Phase 1: 見積・原価管理 MVP
- [x] Phase 2: 工程・契約・書類
- [x] Phase 3: 写真・工事台帳
- [x] Phase 4: ダッシュボード・分析
- [ ] Phase 5: 課金・サブスク基盤
- [ ] Phase 6: HOUSE DNA 完全版
- [ ] Phase 7: 施主ポータル
- [ ] Phase 8: ゲーミフィケーション
- [ ] Phase 9: 外部連携

## ライセンス

Copyright © 2024 株式会社LinK. All rights reserved.

---

**株式会社LinK** - 建設業界の透明化とDX推進を目指して
