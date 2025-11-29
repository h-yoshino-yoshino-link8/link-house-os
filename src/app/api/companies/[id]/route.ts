import { NextRequest, NextResponse } from "next/server";
import { tryGetPrisma } from "@/lib/api-utils";

// デモ会社データ
const DEMO_COMPANY = {
  id: "demo-company",
  name: "株式会社LinK",
  nameKana: "カブシキガイシャリンク",
  representativeName: "山田太郎",
  establishedYear: 2015,
  businessDescription: "住宅リフォーム工事、外壁塗装、屋根工事、内装工事",
  postalCode: "150-0001",
  address: "東京都渋谷区神宮前1-2-3 ○○ビル5F",
  phone: "03-1234-5678",
  fax: "03-1234-5679",
  email: "info@link-house.co.jp",
  website: "https://link-house.co.jp",
  licenseNumber: "東京都知事許可（般-○）第123456号",
  licenseExpiry: "2028-03-31",
  qualifications: "一級建築士、二級建築施工管理技士、塗装技能士",
  insurance: "建設工事保険、賠償責任保険、労災保険",
  bankInfo: {
    bankName: "○○銀行",
    branchName: "渋谷支店",
    accountType: "ordinary",
    accountNumber: "1234567",
    accountHolder: "カ）リンク",
  },
  documentSettings: {
    estimatePrefix: "EST-",
    projectPrefix: "PRJ-",
    invoicePrefix: "INV-",
    defaultPaymentTerms: "工事完了後30日以内",
    estimateValidityDays: 30,
  },
  logoUrl: null,
  sealUrl: null,
};

// GET /api/companies/[id] - 会社情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json({ data: DEMO_COMPANY });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Failed to fetch company:", error);
    return NextResponse.json({ data: DEMO_COMPANY });
  }
}

// PUT /api/companies/[id] - 会社情報更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await tryGetPrisma();

  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available in demo mode" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      nameKana,
      representativeName,
      establishedYear,
      businessDescription,
      postalCode,
      address,
      phone,
      fax,
      email,
      website,
      licenseNumber,
      licenseExpiry,
      qualifications,
      insurance,
      bankInfo,
      documentSettings,
    } = body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameKana !== undefined && { nameKana }),
        ...(representativeName !== undefined && { representativeName }),
        ...(establishedYear !== undefined && { establishedYear: parseInt(establishedYear) || null }),
        ...(businessDescription !== undefined && { businessDescription }),
        ...(postalCode !== undefined && { postalCode }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(fax !== undefined && { fax }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(licenseNumber !== undefined && { licenseNumber }),
        ...(licenseExpiry !== undefined && { licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null }),
        ...(qualifications !== undefined && { qualifications }),
        ...(insurance !== undefined && { insurance }),
        ...(bankInfo !== undefined && { bankInfo }),
        ...(documentSettings !== undefined && { documentSettings }),
      },
    });

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Failed to update company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}
