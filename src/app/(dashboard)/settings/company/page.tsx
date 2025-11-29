"use client";

import { useState, useEffect } from "react";
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
  Globe,
  FileText,
  Shield,
  Save,
  Upload,
  Banknote,
  Loader2,
} from "lucide-react";
import { useCompany, useUpdateCompany, BankInfo, DocumentSettings } from "@/hooks/use-company";
import { useAppStore, DEMO_COMPANY_ID } from "@/stores/app-store";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const companyId = useAppStore((state) => state.companyId) || DEMO_COMPANY_ID;
  const { data: company, isLoading } = useCompany(companyId);
  const updateCompany = useUpdateCompany(companyId);

  // フォーム状態
  const [formData, setFormData] = useState({
    name: "",
    nameKana: "",
    representativeName: "",
    establishedYear: "",
    businessDescription: "",
    postalCode: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    licenseNumber: "",
    licenseExpiry: "",
    qualifications: "",
    insurance: "",
  });

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    branchName: "",
    accountType: "ordinary",
    accountNumber: "",
    accountHolder: "",
  });

  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>({
    estimatePrefix: "EST-",
    projectPrefix: "PRJ-",
    invoicePrefix: "INV-",
    defaultPaymentTerms: "工事完了後30日以内",
    estimateValidityDays: 30,
  });

  // データ読み込み時にフォームを更新
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        nameKana: company.nameKana || "",
        representativeName: company.representativeName || "",
        establishedYear: company.establishedYear?.toString() || "",
        businessDescription: company.businessDescription || "",
        postalCode: company.postalCode || "",
        address: company.address || "",
        phone: company.phone || "",
        fax: company.fax || "",
        email: company.email || "",
        website: company.website || "",
        licenseNumber: company.licenseNumber || "",
        licenseExpiry: company.licenseExpiry?.split("T")[0] || "",
        qualifications: company.qualifications || "",
        insurance: company.insurance || "",
      });
      if (company.bankInfo) {
        setBankInfo(company.bankInfo);
      }
      if (company.documentSettings) {
        setDocumentSettings(company.documentSettings);
      }
    }
  }, [company]);

  const handleSave = async () => {
    try {
      await updateCompany.mutateAsync({
        ...formData,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear) : undefined,
        bankInfo,
        documentSettings,
      });
      toast.success("会社情報を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">会社情報設定</h1>
          <p className="text-muted-foreground">会社の基本情報・各種設定</p>
        </div>
        <Button onClick={handleSave} disabled={updateCompany.isPending}>
          {updateCompany.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {updateCompany.isPending ? "保存中..." : "保存"}
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
                <Input
                  id="companyName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyNameKana">会社名（フリガナ）</Label>
                <Input
                  id="companyNameKana"
                  value={formData.nameKana}
                  onChange={(e) => setFormData({ ...formData, nameKana: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="representativeName">代表者名</Label>
                <Input
                  id="representativeName"
                  value={formData.representativeName}
                  onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">設立年</Label>
                <Input
                  id="establishedYear"
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">事業内容</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
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
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">FAX番号</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">ウェブサイト</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
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
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">許可期限</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications">保有資格</Label>
              <Textarea
                id="qualifications"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">加入保険</Label>
              <Textarea
                id="insurance"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
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
                <Input
                  id="bankName"
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName">支店名</Label>
                <Input
                  id="branchName"
                  value={bankInfo.branchName}
                  onChange={(e) => setBankInfo({ ...bankInfo, branchName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accountType">口座種別</Label>
                <Select
                  value={bankInfo.accountType}
                  onValueChange={(value: "ordinary" | "checking") =>
                    setBankInfo({ ...bankInfo, accountType: value })
                  }
                >
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
                <Input
                  id="accountNumber"
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolder">口座名義</Label>
                <Input
                  id="accountHolder"
                  value={bankInfo.accountHolder}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                />
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="estimatePrefix">見積番号プレフィックス</Label>
                  <Input
                    id="estimatePrefix"
                    value={documentSettings.estimatePrefix}
                    onChange={(e) =>
                      setDocumentSettings({ ...documentSettings, estimatePrefix: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectPrefix">案件番号プレフィックス</Label>
                  <Input
                    id="projectPrefix"
                    value={documentSettings.projectPrefix}
                    onChange={(e) =>
                      setDocumentSettings({ ...documentSettings, projectPrefix: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">請求番号プレフィックス</Label>
                  <Input
                    id="invoicePrefix"
                    value={documentSettings.invoicePrefix}
                    onChange={(e) =>
                      setDocumentSettings({ ...documentSettings, invoicePrefix: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultPaymentTerms">標準支払条件</Label>
                <Input
                  id="defaultPaymentTerms"
                  value={documentSettings.defaultPaymentTerms}
                  onChange={(e) =>
                    setDocumentSettings({ ...documentSettings, defaultPaymentTerms: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimateValidity">見積有効期限（日数）</Label>
                <Input
                  id="estimateValidity"
                  type="number"
                  value={documentSettings.estimateValidityDays}
                  onChange={(e) =>
                    setDocumentSettings({
                      ...documentSettings,
                      estimateValidityDays: parseInt(e.target.value) || 30,
                    })
                  }
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
