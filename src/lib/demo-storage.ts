/**
 * デモモード用のlocalStorageベースのデータストレージ
 * DATABASE_URLが設定されていない場合に使用
 */

const STORAGE_KEY = "link-house-os-demo-data";

export interface DemoData {
  estimates: DemoEstimate[];
  customers: DemoCustomer[];
  projects: DemoProject[];
  houses: DemoHouse[];
}

export interface DemoEstimate {
  id: string;
  estimateNumber: string;
  companyId: string;
  customerId: string;
  houseId?: string | null;
  title: string;
  status: string;
  estimateDate: string;
  validUntil?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  costTotal: number;
  profit: number;
  profitRate: number;
  notes?: string | null;
  internalMemo?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email?: string; phone?: string; address?: string } | null;
  house?: { id: string; address: string } | null;
  details?: DemoEstimateDetail[];
}

export interface DemoEstimateDetail {
  id: string;
  estimateId: string;
  sortOrder: number;
  name: string;
  specification?: string | null;
  quantity: number;
  unit?: string | null;
  costMaterial: number;
  costLabor: number;
  costUnit: number;
  costTotal: number;
  profitRate: number;
  priceUnit: number;
  priceTotal: number;
  internalMemo?: string | null;
}

export interface DemoCustomer {
  id: string;
  companyId: string;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  rank: string;
  lifetimeValue: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoProject {
  id: string;
  projectNumber: string;
  companyId: string;
  customerId: string;
  estimateId?: string | null;
  title: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  contractAmount?: number | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string } | null;
  estimate?: { id: string; estimateNumber: string; total: number } | null;
}

export interface DemoHouse {
  id: string;
  companyId: string;
  customerId: string;
  address: string;
  structureType?: string | null;
  builtYear?: number | null;
  floorArea?: number | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string } | null;
}

// SSR対策：windowがない場合は空のストレージを返す
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return localStorage;
}

// 初期データを取得
function getInitialData(): DemoData {
  return {
    estimates: [],
    customers: [],
    projects: [],
    houses: [],
  };
}

// ストレージからデータを読み込み
export function loadDemoData(): DemoData {
  const storage = getStorage();
  if (!storage) return getInitialData();

  try {
    const data = storage.getItem(STORAGE_KEY);
    if (!data) return getInitialData();
    return JSON.parse(data) as DemoData;
  } catch {
    return getInitialData();
  }
}

// ストレージにデータを保存
export function saveDemoData(data: DemoData): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save demo data:", error);
  }
}

// ID生成
export function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 見積番号生成
export function generateEstimateNumber(): string {
  const year = new Date().getFullYear();
  const data = loadDemoData();
  const count = data.estimates.filter(e => e.estimateNumber.startsWith(`EST-${year}`)).length;
  return `EST-${year}-${String(count + 1).padStart(3, "0")}`;
}

// 案件番号生成
export function generateProjectNumber(): string {
  const year = new Date().getFullYear();
  const data = loadDemoData();
  const count = data.projects.filter(p => p.projectNumber.startsWith(`PRJ-${year}`)).length;
  return `PRJ-${year}-${String(count + 1).padStart(3, "0")}`;
}

// === 見積CRUD ===

export function createDemoEstimate(input: {
  companyId: string;
  customerId: string;
  houseId?: string | null;
  title: string;
  status?: string;
  estimateDate?: string;
  validUntil?: string | null;
  taxRate?: number;
  notes?: string | null;
  internalMemo?: string | null;
  details?: Array<{
    sortOrder?: number;
    name: string;
    specification?: string | null;
    quantity?: number;
    unit?: string | null;
    costMaterial?: number;
    costLabor?: number;
    profitRate?: number;
    internalMemo?: string | null;
  }>;
}): DemoEstimate {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();
  const estimateNumber = generateEstimateNumber();
  const taxRate = input.taxRate ?? 10;

  // 明細を計算
  const details: DemoEstimateDetail[] = (input.details || []).map((d, i) => {
    const costMaterial = d.costMaterial || 0;
    const costLabor = d.costLabor || 0;
    const costUnit = costMaterial + costLabor;
    const quantity = d.quantity || 1;
    const costTotal = costUnit * quantity;
    const profitRate = d.profitRate || 25;
    const priceUnit = costUnit / (1 - profitRate / 100);
    const priceTotal = priceUnit * quantity;

    return {
      id: generateId(),
      estimateId: id,
      sortOrder: d.sortOrder ?? i,
      name: d.name,
      specification: d.specification,
      quantity,
      unit: d.unit,
      costMaterial,
      costLabor,
      costUnit,
      costTotal,
      profitRate,
      priceUnit: Math.round(priceUnit),
      priceTotal: Math.round(priceTotal),
      internalMemo: d.internalMemo,
    };
  });

  const subtotal = details.reduce((sum, d) => sum + d.priceTotal, 0);
  const costTotal = details.reduce((sum, d) => sum + d.costTotal, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax;
  const profit = subtotal - costTotal;
  const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  // 顧客情報を取得
  const customer = data.customers.find(c => c.id === input.customerId);
  const house = input.houseId ? data.houses.find(h => h.id === input.houseId) : null;

  const estimate: DemoEstimate = {
    id,
    estimateNumber,
    companyId: input.companyId,
    customerId: input.customerId,
    houseId: input.houseId,
    title: input.title,
    status: input.status || "draft",
    estimateDate: input.estimateDate || now.split("T")[0],
    validUntil: input.validUntil,
    subtotal,
    tax,
    total,
    taxRate,
    costTotal,
    profit,
    profitRate,
    notes: input.notes,
    internalMemo: input.internalMemo,
    createdAt: now,
    updatedAt: now,
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email ?? undefined, phone: customer.phone ?? undefined, address: customer.address ?? undefined } : null,
    house: house ? { id: house.id, address: house.address } : null,
    details,
  };

  data.estimates.unshift(estimate);
  saveDemoData(data);

  return estimate;
}

