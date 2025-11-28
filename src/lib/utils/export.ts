/**
 * データエクスポート用ユーティリティ
 * CSV/Excel形式でデータをダウンロード
 */

// CSVエスケープ処理
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// CSVダウンロード
export function downloadCSV(data: Record<string, unknown>[], filename: string, headers?: Record<string, string>) {
  if (data.length === 0) return;

  // ヘッダー行
  const keys = Object.keys(data[0]);
  const headerRow = keys.map(key => headers?.[key] || key).join(",");

  // データ行
  const rows = data.map(row =>
    keys.map(key => escapeCSV(row[key])).join(",")
  );

  // BOMを追加してExcelで日本語が文字化けしないようにする
  const BOM = "\uFEFF";
  const csv = BOM + [headerRow, ...rows].join("\n");

  // ダウンロード
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 見積一覧エクスポート用の型変換
export function formatEstimatesForExport(estimates: Array<{
  estimateNumber: string;
  title: string;
  customer?: { name: string } | null;
  status: string;
  estimateDate?: string;
  validUntil?: string | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  costTotal?: number;
  profit?: number;
  profitRate?: number;
  createdAt?: string;
}>) {
  return estimates.map(e => ({
    見積番号: e.estimateNumber,
    件名: e.title,
    顧客名: e.customer?.name || "-",
    ステータス: getStatusLabel(e.status),
    見積日: e.estimateDate?.split("T")[0] || "-",
    有効期限: e.validUntil?.split("T")[0] || "-",
    小計: e.subtotal || 0,
    消費税: e.tax || 0,
    合計: e.total || 0,
    原価合計: e.costTotal || 0,
    粗利: e.profit || 0,
    粗利率: e.profitRate ? `${e.profitRate.toFixed(1)}%` : "-",
    作成日: e.createdAt?.split("T")[0] || "-",
  }));
}

// ステータスラベル取得
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "下書き",
    submitted: "提出済",
    ordered: "受注",
    lost: "失注",
    pending: "保留",
  };
  return labels[status] || status;
}

// 顧客一覧エクスポート用
export function formatCustomersForExport(customers: Array<{
  name: string;
  type?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  rank?: string;
  lifetimeValue?: number;
  totalPoints?: number;
  createdAt?: string;
}>) {
  return customers.map(c => ({
    顧客名: c.name,
    種別: c.type === "corporate" ? "法人" : "個人",
    メール: c.email || "-",
    電話番号: c.phone || "-",
    住所: c.address || "-",
    ランク: c.rank || "-",
    累計取引額: c.lifetimeValue || 0,
    ポイント: c.totalPoints || 0,
    登録日: c.createdAt?.split("T")[0] || "-",
  }));
}

// 案件一覧エクスポート用
export function formatProjectsForExport(projects: Array<{
  projectNumber: string;
  title: string;
  customer?: { name: string } | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  contractAmount?: number | null;
  progress?: number;
  createdAt?: string;
}>) {
  return projects.map(p => ({
    案件番号: p.projectNumber,
    件名: p.title,
    顧客名: p.customer?.name || "-",
    ステータス: p.status || "-",
    開始日: p.startDate?.split("T")[0] || "-",
    終了日: p.endDate?.split("T")[0] || "-",
    契約金額: p.contractAmount || 0,
    進捗率: p.progress ? `${p.progress}%` : "0%",
    作成日: p.createdAt?.split("T")[0] || "-",
  }));
}
