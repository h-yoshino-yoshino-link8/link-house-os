"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// フォント登録（日本語対応）
Font.register({
  family: "NotoSansJP",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj757Y0rw-oME.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJUj757Y0rw-oME.ttf",
      fontWeight: "bold",
    },
  ],
});

// スタイル定義（A4横向き: 842pt x 595pt）
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 35,
    backgroundColor: "#fff",
  },
  // ヘッダー（左側に会社情報、右側にタイトル・顧客）
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    width: "35%",
  },
  headerRight: {
    width: "60%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#333",
    marginBottom: 10,
  },
  estimateNumber: {
    fontSize: 9,
    textAlign: "right",
    color: "#666",
  },
  // 顧客情報ボックス
  customerBox: {
    borderBottom: "2px solid #333",
    paddingBottom: 8,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  customerSuffix: {
    fontSize: 11,
    marginLeft: 5,
  },
  customerAddress: {
    fontSize: 8,
    color: "#666",
    marginTop: 3,
  },
  // 会社情報
  companyBox: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 4,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 8,
    color: "#555",
    marginBottom: 2,
  },
  // 見積金額セクション
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: 11,
    color: "#fff",
    marginRight: 15,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  totalTax: {
    fontSize: 9,
    color: "#aaa",
    marginLeft: 10,
  },
  dateInfo: {
    textAlign: "right",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  dateLabel: {
    fontSize: 8,
    color: "#aaa",
    marginRight: 10,
    width: 50,
    textAlign: "right",
  },
  dateValue: {
    fontSize: 9,
    color: "#fff",
    width: 80,
  },
  // 明細テーブル
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e0e0e0",
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 26,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  // 列幅定義（A4横向き用に最適化）
  colNo: {
    width: 25,
    textAlign: "center",
  },
  colName: {
    width: 180,
    paddingRight: 8,
  },
  colSpec: {
    width: 100,
    paddingRight: 8,
    color: "#666",
  },
  colQty: {
    width: 50,
    textAlign: "right",
    paddingRight: 5,
  },
  colUnit: {
    width: 35,
    textAlign: "center",
  },
  colCostMaterial: {
    width: 70,
    textAlign: "right",
    paddingRight: 5,
  },
  colCostLabor: {
    width: 70,
    textAlign: "right",
    paddingRight: 5,
  },
  colCostTotal: {
    width: 80,
    textAlign: "right",
    paddingRight: 5,
  },
  colProfitRate: {
    width: 45,
    textAlign: "center",
  },
  colPrice: {
    width: 75,
    textAlign: "right",
    paddingRight: 5,
  },
  colAmount: {
    width: 85,
    textAlign: "right",
  },
  headerText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
  },
  cellText: {
    fontSize: 8,
  },
  cellTextSmall: {
    fontSize: 7,
  },
  // サマリーセクション
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notesBox: {
    width: "55%",
  },
  summaryBox: {
    width: "40%",
  },
  summaryTable: {
    borderTop: "2px solid #333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "1px solid #e0e0e0",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#333",
  },
  summaryValue: {
    fontSize: 9,
    textAlign: "right",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    marginTop: 5,
  },
  summaryTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  summaryTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // 備考
  notesSection: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderLeft: "3px solid #333",
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notesContent: {
    fontSize: 8,
    lineHeight: 1.4,
    color: "#333",
  },
  // フッター
  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#999",
    borderTop: "1px solid #e0e0e0",
    paddingTop: 8,
  },
  // 粗利表示（社内用オプション）
  profitInfo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 10,
    padding: 8,
    backgroundColor: "#e8f5e9",
    borderRadius: 4,
  },
  profitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  profitLabel: {
    fontSize: 8,
    color: "#2e7d32",
    marginRight: 5,
  },
  profitValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2e7d32",
  },
});

// 型定義
interface EstimateDetailForPDF {
  id: string;
  name: string;
  specification?: string | null;
  quantity: number;
  unit?: string | null;
  costMaterial?: number;
  costLabor?: number;
  costTotal?: number;
  profitRate?: number;
  priceUnit: number;
  priceTotal: number;
}