export function getDemoEstimates(companyId: string): DemoEstimate[] {
  const data = loadDemoData();
  return data.estimates.filter(e => e.companyId === companyId);
}

export function getDemoEstimate(id: string): DemoEstimate | null {
  const data = loadDemoData();
  return data.estimates.find(e => e.id === id) || null;
}

export function updateDemoEstimate(id: string, updates: Partial<DemoEstimate>): DemoEstimate | null {
  const data = loadDemoData();
  const index = data.estimates.findIndex(e => e.id === id);
  if (index === -1) return null;

  data.estimates[index] = {
    ...data.estimates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDemoData(data);

  return data.estimates[index];
}

export function deleteDemoEstimate(id: string): boolean {
  const data = loadDemoData();
  const index = data.estimates.findIndex(e => e.id === id);
  if (index === -1) return false;

  data.estimates.splice(index, 1);
  saveDemoData(data);

  return true;
}

// === 顧客CRUD ===

export function createDemoCustomer(input: {
  companyId: string;
  name: string;
  type?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}): DemoCustomer {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();

  const customer: DemoCustomer = {
    id,
    companyId: input.companyId,
    name: input.name,
    type: input.type || "individual",
    email: input.email,
    phone: input.phone,
    address: input.address,
    rank: "member",
    lifetimeValue: 0,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
  };

  data.customers.unshift(customer);
  saveDemoData(data);

  return customer;
}

export function getDemoCustomers(companyId: string): DemoCustomer[] {
  const data = loadDemoData();
  return data.customers.filter(c => c.companyId === companyId);
}

export function getDemoCustomer(id: string): DemoCustomer | null {
  const data = loadDemoData();
  return data.customers.find(c => c.id === id) || null;
}

// === 案件CRUD ===

export function createDemoProject(input: {
  companyId: string;
  customerId: string;
  estimateId?: string | null;
  title: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  contractAmount?: number | null;
}): DemoProject {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();
  const projectNumber = generateProjectNumber();

  const customer = data.customers.find(c => c.id === input.customerId);
  const estimate = input.estimateId ? data.estimates.find(e => e.id === input.estimateId) : null;

  const project: DemoProject = {
    id,
    projectNumber,
    companyId: input.companyId,
    customerId: input.customerId,
    estimateId: input.estimateId,
    title: input.title,
    status: input.status || "planning",
    startDate: input.startDate,
    endDate: input.endDate,
    contractAmount: input.contractAmount,
    progress: 0,
    createdAt: now,
    updatedAt: now,
    customer: customer ? { id: customer.id, name: customer.name } : null,
    estimate: estimate ? { id: estimate.id, estimateNumber: estimate.estimateNumber, total: estimate.total } : null,
  };

  data.projects.unshift(project);
  saveDemoData(data);

  return project;
}

export function getDemoProjects(companyId: string): DemoProject[] {
  const data = loadDemoData();
  return data.projects.filter(p => p.companyId === companyId);
}

// === 物件CRUD ===

export function createDemoHouse(input: {
  companyId: string;
  customerId: string;
  address: string;
  structureType?: string | null;
  builtYear?: number | null;
  floorArea?: number | null;
}): DemoHouse {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();

  const customer = data.customers.find(c => c.id === input.customerId);

  const house: DemoHouse = {
    id,
    companyId: input.companyId,
    customerId: input.customerId,
    address: input.address,
    structureType: input.structureType,
    builtYear: input.builtYear,
    floorArea: input.floorArea,
    createdAt: now,
    updatedAt: now,
    customer: customer ? { id: customer.id, name: customer.name } : null,
  };

  data.houses.unshift(house);
  saveDemoData(data);

  return house;
}

export function getDemoHouses(companyId: string, customerId?: string): DemoHouse[] {
  const data = loadDemoData();
  let houses = data.houses.filter(h => h.companyId === companyId);
  if (customerId) {
    houses = houses.filter(h => h.customerId === customerId);
  }
  return houses;
}

// デモデータをクリア
export function clearDemoData(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

// デモモードかどうかをチェック（クライアントサイド用）
export function isDemoMode(): boolean {
  // NEXT_PUBLIC_で始まる環境変数はクライアントで参照可能
  const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  return !dbUrl || dbUrl === "" || dbUrl === "undefined";
}
