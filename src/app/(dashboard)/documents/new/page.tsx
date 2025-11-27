"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Send,
  Download,
  Eye,
  FileCheck,
  Shield,
  Scale,
  AlertTriangle,
  CheckCircle,
  Building,
  User,
  Calendar,
  Banknote,
  Stamp,
  PenTool,
  Info,
} from "lucide-react";

// 2025年民法改正対応項目
const CIVIL_LAW_2025_ITEMS = [
  {
    id: "defect_liability",
    title: "契約不適合責任",
    description: "従来の「瑕疵担保責任」から「契約不適合責任」への変更に対応",
    required: true,
    checked: true,
  },
  {
    id: "notification_period",
    title: "通知期間の明記",
    description: "契約不適合を知った時から1年以内の通知義務を明記",
    required: true,
    checked: true,
  },
  {
    id: "remedy_options",
    title: "追完請求・代金減額請求",
    description: "修補・代替物の追完請求権、代金減額請求権を明記",
    required: true,
    checked: true,
  },
  {
    id: "cancellation_terms",
    title: "解除条件",
    description: "催告解除・無催告解除の条件を明確化",
    required: true,
    checked: true,
  },
  {
    id: "prescription",
    title: "消滅時効",
    description: "権利行使可能時から10年、知った時から5年の消滅時効",
    required: true,
    checked: true,
  },
  {
    id: "antisocial_clause",
    title: "反社会的勢力排除条項",
    description: "暴力団等の反社会的勢力でないことの表明保証",
    required: false,
    checked: true,
  },
  {
    id: "privacy_policy",
    title: "個人情報保護条項",
    description: "個人情報の取扱いに関する条項",
    required: false,
    checked: true,
  },
];

// デモ：見積データ
const estimateData = {
  id: "E-2024-001",
  title: "キッチンリフォーム工事",
  customer: {
    id: "1",
    name: "山田太郎",
    address: "東京都渋谷区○○1-2-3",
    phone: "090-1234-5678",
    email: "yamada@example.com",
  },
  house: {
    id: "1",
    address: "東京都渋谷区○○1-2-3",
    structureType: "木造",
    floors: 2,
    builtYear: 2010,
  },
  amount: 2850000,
  tax: 285000,
  total: 3135000,
  details: [
    { name: "システムキッチン LIXIL シエラ", amount: 680000 },
    { name: "施工費（取外し・取付け）", amount: 180000 },
    { name: "給排水工事", amount: 120000 },
    { name: "電気工事", amount: 85000 },
    { name: "内装工事（クロス・床）", amount: 220000 },
    { name: "解体・産廃処分", amount: 95000 },
    { name: "諸経費", amount: 50000 },
  ],
};

