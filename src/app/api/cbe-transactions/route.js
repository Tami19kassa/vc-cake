import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all mock transactions
export async function GET() {
  try {
    const txns = await db.getCBEMockTransactions();
    return NextResponse.json({ success: true, transactions: txns });
  } catch (error) {
    console.error("GET mock transactions failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a mock transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const { referenceId, amount, senderName } = body;

    if (!referenceId || !amount || !senderName) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be a positive number." }, { status: 400 });
    }

    const newTxn = await db.createCBEMockTransaction({
      referenceId,
      amount,
      senderName
    });

    return NextResponse.json({ success: true, transaction: newTxn });
  } catch (error) {
    console.error("POST mock transaction failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
