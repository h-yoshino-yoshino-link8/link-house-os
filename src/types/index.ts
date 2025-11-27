// ============================================
// LinK HOUSE OS - Type Definitions
// ============================================

// 会社
export interface Company {
  id: string;
  name: string;
  licenseNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  sealUrl?: string;
  stripeCustomerId?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  level: number;
  xp: number;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ユーザー
export interface User {
  id: string;
  companyId: string;
  clerkId: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff";
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 顧客
export interface Customer {
  id: string;
  companyId: string;
  type: "individual" | "corporate";
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tags: string[];
  customFields?: Record<string, unknown>;
  rank: "member" | "silver" | "gold" | "platinum" | "diamond";
  totalTransaction: number;
  points: number;
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 物件（HOUSE DNA）
export interface House {
  id: string;
  customerId: string;
  companyId: string;
  address: string;
  addressNormalized?: string;
  geoLat?: number;
  geoLng?: number;
  structureType?: "wood" | "rc" | "steel" | "src";
  floors?: number;
  totalArea?: number;
  landArea?: number;
  builtYear?: number;
  builder?: string;
  healthScore: number;
  nftPassportTokenId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 部材
export interface HouseComponent {
  id: string;
  houseId: string;
  category: "roof" | "exterior" | "interior" | "equipment" | "electrical" | "plumbing";
  subcategory?: string;
  productName?: string;
  manufacturer?: string;
  modelNumber?: string;
  installedDate?: Date;
  warrantyYears?: number;
  warrantyExpires?: Date;
  expectedLifespan?: number;
  replacementCost?: number;
  conditionScore: number;
  lastInspection?: Date;
  photos: string[];
  documents: string[];
  nftTokenId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// メンテナンス推奨
export interface MaintenanceRecommendation {
  id: string;
  houseId: string;
  componentId?: string;
  riskLevel: "high" | "medium" | "low";
  description: string;
  recommendedAction?: string;
  dueDate?: Date;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

// 工事カテゴリ
export interface WorkCategory {
  id: string;
  companyId: string;
  parentId?: string;
  name: string;
  code?: string;
  sortOrder: number;
  isActive: boolean;
  children?: WorkCategory[];
  createdAt: Date;
  updatedAt: Date;
}

// 材料マスタ
export interface Material {
  id: string;
  companyId: string;
  categoryId?: string;
  name: string;
  productCode?: string;
  manufacturer?: string;
  specification?: string;
  costPrice: number;
  unit: string;
  lossRate: number;
  supplierId?: string;
  supplierName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 労務マスタ
export interface LaborType {
  id: string;
  companyId: string;
  categoryId?: string;
  name: string;
  dailyRate: number;
  hourlyRate?: number;
  productivity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 見積書
export interface Estimate {
  id: string;
  companyId: string;
  customerId: string;
  houseId?: string;
  estimateNumber: string;
  title: string;
  estimateDate: Date;
  validUntil?: Date;
  status: "draft" | "submitted" | "ordered" | "lost" | "pending";
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  costTotal: number;
  profit: number;
  profitRate: number;
  notes?: string;
  internalMemo?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  details?: EstimateDetail[];
  customer?: Customer;
  house?: House;
}

// 見積明細
export interface EstimateDetail {
  id: string;
  estimateId: string;
  parentId?: string;
  sortOrder: number;
  name: string;
  specification?: string;
  quantity: number;
  unit?: string;
  costMaterial: number;
  costLabor: number;
  costUnit: number;
  costTotal: number;
  profitRate: number;
  priceUnit: number;
  priceTotal: number;
  internalMemo?: string;
  children?: EstimateDetail[];
  createdAt: Date;
  updatedAt: Date;
}

// プロジェクト（工事）
export interface Project {
  id: string;
  companyId: string;
  customerId: string;
  houseId?: string;
  estimateId?: string;
  projectNumber: string;
  title: string;
  status: "planning" | "contracted" | "in_progress" | "completed" | "invoiced" | "paid";
  contractAmount?: number;
  costBudget?: number;
  costActual?: number;
  startDate?: Date;
  endDate?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  nftTokenId?: string;
  blockchainTx?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 工程
export interface Schedule {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  assignee?: string;
  color?: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  dependsOnId?: string;
  notes?: string;
  children?: Schedule[];
  createdAt: Date;
  updatedAt: Date;
}

// 写真
export interface Photo {
  id: string;
  projectId: string;
  url: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  folder?: string;
  tags: string[];
  caption?: string;
  takenAt?: Date;
  geoLat?: number;
  geoLng?: number;
  annotations?: PhotoAnnotation[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// 写真注釈
export interface PhotoAnnotation {
  type: "arrow" | "circle" | "rectangle" | "text" | "freehand";
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  text?: string;
  rotation?: number;
}

// 施工証明NFT
export interface WorkCertificate {
  id: string;
  projectId: string;
  houseId: string;
  nftTokenId?: string;
  blockchainTx?: string;
  workType: string;
  workDate: Date;
  contractorName: string;
  contractorLicense?: string;
  craftsmen?: CraftsmanInfo[];
  materials?: MaterialInfo[];
  warrantyYears?: number;
  warrantyExpires?: Date;
  warrantyCoverage?: string;
  photosIpfs?: string;
  documentsIpfs?: string;
  metadataIpfs?: string;
  issuedAt: Date;
}

export interface CraftsmanInfo {
  name: string;
  certification?: string;
  guildRank?: string;
}

export interface MaterialInfo {
  name: string;
  manufacturer?: string;
  lotNumber?: string;
}

// 積立契約
export interface SavingsContract {
  id: string;
  customerId: string;
  houseId: string;
  plan: "light" | "standard" | "premium";
  monthlyAmount: number;
  savingsAmount: number;
  serviceAmount: number;
  balance: number;
  bonusBalance: number;
  startDate: Date;
  status: "active" | "paused" | "cancelled";
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ポイント取引
export interface PointTransaction {
  id: string;
  customerId: string;
  type: "contract" | "referral" | "review" | "survey" | "birthday";
  points: number;
  balanceAfter: number;
  description?: string;
  relatedId?: string;
  createdAt: Date;
}

// バッジ
export interface Badge {
  id: string;
  code: string;
  name: string;
  description?: string;
  iconUrl?: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
}

// ダッシュボードデータ
export interface DashboardData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  profit: {
    current: number;
    previous: number;
    change: number;
  };
  profitRate: {
    current: number;
    previous: number;
    change: number;
  };
  projectCount: {
    current: number;
    previous: number;
    change: number;
  };
  conversionRate: {
    current: number;
    previous: number;
    change: number;
  };
  revenueChart: { date: string; revenue: number; profit: number }[];
  topCustomers: { id: string; name: string; revenue: number }[];
  topPartners: { id: string; name: string; amount: number }[];
  alerts: Alert[];
  quests: Quest[];
}

export interface Alert {
  id: string;
  type: "warning" | "info" | "error";
  title: string;
  description: string;
  link?: string;
}

export interface Quest {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
