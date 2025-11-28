// ゲーミフィケーションシステム - XP・レベル・バッジ管理

// レベル計算
export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number } {
  // レベルアップに必要なXP: 100 * level^1.5
  let level = 1;
  let totalXpRequired = 0;

  while (true) {
    const xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
    if (totalXpRequired + xpForNextLevel > xp) {
      return {
        level,
        currentXp: xp - totalXpRequired,
        nextLevelXp: xpForNextLevel,
      };
    }
    totalXpRequired += xpForNextLevel;
    level++;
  }
}

// XP獲得アクション定義
export const XP_ACTIONS: Record<string, { xp: number; description: string }> = {
  // 日常操作
  daily_login: { xp: 5, description: "毎日ログインボーナス" },

  // 見積関連
  estimate_created: { xp: 10, description: "見積書を作成しました" },
  estimate_submitted: { xp: 15, description: "見積書を提出しました" },
  estimate_ordered: { xp: 50, description: "見積が受注されました" },

  // 案件関連
  project_started: { xp: 30, description: "工事を開始しました" },
  project_completed: { xp: 100, description: "工事が完了しました" },
  project_paid: { xp: 50, description: "入金が完了しました" },

  // 顧客関連
  customer_added: { xp: 10, description: "新規顧客を登録しました" },
  customer_referral: { xp: 100, description: "紹介顧客が成約しました" },

  // HOUSE DNA関連
  house_added: { xp: 20, description: "物件を登録しました" },
  component_added: { xp: 5, description: "部材を登録しました" },
  inspection_completed: { xp: 30, description: "点検を完了しました" },
  maintenance_resolved: { xp: 20, description: "メンテナンス対応を完了しました" },
  nft_issued: { xp: 50, description: "施工証明NFTを発行しました" },

  // 積立関連
  savings_started: { xp: 100, description: "積立契約を開始しました" },
  savings_payment: { xp: 10, description: "積立入金がありました" },

  // 特別イベント
  first_estimate: { xp: 50, description: "初めての見積作成" },
  first_project: { xp: 100, description: "初めての工事完了" },
  monthly_active: { xp: 50, description: "月間アクティブボーナス" },
};

// バッジ定義
export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  iconUrl?: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // 見積関連
  {
    code: "estimate_beginner",
    name: "見積ビギナー",
    description: "初めての見積書を作成",
    conditionType: "estimate_count",
    conditionValue: 1,
    xpReward: 50,
  },
  {
    code: "estimate_pro",
    name: "見積プロ",
    description: "10件の見積書を作成",
    conditionType: "estimate_count",
    conditionValue: 10,
    xpReward: 100,
  },
  {
    code: "estimate_master",
    name: "見積マスター",
    description: "50件の見積書を作成",
    conditionType: "estimate_count",
    conditionValue: 50,
    xpReward: 300,
  },

  // 受注関連
  {
    code: "first_order",
    name: "初受注",
    description: "初めての受注を獲得",
    conditionType: "order_count",
    conditionValue: 1,
    xpReward: 100,
  },
  {
    code: "order_star",
    name: "受注スター",
    description: "10件の受注を獲得",
    conditionType: "order_count",
    conditionValue: 10,
    xpReward: 200,
  },

  // 工事完了関連
  {
    code: "project_starter",
    name: "工事デビュー",
    description: "初めての工事を完了",
    conditionType: "completed_project_count",
    conditionValue: 1,
    xpReward: 100,
  },
  {
    code: "project_veteran",
    name: "ベテラン施工者",
    description: "20件の工事を完了",
    conditionType: "completed_project_count",
    conditionValue: 20,
    xpReward: 500,
  },

  // HOUSE DNA関連
  {
    code: "house_registrar",
    name: "物件登録者",
    description: "10件の物件を登録",
    conditionType: "house_count",
    conditionValue: 10,
    xpReward: 150,
  },
  {
    code: "house_manager",
    name: "物件管理マスター",
    description: "50件の物件を管理",
    conditionType: "house_count",
    conditionValue: 50,
    xpReward: 400,
  },

  // NFT関連
  {
    code: "nft_pioneer",
    name: "NFTパイオニア",
    description: "初めての施工証明NFTを発行",
    conditionType: "nft_count",
    conditionValue: 1,
    xpReward: 100,
  },
  {
    code: "nft_collector",
    name: "NFTコレクター",
    description: "10件のNFTを発行",
    conditionType: "nft_count",
    conditionValue: 10,
    xpReward: 300,
  },

  // レベル関連
  {
    code: "level_10",
    name: "レベル10達成",
    description: "レベル10に到達",
    conditionType: "level",
    conditionValue: 10,
    xpReward: 200,
  },
  {
    code: "level_25",
    name: "レベル25達成",
    description: "レベル25に到達",
    conditionType: "level",
    conditionValue: 25,
    xpReward: 500,
  },
  {
    code: "level_50",
    name: "レベル50達成",
    description: "レベル50に到達",
    conditionType: "level",
    conditionValue: 50,
    xpReward: 1000,
  },

  // 積立関連
  {
    code: "savings_supporter",
    name: "積立サポーター",
    description: "初めての積立契約を獲得",
    conditionType: "savings_count",
    conditionValue: 1,
    xpReward: 150,
  },

  // 紹介関連
  {
    code: "referrer",
    name: "紹介者",
    description: "初めての紹介成約",
    conditionType: "referral_count",
    conditionValue: 1,
    xpReward: 150,
  },
  {
    code: "super_referrer",
    name: "スーパー紹介者",
    description: "5件の紹介成約",
    conditionType: "referral_count",
    conditionValue: 5,
    xpReward: 500,
  },
];

// レベルランク名
export function getLevelRank(level: number): string {
  if (level >= 50) return "レジェンド";
  if (level >= 40) return "マスター";
  if (level >= 30) return "エキスパート";
  if (level >= 20) return "プロフェッショナル";
  if (level >= 10) return "アドバンスド";
  if (level >= 5) return "インターミディエイト";
  return "ビギナー";
}

// レベルランクの色
export function getLevelRankColor(level: number): string {
  if (level >= 50) return "text-purple-600 bg-purple-100";
  if (level >= 40) return "text-amber-600 bg-amber-100";
  if (level >= 30) return "text-red-600 bg-red-100";
  if (level >= 20) return "text-blue-600 bg-blue-100";
  if (level >= 10) return "text-green-600 bg-green-100";
  if (level >= 5) return "text-teal-600 bg-teal-100";
  return "text-gray-600 bg-gray-100";
}
