"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ExternalLink,
  Download,
  CheckCircle,
  Calendar,
  User,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// デモデータ
const certificatesData = {
  house: {
    passportTokenId: "0x1234...abcd",
    builtYear: 2010,
    builder: "○○ハウス",
  },
  certificates: [
    {
      id: "1",
      tokenId: "0x1234...5678",
      workType: "内装リフォーム",
      workDate: new Date("2022-03-15"),
      contractor: "○○内装",
      contractorLicense: "東京都知事（般-30）第123456号",
      craftsmen: ["田中一郎（クロス職人・20年）", "佐藤次郎（床職人・15年）"],
      materials: ["サンゲツクロス SP-2151", "永大フローリング"],
      warranty: {
        years: 3,
        expires: new Date("2025-03-15"),
        coverage: "施工不良による剥がれ、浮きに対する無償補修",
      },
    },
    {
      id: "2",
      tokenId: "0x2345...6789",
      workType: "屋根塗装",
      workDate: new Date("2020-05-10"),
      contractor: "□□塗装",
      contractorLicense: "東京都知事（般-28）第234567号",
      craftsmen: ["高橋三郎（塗装職人・25年）"],
      materials: ["関西ペイント アレスアクアセラ"],
      warranty: {
        years: 5,
        expires: new Date("2025-05-10"),
        coverage: "塗膜の剥離、変色に対する無償補修",
      },
    },
    {
      id: "3",
      tokenId: "0x3456...7890",
      workType: "外壁塗装",
      workDate: new Date("2019-08-20"),
      contractor: "□□塗装",
      contractorLicense: "東京都知事（般-28）第234567号",
      craftsmen: ["高橋三郎（塗装職人・25年）", "山田四郎（足場職人・18年）"],
      materials: ["日本ペイント パーフェクトトップ"],
      warranty: {
        years: 5,
        expires: new Date("2024-08-20"),
        coverage: "塗膜の剥離、変色に対する無償補修",
      },
    },
  ],
};

const isWarrantyValid = (expires: Date) => expires > new Date();

export default function PortalCertificatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">施工証明NFT</h1>
        <p className="text-muted-foreground">
          ブロックチェーンに記録された施工証明を確認できます
        </p>
      </div>

      {/* House Passport */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            家のパスポート
          </CardTitle>
          <CardDescription>
            この家のデジタル身分証明
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  認証済
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {certificatesData.house.passportTokenId}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {certificatesData.house.builtYear}年築
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {certificatesData.house.builder}
                </span>
              </div>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              ブロックチェーンで確認
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificatesData.certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden">
            {/* Certificate Header Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
              <Shield className="h-16 w-16 text-white/80" />
              <Badge
                className={`absolute top-3 right-3 ${
                  isWarrantyValid(cert.warranty.expires)
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isWarrantyValid(cert.warranty.expires) ? "保証期間内" : "保証期間終了"}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-4">
              {/* Basic Info */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{cert.workType}</h3>
                  <Badge variant="outline">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                    認証済
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  施工日: {format(cert.workDate, "yyyy年M月d日", { locale: ja })}
                </p>
              </div>

              {/* Contractor Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{cert.contractor}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {cert.contractorLicense}
                </p>
              </div>

              {/* Craftsmen */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">担当職人</p>
                <div className="flex flex-wrap gap-1">
                  {cert.craftsmen.map((craftsman, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {craftsman}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">使用材料</p>
                <div className="flex flex-wrap gap-1">
                  {cert.materials.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Warranty */}
              <div
                className={`rounded-lg p-3 ${
                  isWarrantyValid(cert.warranty.expires)
                    ? "bg-green-50"
                    : "bg-gray-50"
                }`}
              >
                <p className="text-xs font-medium">
                  保証期間: {cert.warranty.years}年（〜{format(cert.warranty.expires, "yyyy年M月d日", { locale: ja })}）
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cert.warranty.coverage}
                </p>
              </div>

              {/* Token ID */}
              <p className="text-xs text-muted-foreground font-mono">
                Token: {cert.tokenId}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  確認
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-3 w-3" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">施工証明NFTについて</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            施工証明NFTは、工事の内容・担当職人・使用材料・保証内容をブロックチェーンに記録した
            改ざん不可能なデジタル証明書です。
          </p>
          <p>
            将来の売却時や、保険申請時の証明として活用できます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
