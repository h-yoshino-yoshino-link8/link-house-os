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
  Database,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Users,
  Wrench,
  Tag,
} from "lucide-react";

// デモデータ - 材料マスタ
const materialMaster = [
  { id: "1", code: "MAT-001", name: "シリコン塗料（上塗り）", unit: "缶", unitPrice: 28000, category: "塗料" },
  { id: "2", code: "MAT-002", name: "下地シーラー", unit: "缶", unitPrice: 8500, category: "塗料" },
  { id: "3", code: "MAT-003", name: "コーキング材", unit: "本", unitPrice: 1200, category: "副資材" },
  { id: "4", code: "MAT-004", name: "養生シート", unit: "ロール", unitPrice: 3500, category: "副資材" },
  { id: "5", code: "MAT-005", name: "サイディング（窯業系）", unit: "㎡", unitPrice: 5800, category: "外壁材" },
  { id: "6", code: "MAT-006", name: "コロニアル屋根材", unit: "㎡", unitPrice: 4200, category: "屋根材" },
  { id: "7", code: "MAT-007", name: "断熱材（グラスウール）", unit: "㎡", unitPrice: 2800, category: "断熱材" },
];

// 業者マスタ
const vendorMaster = [
  { id: "1", code: "VEN-001", name: "○○塗料店", type: "材料", phone: "03-1111-1111", rating: 4.5 },
  { id: "2", code: "VEN-002", name: "△△建材", type: "材料", phone: "03-2222-2222", rating: 4.2 },
  { id: "3", code: "VEN-003", name: "□□足場", type: "外注", phone: "03-3333-3333", rating: 4.8 },
  { id: "4", code: "VEN-004", name: "◇◇電気工事", type: "外注", phone: "03-4444-4444", rating: 4.0 },
  { id: "5", code: "VEN-005", name: "☆☆設備", type: "外注", phone: "03-5555-5555", rating: 4.3 },
];

// 工種マスタ
const workTypeMaster = [
  { id: "1", code: "WRK-001", name: "外壁塗装", laborRate: 35000, defaultMargin: 30 },
  { id: "2", code: "WRK-002", name: "屋根塗装", laborRate: 38000, defaultMargin: 30 },
  { id: "3", code: "WRK-003", name: "足場設置", laborRate: 25000, defaultMargin: 25 },
  { id: "4", code: "WRK-004", name: "高圧洗浄", laborRate: 30000, defaultMargin: 35 },
  { id: "5", code: "WRK-005", name: "コーキング", laborRate: 32000, defaultMargin: 30 },
  { id: "6", code: "WRK-006", name: "内装クロス", laborRate: 28000, defaultMargin: 28 },
  { id: "7", code: "WRK-007", name: "床張替え", laborRate: 30000, defaultMargin: 28 },
];

// タグマスタ
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">マスタ管理</h1>
          <p className="text-muted-foreground">材料・業者・工種等のマスタデータ管理</p>
        </div>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            材料マスタ
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            業者マスタ
          </TabsTrigger>
          <TabsTrigger value="worktypes" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            工種マスタ
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
                  <CardDescription>見積で使用する材料の単価マスタ</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="材料名で検索..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新規登録
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>材料マスタ登録</DialogTitle>
                        <DialogDescription>新しい材料を登録します</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>材料コード</Label>
                            <Input placeholder="MAT-XXX" />
                          </div>
                          <div className="space-y-2">
                            <Label>カテゴリ</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paint">塗料</SelectItem>
                                <SelectItem value="sub">副資材</SelectItem>
                                <SelectItem value="exterior">外壁材</SelectItem>
                                <SelectItem value="roof">屋根材</SelectItem>
                                <SelectItem value="insulation">断熱材</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>材料名</Label>
                          <Input placeholder="シリコン塗料（上塗り）" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>単位</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="can">缶</SelectItem>
                                <SelectItem value="piece">本</SelectItem>
                                <SelectItem value="roll">ロール</SelectItem>
                                <SelectItem value="m2">㎡</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>単価</Label>
                            <Input type="number" placeholder="28000" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={() => setIsDialogOpen(false)}>登録</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>材料名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>単位</TableHead>
                    <TableHead className="text-right">単価</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialMaster.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-mono text-sm">{material.code}</TableCell>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.category}</Badge>
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="text-right">
                        ¥{material.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>業者マスタ</CardTitle>
                  <CardDescription>取引先業者の管理</CardDescription>
                </div>
                <Button>
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

        {/* Work Types Tab */}
        <TabsContent value="worktypes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>工種マスタ</CardTitle>
                  <CardDescription>工種ごとの労務単価・標準利益率</CardDescription>
                </div>
                <Button>
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
                    <TableHead>工種名</TableHead>
                    <TableHead className="text-right">労務単価（人工）</TableHead>
                    <TableHead className="text-right">標準利益率</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workTypeMaster.map((workType) => (
                    <TableRow key={workType.id}>
                      <TableCell className="font-mono text-sm">{workType.code}</TableCell>
                      <TableCell className="font-medium">{workType.name}</TableCell>
                      <TableCell className="text-right">
                        ¥{workType.laborRate.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{workType.defaultMargin}%</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>タグマスタ</CardTitle>
                  <CardDescription>顧客・案件に付けるタグの管理</CardDescription>
                </div>
                <Button>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
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
