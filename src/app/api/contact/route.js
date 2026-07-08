import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ success: false, error: "Please fill all fields of the contact form." }, { status: 400 });
    }

    const newMessage = await db.createContactMessage({
      name,
      email,
      phone,
      message
    });

    return NextResponse.json({
      success: true,
      message: "Message received! We will contact you at VC Cake Academy shortly.",
      contactMessage: newMessage
    });
  } catch (error) {
    console.error("Contact message API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
