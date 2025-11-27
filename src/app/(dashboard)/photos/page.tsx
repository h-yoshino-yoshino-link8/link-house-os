"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Upload,
  Camera,
  Image,
  FolderOpen,
  Grid,
  List,
  Download,
  Trash,
  Edit,
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin,
  Tag,
  FileText,
  ZoomIn,
  PenTool,
  Circle,
  ArrowRight,
  Type,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 写真カテゴリ
const PHOTO_CATEGORIES = {
  before: { label: "施工前", color: "bg-blue-100 text-blue-800" },
  during: { label: "施工中", color: "bg-yellow-100 text-yellow-800" },
  after: { label: "施工後", color: "bg-green-100 text-green-800" },
  inspection: { label: "検査", color: "bg-purple-100 text-purple-800" },
  issue: { label: "問題箇所", color: "bg-red-100 text-red-800" },
  material: { label: "資材", color: "bg-gray-100 text-gray-800" },
} as const;

// デモデータ
const projects = [
  { id: "1", name: "山田邸 キッチンリフォーム", photoCount: 48 },
  { id: "2", name: "佐藤邸 外壁塗装", photoCount: 124 },
  { id: "3", name: "田中邸 浴室リフォーム", photoCount: 36 },
];

const photos = [
  {
    id: "1",
    projectId: "1",
    projectName: "山田邸 キッチンリフォーム",
    filename: "kitchen_before_01.jpg",
    category: "before",
    title: "キッチン全景（施工前）",
    description: "施工前のキッチン全体写真",
    takenAt: new Date("2024-10-01"),
    uploadedAt: new Date("2024-10-01"),
    hasAnnotations: false,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "2",
    projectId: "1",
    projectName: "山田邸 キッチンリフォーム",
    filename: "kitchen_before_02.jpg",
    category: "before",
    title: "シンク周り（施工前）",
    description: "シンク周りの状態確認",
    takenAt: new Date("2024-10-01"),
    uploadedAt: new Date("2024-10-01"),
    hasAnnotations: true,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "3",
    projectId: "1",
    projectName: "山田邸 キッチンリフォーム",
    filename: "kitchen_during_01.jpg",
    category: "during",
    title: "配管工事中",
    description: "給排水配管の入替作業",
    takenAt: new Date("2024-10-15"),
    uploadedAt: new Date("2024-10-15"),
    hasAnnotations: true,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "4",
    projectId: "1",
    projectName: "山田邸 キッチンリフォーム",
    filename: "kitchen_issue_01.jpg",
    category: "issue",
    title: "壁内配管腐食",
    description: "壁内の配管に腐食を発見。交換が必要。",
    takenAt: new Date("2024-10-16"),
    uploadedAt: new Date("2024-10-16"),
    hasAnnotations: true,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "5",
    projectId: "1",
    projectName: "山田邸 キッチンリフォーム",
    filename: "kitchen_after_01.jpg",
    category: "after",
    title: "キッチン全景（施工後）",
    description: "施工完了後のキッチン全体写真",
    takenAt: new Date("2024-11-01"),
    uploadedAt: new Date("2024-11-01"),
    hasAnnotations: false,
    thumbnail: "/api/placeholder/400/300",
  },
  {
    id: "6",
    projectId: "2",
    projectName: "佐藤邸 外壁塗装",
    filename: "wall_before_01.jpg",
    category: "before",
    title: "外壁南面（施工前）",
    description: "南面の外壁状態",
    takenAt: new Date("2024-09-15"),
    uploadedAt: new Date("2024-09-15"),
    hasAnnotations: false,
    thumbnail: "/api/placeholder/400/300",
  },
];

