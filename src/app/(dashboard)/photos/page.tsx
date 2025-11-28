"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Upload,
  Camera,
  Image,
  Grid,
  List,
  Download,
  Trash,
  Edit,
  Eye,
  MoreHorizontal,
  PenTool,
  Circle,
  ArrowRight,
  Type,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  ZoomIn,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { usePhotos, useDeletePhotos } from "@/hooks/use-photos";
import { useProjects } from "@/hooks/use-projects";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

// 写真カテゴリ
const PHOTO_CATEGORIES = {
  before: { label: "施工前", color: "bg-blue-100 text-blue-800" },
  during: { label: "施工中", color: "bg-yellow-100 text-yellow-800" },
  after: { label: "施工後", color: "bg-green-100 text-green-800" },
  inspection: { label: "検査", color: "bg-purple-100 text-purple-800" },
  issue: { label: "問題箇所", color: "bg-red-100 text-red-800" },
  material: { label: "資材", color: "bg-gray-100 text-gray-800" },
} as const;

export default function PhotosPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // APIからデータ取得
  const { data: photosData, isLoading, isError } = usePhotos({
    companyId,
    projectId: selectedProject !== "all" ? selectedProject : undefined,
    folder: selectedCategory !== "all" ? selectedCategory : undefined,
    page,
    limit: 20,
  });

  const { data: projectsData } = useProjects({
    companyId,
    limit: 100,
  });

  const deletePhotos = useDeletePhotos();

  const photos = photosData?.data ?? [];
  const stats = photosData?.stats;
  const pagination = photosData?.pagination;
  const projects = projectsData?.data ?? [];

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const openViewer = (photoId: string) => {
    setSelectedPhotoId(photoId);
    setIsViewerOpen(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.length === 0) return;
    if (!confirm(`${selectedPhotos.length}枚の写真を削除しますか？`)) return;

    try {
      await deletePhotos.mutateAsync(selectedPhotos);
      toast.success(`${selectedPhotos.length}枚の写真を削除しました`);
      setSelectedPhotos([]);
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

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
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
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
            <div className="text-2xl font-bold">{stats?.total ?? 0}枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工前
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byFolder?.before ?? 0}枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byFolder?.during ?? 0}枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              施工後
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.byFolder?.after ?? 0}枚</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              注釈付き
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.annotated ?? 0}枚</div>
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
          <Select value={selectedProject} onValueChange={(v) => { setSelectedProject(v); setPage(1); }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="案件" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての案件</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setPage(1); }}>
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
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={handleDeleteSelected}
                disabled={deletePhotos.isPending}
              >
                {deletePhotos.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4 mr-1" />
                )}
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
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : photos.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          写真がありません
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const categoryInfo = PHOTO_CATEGORIES[photo.category as keyof typeof PHOTO_CATEGORIES];
            const isSelected = selectedPhotos.includes(photo.id);
            return (
              <Card
                key={photo.id}
                className={`overflow-hidden cursor-pointer group ${isSelected ? "ring-2 ring-primary" : ""}`}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {photo.thumbnailUrl ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Image className="h-12 w-12" />
                    </div>
                  )}
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePhotoSelection(photo.id)}
                      className="bg-white"
                    />
                  </div>
                  {/* Category Badge */}
                  {categoryInfo && (
                    <Badge className={`absolute top-2 right-2 ${categoryInfo.color}`}>
                      {categoryInfo.label}
                    </Badge>
                  )}
                  {/* Annotations Indicator */}
                  {photo.hasAnnotations && (
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <PenTool className="h-3 w-3" />
                    </div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openViewer(photo.id)}>
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
                  {photo.takenAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(photo.takenAt)}
                    </p>
                  )}
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
                {photos.map((photo) => {
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
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                            {photo.thumbnailUrl ? (
                              <img src={photo.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                            ) : (
                              <Image className="h-6 w-6 text-muted-foreground" />
                            )}
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
                      </td>
                      <td className="p-3 text-sm">{photo.projectName}</td>
                      <td className="p-3">
                        {categoryInfo && (
                          <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {photo.takenAt && formatDate(photo.takenAt)}
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewer(photo.id)}>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
                <div className="w-full h-full flex items-center justify-center">
                  {selectedPhoto?.url ? (
                    <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="bg-muted rounded-lg w-[600px] h-[400px] flex items-center justify-center">
                      <Image className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
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
                      <span className="text-muted-foreground">案件</span>
                      <span>{selectedPhoto?.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">撮影日</span>
                      <span>{selectedPhoto?.takenAt && formatDate(selectedPhoto.takenAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">カテゴリ</span>
                      {selectedPhoto?.category && (
                        <Badge className={PHOTO_CATEGORIES[selectedPhoto.category as keyof typeof PHOTO_CATEGORIES]?.color}>
                          {PHOTO_CATEGORIES[selectedPhoto.category as keyof typeof PHOTO_CATEGORIES]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">説明</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPhoto?.caption || "説明なし"}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">注釈</h4>
                  {selectedPhoto?.hasAnnotations ? (
                    <p className="text-sm text-muted-foreground">注釈があります</p>
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
