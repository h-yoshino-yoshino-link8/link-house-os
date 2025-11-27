"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Shield,
  Save,
  Upload,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function CompanySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // 保存処理をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">会社情報設定</h1>
          <p className="text-muted-foreground">会社の基本情報・各種設定</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "保存中..." : "保存"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              基本情報
            </CardTitle>
            <CardDescription>会社の基本情報を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">会社名</Label>
                <Input id="companyName" defaultValue="株式会社LinK" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNameKana">会社名（フリガナ）</Label>
                <Input id="companyNameKana" defaultValue="カブシキガイシャリンク" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="representativeName">代表者名</Label>
                <Input id="representativeName" defaultValue="山田太郎" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">設立年</Label>
                <Input id="establishedYear" type="number" defaultValue="2015" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">事業内容</Label>
              <Textarea
                id="businessDescription"
                defaultValue="住宅リフォーム工事、外壁塗装、屋根工事、内装工事"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              連絡先情報
            </CardTitle>
            <CardDescription>連絡先・所在地情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">郵便番号</Label>
              <Input id="postalCode" defaultValue="150-0001" className="w-40" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                defaultValue="東京都渋谷区神宮前1-2-3 ○○ビル5F"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input id="phone" defaultValue="03-1234-5678" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">FAX番号</Label>
                <Input id="fax" defaultValue="03-1234-5679" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue="info@link-house.co.jp" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">ウェブサイト</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input id="website" defaultValue="https://link-house.co.jp" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              許可・資格情報
            </CardTitle>
            <CardDescription>建設業許可等の情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="constructionLicense">建設業許可番号</Label>
                <Input
                  id="constructionLicense"
                  defaultValue="東京都知事許可（般-○）第123456号"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">許可期限</Label>
                <Input id="licenseExpiry" type="date" defaultValue="2028-03-31" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications">保有資格</Label>
              <Textarea
                id="qualifications"
                defaultValue="一級建築士、二級建築施工管理技士、塗装技能士"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">加入保険</Label>
              <Textarea
                id="insurance"
                defaultValue="建設工事保険、賠償責任保険、労災保険"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              振込先情報
            </CardTitle>
            <CardDescription>請求書に記載する振込先</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankName">銀行名</Label>
                <Input id="bankName" defaultValue="○○銀行" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName">支店名</Label>
                <Input id="branchName" defaultValue="渋谷支店" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accountType">口座種別</Label>
                <Select defaultValue="ordinary">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinary">普通</SelectItem>
                    <SelectItem value="checking">当座</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">口座番号</Label>
                <Input id="accountNumber" defaultValue="1234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">口座名義</Label>
                <Input id="accountHolder" defaultValue="カ）リンク" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              書類設定
            </CardTitle>
            <CardDescription>見積書・請求書等の設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>会社ロゴ</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-48 items-center justify-center rounded-lg border-2 border-dashed">
                    <span className="text-sm text-muted-foreground">ロゴ未設定</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    アップロード
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>会社印</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed">
                    <span className="text-sm text-muted-foreground">印影未設定</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    アップロード
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimatePrefix">見積番号プレフィックス</Label>
                  <Input id="estimatePrefix" defaultValue="EST-" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectPrefix">案件番号プレフィックス</Label>
                  <Input id="projectPrefix" defaultValue="PRJ-" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPaymentTerms">標準支払条件</Label>
                <Input
                  id="defaultPaymentTerms"
                  defaultValue="工事完了後30日以内"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimateValidity">見積有効期限（日数）</Label>
                <Input
                  id="estimateValidity"
                  type="number"
                  defaultValue="30"
                  className="w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>システム設定</CardTitle>
            <CardDescription>システム全体の設定</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>メール通知</Label>
                <p className="text-sm text-muted-foreground">
                  重要なイベント時にメール通知を送信
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>ダークモード</Label>
                <p className="text-sm text-muted-foreground">
                  ダークモードを有効にする
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>自動バックアップ</Label>
                <p className="text-sm text-muted-foreground">
                  毎日深夜にデータを自動バックアップ
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
