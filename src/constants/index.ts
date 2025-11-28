// ============================================
// LinK HOUSE OS - Constants
// ============================================

export const APP_NAME = "LinK HOUSE OS";
export const APP_DESCRIPTION = "建設業向け統合業務管理システム";

// ステータス
export const ESTIMATE_STATUS = {
  draft: { label: "作成中", color: "gray" },
  submitted: { label: "提出済", color: "blue" },
  ordered: { label: "受注", color: "green" },
  lost: { label: "失注", color: "red" },
  pending: { label: "保留", color: "yellow" },
} as const;

export const PROJECT_STATUS = {
  planning: { label: "計画中", color: "gray" },
  contracted: { label: "契約済", color: "blue" },
  in_progress: { label: "施工中", color: "yellow" },
  completed: { label: "完了", color: "green" },
  invoiced: { label: "請求済", color: "purple" },
  paid: { label: "入金済", color: "emerald" },
} as const;

export const CUSTOMER_RANK = {
  member: { label: "メンバー", color: "gray", icon: "User" },
  silver: { label: "シルバー", color: "slate", icon: "Award" },
  gold: { label: "ゴールド", color: "yellow", icon: "Award" },
  platinum: { label: "プラチナ", color: "cyan", icon: "Crown" },
  diamond: { label: "ダイヤモンド", color: "purple", icon: "Gem" },
} as const;

// 構造タイプ
export const STRUCTURE_TYPES = {
  wood: "木造",
  rc: "RC造",
  steel: "S造",
  src: "SRC造",
} as const;

// 部材カテゴリ
export const COMPONENT_CATEGORIES = {
  roof: { label: "屋根", icon: "Home" },
  exterior: { label: "外壁", icon: "Building" },
  interior: { label: "内装", icon: "Sofa" },
  equipment: { label: "設備", icon: "Wrench" },
  electrical: { label: "電気", icon: "Zap" },
  plumbing: { label: "給排水", icon: "Droplets" },
} as const;

// 単位
export const UNITS = [
  { value: "m", label: "m（メートル）" },
  { value: "m2", label: "㎡（平米）" },
  { value: "m3", label: "㎥（立米）" },
  { value: "piece", label: "個" },
  { value: "set", label: "式" },
  { value: "unit", label: "台" },
  { value: "sheet", label: "枚" },
  { value: "roll", label: "本" },
  { value: "bag", label: "袋" },
  { value: "can", label: "缶" },
  { value: "box", label: "箱" },
  { value: "day", label: "人工" },
] as const;

// リスクレベル
export const RISK_LEVELS = {
  high: { label: "高", color: "red" },
  medium: { label: "中", color: "yellow" },
  low: { label: "低", color: "green" },
} as const;

// 健康スコア
export const HEALTH_SCORE_RANGES = {
  excellent: { min: 90, max: 100, label: "Excellent", color: "green" },
  good: { min: 70, max: 89, label: "Good", color: "lime" },
  fair: { min: 50, max: 69, label: "Fair", color: "yellow" },
  poor: { min: 30, max: 49, label: "Poor", color: "orange" },
  critical: { min: 0, max: 29, label: "Critical", color: "red" },
} as const;

// ゲーミフィケーション - レベル称号
export const LEVEL_TITLES = [
  { minLevel: 1, title: "見習い" },
  { minLevel: 11, title: "職人" },
  { minLevel: 26, title: "熟練職人" },
  { minLevel: 51, title: "匠" },
  { minLevel: 76, title: "棟梁" },
  { minLevel: 100, title: "伝説の棟梁" },
] as const;

// XP獲得アクション
export const XP_ACTIONS = {
  login: { xp: 10, label: "ログイン" },
  estimate_created: { xp: 50, label: "見積作成" },
  estimate_submitted: { xp: 30, label: "見積提出" },
  project_ordered: { xp: 200, label: "受注" },
  project_completed: { xp: 300, label: "完工" },
  customer_rating_high: { xp: 100, label: "高評価獲得" },
  referral_success: { xp: 500, label: "紹介成約" },
  consecutive_login_7: { xp: 200, label: "7日連続ログイン" },
} as const;

// ナビゲーション
export const NAVIGATION = [
  {
    title: "ダッシュボード",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "見積管理",
    href: "/estimates",
    icon: "FileText",
  },
  {
    title: "案件管理",
    href: "/projects",
    icon: "FolderKanban",
  },
  {
    title: "顧客管理",
    href: "/customers",
    icon: "Users",
  },
  {
    title: "HOUSE DNA",
    href: "/houses",
    icon: "Home",
  },
  {
    title: "工程表",
    href: "/schedules",
    icon: "Calendar",
  },
  {
    title: "書類作成",
    href: "/documents",
    icon: "FileCheck",
  },
  {
    title: "写真管理",
    href: "/photos",
    icon: "Camera",
  },
  {
    title: "レポート",
    href: "/reports",
    icon: "BarChart3",
  },
  {
    title: "積立管理",
    href: "/savings",
    icon: "PiggyBank",
  },
] as const;

export const SETTINGS_NAVIGATION = [
  {
    title: "会社情報",
    href: "/settings/company",
    icon: "Building",
  },
  {
    title: "料金・プラン",
    href: "/settings/billing",
    icon: "CreditCard",
  },
  {
    title: "マスタ管理",
    href: "/settings/masters",
    icon: "Database",
  },
  {
    title: "ユーザー管理",
    href: "/settings/users",
    icon: "Users",
  },
] as const;

// 積立プラン
export const SAVINGS_PLANS = {
  light: {
    name: "ライト",
    monthlyAmount: 5000,
    savingsAmount: 4000,
    serviceAmount: 1000,
    features: [
      "年1回 簡易点検（30分）",
      "工事代金 3% OFF",
      "緊急時優先対応",
    ],
  },
  standard: {
    name: "スタンダード",
    monthlyAmount: 10000,
    savingsAmount: 8000,
    serviceAmount: 2000,
    features: [
      "年1回 詳細点検（60分・報告書付き）",
      "小修繕 年3万円まで無料",
      "工事代金 5% OFF",
      "24時間緊急ダイヤル",
      "HOUSE DNA 健康レポート（四半期）",
    ],
  },
  premium: {
    name: "プレミアム",
    monthlyAmount: 20000,
    savingsAmount: 15000,
    serviceAmount: 5000,
    features: [
      "年2回 詳細点検",
      "小修繕 年10万円まで無料",
      "工事代金 10% OFF",
      "専任担当者",
      "設備故障時の仮設手配",
      "家族向け住まい相談（無制限）",
      "施工証明NFT プレミアムバッジ",
    ],
  },
} as const;

// 紹介報酬
export const REFERRAL_REWARDS = {
  customer_to_customer_contract: 0.03, // 3%
  customer_to_customer_savings: 0.10, // 10%
  company_to_company_pro: 200000, // 20万円
  company_to_company_subscription_first: 0.15, // 15%
  company_to_company_subscription_ongoing: 0.05, // 5%
} as const;

// ポイント獲得ルール（顧客向け）
export const POINT_RULES = {
  contract: 0.01, // 契約金額の1%
  referral: 0.02, // 紹介成約の2%
  review: 500,
  survey: 100,
  birthday: 500,
  anniversary: 300,
} as const;
