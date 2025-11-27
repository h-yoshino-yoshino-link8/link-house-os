// API レスポンス型定義

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

// 顧客
export interface Customer {
  id: string;
  companyId: string;
  type: "individual" | "corporate";
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tags: string[];
  rank: "member" | "silver" | "gold" | "platinum" | "diamond";
  totalTransaction: number;
  points: number;
  referralCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    estimates: number;
    projects: number;
    houses: number;
  };
}

export interface CustomerDetail extends Customer {
  houses: HouseSummary[];
  estimates: EstimateSummary[];
  projects: ProjectSummary[];
  savingsContracts: SavingsContractSummary[];
  pointTransactions: PointTransaction[];
  referrals?: CustomerReferral[];
  _count?: {
    estimates: number;
    projects: number;
    houses: number;
    referrals?: number;
  };
}

export interface CustomerReferral {
  id: string;
  name: string;
  status: string;
  projectAmount: number;
  reward: number;
  createdAt: string;
}

// 物件
export interface House {
  id: string;
  customerId: string;
  companyId: string;
  address: string;
  structureType: string | null;
  floors: number | null;
  totalArea: number | null;
  builtYear: number | null;
  builder: string | null;
  healthScore: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
  };
  _count?: {
    components: number;
    maintenanceRecs: number;
    projects: number;
    workCertificates: number;
  };
}

export interface HouseSummary {
  id: string;
  address: string;
  healthScore: number;
  structureType: string | null;
  builtYear: number | null;
}

export interface HouseDetail extends House {
  components: HouseComponent[];
  maintenanceRecs: MaintenanceRecommendation[];
  projects: ProjectSummary[];
  workCertificates: WorkCertificate[];
}

export interface HouseComponent {
  id: string;
  houseId: string;
  category: string;
  subcategory: string | null;
  productName: string | null;
  manufacturer: string | null;
  installedDate: string | null;
  conditionScore: number;
  lastInspection: string | null;
}

export interface MaintenanceRecommendation {
  id: string;
  houseId: string;
  componentId: string | null;
  riskLevel: "high" | "medium" | "low";
  description: string;
  recommendedAction: string | null;
  isResolved: boolean;
}

// 見積
export interface Estimate {
  id: string;
  companyId: string;
  customerId: string;
  houseId: string | null;
  estimateNumber: string;
  title: string;
  estimateDate: string;
  validUntil: string | null;
  status: "draft" | "submitted" | "ordered" | "lost" | "pending";
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  costTotal: number;
  profit: number;
  profitRate: number;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
  _count?: {
    details: number;
  };
}

export interface EstimateSummary {
  id: string;
  estimateNumber: string;
  title: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface EstimateDetail extends Estimate {
  details: EstimateDetailItem[];
  house?: HouseSummary;
  project?: {
    id: string;
    projectNumber: string;
    status: string;
  };
  notes?: string | null;
  internalMemo?: string | null;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    rank?: string;
  };
}

export interface EstimateDetailItem {
  id: string;
  estimateId: string;
  sortOrder: number;
  name: string;
  specification: string | null;
  quantity: number;
  unit: string | null;
  costMaterial: number;
  costLabor: number;
  costUnit: number;
  costTotal: number;
  profitRate: number;
  priceUnit: number;
  priceTotal: number;
}

// 案件
export interface Project {
  id: string;
  companyId: string;
  customerId: string;
  houseId: string | null;
  estimateId: string | null;
  projectNumber: string;
  title: string;
  status: "planning" | "contracted" | "in_progress" | "completed" | "invoiced" | "paid";
  contractAmount: number | null;
  costBudget: number | null;
  costActual: number | null;
  startDate: string | null;
  endDate: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
  };
  house?: {
    id: string;
    address: string;
  };
  _count?: {
    schedules: number;
    photos: number;
  };
}

export interface ProjectSummary {
  id: string;
  projectNumber: string;
  title: string;
  status: string;
  contractAmount: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ProjectDetail extends Project {
  estimate?: EstimateSummary;
  schedules: Schedule[];
  photos: Photo[];
  workCertificates: WorkCertificate[];
}

export interface Schedule {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  assignee: string | null;
  color: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  notes: string | null;
}

export interface Photo {
  id: string;
  projectId: string;
  url: string;
  thumbnailUrl: string | null;
  folder: string | null;
  tags: string[];
  caption: string | null;
  takenAt: string | null;
}

export interface WorkCertificate {
  id: string;
  projectId: string;
  houseId: string;
  nftTokenId: string | null;
  workType: string;
  workDate: string;
  contractorName: string;
}

// 積立
export interface SavingsContractSummary {
  id: string;
  plan: string;
  balance: number;
  monthlyAmount: number;
}

// ポイント
export interface PointTransaction {
  id: string;
  customerId: string;
  type: string;
  points: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

// リクエスト型
export interface CreateCustomerRequest {
  companyId: string;
  type?: "individual" | "corporate";
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tags?: string[];
}

export interface UpdateCustomerRequest {
  type?: "individual" | "corporate";
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  tags?: string[];
  rank?: string;
}

export interface CreateProjectRequest {
  companyId: string;
  customerId: string;
  houseId?: string;
  estimateId?: string;
  title: string;
  contractAmount?: number;
  costBudget?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  status?: string;
  contractAmount?: number;
  costBudget?: number;
  costActual?: number;
  startDate?: string | null;
  endDate?: string | null;
  actualStart?: string | null;
  actualEnd?: string | null;
}

export interface CreateHouseRequest {
  companyId: string;
  customerId: string;
  address: string;
  structureType?: string;
  floors?: number;
  totalArea?: number;
  landArea?: number;
  builtYear?: number;
  builder?: string;
}

export interface UpdateHouseRequest {
  address?: string;
  structureType?: string;
  floors?: number;
  totalArea?: number;
  landArea?: number;
  builtYear?: number;
  builder?: string;
  healthScore?: number;
}

export interface CreateEstimateRequest {
  companyId: string;
  customerId: string;
  houseId?: string;
  title: string;
  estimateDate?: string;
  validUntil?: string;
  status?: "draft" | "submitted" | "ordered" | "lost" | "pending";
  taxRate?: number;
  notes?: string;
  internalMemo?: string;
  createdById?: string;
  details?: CreateEstimateDetailRequest[];
}

export interface CreateEstimateDetailRequest {
  sortOrder?: number;
  name: string;
  specification?: string;
  quantity?: number;
  unit?: string;
  costMaterial?: number;
  costLabor?: number;
  costUnit?: number;
  costTotal?: number;
  profitRate?: number;
  priceUnit?: number;
  priceTotal?: number;
  internalMemo?: string;
}
