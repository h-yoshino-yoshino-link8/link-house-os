"use client";

import { useState } from "react";
import Link from "next/link";
import { useEstimateStore } from "@/stores/estimate-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash,
  Save,
  FileDown,
  Send,
  Calculator,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Lightbulb,
} from "lucide-react";
import { UNITS } from "@/constants";

// 見積明細の行コンポーネント
function EstimateDetailRow({
  detail,
  onUpdate,
  onRemove,
}: {
  detail: {
    id: string;
    name: string;
    specification: string;
    quantity: number;
    unit: string;
    costMaterial: number;
    costLabor: number;
    costUnit: number;
    costTotal: number;
    profitRate: number;
    priceUnit: number;
    priceTotal: number;
  };
  onUpdate: (id: string, updates: Partial<typeof detail>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <TableRow>
      <TableCell className="w-8">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      </TableCell>
      <TableCell>
        <Input
          value={detail.name}
          onChange={(e) => onUpdate(detail.id, { name: e.target.value })}
          placeholder="項目名"
          className="min-w-[150px]"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={detail.quantity}
          onChange={(e) => onUpdate(detail.id, { quantity: parseFloat(e.target.value) || 0 })}
          className="w-20 text-right"
        />
      </TableCell>
      <TableCell>
        <Select
          value={detail.unit}
          onValueChange={(value) => onUpdate(detail.id, { unit: value })}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={detail.costMaterial}
          onChange={(e) => onUpdate(detail.id, { costMaterial: parseFloat(e.target.value) || 0 })}
          className="w-28 text-right"
          placeholder="材料費"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={detail.costLabor}
          onChange={(e) => onUpdate(detail.id, { costLabor: parseFloat(e.target.value) || 0 })}
          className="w-28 text-right"
          placeholder="労務費"
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        ¥{detail.costTotal.toLocaleString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={detail.profitRate}
            onChange={(e) => onUpdate(detail.id, { profitRate: parseFloat(e.target.value) || 0 })}
            className="w-16 text-right"
            min={0}
            max={99}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">
        ¥{Math.round(detail.priceUnit).toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-bold">
        ¥{Math.round(detail.priceTotal).toLocaleString()}
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(detail.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function NewEstimatePage() {
  const store = useEstimateStore();
  const [showSimulator, setShowSimulator] = useState(false);

  // デフォルトの明細を追加
  const addDefaultDetail = () => {
    store.addDetail({
      name: "",
      quantity: 1,
      unit: "式",
      costMaterial: 0,
      costLabor: 0,
      profitRate: store.globalProfitRate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/estimates">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規見積作成</h1>
            <p className="text-muted-foreground">原価から客出し単価を逆算</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            下書き保存
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            PDF出力
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            見積確定
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>顧客</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="顧客を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">山田太郎 様</SelectItem>
                    <SelectItem value="2">佐藤建設 様</SelectItem>
                    <SelectItem value="3">田中工務店 様</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>物件</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="物件を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">東京都○○区...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>件名</Label>
              <Input
                value={store.title}
                onChange={(e) => store.setTitle(e.target.value)}
                placeholder="例：キッチンリフォーム工事"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>見積日</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>有効期限</Label>
                <Input type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Simulator */}
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                粗利シミュレーター
              </CardTitle>
              <Badge variant="secondary">目標粗利率</Badge>
            </div>
            <CardDescription>
              スライダーで粗利率を調整すると、客出し金額がリアルタイムで変動します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">粗利率</span>
                <span className="text-2xl font-bold">{store.globalProfitRate}%</span>
              </div>
              <Slider
                value={[store.globalProfitRate]}
                onValueChange={([value]) => store.setGlobalProfitRate(value)}
                max={60}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>30%</span>
                <span>60%</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => store.applyGlobalProfitRate()}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              全明細に粗利率を一括適用
            </Button>

            <Separator />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">原価合計</p>
                <p className="text-lg font-bold">
                  ¥{store.costTotal.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">客出し合計</p>
                <p className="text-lg font-bold text-primary">
                  ¥{Math.round(store.subtotal).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">粗利額</p>
                <p className="text-lg font-bold text-green-600">
                  ¥{Math.round(store.profit).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>見積明細</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                マスタから追加
              </Button>
              <Button variant="outline" size="sm">
                過去見積からコピー
              </Button>
              <Button size="sm" onClick={addDefaultDetail}>
                <Plus className="mr-2 h-4 w-4" />
                行を追加
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead>項目名</TableHead>
                  <TableHead className="w-20">数量</TableHead>
                  <TableHead className="w-20">単位</TableHead>
                  <TableHead className="w-28">材料費</TableHead>
                  <TableHead className="w-28">労務費</TableHead>
                  <TableHead className="w-28 text-right">原価計</TableHead>
                  <TableHead className="w-24">粗利率</TableHead>
                  <TableHead className="w-28 text-right">客出単価</TableHead>
                  <TableHead className="w-32 text-right">客出金額</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.details.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <p>明細がありません</p>
                        <Button variant="outline" size="sm" onClick={addDefaultDetail}>
                          <Plus className="mr-2 h-4 w-4" />
                          最初の行を追加
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  store.details.map((detail) => (
                    <EstimateDetailRow
                      key={detail.id}
                      detail={detail}
                      onUpdate={store.updateDetail}
                      onRemove={store.removeDetail}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {store.details.length > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">原価合計</span>
                  <span>¥{store.costTotal.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">小計（税抜）</span>
                  <span>¥{Math.round(store.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">消費税（{store.taxRate}%）</span>
                  <span>¥{Math.round(store.tax).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>合計</span>
                  <span className="text-primary">¥{Math.round(store.total).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-green-600">
                  <span>粗利額</span>
                  <span>¥{Math.round(store.profit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-green-600">
                  <span>粗利率</span>
                  <span>{store.profitRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>備考（顧客向け）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={store.notes}
              onChange={(e) => store.setNotes(e.target.value)}
              placeholder="見積書に記載する備考・条件など"
              rows={4}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>社内メモ（非表示）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={store.internalMemo}
              onChange={(e) => store.setInternalMemo(e.target.value)}
              placeholder="社内共有用のメモ（顧客には表示されません）"
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
