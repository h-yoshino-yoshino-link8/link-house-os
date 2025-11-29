"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, ChevronDown, FileText, FileSpreadsheet, Printer, X } from "lucide-react";
import { EstimatePrintPreview } from "./estimate-print-preview";
import { useReactToPrint } from "react-to-print";

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
  showDropdown?: boolean;
}

export function PDFDownloadButton({
  estimate,
  company,
  variant = "outline",
  size = "default",
  className,
  showDropdown = true,
}: PDFDownloadButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showCostColumns, setShowCostColumns] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `見積書_${estimate.estimateNumber}_${estimate.customer?.name || "顧客"}${showCostColumns ? "_社内用" : ""}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  const openPreview = useCallback((withCostColumns: boolean) => {
    setShowCostColumns(withCostColumns);
    setIsPreviewOpen(true);
  }, []);

  if (!showDropdown) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => openPreview(false)}
        >
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>

        <PreviewDialog
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          estimate={estimate}
          company={company}
          showCostColumns={showCostColumns}
          printRef={printRef}
          onPrint={handlePrint}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Download className="mr-2 h-4 w-4" />
            PDF
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openPreview(false)}>
            <FileText className="mr-2 h-4 w-4" />
            通常版（顧客向け）
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openPreview(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            社内用（原価・粗利表示）
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        estimate={estimate}
        company={company}
        showCostColumns={showCostColumns}
        printRef={printRef}
        onPrint={handlePrint}
      />
    </>
  );
}

// プレビューダイアログコンポーネント
function PreviewDialog({
  isOpen,
  onClose,
  estimate,
  company,
  showCostColumns,
  printRef,
  onPrint,
}: {
  isOpen: boolean;
  onClose: () => void;
  estimate: PDFDownloadButtonProps["estimate"];
  company?: PDFDownloadButtonProps["company"];
  showCostColumns: boolean;
  printRef: React.RefObject<HTMLDivElement | null>;
  onPrint: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            見積書プレビュー {showCostColumns && "(社内用)"}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={onPrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              印刷 / PDF保存
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
          <EstimatePrintPreview
            ref={printRef}
            estimate={estimate}
            company={company}
            showCostColumns={showCostColumns}
          />
        </div>

        <div className="text-sm text-muted-foreground text-center">
          「印刷 / PDF保存」をクリックし、印刷ダイアログで「PDFに保存」を選択してください
        </div>
      </DialogContent>
    </Dialog>
  );
}
