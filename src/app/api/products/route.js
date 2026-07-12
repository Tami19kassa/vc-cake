import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET products (public or filtered)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let list = await db.getProducts();
    if (activeOnly) {
      list = list.filter(item => item.isEnabled);
    }
    return NextResponse.json({ success: true, products: list });
  } catch (error) {
    console.error("GET products failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create product (admin only)
export async function POST(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, basePrice, image, isEnabled } = body;

    if (!name || !category || basePrice === undefined) {
      return NextResponse.json({ success: false, error: "Missing required product fields." }, { status: 400 });
    }

    const newProd = await db.createProduct({
      name,
      category,
      basePrice: Number(basePrice),
      image: image || "",
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true
    });

    return NextResponse.json({ success: true, product: newProd, message: "Product created successfully!" });
  } catch (error) {
    console.error("POST product failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update product (admin only)
export async function PUT(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category, basePrice, image, isEnabled } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID." }, { status: 400 });
    }

    const updated = await db.updateProduct(Number(id), {
      name,
      category,
      basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
      image,
      isEnabled
    });

    return NextResponse.json({ success: true, product: updated, message: "Product updated successfully!" });
  } catch (error) {
    console.error("PUT product failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE product (admin only)
export async function DELETE(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID." }, { status: 400 });
    }

    await db.deleteProduct(Number(id));
    return NextResponse.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    console.error("DELETE product failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
