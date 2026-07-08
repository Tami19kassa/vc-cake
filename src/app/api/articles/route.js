import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET articles (public)
export async function GET() {
  try {
    const list = await db.getArticles();
    return NextResponse.json({ success: true, articles: list });
  } catch (error) {
    console.error("GET articles failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create article (admin only)
export async function POST(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type, mediaUrl } = body;

    if (!title || !content || !type || !mediaUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const newArt = await db.createArticle({ title, content, type, mediaUrl });
    return NextResponse.json({ success: true, article: newArt, message: "Article created successfully!" });
  } catch (error) {
    console.error("POST article failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update article (admin only)
export async function PUT(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, type, mediaUrl } = body;

    if (!id || !title || !content || !type || !mediaUrl) {
      return NextResponse.json({ success: false, error: "Missing fields for update." }, { status: 400 });
    }

    const updated = await db.updateArticle(id, { title, content, type, mediaUrl });
    return NextResponse.json({ success: true, article: updated, message: "Article updated successfully!" });
  } catch (error) {
    console.error("PUT article failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE article (admin only)
export async function DELETE(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing article ID." }, { status: 400 });
    }

    await db.deleteArticle(Number(id));
    return NextResponse.json({ success: true, message: "Article deleted successfully!" });
  } catch (error) {
    console.error("DELETE article failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
