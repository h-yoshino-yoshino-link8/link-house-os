import { NextRequest, NextResponse } from "next/server";

// 外部連携設定API
// 将来的な機能: 会計ソフト、CRM、電子契約、決済サービス等との連携

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "available" | "connected" | "coming_soon";
  iconUrl?: string;
}

// 利用可能な連携サービス一覧
const AVAILABLE_INTEGRATIONS: Integration[] = [
  // 会計ソフト
  {
    id: "freee",
    name: "freee会計",
    description: "見積・請求書・経費をfreeeと自動連携",
    category: "accounting",
    status: "coming_soon",
  },
  {
    id: "mfcloud",
    name: "マネーフォワードクラウド",
    description: "請求書・経費を自動同期",
    category: "accounting",
    status: "coming_soon",
  },
  {
    id: "yayoi",
    name: "弥生会計",
    description: "仕訳データの自動連携",
    category: "accounting",
    status: "coming_soon",
  },

  // CRM
  {
    id: "salesforce",
    name: "Salesforce",
    description: "顧客情報・案件を自動同期",
    category: "crm",
    status: "coming_soon",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "マーケティング・顧客管理を連携",
    category: "crm",
    status: "coming_soon",
  },

  // 電子契約
  {
    id: "cloudsign",
    name: "クラウドサイン",
    description: "見積確定時に電子契約を自動作成",
    category: "contract",
    status: "coming_soon",
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "電子署名・契約管理を連携",
    category: "contract",
    status: "coming_soon",
  },

  // 決済
  {
    id: "stripe",
    name: "Stripe",
    description: "オンライン決済・サブスクリプション",
    category: "payment",
    status: "available",
  },
  {
    id: "square",
    name: "Square",
    description: "店頭決済・請求書決済",
    category: "payment",
    status: "coming_soon",
  },

  // コミュニケーション
  {
    id: "slack",
    name: "Slack",
    description: "通知・アラートをSlackに送信",
    category: "communication",
    status: "coming_soon",
  },
  {
    id: "chatwork",
    name: "Chatwork",
    description: "通知・アラートをChatworkに送信",
    category: "communication",
    status: "coming_soon",
  },
  {
    id: "line",
    name: "LINE公式アカウント",
    description: "顧客への通知をLINEで送信",
    category: "communication",
    status: "coming_soon",
  },

  // ストレージ
  {
    id: "google_drive",
    name: "Google Drive",
    description: "写真・書類をGoogle Driveに自動保存",
    category: "storage",
    status: "coming_soon",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "ファイルをDropboxに自動バックアップ",
    category: "storage",
    status: "coming_soon",
  },

  // カレンダー
  {
    id: "google_calendar",
    name: "Google カレンダー",
    description: "工程表をGoogleカレンダーに同期",
    category: "calendar",
    status: "coming_soon",
  },

  // その他
  {
    id: "zapier",
    name: "Zapier",
    description: "5000以上のアプリと自動連携",
    category: "automation",
    status: "coming_soon",
  },
];

// GET /api/integrations - 連携サービス一覧取得
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let integrations = AVAILABLE_INTEGRATIONS;

    if (category) {
      integrations = integrations.filter((i) => i.category === category);
    }

    if (status) {
      integrations = integrations.filter((i) => i.status === status);
    }

    // カテゴリでグループ化
    const grouped = integrations.reduce((acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    }, {} as Record<string, Integration[]>);

    return NextResponse.json({
      data: {
        integrations,
        grouped,
        categories: [
          { id: "accounting", name: "会計ソフト" },
          { id: "crm", name: "CRM" },
          { id: "contract", name: "電子契約" },
          { id: "payment", name: "決済" },
          { id: "communication", name: "コミュニケーション" },
          { id: "storage", name: "ストレージ" },
          { id: "calendar", name: "カレンダー" },
          { id: "automation", name: "自動化" },
        ],
      },
    });
  } catch (error) {
    console.error("Failed to fetch integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

// POST /api/integrations - 連携を有効化（将来実装）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, integrationId, config } = body;

    // TODO: 連携設定を保存する処理を実装
    // 現在はプレースホルダー

    return NextResponse.json({
      data: {
        message: "Integration setup will be available soon",
        integrationId,
      },
    });
  } catch (error) {
    console.error("Failed to setup integration:", error);
    return NextResponse.json(
      { error: "Failed to setup integration" },
      { status: 500 }
    );
  }
}
