import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET settings (public)
export async function GET() {
  try {
    const settings = await db.getHeroSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST settings (admin only)
export async function POST(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, ctaText, imageUrl, cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder } = body;

    if (!title || !subtitle || !ctaText) {
      return NextResponse.json({ success: false, error: "Missing required settings fields." }, { status: 400 });
    }

    const updated = await db.updateHeroSettings(
      title,
      subtitle,
      ctaText,
      imageUrl || "",
      cbeAccountNo,
      cbeAccountHolder,
      telebirrPhone,
      telebirrAccountHolder
    );
    return NextResponse.json({ success: true, settings: updated, message: "Settings updated successfully!" });
  } catch (error) {
    console.error("POST settings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
