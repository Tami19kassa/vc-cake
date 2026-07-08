import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      cakeType,
      sizeKg,
      layers,
      flavor,
      description,
      deliveryDate,
      paymentReference,
      amountPaid
    } = body;

    // Validate fields
    if (
      !customerName ||
      !customerPhone ||
      !cakeType ||
      !sizeKg ||
      !layers ||
      !flavor ||
      !deliveryDate ||
      !paymentReference ||
      !amountPaid
    ) {
      return NextResponse.json({ success: false, error: "Please fill all required order details." }, { status: 400 });
    }

    const refCode = paymentReference.trim().toUpperCase();

    // Check duplicate references in registrations
    const regs = await db.getCourseRegistrations();
    const duplicateReg = regs.find((r) => r.paymentReference.trim().toUpperCase() === refCode);
    if (duplicateReg) {
      return NextResponse.json(
        { success: false, error: "This CBE Payment Reference is already claimed for course registration." },
        { status: 400 }
      );
    }

    // Check duplicate references in orders
    const orders = await db.getCakeOrders();
    const duplicateOrder = orders.find((o) => o.paymentReference.trim().toUpperCase() === refCode);
    if (duplicateOrder) {
      return NextResponse.json(
        { success: false, error: "This CBE Payment Reference has already been submitted for a cake order." },
        { status: 400 }
      );
    }

    // Save order
    const newOrder = await db.createCakeOrder({
      customerName,
      customerPhone,
      cakeType,
      sizeKg: parseFloat(sizeKg),
      layers: parseInt(layers),
      flavor,
      description: description || "",
      deliveryDate,
      paymentReference: refCode,
      amountPaid: parseFloat(amountPaid)
    });

    return NextResponse.json({
      success: true,
      message: "Cake order placed successfully! Check your status inside the admin portal or contact us.",
      order: newOrder
    });

  } catch (error) {
    console.error("Cake order API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
