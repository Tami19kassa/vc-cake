import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET admin dashboard stats and lists
export async function GET(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const registrations = await db.getCourseRegistrations();
    const orders = await db.getCakeOrders();
    const contacts = await db.getContactMessages();
    const mockTxns = await db.getCBEMockTransactions();

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        orders,
        contacts,
        mockTransactions: mockTxns
      }
    });

  } catch (error) {
    console.error("GET dashboard stats failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST manual status update (Approve/Reject)
export async function POST(request) {
  try {
    const admin = verifyToken(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, action } = body; // action is 'approved' or 'rejected'

    if (!id || !type || !action) {
      return NextResponse.json({ success: false, error: "Missing parameters (id, type, action)." }, { status: 400 });
    }

    const validActions = ["approved", "rejected", "pending"];
    if (!validActions.includes(action.toLowerCase())) {
      return NextResponse.json({ success: false, error: "Invalid status action." }, { status: 400 });
    }

    const targetStatus = action.toLowerCase();

    if (type === "registration") {
      await db.updateCourseRegistrationStatus(id, targetStatus);
    } else if (type === "order") {
      await db.updateCakeOrderStatus(id, targetStatus);
    } else {
      return NextResponse.json({ success: false, error: "Invalid content type." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Status updated to ${targetStatus} successfully.`
    });

  } catch (error) {
    console.error("POST status update failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
