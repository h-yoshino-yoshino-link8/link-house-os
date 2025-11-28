"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Plus,
  Trash,
  Save,
  FileDown,
  Send,
  Calculator,
  GripVertical,
  Lightbulb,
  Loader2,
  Package,
  Wrench,
  Search,
  Check,
} from "lucide-react";
import { UNITS } from "@/constants";
import { useCustomers } from "@/hooks/use-customers";
import { useHouses } from "@/hooks/use-houses";
import { useCreateEstimate } from "@/hooks/use-estimates";
import { useMaterials, useLaborTypes, Material, LaborType } from "@/hooks/use-masters";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useEstimateStore();
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;

  // URL パラメータから初期値を設定
  const initialCustomerId = searchParams.get("customer") || searchParams.get("customerId");

  // 顧客・物件一覧を取得
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers({
    companyId,
    limit: 100,
  });
  const customers = customersData?.data ?? [];

  // 選択された顧客のIDで物件をフィルタ
  const { data: housesData, isLoading: isLoadingHouses } = useHouses({
    companyId,
    customerId: store.customerId || undefined,
    limit: 100,
    enabled: !!store.customerId,
  });
  const houses = housesData?.data ?? [];

  // マスタデータ取得
  const [masterSearch, setMasterSearch] = useState("");
  const [masterDialogOpen, setMasterDialogOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedLabors, setSelectedLabors] = useState<string[]>([]);

  const { data: materials, isLoading: isLoadingMaterials } = useMaterials({
    companyId,
    search: masterSearch || undefined,
    isActive: true,
  });

  const { data: laborTypes, isLoading: isLoadingLabors } = useLaborTypes({
    companyId,
    search: masterSearch || undefined,
    isActive: true,
  });

  // 見積作成ミューテーション
  const createEstimate = useCreateEstimate();

  // 見積日から1ヶ月後を計算
  const calcValidUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  };

  // フォーム状態
  const today = new Date().toISOString().split("T")[0];
  const [estimateDate, setEstimateDate] = useState(today);
  const [validUntil, setValidUntil] = useState(calcValidUntil(today));
  const [isSaving, setIsSaving] = useState(false);

  // 見積日が変更されたら有効期限を自動更新
  const handleEstimateDateChange = (newDate: string) => {
    setEstimateDate(newDate);
    setValidUntil(calcValidUntil(newDate));
  };

  // 初期化時にURLパラメータから顧客を設定
  useEffect(() => {
    if (initialCustomerId && !store.customerId) {
      store.setCustomerId(initialCustomerId);
    }
  }, [initialCustomerId, store]);

  // コンポーネントマウント時にストアをリセット
  useEffect(() => {
    return () => {
      // ページ離脱時はリセットしない（保存していない変更を保持）
    };
  }, []);

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

  // マスタから材料を追加
  const addMaterialToDetail = (material: Material) => {
    store.addDetail({
      name: material.name,
      quantity: 1,
      unit: material.unit,
      costMaterial: Number(material.costPrice),
      costLabor: 0,
      profitRate: store.globalProfitRate,
    });
  };

  // マスタから工種を追加
  const addLaborToDetail = (labor: LaborType) => {
    store.addDetail({
      name: labor.name,
      quantity: 1,
      unit: "人工",
      costMaterial: 0,
      costLabor: Number(labor.dailyRate),
      profitRate: store.globalProfitRate,
    });
  };

  // 選択したマスタを追加
  const handleAddFromMaster = () => {
    // 材料を追加
    if (materials) {
      selectedMaterials.forEach((id) => {
        const material = materials.find((m) => m.id === id);
        if (material) {
          addMaterialToDetail(material);
        }
      });
    }
    // 工種を追加
    if (laborTypes) {
      selectedLabors.forEach((id) => {
        const labor = laborTypes.find((l) => l.id === id);
        if (labor) {
          addLaborToDetail(labor);
        }
      });
    }
    // リセット
    setSelectedMaterials([]);
    setSelectedLabors([]);
    setMasterSearch("");
    setMasterDialogOpen(false);
    toast.success("マスタから追加しました");
  };

  // 材料の選択トグル
  const toggleMaterialSelection = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 工種の選択トグル
  const toggleLaborSelection = (id: string) => {
    setSelectedLabors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 下書き保存
  const handleSaveDraft = async () => {
    if (!store.customerId) {
      toast.error("顧客を選択してください");
      return;
    }
    if (!store.title) {
      toast.error("件名を入力してください");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createEstimate.mutateAsync({
        companyId,
        customerId: store.customerId,
        houseId: store.houseId || undefined,
        title: store.title,
        status: "draft",
        estimateDate: new Date(estimateDate).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        taxRate: store.taxRate,
        notes: store.notes || undefined,
        internalMemo: store.internalMemo || undefined,
        details: store.details.map((d, i) => ({
          sortOrder: i,
          name: d.name,
          specification: d.specification || undefined,
          quantity: d.quantity,
          unit: d.unit,
          costMaterial: d.costMaterial,
          costLabor: d.costLabor,
          profitRate: d.profitRate,
          internalMemo: d.internalMemo || undefined,
        })),
      });

      toast.success("下書きを保存しました");
      store.reset();
      router.push(`/estimates/${result.data.id}`);
    } catch (error) {
      toast.error("保存に失敗しました");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // 見積確定
  const handleSubmit = async () => {
    if (!store.customerId) {
      toast.error("顧客を選択してください");
      return;
    }
    if (!store.title) {
      toast.error("件名を入力してください");
      return;
    }
    if (store.details.length === 0) {
      toast.error("明細を追加してください");
      return;
    }

    setIsSaving(true);
    try {
      const result = await createEstimate.mutateAsync({
        companyId,
        customerId: store.customerId,
        houseId: store.houseId || undefined,
        title: store.title,
        status: "submitted",
        estimateDate: new Date(estimateDate).toISOString(),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        taxRate: store.taxRate,
        notes: store.notes || undefined,
        internalMemo: store.internalMemo || undefined,
        details: store.details.map((d, i) => ({
          sortOrder: i,
          name: d.name,
          specification: d.specification || undefined,
          quantity: d.quantity,
          unit: d.unit,
          costMaterial: d.costMaterial,
          costLabor: d.costLabor,
          profitRate: d.profitRate,
          internalMemo: d.internalMemo || undefined,
        })),
      });

      toast.success("見積を確定しました");
      store.reset();
      router.push(`/estimates/${result.data.id}`);
    } catch (error) {
      toast.error("保存に失敗しました");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            下書き保存
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            PDF出力
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
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
                <Label>顧客 *</Label>
                <Select
                  value={store.customerId || ""}
                  onValueChange={(value) => {
                    store.setCustomerId(value);
                    store.setHouseId(null); // 顧客変更時は物件をリセット
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCustomers ? "読み込み中..." : "顧客を選択"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>物件</Label>
                <Select
                  value={store.houseId || ""}
                  onValueChange={(value) => store.setHouseId(value)}
                  disabled={!store.customerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !store.customerId
                        ? "顧客を先に選択"
                        : isLoadingHouses
                        ? "読み込み中..."
                        : houses.length === 0
                        ? "物件なし"
                        : "物件を選択"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map((house) => (
                      <SelectItem key={house.id} value={house.id}>
                        {house.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>件名 *</Label>
              <Input
                value={store.title}
                onChange={(e) => store.setTitle(e.target.value)}
                placeholder="例：キッチンリフォーム工事"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>見積日</Label>
                <Input
                  type="date"
                  value={estimateDate}
                  onChange={(e) => handleEstimateDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>有効期限（見積日+1ヶ月）</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
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
              <Dialog open={masterDialogOpen} onOpenChange={setMasterDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    マスタから追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>マスタから追加</DialogTitle>
                    <DialogDescription>
                      材料・工種マスタから見積明細に追加します
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* 検索 */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="検索..."
                        className="pl-9"
                        value={masterSearch}
                        onChange={(e) => setMasterSearch(e.target.value)}
                      />
                    </div>

                    <Tabs defaultValue="materials" className="w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="materials" className="flex-1">
                          <Package className="mr-2 h-4 w-4" />
                          材料マスタ
                        </TabsTrigger>
                        <TabsTrigger value="labors" className="flex-1">
                          <Wrench className="mr-2 h-4 w-4" />
                          工種マスタ
                        </TabsTrigger>
                      </TabsList>

                      {/* 材料タブ */}
                      <TabsContent value="materials">
                        <ScrollArea className="h-[300px] rounded-md border">
                          {isLoadingMaterials ? (
                            <div className="flex items-center justify-center h-32">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : materials && materials.length > 0 ? (
                            <div className="divide-y">
                              {materials.map((material) => (
                                <div
                                  key={material.id}
                                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 ${
                                    selectedMaterials.includes(material.id) ? "bg-primary/10" : ""
                                  }`}
                                  onClick={() => toggleMaterialSelection(material.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                                        selectedMaterials.includes(material.id)
                                          ? "bg-primary border-primary"
                                          : "border-input"
                                      }`}
                                    >
                                      {selectedMaterials.includes(material.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{material.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {material.productCode || "-"} / {material.unit}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      ¥{Number(material.costPrice).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">原価</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                              <Package className="h-8 w-8 mb-2" />
                              <p>材料マスタがありません</p>
                              <p className="text-sm">設定 → マスタ管理から登録してください</p>
                            </div>
                          )}
                        </ScrollArea>
                      </TabsContent>

                      {/* 工種タブ */}
                      <TabsContent value="labors">
                        <ScrollArea className="h-[300px] rounded-md border">
                          {isLoadingLabors ? (
                            <div className="flex items-center justify-center h-32">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          ) : laborTypes && laborTypes.length > 0 ? (
                            <div className="divide-y">
                              {laborTypes.map((labor) => (
                                <div
                                  key={labor.id}
                                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 ${
                                    selectedLabors.includes(labor.id) ? "bg-primary/10" : ""
                                  }`}
                                  onClick={() => toggleLaborSelection(labor.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                                        selectedLabors.includes(labor.id)
                                          ? "bg-primary border-primary"
                                          : "border-input"
                                      }`}
                                    >
                                      {selectedLabors.includes(labor.id) && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{labor.name}</p>
                                      <p className="text-sm text-muted-foreground">人工</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      ¥{Number(labor.dailyRate).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">日当</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                              <Wrench className="h-8 w-8 mb-2" />
                              <p>工種マスタがありません</p>
                              <p className="text-sm">設定 → マスタ管理から登録してください</p>
                            </div>
                          )}
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>

                    {/* 選択数と追加ボタン */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedMaterials.length + selectedLabors.length} 件選択中
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedMaterials([]);
                            setSelectedLabors([]);
                            setMasterSearch("");
                            setMasterDialogOpen(false);
                          }}
                        >
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleAddFromMaster}
                          disabled={selectedMaterials.length + selectedLabors.length === 0}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          追加する
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" disabled>
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
