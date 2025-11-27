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

// スタイル定義
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #333",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
  },
  estimateNumber: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 10,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  infoBox: {
    width: "48%",
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  infoContent: {
    paddingHorizontal: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 70,
    fontSize: 9,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
  },
  totalSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    marginBottom: 25,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    marginRight: 30,
    width: 100,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 12,
    width: 120,
    textAlign: "right",
  },
  totalMain: {
    fontSize: 18,
    fontWeight: "bold",
  },
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 30,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colNo: {
    width: 25,
    textAlign: "center",
    fontSize: 9,
  },
  colName: {
    flex: 1,
    paddingRight: 10,
    fontSize: 9,
  },
  colSpec: {
    width: 80,
    fontSize: 8,
    color: "#666",
    paddingRight: 5,
  },
  colQty: {
    width: 40,
    textAlign: "right",
    fontSize: 9,
    paddingRight: 5,
  },
  colUnit: {
    width: 30,
    textAlign: "center",
    fontSize: 9,
  },
  colPrice: {
    width: 70,
    textAlign: "right",
    fontSize: 9,
  },
  colAmount: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
  },
  headerText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  summaryBox: {
    width: 250,
    borderTop: "2px solid #333",
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 10,
  },
  summaryValue: {
    fontSize: 10,
    textAlign: "right",
  },
  summaryTotal: {
    fontWeight: "bold",
    fontSize: 14,
    borderTop: "1px solid #333",
    paddingTop: 8,
    marginTop: 5,
  },
  notesSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#fafafa",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#999",
    borderTop: "1px solid #ddd",
    paddingTop: 10,
  },
  stamp: {
    position: "absolute",
    right: 40,
    top: 80,
    width: 70,
    height: 70,
    border: "2px solid #cc0000",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  stampText: {
    color: "#cc0000",
    fontSize: 14,
    fontWeight: "bold",
  },
});

// 型定義
interface EstimateDetailForPDF {
  id: string;
  name: string;
  specification?: string | null;
  quantity: number;
  unit?: string | null;
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
  details: EstimateDetailForPDF[];
  notes?: string | null;
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>御 見 積 書</Text>
          <Text style={styles.subtitle}>{data.title}</Text>
          <Text style={styles.estimateNumber}>
            見積番号: {data.estimateNumber}
          </Text>
        </View>

        {/* 顧客・会社情報 */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>御中</Text>
            <View style={styles.infoContent}>
              <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>
                {data.customerName} 様
              </Text>
              {data.customerAddress && (
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {data.customerAddress}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>発行者</Text>
            <View style={styles.infoContent}>
              <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>
                {data.companyName}
              </Text>
              {data.companyAddress && (
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {data.companyAddress}
                </Text>
              )}
              {data.companyPhone && (
                <Text style={{ fontSize: 9, color: "#666" }}>
                  TEL: {data.companyPhone}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 見積金額 */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.totalMain]}>
              お見積金額（税込）
            </Text>
            <Text style={[styles.totalValue, styles.totalMain]}>
              {formatCurrency(data.total)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>見積日</Text>
            <Text style={styles.totalValue}>{formatDate(data.estimateDate)}</Text>
          </View>
          {data.validUntil && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>有効期限</Text>
              <Text style={styles.totalValue}>{formatDate(data.validUntil)}</Text>
            </View>
          )}
        </View>

        {/* 明細テーブル */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colNo, styles.headerText]}>No.</Text>
            <Text style={[styles.colName, styles.headerText]}>項目名</Text>
            <Text style={[styles.colSpec, styles.headerText]}>仕様</Text>
            <Text style={[styles.colQty, styles.headerText]}>数量</Text>
            <Text style={[styles.colUnit, styles.headerText]}>単位</Text>
            <Text style={[styles.colPrice, styles.headerText]}>単価</Text>
            <Text style={[styles.colAmount, styles.headerText]}>金額</Text>
          </View>
          {data.details.map((detail, index) => (
            <View
              key={detail.id}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colName}>{detail.name}</Text>
              <Text style={styles.colSpec}>{detail.specification || "-"}</Text>
              <Text style={styles.colQty}>{detail.quantity}</Text>
              <Text style={styles.colUnit}>{detail.unit || "-"}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(detail.priceUnit)}
              </Text>
              <Text style={styles.colAmount}>
                {formatCurrency(detail.priceTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* 合計セクション */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>小計（税抜）</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                消費税（{data.taxRate}%）
              </Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.tax)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryLabel}>合計（税込）</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* 備考 */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考</Text>
            <Text style={styles.notesContent}>{data.notes}</Text>
          </View>
        )}

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
export function prepareEstimateForPDF(estimate: {
  estimateNumber: string;
  title: string;
  estimateDate: string;
  validUntil?: string | null;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
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
    priceUnit: number;
    priceTotal: number;
  }>;
}, company?: {
  name: string;
  address?: string | null;
  phone?: string | null;
}): EstimateDataForPDF {
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
    details: estimate.details,
    notes: estimate.notes,
  };
}
