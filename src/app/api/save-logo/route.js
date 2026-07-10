import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { dataUrl512, dataUrl192 } = await request.json();
    if (!dataUrl512 || !dataUrl192) {
      return NextResponse.json({ success: false, error: "Missing data URLs" }, { status: 400 });
    }

    const iconsDir = path.join(process.cwd(), "public", "icons");
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    // Save 512
    const base64Data512 = dataUrl512.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(iconsDir, "icon-512.png"), base64Data512, "base64");

    // Save 192
    const base64Data192 = dataUrl192.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(iconsDir, "icon-192.png"), base64Data192, "base64");

    return NextResponse.json({ success: true, message: "PWA Icons generated successfully!" });
  } catch (error) {
    console.error("Save logo error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