export default function PhotosPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const filteredPhotos = photos.filter(photo => {
    if (selectedProject !== "all" && photo.projectId !== selectedProject) return false;
    if (selectedCategory !== "all" && photo.category !== selectedCategory) return false;
    return true;
  });

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const openViewer = (photo: typeof photos[0]) => {
    setSelectedPhoto(photo);
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">写真管理</h1>
          <p className="text-muted-foreground">工事写真のアップロード・整理・注釈</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                アップロード
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>写真アップロード</DialogTitle>
                <DialogDescription>
                  工事写真をアップロードします
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    ドラッグ&ドロップまたはクリックしてファイルを選択
                  </p>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    ファイルを選択
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, HEIC（最大50MB/ファイル）
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">案件</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="案件を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">カテゴリ</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PHOTO_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>
                  アップロード
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総写真数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月アップロード
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">186枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              注釈付き
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">324枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              問題箇所
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">18枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              使用容量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2GB</div>
            <p className="text-xs text-muted-foreground">/10GB</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ファイル名・説明で検索..." className="pl-9" />
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="案件" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての案件</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {Object.entries(PHOTO_CATEGORIES).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedPhotos.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedPhotos.length}枚選択中
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                一括DL
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <Trash className="h-4 w-4 mr-1" />
                削除
              </Button>
            </>
          )}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Photo Grid / List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPhotos.map((photo) => {
            const categoryInfo = PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES];
            const isSelected = selectedPhotos.includes(photo.id);
            return (
              <Card
                key={photo.id}
                className={`overflow-hidden cursor-pointer group ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Image className="h-12 w-12" />
                  </div>
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePhotoSelection(photo.id)}
                      className="bg-white"
                    />
                  </div>
                  {/* Category Badge */}
                  <Badge className={`absolute top-2 right-2 ${categoryInfo?.color}`}>
                    {categoryInfo?.label}
                  </Badge>
                  {/* Annotations Indicator */}
                  {photo.hasAnnotations && (
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <PenTool className="h-3 w-3" />
                    </div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openViewer(photo)}>
                      <Eye className="h-4 w-4 mr-1" />
                      表示
                    </Button>
                    <Button size="sm" variant="secondary">
                      <PenTool className="h-4 w-4 mr-1" />
                      注釈
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{photo.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{photo.projectName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(photo.takenAt, "yyyy/MM/dd")}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left w-8">
                    <Checkbox />
                  </th>
                  <th className="p-3 text-left">写真</th>
                  <th className="p-3 text-left">タイトル</th>
                  <th className="p-3 text-left">案件</th>
                  <th className="p-3 text-left">カテゴリ</th>
                  <th className="p-3 text-left">撮影日</th>
                  <th className="p-3 text-left w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPhotos.map((photo) => {
                  const categoryInfo = PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES];
                  return (
                    <tr key={photo.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedPhotos.includes(photo.id)}
                          onCheckedChange={() => togglePhotoSelection(photo.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                          {photo.hasAnnotations && (
                            <Badge variant="outline" className="text-xs">
                              <PenTool className="h-3 w-3 mr-1" />
                              注釈
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{photo.title}</p>
                        <p className="text-xs text-muted-foreground">{photo.filename}</p>
                      </td>
                      <td className="p-3 text-sm">{photo.projectName}</td>
                      <td className="p-3">
                        <Badge className={categoryInfo?.color}>{categoryInfo?.label}</Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {format(photo.takenAt, "yyyy/MM/dd")}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewer(photo)}>
                              <Eye className="h-4 w-4 mr-2" />
                              表示
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <PenTool className="h-4 w-4 mr-2" />
                              注釈を追加
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              ダウンロード
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Photo Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Main Image Area */}
            <div className="flex-1 bg-black flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-black/80 text-white">
                <div>
                  <h3 className="font-medium">{selectedPhoto?.title}</h3>
                  <p className="text-sm text-gray-400">{selectedPhoto?.projectName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Maximize className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsViewerOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="bg-muted rounded-lg w-[600px] h-[400px] flex items-center justify-center">
                    <Image className="h-24 w-24 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>

              {/* Annotation Tools */}
              <div className="p-4 bg-black/80 flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  矢印
                </Button>
                <Button variant="secondary" size="sm">
                  <Circle className="h-4 w-4 mr-1" />
                  円
                </Button>
                <Button variant="secondary" size="sm">
                  <Type className="h-4 w-4 mr-1" />
                  テキスト
                </Button>
                <Button variant="secondary" size="sm">
                  <PenTool className="h-4 w-4 mr-1" />
                  フリーハンド
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-background border-l overflow-y-auto">
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">写真情報</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ファイル名</span>
                      <span>{selectedPhoto?.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">撮影日</span>
                      <span>{selectedPhoto && format(selectedPhoto.takenAt, "yyyy/MM/dd")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">カテゴリ</span>
                      <Badge className={selectedPhoto ? PHOTO_CATEGORIES[selectedPhoto.category as keyof typeof PHOTO_CATEGORIES]?.color : ""}>
                        {selectedPhoto && PHOTO_CATEGORIES[selectedPhoto.category as keyof typeof PHOTO_CATEGORIES]?.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">説明</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPhoto?.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">注釈</h4>
                  {selectedPhoto?.hasAnnotations ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowRight className="h-3 w-3 text-red-500" />
                          <span className="font-medium">矢印 #1</span>
                        </div>
                        <p className="text-xs text-muted-foreground">腐食箇所を指示</p>
                      </div>
                      <div className="p-2 bg-muted rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">円 #1</span>
                        </div>
                        <p className="text-xs text-muted-foreground">要交換箇所</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">注釈はありません</p>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    ダウンロード
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    工事台帳に追加
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