export default function NewDocumentPage() {
  const [formData, setFormData] = useState({
    title: `${estimateData.title} 請負契約書`,
    projectId: "",
    customerId: estimateData.customer.id,
    estimateId: estimateData.id,
    workPeriodStart: "",
    workPeriodEnd: "",
    paymentTerms: "completion", // completion, split, custom
    paymentSchedule: [] as { timing: string; amount: number; percentage: number }[],
    warrantyPeriod: "2",
    defectLiabilityPeriod: "10",
    notes: "",
    specialTerms: "",
  });

  const [legalChecklist, setLegalChecklist] = useState(
    CIVIL_LAW_2025_ITEMS.map(item => ({ ...item }))
  );

  const [preview, setPreview] = useState(false);

  const updateChecklistItem = (id: string, checked: boolean) => {
    setLegalChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, checked } : item)
    );
  };

  const allRequiredChecked = legalChecklist
    .filter(item => item.required)
    .every(item => item.checked);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/documents">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">契約書作成</h1>
            <p className="text-muted-foreground">2025年民法改正対応テンプレート</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="mr-2 h-4 w-4" />
            プレビュー
          </Button>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            下書き保存
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            PDF出力
          </Button>
          <Button disabled={!allRequiredChecked}>
            <PenTool className="mr-2 h-4 w-4" />
            電子署名を依頼
          </Button>
        </div>
      </div>

      {/* 2025年民法対応ステータス */}
      <Card className={allRequiredChecked ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
        <CardContent className="flex items-center gap-4 py-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${allRequiredChecked ? "bg-green-100" : "bg-yellow-100"}`}>
            {allRequiredChecked ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">
              {allRequiredChecked
                ? "2025年民法改正に完全対応しています"
                : "必須項目が未チェックです"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {allRequiredChecked
                ? "契約不適合責任、解除条件等すべての改正項目が含まれています"
                : "すべての必須項目をチェックしてください"}
            </p>
          </div>
          <Badge variant={allRequiredChecked ? "default" : "secondary"}>
            <Shield className="h-3 w-3 mr-1" />
            {legalChecklist.filter(i => i.checked).length}/{legalChecklist.length} チェック済
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>契約書タイトル</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>見積書</Label>
                  <Select defaultValue={estimateData.id}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={estimateData.id}>
                        {estimateData.id} - {estimateData.title}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>契約金額</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`¥${estimateData.total.toLocaleString()}`}
                      readOnly
                      className="bg-muted"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      （税込）
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 発注者情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                発注者（甲）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>氏名</Label>
                  <Input value={estimateData.customer.name} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>電話番号</Label>
                  <Input value={estimateData.customer.phone} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>住所</Label>
                <Input value={estimateData.customer.address} readOnly className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* 工事情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                工事情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>工事場所</Label>
                <Input value={estimateData.house.address} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>工事着工日</Label>
                  <Input
                    type="date"
                    value={formData.workPeriodStart}
                    onChange={(e) => setFormData({ ...formData, workPeriodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>工事完了予定日</Label>
                  <Input
                    type="date"
                    value={formData.workPeriodEnd}
                    onChange={(e) => setFormData({ ...formData, workPeriodEnd: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 支払条件 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                支払条件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>支払方法</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completion">完成払い（工事完了後一括）</SelectItem>
                    <SelectItem value="split">分割払い（着工時・完了時）</SelectItem>
                    <SelectItem value="custom">カスタム</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentTerms === "split" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium">着工時</p>
                      <p className="text-2xl font-bold">¥{Math.floor(estimateData.total * 0.5).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">50%</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium">完了時</p>
                      <p className="text-2xl font-bold">¥{Math.ceil(estimateData.total * 0.5).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">50%</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 保証・責任期間 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                保証・責任期間
              </CardTitle>
              <CardDescription>
                2025年民法改正により「瑕疵担保責任」から「契約不適合責任」に変更
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>保証期間</Label>
                  <Select
                    value={formData.warrantyPeriod}
                    onValueChange={(value) => setFormData({ ...formData, warrantyPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1年</SelectItem>
                      <SelectItem value="2">2年</SelectItem>
                      <SelectItem value="3">3年</SelectItem>
                      <SelectItem value="5">5年</SelectItem>
                      <SelectItem value="10">10年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>契約不適合責任期間</Label>
                  <Select
                    value={formData.defectLiabilityPeriod}
                    onValueChange={(value) => setFormData({ ...formData, defectLiabilityPeriod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5年（知った時から）</SelectItem>
                      <SelectItem value="10">10年（引渡しから）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-md bg-blue-50 p-4 text-sm">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">契約不適合責任について</p>
                    <p className="text-blue-700 mt-1">
                      発注者は、目的物が契約内容に適合しない場合、修補・代替物の追完請求、
                      代金減額請求、損害賠償請求、契約解除をすることができます。
                      ただし、不適合を知った時から1年以内に通知する必要があります。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 特記事項 */}
          <Card>
            <CardHeader>
              <CardTitle>特記事項</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>備考・特記事項</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="工事に関する特記事項を入力..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>特約条項</Label>
                <Textarea
                  value={formData.specialTerms}
                  onChange={(e) => setFormData({ ...formData, specialTerms: e.target.value })}
                  placeholder="特約条項がある場合は入力..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Legal Checklist */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                法的チェックリスト
              </CardTitle>
              <CardDescription>
                2025年民法改正対応項目
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {legalChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.checked ? "bg-green-50" : item.required ? "bg-red-50" : "bg-gray-50"
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={(checked) => updateChecklistItem(item.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      {item.title}
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">必須</Badge>
                      )}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>チェック済み</span>
                  <span className="font-bold">
                    {legalChecklist.filter(i => i.checked).length}/{legalChecklist.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>必須項目</span>
                  <span className={`font-bold ${allRequiredChecked ? "text-green-600" : "text-red-600"}`}>
                    {legalChecklist.filter(i => i.required && i.checked).length}/
                    {legalChecklist.filter(i => i.required).length}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!allRequiredChecked}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                法的チェック完了
              </Button>
            </CardContent>
          </Card>

          {/* 工事内訳 */}
          <Card>
            <CardHeader>
              <CardTitle>工事内訳</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estimateData.details.map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{detail.name}</span>
                    <span>¥{detail.amount.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>小計</span>
                  <span>¥{estimateData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>消費税（10%）</span>
                  <span>¥{estimateData.tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>合計</span>
                  <span>¥{estimateData.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
