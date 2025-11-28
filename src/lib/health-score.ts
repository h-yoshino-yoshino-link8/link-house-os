// HOUSE DNA - 健康スコア計算アルゴリズム

export interface ComponentScore {
  category: string;
  score: number;
  weight: number;
}

export interface HealthScoreInput {
  components: {
    category: string;
    conditionScore: number;
    installedDate?: Date | string | null;
    expectedLifespan?: number | null;
    warrantyExpires?: Date | string | null;
    lastInspection?: Date | string | null;
  }[];
  builtYear?: number | null;
  structureType?: string | null;
}

// カテゴリ別の重み付け（構造的に重要な部分ほど高い）
const CATEGORY_WEIGHTS: Record<string, number> = {
  roof: 1.5,       // 屋根 - 雨漏り防止で最重要
  exterior: 1.3,   // 外壁 - 構造保護
  plumbing: 1.2,   // 給排水 - 生活インフラ
  electrical: 1.1, // 電気 - 安全性
  equipment: 1.0,  // 設備 - 快適性
  interior: 0.8,   // 内装 - 美観
};

// 築年数による基礎減点
function getAgeDeduction(builtYear: number | null | undefined): number {
  if (!builtYear) return 0;
  const age = new Date().getFullYear() - builtYear;

  if (age <= 5) return 0;
  if (age <= 10) return 2;
  if (age <= 15) return 5;
  if (age <= 20) return 8;
  if (age <= 30) return 12;
  if (age <= 40) return 18;
  return 25;
}

// 構造タイプによる補正
function getStructureBonus(structureType: string | null | undefined): number {
  switch (structureType) {
    case "rc":  // 鉄筋コンクリート
    case "src": // 鉄骨鉄筋コンクリート
      return 5;
    case "steel": // 鉄骨
      return 3;
    case "wood": // 木造
    default:
      return 0;
  }
}

// 部材の経年劣化による減点
function getComponentAgeDeduction(
  installedDate: Date | string | null | undefined,
  expectedLifespan: number | null | undefined
): number {
  if (!installedDate || !expectedLifespan) return 0;

  const installed = new Date(installedDate);
  const now = new Date();
  const yearsSinceInstall = (now.getTime() - installed.getTime()) / (1000 * 60 * 60 * 24 * 365);

  const lifespanRatio = yearsSinceInstall / expectedLifespan;

  if (lifespanRatio < 0.5) return 0;
  if (lifespanRatio < 0.7) return 5;
  if (lifespanRatio < 0.9) return 15;
  if (lifespanRatio < 1.0) return 25;
  return 40; // 寿命超過
}

// 点検期限超過による減点
function getInspectionDeduction(lastInspection: Date | string | null | undefined): number {
  if (!lastInspection) return 10; // 点検記録なしは減点

  const last = new Date(lastInspection);
  const now = new Date();
  const monthsSinceInspection = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsSinceInspection <= 12) return 0;
  if (monthsSinceInspection <= 24) return 3;
  if (monthsSinceInspection <= 36) return 7;
  return 15;
}

// 保証期限による補正
function getWarrantyBonus(warrantyExpires: Date | string | null | undefined): number {
  if (!warrantyExpires) return 0;

  const expires = new Date(warrantyExpires);
  const now = new Date();

  if (expires > now) {
    const monthsRemaining = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsRemaining > 24) return 5;
    if (monthsRemaining > 12) return 3;
    return 1;
  }
  return 0;
}

// 個別部材のスコア計算
function calculateComponentScore(component: HealthScoreInput["components"][0]): number {
  let score = component.conditionScore;

  // 経年劣化による減点
  score -= getComponentAgeDeduction(component.installedDate, component.expectedLifespan);

  // 点検期限超過による減点
  score -= getInspectionDeduction(component.lastInspection);

  // 保証期限による加点
  score += getWarrantyBonus(component.warrantyExpires);

  // スコアは0-100の範囲に収める
  return Math.max(0, Math.min(100, score));
}