interface EstimateDataForPDF {
  estimateNumber: string;
  title: string;
  estimateDate: string;
  validUntil?: string | null;
  customerName: string;
  customerAddress?: string | null;
  companyName: string;
  companyAddress?: string | null;
  companyPhone?: string | null;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  costTotal?: number;
  profit?: number;
  profitRate?: number;
  details: EstimateDetailForPDF[];
  notes?: string | null;
  showCostColumns?: boolean; // 原価列を表示するか（社内用）
}

interface EstimatePDFProps {
  data: EstimateDataForPDF;
}

// 金額フォーマット
const formatCurrency = (value: number): string => {
  return `¥${Math.round(value).toLocaleString()}`;
};

// 日付フォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export function EstimatePDF({ data }: EstimatePDFProps) {
  const showCost = data.showCostColumns ?? false;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.headerContainer}>
          {/* 左側：会社情報 */}
          <View style={styles.headerLeft}>
            <View style={styles.companyBox}>
              <Text style={styles.companyName}>{data.companyName}</Text>
              {data.companyAddress && (
                <Text style={styles.companyInfo}>{data.companyAddress}</Text>
              )}
              {data.companyPhone && (
                <Text style={styles.companyInfo}>TEL: {data.companyPhone}</Text>
              )}
            </View>
          </View>

          {/* 右側：タイトル・顧客情報 */}
          <View style={styles.headerRight}>
            <Text style={styles.title}>御 見 積 書</Text>
            <View style={styles.customerBox}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={styles.customerName}>{data.customerName}</Text>
                <Text style={styles.customerSuffix}>様</Text>
              </View>
              {data.customerAddress && (
                <Text style={styles.customerAddress}>{data.customerAddress}</Text>
              )}
            </View>
            <Text style={styles.subtitle}>{data.title}</Text>
            <Text style={styles.estimateNumber}>
              見積番号: {data.estimateNumber}
            </Text>
          </View>
        </View>

        {/* 見積金額セクション */}
        <View style={styles.totalSection}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLabel}>お見積金額（税込）</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
            <Text style={styles.totalTax}>
              （税抜 {formatCurrency(data.subtotal)} / 消費税 {formatCurrency(data.tax)}）
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>見積日</Text>
              <Text style={styles.dateValue}>{formatDate(data.estimateDate)}</Text>
            </View>
            {data.validUntil && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>有効期限</Text>
                <Text style={styles.dateValue}>{formatDate(data.validUntil)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 明細テーブル */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.headerText]}>No.</Text>
            <Text style={[styles.colName, styles.headerText]}>項目名</Text>
            <Text style={[styles.colSpec, styles.headerText]}>仕様</Text>
            <Text style={[styles.colQty, styles.headerText]}>数量</Text>
            <Text style={[styles.colUnit, styles.headerText]}>単位</Text>
            {showCost && (
              <>
                <Text style={[styles.colCostMaterial, styles.headerText]}>材料費</Text>
                <Text style={[styles.colCostLabor, styles.headerText]}>労務費</Text>
                <Text style={[styles.colCostTotal, styles.headerText]}>原価計</Text>
                <Text style={[styles.colProfitRate, styles.headerText]}>粗利率</Text>
              </>
            )}
            <Text style={[styles.colPrice, styles.headerText]}>単価</Text>
            <Text style={[styles.colAmount, styles.headerText]}>金額</Text>
          </View>
          {data.details.map((detail, index) => (
            <View
              key={detail.id}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={[styles.colNo, styles.cellText]}>{index + 1}</Text>
              <Text style={[styles.colName, styles.cellText]}>{detail.name}</Text>
              <Text style={[styles.colSpec, styles.cellTextSmall]}>
                {detail.specification || "-"}
              </Text>
              <Text style={[styles.colQty, styles.cellText]}>{detail.quantity}</Text>
              <Text style={[styles.colUnit, styles.cellText]}>{detail.unit || "-"}</Text>
              {showCost && (
                <>
                  <Text style={[styles.colCostMaterial, styles.cellText]}>
                    {detail.costMaterial ? formatCurrency(detail.costMaterial) : "-"}
                  </Text>
                  <Text style={[styles.colCostLabor, styles.cellText]}>
                    {detail.costLabor ? formatCurrency(detail.costLabor) : "-"}
                  </Text>
                  <Text style={[styles.colCostTotal, styles.cellText]}>
                    {detail.costTotal ? formatCurrency(detail.costTotal) : "-"}
                  </Text>
                  <Text style={[styles.colProfitRate, styles.cellText]}>
                    {detail.profitRate ? `${detail.profitRate.toFixed(0)}%` : "-"}
                  </Text>
                </>
              )}
              <Text style={[styles.colPrice, styles.cellText]}>
                {formatCurrency(detail.priceUnit)}
              </Text>
              <Text style={[styles.colAmount, styles.cellText]}>
                {formatCurrency(detail.priceTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* サマリーセクション */}
        <View style={styles.summaryContainer}>
          {/* 左側：備考 */}
          <View style={styles.notesBox}>
            {data.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>備考</Text>
                <Text style={styles.notesContent}>{data.notes}</Text>
              </View>
            )}
          </View>

          {/* 右側：合計 */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryTable}>
              {showCost && data.costTotal !== undefined && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>原価合計</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(data.costTotal)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>小計（税抜）</Text>
                <Text style={styles.summaryValue}>{formatCurrency(data.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>消費税（{data.taxRate}%）</Text>
                <Text style={styles.summaryValue}>{formatCurrency(data.tax)}</Text>
              </View>
              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>合計（税込）</Text>
                <Text style={styles.summaryTotalValue}>{formatCurrency(data.total)}</Text>
              </View>
            </View>

            {/* 粗利情報（社内用） */}
            {showCost && data.profit !== undefined && data.profitRate !== undefined && (
              <View style={styles.profitInfo}>
                <View style={styles.profitItem}>
                  <Text style={styles.profitLabel}>粗利額</Text>
                  <Text style={styles.profitValue}>{formatCurrency(data.profit)}</Text>
                </View>
                <View style={styles.profitItem}>
                  <Text style={styles.profitLabel}>粗利率</Text>
                  <Text style={styles.profitValue}>{data.profitRate.toFixed(1)}%</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text>この見積書は {data.companyName} が発行しました</Text>
          <Text>Powered by LinK HOUSE OS</Text>
        </View>
      </Page>
    </Document>
  );
}

// PDF生成用のデータ変換関数
export function prepareEstimateForPDF(
  estimate: {
    estimateNumber: string;
    title: string;
    estimateDate: string;
    validUntil?: string | null;
    subtotal: number;
    taxRate: number;
    tax: number;
    total: number;
    costTotal?: number;
    profit?: number;
    profitRate?: number;
    notes?: string | null;
    customer?: {
      name: string;
      address?: string | null;
    };
    details: Array<{
      id: string;
      name: string;
      specification?: string | null;
      quantity: number;
      unit?: string | null;
      costMaterial?: number;
      costLabor?: number;
      costTotal?: number;
      profitRate?: number;
      priceUnit: number;
      priceTotal: number;
    }>;
  },
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  },
  options?: {
    showCostColumns?: boolean;
  }
): EstimateDataForPDF {
  return {
    estimateNumber: estimate.estimateNumber,
    title: estimate.title,
    estimateDate: estimate.estimateDate,
    validUntil: estimate.validUntil,
    customerName: estimate.customer?.name || "お客様",
    customerAddress: estimate.customer?.address,
    companyName: company?.name || "株式会社サンプル建設",
    companyAddress: company?.address || "東京都渋谷区〇〇1-2-3",
    companyPhone: company?.phone || "03-1234-5678",
    subtotal: estimate.subtotal,
    taxRate: estimate.taxRate,
    tax: estimate.tax,
    total: estimate.total,
    costTotal: estimate.costTotal,
    profit: estimate.profit,
    profitRate: estimate.profitRate,
    details: estimate.details,
    notes: estimate.notes,
    showCostColumns: options?.showCostColumns ?? false,
  };
}
