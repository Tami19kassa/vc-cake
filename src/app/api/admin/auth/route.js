import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "vccakeacademysecret12345";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Please enter both username and password." }, { status: 400 });
    }

    // Retrieve admin details
    const admin = await db.getAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Invalid username or password." }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful!",
      token,
      admin: { id: admin.id, username: admin.username }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
