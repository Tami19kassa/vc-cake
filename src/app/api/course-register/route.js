import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, studentPhone, studentEmail, shift, paymentReference, amountPaid } = body;

    // Validate fields
    if (!studentName || !studentPhone || !studentEmail || !shift || !paymentReference || !amountPaid) {
      return NextResponse.json(
        { success: false, error: "Please fill all required registration details." },
        { status: 400 }
      );
    }

    // Verify shift option
    const validShifts = ["morning", "afternoon", "night"];
    if (!validShifts.includes(shift.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Invalid shift selection." }, { status: 400 });
    }

    // Check if duplicate transaction reference exists in registrations
    const regs = await db.getCourseRegistrations();
    const duplicateReg = regs.find(
      (r) => r.paymentReference.trim().toUpperCase() === paymentReference.trim().toUpperCase()
    );

    if (duplicateReg) {
      return NextResponse.json(
        { success: false, error: "This CBE Payment Reference has already been submitted for course registration." },
        { status: 400 }
      );
    }

    // Check cake orders to prevent reference reuse
    const orders = await db.getCakeOrders();
    const duplicateOrder = orders.find(
      (o) => o.paymentReference.trim().toUpperCase() === paymentReference.trim().toUpperCase()
    );

    if (duplicateOrder) {
      return NextResponse.json(
        { success: false, error: "This CBE Payment Reference has already been claimed for a cake order." },
        { status: 400 }
      );
    }

    // Save registration
    const newReg = await db.createCourseRegistration({
      studentName,
      studentPhone,
      studentEmail,
      shift: shift.toLowerCase(),
      paymentReference: paymentReference.trim().toUpperCase(),
      amountPaid: parseFloat(amountPaid)
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully! Please wait for payment verification in your dashboard.",
      registration: newReg
    });

  } catch (error) {
    console.error("Course registration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
