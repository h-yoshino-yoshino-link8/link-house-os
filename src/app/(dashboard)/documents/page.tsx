"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  FileCheck,
  FileWarning,
  Send,
  Download,
  Eye,
  Edit,
  Copy,
  Trash,
  Stamp,
  PenTool,
  Shield,
  Scale,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 書類タイプ
const DOCUMENT_TYPES = {
  contract: { label: "請負契約書", icon: FileCheck, color: "bg-blue-100 text-blue-800" },
  notice: { label: "工事お知らせ", icon: FileWarning, color: "bg-yellow-100 text-yellow-800" },
  specification: { label: "仕様書", icon: FileText, color: "bg-green-100 text-green-800" },
  estimate: { label: "見積書", icon: FileText, color: "bg-purple-100 text-purple-800" },
  invoice: { label: "請求書", icon: FileText, color: "bg-orange-100 text-orange-800" },
  completion: { label: "完工報告書", icon: FileCheck, color: "bg-emerald-100 text-emerald-800" },
} as const;

// 書類ステータス
const DOCUMENT_STATUS = {
  draft: { label: "下書き", color: "bg-gray-100 text-gray-800" },
  pending: { label: "確認待ち", color: "bg-yellow-100 text-yellow-800" },
  sent: { label: "送付済", color: "bg-blue-100 text-blue-800" },
  signed: { label: "締結済", color: "bg-green-100 text-green-800" },
  rejected: { label: "差戻し", color: "bg-red-100 text-red-800" },
} as const;

// デモデータ
const documents = [
  {
    id: "1",
    type: "contract",
    title: "キッチンリフォーム工事 請負契約書",
    projectId: "P-2024-001",
    projectName: "山田邸 キッチンリフォーム",
    customerName: "山田太郎 様",
    status: "signed",
    amount: 2850000,
    createdAt: new Date("2024-10-15"),
    signedAt: new Date("2024-10-18"),
    legalCheck: true,
    civilLaw2025: true,
  },
  {
    id: "2",
    type: "notice",
    title: "外壁塗装工事のお知らせ",
    projectId: "P-2024-002",
    projectName: "佐藤邸 外壁塗装",
    customerName: "佐藤建設 様",
    status: "sent",
    amount: null,
    createdAt: new Date("2024-11-01"),
    signedAt: null,
    legalCheck: false,
    civilLaw2025: false,
  },
  {
    id: "3",
    type: "specification",
    title: "浴室リフォーム仕様書",
    projectId: "P-2024-003",
    projectName: "田中邸 浴室リフォーム",
    customerName: "田中花子 様",
    status: "pending",
    amount: null,
    createdAt: new Date("2024-11-10"),
    signedAt: null,
    legalCheck: false,
    civilLaw2025: false,
  },
  {
    id: "4",
    type: "contract",
    title: "屋根葺替え工事 請負契約書",
    projectId: "P-2024-004",
    projectName: "鈴木邸 屋根葺替え",
    customerName: "鈴木一郎 様",
    status: "draft",
    amount: 1980000,
    createdAt: new Date("2024-11-15"),
    signedAt: null,
    legalCheck: true,
    civilLaw2025: true,
  },
  {
    id: "5",
    type: "completion",
    title: "キッチンリフォーム工事 完工報告書",
    projectId: "P-2024-001",
    projectName: "山田邸 キッチンリフォーム",
    customerName: "山田太郎 様",
    status: "signed",
    amount: null,
    createdAt: new Date("2024-11-20"),
    signedAt: new Date("2024-11-22"),
    legalCheck: false,
    civilLaw2025: false,
  },
];

