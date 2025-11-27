"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
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
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PDFDownloadButton({
  estimate,
  company,
  variant = "outline",
  size = "default",
  className,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // PDF用データを準備
      const pdfData = prepareEstimateForPDF(estimate, company);

      // PDF生成
      const blob = await pdf(<EstimatePDF data={pdfData} />).toBlob();

      // ダウンロード用のリンクを作成
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `見積書_${estimate.estimateNumber}_${estimate.customer?.name || "顧客"}.pdf`;
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

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
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
