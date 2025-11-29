"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Printer, X } from "lucide-react";
import { InvoicePrintPreview } from "./invoice-print-preview";
import { useReactToPrint } from "react-to-print";

interface InvoicePDFButtonProps {
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
    details: Array<{
      id: string;
      name: string;
      description?: string | null;
      quantity: number;
      unit?: string | null;
      unitPrice: number;
      amount: number;
    }>;
  };
  company?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    bankInfo?: string | null;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function InvoicePDFButton({
  invoice,
  company,
  variant = "outline",
  size = "default",
  className,
}: InvoicePDFButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `請求書_${invoice.invoiceNumber}_${invoice.customer?.name || "顧客"}`,
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

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={openPreview}
      >
        <Download className="mr-2 h-4 w-4" />
        PDF
      </Button>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>請求書プレビュー</DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} size="sm">
                <Printer className="mr-2 h-4 w-4" />
                印刷 / PDF保存
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
            <InvoicePrintPreview
              ref={printRef}
              invoice={invoice}
              company={company}
            />
          </div>

          <div className="text-sm text-muted-foreground text-center">
            「印刷 / PDF保存」をクリックし、印刷ダイアログで「PDFに保存」を選択してください
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
