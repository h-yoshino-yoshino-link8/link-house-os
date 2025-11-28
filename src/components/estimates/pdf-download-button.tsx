"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { EstimatePDF, prepareEstimateForPDF } from "./estimate-pdf";
import { toast } from "sonner";

interface PDFDownloadButtonProps {
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
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showDropdown?: boolean; // ドロップダウンメニューを表示するか
}

export function PDFDownloadButton({
  estimate,
  company,
  variant = "outline",
  size = "default",
  className,
  showDropdown = true,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (showCostColumns: boolean = false) => {
    setIsGenerating(true);
    try {
      // PDF用データを準備
      const pdfData = prepareEstimateForPDF(estimate, company, { showCostColumns });

      // PDF生成
      const blob = await pdf(<EstimatePDF data={pdfData} />).toBlob();

      // ダウンロード用のリンクを作成
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const suffix = showCostColumns ? "_社内用" : "";
      link.download = `見積書_${estimate.estimateNumber}_${estimate.customer?.name || "顧客"}${suffix}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDFをダウンロードしました");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => handleDownload(false)}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "生成中..." : "PDF"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "生成中..." : "PDF"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload(false)}>
          <FileText className="mr-2 h-4 w-4" />
          通常版（顧客向け）
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload(true)}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          社内用（原価・粗利表示）
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
