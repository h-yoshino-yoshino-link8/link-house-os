"use client";

import { forwardRef } from "react";

interface InvoiceDetail {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  amount: number;
}

interface InvoicePrintPreviewProps {
  invoice: {
    invoiceNumber: string;
    title: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    taxRate: number;
    tax: number;
    total: number;
    paidAmount?: number;
    remainingAmount?: number;
    notes?: string | null;
    customer?: {
      name: string;
      address?: string | null;
    };
    project?: {
      projectNumber: string;
      title: string;
    };
    details: InvoiceDetail[];
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    bankInfo?: string | null;
  };
}

const formatCurrency = (value: number): string => {
  return `¥${Math.round(value).toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const InvoicePrintPreview = forwardRef<HTMLDivElement, InvoicePrintPreviewProps>(
  ({ invoice, company }, ref) => {
    const companyName = company?.name || "株式会社LinK";
    const companyAddress = company?.address || "";
    const companyPhone = company?.phone || "";
    const bankInfo = company?.bankInfo || "銀行名: ○○銀行 ○○支店\n口座種別: 普通\n口座番号: 1234567\n口座名義: カ）リンク";

    return (
      <div ref={ref} className="print-preview bg-white p-6 min-h-[210mm] w-[297mm] mx-auto">
        <style jsx>{`
          @media print {
            .print-preview {
              margin: 0;
              padding: 8mm;
              width: 100%;
              min-height: auto;
            }
          }
        `}</style>

        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm text-gray-600">
            <div className="font-bold text-base mb-1">{companyName}</div>
            {companyAddress && <div>{companyAddress}</div>}
            {companyPhone && <div>TEL: {companyPhone}</div>}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-widest mb-2">請 求 書</h1>
            <div className="text-sm text-gray-600">
              請求番号: {invoice.invoiceNumber}
            </div>
          </div>
        </div>

        {/* 顧客情報 */}
        <div className="border-b-2 border-black pb-2 mb-4">
          <div className="text-lg font-bold">
            {invoice.customer?.name || "お客様"} 様
          </div>
          {invoice.customer?.address && (
            <div className="text-sm text-gray-600">{invoice.customer.address}</div>
          )}
        </div>

        {/* 件名・案件番号 */}
        <div className="text-center mb-4">
          <div className="text-base">{invoice.title}</div>
          {invoice.project && (
            <div className="text-sm text-gray-500">
              案件番号: {invoice.project.projectNumber}
            </div>
          )}
        </div>

        {/* 請求金額 */}
        <div className="bg-slate-800 text-white p-4 rounded mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm mr-4">ご請求金額（税込）</span>
            <span className="text-2xl font-bold">{formatCurrency(invoice.total)}</span>
            <span className="text-xs text-gray-300 ml-3">
              （税抜 {formatCurrency(invoice.subtotal)} / 消費税 {formatCurrency(invoice.tax)}）
            </span>
          </div>
          <div className="text-right text-sm">
            <div>発行日: {formatDate(invoice.issueDate)}</div>
            <div>お支払期限: {formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        {/* 明細テーブル */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2 text-center w-10">No.</th>
              <th className="border p-2 text-left">品名・内容</th>
              <th className="border p-2 text-left w-48">摘要</th>
              <th className="border p-2 text-right w-16">数量</th>
              <th className="border p-2 text-center w-12">単位</th>
              <th className="border p-2 text-right w-24">単価</th>
              <th className="border p-2 text-right w-28">金額</th>
            </tr>
          </thead>
          <tbody>
            {invoice.details.map((detail, index) => (
              <tr key={detail.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{detail.name}</td>
                <td className="border p-2 text-xs text-gray-600">
                  {detail.description || "-"}
                </td>
                <td className="border p-2 text-right">{detail.quantity}</td>
                <td className="border p-2 text-center">{detail.unit || "式"}</td>
                <td className="border p-2 text-right">{formatCurrency(detail.unitPrice)}</td>
                <td className="border p-2 text-right font-medium">
                  {formatCurrency(detail.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* サマリー */}
        <div className="flex justify-between">
          {/* 振込先情報 */}
          <div className="w-1/2 pr-4">
            <div className="border-l-4 border-gray-400 pl-3 bg-gray-50 p-3">
              <div className="font-bold text-sm mb-1">お振込先</div>
              <div className="text-sm whitespace-pre-wrap">{bankInfo}</div>
            </div>
            {invoice.notes && (
              <div className="mt-3 border-l-4 border-gray-400 pl-3 bg-gray-50 p-3">
                <div className="font-bold text-sm mb-1">備考</div>
                <div className="text-sm whitespace-pre-wrap">{invoice.notes}</div>
              </div>
            )}
          </div>

          {/* 合計 */}
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t">
                  <td className="p-2">小計（税抜）</td>
                  <td className="p-2 text-right">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                  <td className="p-2">消費税（{invoice.taxRate}%）</td>
                  <td className="p-2 text-right">{formatCurrency(invoice.tax)}</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-2">合計（税込）</td>
                  <td className="p-2 text-right text-lg">{formatCurrency(invoice.total)}</td>
                </tr>
                {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                  <>
                    <tr>
                      <td className="p-2 text-green-600">入金済</td>
                      <td className="p-2 text-right text-green-600">{formatCurrency(invoice.paidAmount)}</td>
                    </tr>
                    <tr className="bg-orange-50 font-bold">
                      <td className="p-2 text-orange-600">残額</td>
                      <td className="p-2 text-right text-orange-600 text-lg">
                        {formatCurrency(invoice.remainingAmount || 0)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between">
          <span>この請求書は {companyName} が発行しました</span>
          <span>Powered by LinK HOUSE OS</span>
        </div>
      </div>
    );
  }
);

InvoicePrintPreview.displayName = "InvoicePrintPreview";
