"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Users,
  Wrench,
  Tag,
  Loader2,
  FolderTree,
} from "lucide-react";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  useLaborTypes,
  useCreateLaborType,
  useUpdateLaborType,
  useDeleteLaborType,
  useWorkCategories,
  useCreateWorkCategory,
  useUpdateWorkCategory,
  useDeleteWorkCategory,
  Material,
  LaborType,
  WorkCategory,
} from "@/hooks/use-masters";
import { toast } from "sonner";

// デモデータ - 業者マスタ（将来的にAPIに移行）
const vendorMaster = [
  { id: "1", code: "VEN-001", name: "○○塗料店", type: "材料", phone: "03-1111-1111", rating: 4.5 },
  { id: "2", code: "VEN-002", name: "△△建材", type: "材料", phone: "03-2222-2222", rating: 4.2 },
  { id: "3", code: "VEN-003", name: "□□足場", type: "外注", phone: "03-3333-3333", rating: 4.8 },
  { id: "4", code: "VEN-004", name: "◇◇電気工事", type: "外注", phone: "03-4444-4444", rating: 4.0 },
  { id: "5", code: "VEN-005", name: "☆☆設備", type: "外注", phone: "03-5555-5555", rating: 4.3 },
];

// デモデータ - タグマスタ（将来的にAPIに移行）
const tagMaster = [
  { id: "1", name: "VIP", color: "purple", count: 12 },
  { id: "2", name: "リピーター", color: "blue", count: 45 },
  { id: "3", name: "紹介", color: "green", count: 28 },
  { id: "4", name: "新規", color: "yellow", count: 35 },
  { id: "5", name: "法人", color: "cyan", count: 18 },
  { id: "6", name: "大口", color: "red", count: 8 },
];

const tagColors: Record<string, string> = {
  purple: "bg-purple-100 text-purple-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  cyan: "bg-cyan-100 text-cyan-800",
  red: "bg-red-100 text-red-800",
};

