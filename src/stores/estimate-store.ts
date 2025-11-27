import { create } from "zustand";
import type { EstimateDetail } from "@/types";

interface EstimateState {
  // 見積データ
  customerId: string | null;
  houseId: string | null;
  title: string;
  estimateDate: Date;
  validUntil: Date | null;
  notes: string;
  internalMemo: string;
  taxRate: number;

  // 明細
  details: EstimateDetailState[];

  // 計算結果
  subtotal: number;
  tax: number;
  total: number;
  costTotal: number;
  profit: number;
  profitRate: number;

  // グローバル粗利率（一括設定用）
  globalProfitRate: number;

  // アクション
  setCustomerId: (id: string | null) => void;
  setHouseId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setEstimateDate: (date: Date) => void;
  setValidUntil: (date: Date | null) => void;
  setNotes: (notes: string) => void;
  setInternalMemo: (memo: string) => void;
  setTaxRate: (rate: number) => void;

  addDetail: (detail: Partial<EstimateDetailState>) => void;
  updateDetail: (id: string, detail: Partial<EstimateDetailState>) => void;
  removeDetail: (id: string) => void;
  reorderDetails: (details: EstimateDetailState[]) => void;

  setGlobalProfitRate: (rate: number) => void;
  applyGlobalProfitRate: () => void;

  recalculate: () => void;
  reset: () => void;
}

interface EstimateDetailState {
  id: string;
  parentId: string | null;
  sortOrder: number;
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  costMaterial: number;
  costLabor: number;
  costUnit: number;
  costTotal: number;
  profitRate: number;
  priceUnit: number;
  priceTotal: number;
  internalMemo: string;
  isExpanded: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// 客出し単価計算（原価から逆算）
const calculatePriceFromCost = (cost: number, profitRate: number): number => {
  if (profitRate >= 100) return cost;
  return cost / (1 - profitRate / 100);
};

// 粗利率計算（客出しから逆算）
const calculateProfitRate = (cost: number, price: number): number => {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
};

const initialState = {
  customerId: null,
  houseId: null,
  title: "",
  estimateDate: new Date(),
  validUntil: null,
  notes: "",
  internalMemo: "",
  taxRate: 10,
  details: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  costTotal: 0,
  profit: 0,
  profitRate: 0,
  globalProfitRate: 25,
};

export const useEstimateStore = create<EstimateState>()((set, get) => ({
  ...initialState,

  setCustomerId: (id) => set({ customerId: id }),
  setHouseId: (id) => set({ houseId: id }),
  setTitle: (title) => set({ title }),
  setEstimateDate: (date) => set({ estimateDate: date }),
  setValidUntil: (date) => set({ validUntil: date }),
  setNotes: (notes) => set({ notes }),
  setInternalMemo: (memo) => set({ internalMemo: memo }),
  setTaxRate: (rate) => set({ taxRate: rate }),

  addDetail: (detail) => {
    const state = get();
    const newDetail: EstimateDetailState = {
      id: generateId(),
      parentId: detail.parentId ?? null,
      sortOrder: state.details.length,
      name: detail.name ?? "",
      specification: detail.specification ?? "",
      quantity: detail.quantity ?? 1,
      unit: detail.unit ?? "式",
      costMaterial: detail.costMaterial ?? 0,
      costLabor: detail.costLabor ?? 0,
      costUnit: 0,
      costTotal: 0,
      profitRate: detail.profitRate ?? state.globalProfitRate,
      priceUnit: 0,
      priceTotal: 0,
      internalMemo: detail.internalMemo ?? "",
      isExpanded: true,
    };

    // 原価計算
    newDetail.costUnit = newDetail.costMaterial + newDetail.costLabor;
    newDetail.costTotal = newDetail.costUnit * newDetail.quantity;

    // 客出し計算（原価から逆算）
    newDetail.priceUnit = calculatePriceFromCost(
      newDetail.costUnit,
      newDetail.profitRate
    );
    newDetail.priceTotal = newDetail.priceUnit * newDetail.quantity;

    set({ details: [...state.details, newDetail] });
    get().recalculate();
  },

  updateDetail: (id, updates) => {
    const state = get();
    const details = state.details.map((detail) => {
      if (detail.id !== id) return detail;

      const updated = { ...detail, ...updates };

      // 原価更新があった場合
      if (
        updates.costMaterial !== undefined ||
        updates.costLabor !== undefined ||
        updates.quantity !== undefined
      ) {
        updated.costUnit = updated.costMaterial + updated.costLabor;
        updated.costTotal = updated.costUnit * updated.quantity;

        // 粗利率から客出し再計算
        updated.priceUnit = calculatePriceFromCost(
          updated.costUnit,
          updated.profitRate
        );
        updated.priceTotal = updated.priceUnit * updated.quantity;
      }

      // 粗利率更新があった場合
      if (updates.profitRate !== undefined) {
        updated.priceUnit = calculatePriceFromCost(
          updated.costUnit,
          updated.profitRate
        );
        updated.priceTotal = updated.priceUnit * updated.quantity;
      }

      // 客出し単価を直接入力した場合（逆算）
      if (updates.priceUnit !== undefined && updates.profitRate === undefined) {
        updated.profitRate = calculateProfitRate(
          updated.costUnit,
          updates.priceUnit
        );
        updated.priceTotal = updated.priceUnit * updated.quantity;
      }

      return updated;
    });

    set({ details });
    get().recalculate();
  },

  removeDetail: (id) => {
    const state = get();
    // 子要素も削除
    const idsToRemove = new Set<string>();
    const findChildren = (parentId: string) => {
      idsToRemove.add(parentId);
      state.details
        .filter((d) => d.parentId === parentId)
        .forEach((d) => findChildren(d.id));
    };
    findChildren(id);

    set({
      details: state.details.filter((d) => !idsToRemove.has(d.id)),
    });
    get().recalculate();
  },

  reorderDetails: (details) => {
    set({
      details: details.map((d, i) => ({ ...d, sortOrder: i })),
    });
  },

  setGlobalProfitRate: (rate) => set({ globalProfitRate: rate }),

  applyGlobalProfitRate: () => {
    const state = get();
    const details = state.details.map((detail) => {
      const updated = { ...detail, profitRate: state.globalProfitRate };
      updated.priceUnit = calculatePriceFromCost(
        updated.costUnit,
        updated.profitRate
      );
      updated.priceTotal = updated.priceUnit * updated.quantity;
      return updated;
    });
    set({ details });
    get().recalculate();
  },

  recalculate: () => {
    const state = get();

    // ルートレベルの明細のみ集計（子は親に含まれる想定）
    const rootDetails = state.details.filter((d) => !d.parentId);

    const costTotal = rootDetails.reduce((sum, d) => sum + d.costTotal, 0);
    const subtotal = rootDetails.reduce((sum, d) => sum + d.priceTotal, 0);
    const tax = Math.floor(subtotal * (state.taxRate / 100));
    const total = subtotal + tax;
    const profit = subtotal - costTotal;
    const profitRate = subtotal > 0 ? (profit / subtotal) * 100 : 0;

    set({
      costTotal,
      subtotal,
      tax,
      total,
      profit,
      profitRate,
    });
  },

  reset: () => set(initialState),
}));
