import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: user.companyId,
        name: user.company.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
