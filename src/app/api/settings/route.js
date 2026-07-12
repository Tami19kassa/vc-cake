import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET settings (public)
export async function GET() {
  try {
    const settings = await db.getHeroSettings();
    const regs = await db.getCourseRegistrations();
    const counts = {
      morning: regs.filter(r => r.shift.toLowerCase() === "morning" && r.status !== "rejected").length,
      afternoon: regs.filter(r => r.shift.toLowerCase() === "afternoon" && r.status !== "rejected").length,
      night: regs.filter(r => r.shift.toLowerCase() === "night" && r.status !== "rejected").length
    };
    return NextResponse.json({ success: true, settings, shiftCounts: counts });
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
    const { 
      title, subtitle, ctaText, imageUrl, 
      cbeAccountNo, cbeAccountHolder, telebirrPhone, telebirrAccountHolder,
      contactPhone1, contactPhone2, contactEmail, contactAddressEn, contactAddressAm,
      coursePrice, layerPrice, coursesEnabled, ordersEnabled,
      morningShiftEnabled, afternoonShiftEnabled, nightShiftEnabled,
      morningShiftCapacity, afternoonShiftCapacity, nightShiftCapacity
    } = body;

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
      telebirrAccountHolder,
      contactPhone1,
      contactPhone2,
      contactEmail,
      contactAddressEn,
      contactAddressAm,
      coursePrice,
      layerPrice,
      coursesEnabled,
      ordersEnabled,
      morningShiftEnabled,
      afternoonShiftEnabled,
      nightShiftEnabled,
      morningShiftCapacity,
      afternoonShiftCapacity,
      nightShiftCapacity
    );
    return NextResponse.json({ success: true, settings: updated, message: "Settings updated successfully!" });
  } catch (error) {
    console.error("POST settings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