// テンプレート
const templates = [
  {
    id: "1",
    name: "リフォーム工事請負契約書（2025年民法対応）",
    type: "contract",
    description: "2025年民法改正に完全対応。契約不適合責任、解除条件等を明記。",
    features: ["民法改正対応", "電子契約対応", "反社条項", "個人情報保護"],
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: "2",
    name: "新築工事請負契約書（2025年民法対応）",
    type: "contract",
    description: "新築工事向け。瑕疵担保から契約不適合責任への移行に対応。",
    features: ["民法改正対応", "住宅瑕疵保険連携", "工期遅延条項", "中間検査"],
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: "3",
    name: "工事お知らせ（近隣用）",
    type: "notice",
    description: "近隣住民向けの工事お知らせテンプレート。",
    features: ["地図挿入", "騒音・振動注意", "緊急連絡先", "工期表示"],
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: "4",
    name: "工事仕様書（詳細版）",
    type: "specification",
    description: "使用材料、工法、品質基準を詳細に記載。",
    features: ["材料仕様", "施工手順", "品質基準", "検査項目"],
    updatedAt: new Date("2024-10-01"),
  },
];

export default function DocumentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredDocuments = selectedType === "all"
    ? documents
    : documents.filter(doc => doc.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">書類作成</h1>
          <p className="text-muted-foreground">契約書・工事お知らせ・仕様書の作成・管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規書類作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>新規書類作成</DialogTitle>
              <DialogDescription>
                テンプレートを選択して書類を作成します
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => {
                  const TypeIcon = DOCUMENT_TYPES[template.type as keyof typeof DOCUMENT_TYPES]?.icon || FileText;
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setIsDialogOpen(false);
                        // ここで新規作成ページに遷移
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総書類数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              契約締結済
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">32件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              確認待ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              電子署名待ち
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              2025年民法対応
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2025年民法改正バナー */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">2025年民法改正対応済み</h3>
            <p className="text-sm text-muted-foreground">
              契約不適合責任、解除条件、消滅時効等、改正民法に完全対応したテンプレートを使用しています。
            </p>
          </div>
          <Button variant="outline" size="sm">
            詳細を見る
          </Button>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">書類一覧</TabsTrigger>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="書類名・案件名で検索..." className="pl-9" />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="種類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="contract">請負契約書</SelectItem>
                <SelectItem value="notice">工事お知らせ</SelectItem>
                <SelectItem value="specification">仕様書</SelectItem>
                <SelectItem value="completion">完工報告書</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="pending">確認待ち</SelectItem>
                <SelectItem value="sent">送付済</SelectItem>
                <SelectItem value="signed">締結済</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>書類</TableHead>
                    <TableHead>案件</TableHead>
                    <TableHead>顧客</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>法的チェック</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const typeInfo = DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES];
                    const statusInfo = DOCUMENT_STATUS[doc.status as keyof typeof DOCUMENT_STATUS];
                    const TypeIcon = typeInfo?.icon || FileText;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded ${typeInfo?.color || "bg-gray-100"}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <Link
                                href={`/documents/${doc.id}`}
                                className="font-medium hover:underline"
                              >
                                {doc.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {typeInfo?.label}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{doc.projectName}</p>
                            <p className="text-xs text-muted-foreground">{doc.projectId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{doc.customerName}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo?.color}>
                            {statusInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {doc.legalCheck ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                確認済
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                未確認
                              </Badge>
                            )}
                            {doc.civilLaw2025 && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                2025対応
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(doc.createdAt, "yyyy/MM/dd", { locale: ja })}</p>
                            {doc.signedAt && (
                              <p className="text-xs text-green-600">
                                締結: {format(doc.signedAt, "MM/dd")}
                              </p>
                            )}
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
                                <Eye className="h-4 w-4 mr-2" />
                                プレビュー
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                PDF出力
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                送付
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PenTool className="h-4 w-4 mr-2" />
                                電子署名を依頼
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                複製
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => {
              const TypeIcon = DOCUMENT_TYPES[template.type as keyof typeof DOCUMENT_TYPES]?.icon || FileText;
              const typeInfo = DOCUMENT_TYPES[template.type as keyof typeof DOCUMENT_TYPES];
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${typeInfo?.color || "bg-gray-100"}`}>
                        <TypeIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        更新日: {format(template.updatedAt, "yyyy/MM/dd")}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          プレビュー
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          使用する
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
