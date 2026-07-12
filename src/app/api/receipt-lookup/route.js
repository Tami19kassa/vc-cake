import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query parameter." }, { status: 400 });
    }

    const cleanQuery = query.trim();
    if (cleanQuery.length < 3) {
      return NextResponse.json({ success: false, error: "Search query must be at least 3 characters." }, { status: 400 });
    }

    const registrations = await db.getCourseRegistrationsByPhoneOrRef(cleanQuery);
    const orders = await db.getCakeOrdersByPhoneOrRef(cleanQuery);

    return NextResponse.json({
      success: true,
      registrations,
      orders
    });

  } catch (error) {
    console.error("Receipt lookup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
