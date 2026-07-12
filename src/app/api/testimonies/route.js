import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const list = await db.getTestimonies();
    return NextResponse.json({ success: true, testimonies: list });
  } catch (error) {
    console.error("GET testimonies error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, text, rating, avatarUrl } = body;

    if (!clientName || !text || !rating) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const newTestimony = await db.createTestimony({
      clientName,
      text,
      rating: parseInt(rating),
      avatarUrl
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback!",
      testimony: newTestimony
    });
  } catch (error) {
    console.error("POST testimonies error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing testimony ID." }, { status: 400 });
    }
    await db.deleteTestimony(parseInt(id));
    return NextResponse.json({ success: true, message: "Testimonial deleted successfully!" });
  } catch (error) {
    console.error("DELETE testimonies error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
