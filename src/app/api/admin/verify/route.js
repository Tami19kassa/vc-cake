import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    const ref = searchParams.get("ref");

    if (!type || !id || !ref) {
      return NextResponse.json({ success: false, error: "Missing type, id, or ref parameter." }, { status: 400 });
    }

    const refCode = ref.trim().toUpperCase();

    if (type === "registration") {
      const reg = await db.getCourseRegistrationById(id);
      if (!reg || reg.paymentReference.trim().toUpperCase() !== refCode) {
        return NextResponse.json({ success: false, error: "Receipt does not match any class registration." }, { status: 404 });
      }
      return NextResponse.json({ success: true, type, data: reg });
    } else if (type === "order") {
      const order = await db.getCakeOrderById(id);
      if (!order || order.paymentReference.trim().toUpperCase() !== refCode) {
        return NextResponse.json({ success: false, error: "Receipt does not match any cake order." }, { status: 404 });
      }
      return NextResponse.json({ success: true, type, data: order });
    } else {
      return NextResponse.json({ success: false, error: "Invalid type parameter." }, { status: 400 });
    }

  } catch (error) {
    console.error("Verification GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Missing type or id." }, { status: 400 });
    }

    if (type === "registration") {
      const updated = await db.updateCourseRegistrationStatus(id, "approved");
      return NextResponse.json({ success: true, message: "Class registration payment approved successfully!", data: updated });
    } else if (type === "order") {
      const updated = await db.updateCakeOrderStatus(id, "approved");
      return NextResponse.json({ success: true, message: "Cake order payment approved successfully!", data: updated });
    } else {
      return NextResponse.json({ success: false, error: "Invalid type parameter." }, { status: 400 });
    }

  } catch (error) {
    console.error("Verification POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
