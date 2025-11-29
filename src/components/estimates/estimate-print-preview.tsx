"use client";

import { forwardRef } from "react";

interface EstimateDetail {
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

interface EstimatePrintPreviewProps {
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
    details: EstimateDetail[];
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  showCostColumns?: boolean;
}

const formatCurrency = (value: number): string => {
  return `¥${Math.round(value).toLocaleString()}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const EstimatePrintPreview = forwardRef<HTMLDivElement, EstimatePrintPreviewProps>(
  ({ estimate, company, showCostColumns = false }, ref) => {
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
          <div className="text-sm text-gray-600">
            <div className="font-bold text-base mb-1">{companyName}</div>
            {companyAddress && <div>{companyAddress}</div>}
            {companyPhone && <div>TEL: {companyPhone}</div>}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold tracking-widest mb-2">御 見 積 書</h1>
            <div className="text-sm text-gray-600">
              見積番号: {estimate.estimateNumber}
            </div>
          </div>
        </div>

        {/* 顧客情報 */}
        <div className="border-b-2 border-black pb-2 mb-4">
          <div className="text-lg font-bold">
            {estimate.customer?.name || "お客様"} 様
          </div>
          {estimate.customer?.address && (
            <div className="text-sm text-gray-600">{estimate.customer.address}</div>
          )}
        </div>

        {/* 件名 */}
        <div className="text-center mb-4">
          <div className="text-base">{estimate.title}</div>
        </div>

        {/* 見積金額 */}
        <div className="bg-slate-800 text-white p-4 rounded mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm mr-4">お見積金額（税込）</span>
            <span className="text-2xl font-bold">{formatCurrency(estimate.total)}</span>
            <span className="text-xs text-gray-300 ml-3">
              （税抜 {formatCurrency(estimate.subtotal)} / 消費税 {formatCurrency(estimate.tax)}）
            </span>
          </div>
          <div className="text-right text-sm">
            <div>見積日: {formatDate(estimate.estimateDate)}</div>
            {estimate.validUntil && (
              <div>有効期限: {formatDate(estimate.validUntil)}</div>
            )}
          </div>
        </div>

        {/* 明細テーブル */}
        <table className="w-full border-collapse text-sm mb-4">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2 text-center w-10">No.</th>
              <th className="border p-2 text-left">項目名</th>
              <th className="border p-2 text-left w-24">仕様</th>
              <th className="border p-2 text-right w-16">数量</th>
              <th className="border p-2 text-center w-12">単位</th>
              {showCostColumns && (
                <>
                  <th className="border p-2 text-right w-20">原価単価</th>
                  <th className="border p-2 text-right w-20">原価計</th>
                  <th className="border p-2 text-center w-14">粗利率</th>
                </>
              )}
              <th className="border p-2 text-right w-20">単価</th>
              <th className="border p-2 text-right w-24">金額</th>
            </tr>
          </thead>
          <tbody>
            {estimate.details.map((detail, index) => (
              <tr key={detail.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{detail.name}</td>
                <td className="border p-2 text-xs text-gray-600">
                  {detail.specification || "-"}
                </td>
                <td className="border p-2 text-right">{detail.quantity}</td>
                <td className="border p-2 text-center">{detail.unit || "-"}</td>
                {showCostColumns && (
                  <>
                    <td className="border p-2 text-right">
                      {detail.costTotal && detail.quantity
                        ? formatCurrency((detail.costMaterial || 0) + (detail.costLabor || 0))
                        : "-"}
                    </td>
                    <td className="border p-2 text-right">
                      {detail.costTotal ? formatCurrency(detail.costTotal) : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {detail.profitRate ? `${detail.profitRate.toFixed(0)}%` : "-"}
                    </td>
                  </>
                )}
                <td className="border p-2 text-right">{formatCurrency(detail.priceUnit)}</td>
                <td className="border p-2 text-right font-medium">
                  {formatCurrency(detail.priceTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* サマリー */}
        <div className="flex justify-between">
          {/* 備考 */}
          <div className="w-1/2 pr-4">
            {estimate.notes && (
              <div className="border-l-4 border-gray-400 pl-3 bg-gray-50 p-3">
                <div className="font-bold text-sm mb-1">備考</div>
                <div className="text-sm whitespace-pre-wrap">{estimate.notes}</div>
              </div>
            )}
          </div>

          {/* 合計 */}
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                {showCostColumns && estimate.costTotal !== undefined && (
                  <tr>
                    <td className="p-2">原価合計</td>
                    <td className="p-2 text-right">{formatCurrency(estimate.costTotal)}</td>
                  </tr>
                )}
                <tr className="border-t">
                  <td className="p-2">小計（税抜）</td>
                  <td className="p-2 text-right">{formatCurrency(estimate.subtotal)}</td>
                </tr>
                <tr>
                  <td className="p-2">消費税（{estimate.taxRate}%）</td>
                  <td className="p-2 text-right">{formatCurrency(estimate.tax)}</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-2">合計（税込）</td>
                  <td className="p-2 text-right text-lg">{formatCurrency(estimate.total)}</td>
                </tr>
              </tbody>
            </table>

            {/* 粗利情報（社内用） */}
            {showCostColumns && estimate.profit !== undefined && estimate.profitRate !== undefined && (
              <div className="mt-2 p-2 bg-green-50 rounded flex justify-end gap-4 text-sm">
                <div>
                  <span className="text-green-700">粗利額: </span>
                  <span className="font-bold text-green-700">{formatCurrency(estimate.profit)}</span>
                </div>
                <div>
                  <span className="text-green-700">粗利率: </span>
                  <span className="font-bold text-green-700">{estimate.profitRate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400 flex justify-between">
          <span>この見積書は {companyName} が発行しました</span>
          <span>Powered by LinK HOUSE OS</span>
        </div>
      </div>
    );
  }
);

EstimatePrintPreview.displayName = "EstimatePrintPreview";