// メイン健康スコア計算
export function calculateHealthScore(input: HealthScoreInput): {
  overallScore: number;
  categoryScores: Record<string, number>;
  ageDeduction: number;
  structureBonus: number;
  recommendations: string[];
} {
  const { components, builtYear, structureType } = input;

  // カテゴリ別スコア集計
  const categoryScores: Record<string, { totalScore: number; count: number }> = {};

  for (const component of components) {
    const score = calculateComponentScore(component);
    const category = component.category;

    if (!categoryScores[category]) {
      categoryScores[category] = { totalScore: 0, count: 0 };
    }
    categoryScores[category].totalScore += score;
    categoryScores[category].count += 1;
  }

  // カテゴリ別平均スコア
  const categoryAverages: Record<string, number> = {};
  for (const [category, data] of Object.entries(categoryScores)) {
    categoryAverages[category] = data.count > 0 ? data.totalScore / data.count : 100;
  }

  // 重み付き平均計算
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, avgScore] of Object.entries(categoryAverages)) {
    const weight = CATEGORY_WEIGHTS[category] || 1.0;
    weightedSum += avgScore * weight;
    totalWeight += weight;
  }

  // デフォルトカテゴリがない場合のフォールバック
  if (totalWeight === 0) {
    totalWeight = 1;
    weightedSum = 100;
  }

  let overallScore = weightedSum / totalWeight;

  // 築年数による減点
  const ageDeduction = getAgeDeduction(builtYear);
  overallScore -= ageDeduction;

  // 構造タイプによる加点
  const structureBonus = getStructureBonus(structureType);
  overallScore += structureBonus;

  // スコアを0-100に収める
  overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

  // 推奨事項を生成
  const recommendations: string[] = [];

  if (overallScore < 50) {
    recommendations.push("総合的な点検・リフォームをおすすめします");
  }

  for (const [category, score] of Object.entries(categoryAverages)) {
    if (score < 50) {
      const categoryName = getCategoryName(category);
      recommendations.push(`${categoryName}の状態が低下しています。早急な対応を検討してください`);
    } else if (score < 70) {
      const categoryName = getCategoryName(category);
      recommendations.push(`${categoryName}のメンテナンスを計画的に行ってください`);
    }
  }

  if (ageDeduction > 10) {
    recommendations.push("築年数が経過しています。定期的な点検をおすすめします");
  }

  return {
    overallScore,
    categoryScores: categoryAverages,
    ageDeduction,
    structureBonus,
    recommendations,
  };
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    roof: "屋根",
    exterior: "外壁",
    interior: "内装",
    equipment: "設備機器",
    electrical: "電気設備",
    plumbing: "給排水設備",
  };
  return names[category] || category;
}

// 次回メンテナンス推奨日を計算
export function calculateNextMaintenanceDate(
  category: string,
  lastMaintenance: Date | null
): Date {
  const maintenanceCycles: Record<string, number> = {
    roof: 10,       // 10年
    exterior: 10,   // 10年
    interior: 10,   // 10年
    equipment: 8,   // 8年（給湯器など）
    electrical: 15, // 15年
    plumbing: 15,   // 15年
  };

  const cycleYears = maintenanceCycles[category] || 10;
  const baseDate = lastMaintenance || new Date();

  const nextDate = new Date(baseDate);
  nextDate.setFullYear(nextDate.getFullYear() + cycleYears);

  return nextDate;
}

// リスクレベルを判定
export function determineRiskLevel(
  conditionScore: number,
  installedDate: Date | string | null | undefined,
  expectedLifespan: number | null | undefined
): "high" | "medium" | "low" {
  // 状態スコアによる判定
  if (conditionScore < 30) return "high";
  if (conditionScore < 50) return "medium";

  // 寿命に基づく判定
  if (installedDate && expectedLifespan) {
    const installed = new Date(installedDate);
    const now = new Date();
    const yearsSinceInstall = (now.getTime() - installed.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const lifespanRatio = yearsSinceInstall / expectedLifespan;

    if (lifespanRatio >= 1.0) return "high";
    if (lifespanRatio >= 0.8) return "medium";
  }

  if (conditionScore < 70) return "medium";
  return "low";
}
