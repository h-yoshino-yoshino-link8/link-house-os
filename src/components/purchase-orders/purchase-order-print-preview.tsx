"use client";

import { forwardRef } from "react";

interface PurchaseOrderDetail {
  id: string;
  name: string;
  specification?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  amount: number;
}

interface PurchaseOrderPrintPreviewProps {
  order: {
    orderNumber: string;
    title: string;
    orderDate: string;
    deliveryDate?: string | null;
    subtotal: number;
    taxRate: number;
    tax: number;
    total: number;
    notes?: string | null;
    partner?: {
      name: string;
      address?: string | null;
      contactPerson?: string | null;
    };
    project?: {
      projectNumber: string;
      title: string;
    };
    details: PurchaseOrderDetail[];
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
}

const formatCurrency = (value: number): string => {
  return `¥${Math.round(value).toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const PurchaseOrderPrintPreview = forwardRef<HTMLDivElement, PurchaseOrderPrintPreviewProps>(
  ({ order, company }, ref) => {
    const companyName = company?.name || "株式会社LinK";
    const companyAddress = company?.address || "";
    const companyPhone = company?.phone || "";

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
          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-widest mb-2">発 注 書</h1>
            <div className="text-sm text-gray-600">
              発注番号: {order.orderNumber}
            </div>
          </div>
          <div className="text-sm text-gray-600 text-right">
            <div className="font-bold text-base mb-1">{companyName}</div>
            {companyAddress && <div>{companyAddress}</div>}
            {companyPhone && <div>TEL: {companyPhone}</div>}
          </div>
        </div>

        {/* 協力会社情報 */}
        <div className="border-b-2 border-black pb-2 mb-4">
          <div className="text-lg font-bold">
            {order.partner?.name || "協力会社"} 御中
          </div>
          {order.partner?.contactPerson && (
            <div className="text-sm text-gray-600">
              ご担当: {order.partner.contactPerson} 様
            </div>
          )}
        </div>

        {/* 件名・案件番号 */}
        <div className="text-center mb-4">
          <div className="text-base font-medium">{order.title}</div>
          {order.project && (
            <div className="text-sm text-gray-500">
              案件番号: {order.project.projectNumber}
            </div>
          )}
        </div>

        {/* 発注金額 */}
        <div className="bg-slate-800 text-white p-4 rounded mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm mr-4">ご発注金額（税込）</span>
            <span className="text-2xl font-bold">{formatCurrency(order.total)}</span>
            <span className="text-xs text-gray-300 ml-3">
              （税抜 {formatCurrency(order.subtotal)} / 消費税 {formatCurrency(order.tax)}）
            </span>
          </div>
          <div className="text-right text-sm">
            <div>発注日: {formatDate(order.orderDate)}</div>
            {order.deliveryDate && (
              <div>納期: {formatDate(order.deliveryDate)}</div>
            )}
          </div>
        </div>

        {/* 明細テーブル */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2 text-center w-10">No.</th>
              <th className="border p-2 text-left">品名・内容</th>
              <th className="border p-2 text-left w-48">仕様</th>
              <th className="border p-2 text-right w-16">数量</th>
              <th className="border p-2 text-center w-12">単位</th>
              <th className="border p-2 text-right w-24">単価</th>
              <th className="border p-2 text-right w-28">金額</th>
            </tr>
          </thead>
          <tbody>
            {order.details.map((detail, index) => (
              <tr key={detail.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{detail.name}</td>
                <td className="border p-2 text-xs text-gray-600">
                  {detail.specification || "-"}
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
          {/* 備考 */}
          <div className="w-1/2 pr-4">
            {order.notes && (
              <div className="border-l-4 border-gray-400 pl-3 bg-gray-50 p-3">
                <div className="font-bold text-sm mb-1">備考</div>
                <div className="text-sm whitespace-pre-wrap">{order.notes}</div>
              </div>
            )}
          </div>

          {/* 合計 */}
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t">
                  <td className="p-2">小計（税抜）</td>
                  <td className="p-2 text-right">{formatCurrency(order.subtotal)}</td>
                </tr>
                <tr>
                  <td className="p-2">消費税（{order.taxRate}%）</td>
                  <td className="p-2 text-right">{formatCurrency(order.tax)}</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-2">合計（税込）</td>
                  <td className="p-2 text-right text-lg">{formatCurrency(order.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between">
          <span>この発注書は {companyName} が発行しました</span>
          <span>Powered by LinK HOUSE OS</span>
        </div>
      </div>
    );
  }
);

PurchaseOrderPrintPreview.displayName = "PurchaseOrderPrintPreview";
