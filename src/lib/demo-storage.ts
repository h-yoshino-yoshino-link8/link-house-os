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
  invoices: DemoInvoice[];
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
  parentId?: string | null;
  sortOrder: number;
  level: number;
  isCategory: boolean;
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
  children?: DemoEstimateDetail[];
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

export interface DemoInvoice {
  id: string;
  companyId: string;
  projectId: string;
  customerId: string;
  invoiceNumber: string;
  title: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  notes?: string | null;
  internalMemo?: string | null;
  sentAt?: string | null;
  sentTo?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; projectNumber: string; title: string; customer?: { id: string; name: string; address?: string | null } } | null;
  details?: DemoInvoiceDetail[];
  payments?: DemoPayment[];
}

export interface DemoInvoiceDetail {
  id: string;
  invoiceId: string;
  sortOrder: number;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  amount: number;
}

export interface DemoPayment {
  id: string;
  invoiceId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdAt: string;
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
    invoices: [],
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
    parentId?: string | null;
    level?: number;
    isCategory?: boolean;
    name: string;
    specification?: string | null;
    quantity?: number;
    unit?: string | null;
    costMaterial?: number;
    costLabor?: number;
    costUnit?: number;
    costTotal?: number;
    profitRate?: number;
    priceUnit?: number;
    priceTotal?: number;
    internalMemo?: string | null;
  }>;
}): DemoEstimate {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();
  const estimateNumber = generateEstimateNumber();
  const taxRate = input.taxRate ?? 10;

  // 明細を計算（階層構造対応）
  const details: DemoEstimateDetail[] = (input.details || []).map((d, i) => {
    const level = d.level ?? 0;
    const isCategory = d.isCategory ?? false;
    const costMaterial = d.costMaterial || 0;
    const costLabor = d.costLabor || 0;
    const costUnit = d.costUnit ?? (costMaterial + costLabor);
    const quantity = d.quantity || 1;
    const costTotal = d.costTotal ?? (costUnit * quantity);
    const profitRate = d.profitRate || 25;
    const priceUnit = d.priceUnit ?? (isCategory ? 0 : costUnit / (1 - profitRate / 100));
    const priceTotal = d.priceTotal ?? (isCategory ? 0 : priceUnit * quantity);

    return {
      id: generateId(),
      estimateId: id,
      parentId: d.parentId || null,
      sortOrder: d.sortOrder ?? i,
      level,
      isCategory,
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

  // カテゴリ以外の明細のみで合計を計算（二重計上防止）
  const nonCategoryDetails = details.filter(d => !d.isCategory);
  const subtotal = nonCategoryDetails.reduce((sum, d) => sum + d.priceTotal, 0);
  const costTotal = nonCategoryDetails.reduce((sum, d) => sum + d.costTotal, 0);
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

export function getDemoProject(id: string): DemoProject | null {
  const data = loadDemoData();
  return data.projects.find(p => p.id === id) || null;
}

export function updateDemoProject(id: string, updates: Partial<DemoProject>): DemoProject | null {
  const data = loadDemoData();
  const index = data.projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  data.projects[index] = {
    ...data.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDemoData(data);

  return data.projects[index];
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

// === 請求書CRUD ===

// 請求書番号生成
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const data = loadDemoData();
  const count = data.invoices.filter(i => i.invoiceNumber.startsWith(`INV-${year}`)).length;
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export function createDemoInvoice(input: {
  companyId: string;
  projectId: string;
  customerId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  taxRate?: number;
  notes?: string | null;
  internalMemo?: string | null;
  details: Array<{
    name: string;
    description?: string | null;
    quantity: number;
    unit?: string | null;
    unitPrice: number;
  }>;
}): DemoInvoice {
  const data = loadDemoData();
  const now = new Date().toISOString();
  const id = generateId();
  const invoiceNumber = generateInvoiceNumber();
  const taxRate = input.taxRate ?? 10;

  // 明細を計算
  const details: DemoInvoiceDetail[] = input.details.map((d, i) => ({
    id: generateId(),
    invoiceId: id,
    sortOrder: i,
    name: d.name,
    description: d.description,
    quantity: d.quantity,
    unit: d.unit,
    unitPrice: d.unitPrice,
    amount: d.quantity * d.unitPrice,
  }));

  const subtotal = details.reduce((sum, d) => sum + d.amount, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax;

  // プロジェクト・顧客情報を取得
  const project = data.projects.find(p => p.id === input.projectId);
  const customer = data.customers.find(c => c.id === input.customerId);

  const invoice: DemoInvoice = {
    id,
    companyId: input.companyId,
    projectId: input.projectId,
    customerId: input.customerId,
    invoiceNumber,
    title: input.title,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    status: "draft",
    subtotal,
    taxRate,
    tax,
    total,
    paidAmount: 0,
    remainingAmount: total,
    notes: input.notes,
    internalMemo: input.internalMemo,
    sentAt: null,
    sentTo: null,
    createdAt: now,
    updatedAt: now,
    project: project ? {
      id: project.id,
      projectNumber: project.projectNumber,
      title: project.title,
      customer: customer ? { id: customer.id, name: customer.name, address: customer.address } : undefined,
    } : null,
    details,
    payments: [],
  };

  data.invoices.unshift(invoice);
  saveDemoData(data);

  return invoice;
}

export function getDemoInvoices(companyId: string, projectId?: string, customerId?: string, status?: string): DemoInvoice[] {
  const data = loadDemoData();
  let invoices = data.invoices.filter(i => i.companyId === companyId);
  if (projectId) {
    invoices = invoices.filter(i => i.projectId === projectId);
  }
  if (customerId) {
    invoices = invoices.filter(i => i.customerId === customerId);
  }
  if (status && status !== "all") {
    invoices = invoices.filter(i => i.status === status);
  }
  return invoices;
}

export function getDemoInvoice(id: string): DemoInvoice | null {
  const data = loadDemoData();
  return data.invoices.find(i => i.id === id) || null;
}

export function updateDemoInvoice(id: string, updates: Partial<DemoInvoice>): DemoInvoice | null {
  const data = loadDemoData();
  const index = data.invoices.findIndex(i => i.id === id);
  if (index === -1) return null;

  data.invoices[index] = {
    ...data.invoices[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDemoData(data);

  return data.invoices[index];
}

export function recordDemoPayment(invoiceId: string, payment: {
  paymentDate: string;
  amount: number;
  method?: string | null;
  reference?: string | null;
  notes?: string | null;
}): { payment: DemoPayment; invoice: DemoInvoice } | null {
  const data = loadDemoData();
  const index = data.invoices.findIndex(i => i.id === invoiceId);
  if (index === -1) return null;

  const invoice = data.invoices[index];
  const now = new Date().toISOString();
  const paymentNumber = `PAY-${Date.now()}`;

  const newPayment: DemoPayment = {
    id: generateId(),
    invoiceId,
    paymentNumber,
    paymentDate: payment.paymentDate,
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference,
    notes: payment.notes,
    createdAt: now,
  };

  // 支払い追加
  invoice.payments = [...(invoice.payments || []), newPayment];
  invoice.paidAmount = (invoice.paidAmount || 0) + payment.amount;
  invoice.remainingAmount = invoice.total - invoice.paidAmount;
  invoice.updatedAt = now;

  // ステータス更新
  if (invoice.remainingAmount <= 0) {
    invoice.status = "paid";
  } else if (invoice.paidAmount > 0) {
    invoice.status = "partial_paid";
  }

  data.invoices[index] = invoice;
  saveDemoData(data);

  return { payment: newPayment, invoice };
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

// サンプルデモデータを初期化
export function initializeSampleDemoData(companyId: string): void {
  const data = loadDemoData();

  // 既にデータがある場合はスキップ
  if (data.customers.length > 0 || data.estimates.length > 0) {
    return;
  }

  const now = new Date().toISOString();

  // サンプル顧客を作成
  const customer1: DemoCustomer = {
    id: "demo-customer-1",
    companyId,
    name: "田中 太郎",
    type: "individual",
    email: "tanaka@example.com",
    phone: "090-1234-5678",
    address: "東京都渋谷区神宮前1-2-3",
    rank: "gold",
    lifetimeValue: 5000000,
    totalPoints: 5000,
    createdAt: now,
    updatedAt: now,
  };

  const customer2: DemoCustomer = {
    id: "demo-customer-2",
    companyId,
    name: "鈴木 花子",
    type: "individual",
    email: "suzuki@example.com",
    phone: "080-9876-5432",
    address: "東京都世田谷区成城1-1-1",
    rank: "silver",
    lifetimeValue: 2500000,
    totalPoints: 2500,
    createdAt: now,
    updatedAt: now,
  };

  data.customers.push(customer1, customer2);

  // サンプル物件を作成
  const house1: DemoHouse = {
    id: "demo-house-1",
    companyId,
    customerId: customer1.id,
    address: "東京都渋谷区神宮前1-2-3",
    structureType: "wood",
    builtYear: 2005,
    floorArea: 120,
    createdAt: now,
    updatedAt: now,
    customer: { id: customer1.id, name: customer1.name },
  };

  data.houses.push(house1);

  // 階層構造を持つサンプル見積を作成
  const estimateId = "demo-estimate-1";
  const majorCat1Id = "demo-detail-major-1";
  const majorCat2Id = "demo-detail-major-2";
  const midCat1Id = "demo-detail-mid-1";

  const sampleDetails: DemoEstimateDetail[] = [
    // 大項目1: 外壁工事
    {
      id: majorCat1Id,
      estimateId,
      parentId: null,
      sortOrder: 0,
      level: 0,
      isCategory: true,
      name: "外壁工事",
      specification: null,
      quantity: 1,
      unit: "式",
      costMaterial: 0,
      costLabor: 0,
      costUnit: 0,
      costTotal: 0,
      profitRate: 0,
      priceUnit: 0,
      priceTotal: 0,
      internalMemo: null,
    },
    // 中項目: 塗装工事
    {
      id: midCat1Id,
      estimateId,
      parentId: majorCat1Id,
      sortOrder: 1,
      level: 1,
      isCategory: true,
      name: "塗装工事",
      specification: null,
      quantity: 1,
      unit: "式",
      costMaterial: 0,
      costLabor: 0,
      costUnit: 0,
      costTotal: 0,
      profitRate: 0,
      priceUnit: 0,
      priceTotal: 0,
      internalMemo: null,
    },
    // 小項目: 下塗り
    {
      id: generateId(),
      estimateId,
      parentId: midCat1Id,
      sortOrder: 2,
      level: 2,
      isCategory: false,
      name: "下塗り（シーラー）",
      specification: "水性シーラー",
      quantity: 150,
      unit: "m2",
      costMaterial: 300,
      costLabor: 400,
      costUnit: 700,
      costTotal: 105000,
      profitRate: 30,
      priceUnit: 1000,
      priceTotal: 150000,
      internalMemo: null,
    },
    // 小項目: 中塗り
    {
      id: generateId(),
      estimateId,
      parentId: midCat1Id,
      sortOrder: 3,
      level: 2,
      isCategory: false,
      name: "中塗り",
      specification: "シリコン塗料",
      quantity: 150,
      unit: "m2",
      costMaterial: 500,
      costLabor: 500,
      costUnit: 1000,
      costTotal: 150000,
      profitRate: 30,
      priceUnit: 1429,
      priceTotal: 214350,
      internalMemo: null,
    },
    // 小項目: 上塗り
    {
      id: generateId(),
      estimateId,
      parentId: midCat1Id,
      sortOrder: 4,
      level: 2,
      isCategory: false,
      name: "上塗り",
      specification: "シリコン塗料",
      quantity: 150,
      unit: "m2",
      costMaterial: 500,
      costLabor: 500,
      costUnit: 1000,
      costTotal: 150000,
      profitRate: 30,
      priceUnit: 1429,
      priceTotal: 214350,
      internalMemo: null,
    },
    // 大項目2: 足場工事
    {
      id: majorCat2Id,
      estimateId,
      parentId: null,
      sortOrder: 5,
      level: 0,
      isCategory: true,
      name: "足場工事",
      specification: null,
      quantity: 1,
      unit: "式",
      costMaterial: 0,
      costLabor: 0,
      costUnit: 0,
      costTotal: 0,
      profitRate: 0,
      priceUnit: 0,
      priceTotal: 0,
      internalMemo: null,
    },
    // 小項目: 足場架設
    {
      id: generateId(),
      estimateId,
      parentId: majorCat2Id,
      sortOrder: 6,
      level: 1,
      isCategory: false,
      name: "足場架設・解体",
      specification: "くさび式足場",
      quantity: 200,
      unit: "m2",
      costMaterial: 200,
      costLabor: 300,
      costUnit: 500,
      costTotal: 100000,
      profitRate: 25,
      priceUnit: 667,
      priceTotal: 133400,
      internalMemo: null,
    },
    // 小項目: 養生シート
    {
      id: generateId(),
      estimateId,
      parentId: majorCat2Id,
      sortOrder: 7,
      level: 1,
      isCategory: false,
      name: "養生シート",
      specification: "メッシュシート",
      quantity: 200,
      unit: "m2",
      costMaterial: 100,
      costLabor: 50,
      costUnit: 150,
      costTotal: 30000,
      profitRate: 25,
      priceUnit: 200,
      priceTotal: 40000,
      internalMemo: null,
    },
  ];

  // 合計を計算
  const nonCategoryDetails = sampleDetails.filter(d => !d.isCategory);
  const subtotal = nonCategoryDetails.reduce((sum, d) => sum + d.priceTotal, 0);
  const costTotal = nonCategoryDetails.reduce((sum, d) => sum + d.costTotal, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const profit = subtotal - costTotal;
  const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  const sampleEstimate: DemoEstimate = {
    id: estimateId,
    estimateNumber: "EST-2024-001",
    companyId,
    customerId: customer1.id,
    houseId: house1.id,
    title: "外壁塗装リフォーム工事",
    status: "submitted",
    estimateDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    subtotal,
    tax,
    total,
    taxRate: 10,
    costTotal,
    profit,
    profitRate,
    notes: "工期：約2週間\n養生・清掃含む",
    internalMemo: "隣家との距離が近いため足場に注意",
    createdAt: now,
    updatedAt: now,
    customer: { id: customer1.id, name: customer1.name, email: customer1.email ?? undefined, phone: customer1.phone ?? undefined, address: customer1.address ?? undefined },
    house: { id: house1.id, address: house1.address },
    details: sampleDetails,
  };

  data.estimates.push(sampleEstimate);

  saveDemoData(data);
}