export default function MastersSettingsPage() {
  const { companyId } = useAppStore();
  const effectiveCompanyId = companyId || DEMO_COMPANY_ID;

  // ダイアログ状態
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [laborDialogOpen, setLaborDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingLabor, setEditingLabor] = useState<LaborType | null>(null);
  const [editingCategory, setEditingCategory] = useState<WorkCategory | null>(null);

  // 検索状態
  const [materialSearch, setMaterialSearch] = useState("");
  const [laborSearch, setLaborSearch] = useState("");

  // フォーム状態
  const [materialForm, setMaterialForm] = useState({
    name: "",
    productCode: "",
    manufacturer: "",
    specification: "",
    costPrice: "",
    unit: "piece",
    lossRate: "0",
    supplierName: "",
  });

  const [laborForm, setLaborForm] = useState({
    name: "",
    dailyRate: "",
    hourlyRate: "",
    productivity: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    code: "",
    parentId: "",
  });

  // データ取得
  const { data: materials, isLoading: materialsLoading } = useMaterials({
    companyId: effectiveCompanyId,
    search: materialSearch || undefined,
    isActive: true,
  });

  const { data: laborTypes, isLoading: laborLoading } = useLaborTypes({
    companyId: effectiveCompanyId,
    search: laborSearch || undefined,
    isActive: true,
  });

  const { data: workCategories, isLoading: categoriesLoading } = useWorkCategories({
    companyId: effectiveCompanyId,
    isActive: true,
    flat: true,
  });

  // ミューテーション
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial(editingMaterial?.id || "");
  const deleteMaterial = useDeleteMaterial();

  const createLabor = useCreateLaborType();
  const updateLabor = useUpdateLaborType(editingLabor?.id || "");
  const deleteLabor = useDeleteLaborType();

  const createCategory = useCreateWorkCategory();
  const updateCategory = useUpdateWorkCategory(editingCategory?.id || "");
  const deleteCategory = useDeleteWorkCategory();

  // 材料マスタ操作
  const handleMaterialSubmit = async () => {
    try {
      const data = {
        companyId: effectiveCompanyId,
        name: materialForm.name,
        productCode: materialForm.productCode || null,
        manufacturer: materialForm.manufacturer || null,
        specification: materialForm.specification || null,
        costPrice: parseFloat(materialForm.costPrice) || 0,
        unit: materialForm.unit,
        lossRate: parseFloat(materialForm.lossRate) || 0,
        supplierName: materialForm.supplierName || null,
        supplierId: null,
        categoryId: null,
      };

      if (editingMaterial) {
        await updateMaterial.mutateAsync(data);
        toast.success("材料を更新しました");
      } else {
        await createMaterial.mutateAsync(data);
        toast.success("材料を登録しました");
      }
      setMaterialDialogOpen(false);
      resetMaterialForm();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial.mutateAsync(id);
      toast.success("材料を削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const openEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      productCode: material.productCode || "",
      manufacturer: material.manufacturer || "",
      specification: material.specification || "",
      costPrice: String(material.costPrice),
      unit: material.unit,
      lossRate: String(material.lossRate),
      supplierName: material.supplierName || "",
    });
    setMaterialDialogOpen(true);
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialForm({
      name: "",
      productCode: "",
      manufacturer: "",
      specification: "",
      costPrice: "",
      unit: "piece",
      lossRate: "0",
      supplierName: "",
    });
  };

  // 労務マスタ操作
  const handleLaborSubmit = async () => {
    try {
      const data = {
        companyId: effectiveCompanyId,
        name: laborForm.name,
        dailyRate: parseFloat(laborForm.dailyRate) || 0,
        hourlyRate: laborForm.hourlyRate ? parseFloat(laborForm.hourlyRate) : null,
        productivity: laborForm.productivity ? parseFloat(laborForm.productivity) : null,
        categoryId: null,
      };

      if (editingLabor) {
        await updateLabor.mutateAsync(data);
        toast.success("工種を更新しました");
      } else {
        await createLabor.mutateAsync(data);
        toast.success("工種を登録しました");
      }
      setLaborDialogOpen(false);
      resetLaborForm();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const handleDeleteLabor = async (id: string) => {
    try {
      await deleteLabor.mutateAsync(id);
      toast.success("工種を削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const openEditLabor = (labor: LaborType) => {
    setEditingLabor(labor);
    setLaborForm({
      name: labor.name,
      dailyRate: String(labor.dailyRate),
      hourlyRate: labor.hourlyRate ? String(labor.hourlyRate) : "",
      productivity: labor.productivity ? String(labor.productivity) : "",
    });
    setLaborDialogOpen(true);
  };

  const resetLaborForm = () => {
    setEditingLabor(null);
    setLaborForm({
      name: "",
      dailyRate: "",
      hourlyRate: "",
      productivity: "",
    });
  };

  // カテゴリ操作
  const handleCategorySubmit = async () => {
    try {
      const data = {
        companyId: effectiveCompanyId,
        name: categoryForm.name,
        code: categoryForm.code || null,
        parentId: categoryForm.parentId || null,
        sortOrder: 0,
      };

      if (editingCategory) {
        await updateCategory.mutateAsync(data);
        toast.success("カテゴリを更新しました");
      } else {
        await createCategory.mutateAsync(data);
        toast.success("カテゴリを登録しました");
      }
      setCategoryDialogOpen(false);
      resetCategoryForm();
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("カテゴリを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const openEditCategory = (category: WorkCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      code: category.code || "",
      parentId: category.parentId || "",
    });
    setCategoryDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      code: "",
      parentId: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">マスタ管理</h1>
          <p className="text-muted-foreground">材料・工種・カテゴリ等のマスタデータ管理</p>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            材料マスタ
          </TabsTrigger>
          <TabsTrigger value="worktypes" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            工種マスタ
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            カテゴリ
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            業者マスタ
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            タグマスタ
          </TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>材料マスタ</CardTitle>
                  <CardDescription>見積で使用する材料の原価マスタ</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="材料名で検索..."
                      className="pl-9"
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                    />
                  </div>
                  <Dialog open={materialDialogOpen} onOpenChange={(open) => {
                    setMaterialDialogOpen(open);
                    if (!open) resetMaterialForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規登録
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingMaterial ? "材料マスタ編集" : "材料マスタ登録"}</DialogTitle>
                        <DialogDescription>材料情報を入力してください</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>材料コード</Label>
                            <Input
                              placeholder="MAT-XXX"
                              value={materialForm.productCode}
                              onChange={(e) => setMaterialForm({ ...materialForm, productCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>メーカー</Label>
                            <Input
                              placeholder="メーカー名"
                              value={materialForm.manufacturer}
                              onChange={(e) => setMaterialForm({ ...materialForm, manufacturer: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>材料名 *</Label>
                          <Input
                            placeholder="シリコン塗料（上塗り）"
                            value={materialForm.name}
                            onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>規格・仕様</Label>
                          <Input
                            placeholder="規格・仕様"
                            value={materialForm.specification}
                            onChange={(e) => setMaterialForm({ ...materialForm, specification: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>単位 *</Label>
                            <Select
                              value={materialForm.unit}
                              onValueChange={(value) => setMaterialForm({ ...materialForm, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piece">個</SelectItem>
                                <SelectItem value="can">缶</SelectItem>
                                <SelectItem value="roll">本・ロール</SelectItem>
                                <SelectItem value="m2">㎡</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="set">式</SelectItem>
                                <SelectItem value="sheet">枚</SelectItem>
                                <SelectItem value="bag">袋</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>原価 *</Label>
                            <Input
                              type="number"
                              placeholder="28000"
                              value={materialForm.costPrice}
                              onChange={(e) => setMaterialForm({ ...materialForm, costPrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>ロス率（%）</Label>
                            <Input
                              type="number"
                              placeholder="5"
                              value={materialForm.lossRate}
                              onChange={(e) => setMaterialForm({ ...materialForm, lossRate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>仕入先</Label>
                            <Input
                              placeholder="仕入先名"
                              value={materialForm.supplierName}
                              onChange={(e) => setMaterialForm({ ...materialForm, supplierName: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setMaterialDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleMaterialSubmit}
                          disabled={!materialForm.name || !materialForm.costPrice || createMaterial.isPending || updateMaterial.isPending}
                        >
                          {(createMaterial.isPending || updateMaterial.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingMaterial ? "更新" : "登録"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : materials && materials.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>コード</TableHead>
                      <TableHead>材料名</TableHead>
                      <TableHead>メーカー</TableHead>
                      <TableHead>単位</TableHead>
                      <TableHead className="text-right">原価</TableHead>
                      <TableHead className="text-right">ロス率</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-mono text-sm">{material.productCode || "-"}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.manufacturer || "-"}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell className="text-right">
                          ¥{Number(material.costPrice).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{Number(material.lossRate)}%</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditMaterial(material)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteMaterial(material.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mb-4" />
                  <p>材料マスタがありません</p>
                  <p className="text-sm">「新規登録」から材料を追加してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Types Tab */}
        <TabsContent value="worktypes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>工種マスタ</CardTitle>
                  <CardDescription>工種ごとの労務単価（人工）</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="工種名で検索..."
                      className="pl-9"
                      value={laborSearch}
                      onChange={(e) => setLaborSearch(e.target.value)}
                    />
                  </div>
                  <Dialog open={laborDialogOpen} onOpenChange={(open) => {
                    setLaborDialogOpen(open);
                    if (!open) resetLaborForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規登録
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingLabor ? "工種マスタ編集" : "工種マスタ登録"}</DialogTitle>
                        <DialogDescription>工種情報を入力してください</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>工種名 *</Label>
                          <Input
                            placeholder="大工"
                            value={laborForm.name}
                            onChange={(e) => setLaborForm({ ...laborForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>日当（人工）*</Label>
                            <Input
                              type="number"
                              placeholder="35000"
                              value={laborForm.dailyRate}
                              onChange={(e) => setLaborForm({ ...laborForm, dailyRate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>時給</Label>
                            <Input
                              type="number"
                              placeholder="4000"
                              value={laborForm.hourlyRate}
                              onChange={(e) => setLaborForm({ ...laborForm, hourlyRate: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>歩掛り</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1.0"
                            value={laborForm.productivity}
                            onChange={(e) => setLaborForm({ ...laborForm, productivity: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setLaborDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button
                          onClick={handleLaborSubmit}
                          disabled={!laborForm.name || !laborForm.dailyRate || createLabor.isPending || updateLabor.isPending}
                        >
                          {(createLabor.isPending || updateLabor.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingLabor ? "更新" : "登録"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {laborLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : laborTypes && laborTypes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>工種名</TableHead>
                      <TableHead className="text-right">日当（人工）</TableHead>
                      <TableHead className="text-right">時給</TableHead>
                      <TableHead className="text-right">歩掛り</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laborTypes.map((labor) => (
                      <TableRow key={labor.id}>
                        <TableCell className="font-medium">{labor.name}</TableCell>
                        <TableCell className="text-right">
                          ¥{Number(labor.dailyRate).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {labor.hourlyRate ? `¥${Number(labor.hourlyRate).toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {labor.productivity ? Number(labor.productivity) : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditLabor(labor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteLabor(labor.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mb-4" />
                  <p>工種マスタがありません</p>
                  <p className="text-sm">「新規登録」から工種を追加してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>カテゴリマスタ</CardTitle>
                  <CardDescription>材料・工種を分類するカテゴリ</CardDescription>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={(open) => {
                  setCategoryDialogOpen(open);
                  if (!open) resetCategoryForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      新規登録
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "カテゴリ編集" : "カテゴリ登録"}</DialogTitle>
                      <DialogDescription>カテゴリ情報を入力してください</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>カテゴリ名 *</Label>
                        <Input
                          placeholder="塗装工事"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>コード</Label>
                        <Input
                          placeholder="CAT-001"
                          value={categoryForm.code}
                          onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>親カテゴリ</Label>
                        <Select
                          value={categoryForm.parentId}
                          onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="なし（ルートカテゴリ）" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">なし（ルートカテゴリ）</SelectItem>
                            {workCategories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button
                        onClick={handleCategorySubmit}
                        disabled={!categoryForm.name || createCategory.isPending || updateCategory.isPending}
                      >
                        {(createCategory.isPending || updateCategory.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingCategory ? "更新" : "登録"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : workCategories && workCategories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>コード</TableHead>
                      <TableHead>カテゴリ名</TableHead>
                      <TableHead>親カテゴリ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-mono text-sm">{category.code || "-"}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.parent?.name || "-"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditCategory(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <FolderTree className="h-12 w-12 mb-4" />
                  <p>カテゴリがありません</p>
                  <p className="text-sm">「新規登録」からカテゴリを追加してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab - Demo data for now */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>業者マスタ</CardTitle>
                  <CardDescription>取引先業者の管理（デモデータ）</CardDescription>
                </div>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  新規登録
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>業者名</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>電話番号</TableHead>
                    <TableHead>評価</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorMaster.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-mono text-sm">{vendor.code}</TableCell>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.type}</Badge>
                      </TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" disabled>
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab - Demo data for now */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>タグマスタ</CardTitle>
                  <CardDescription>顧客・案件に付けるタグの管理（デモデータ）</CardDescription>
                </div>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  新規登録
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tagMaster.map((tag) => (
                  <Card key={tag.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Badge className={tagColors[tag.color]}>{tag.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {tag.count}件で使用中
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            <Edit className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" disabled>
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
