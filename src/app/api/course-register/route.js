import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/db";

async function scrapeRealTransaction(paymentMethod, referenceInput, targetAmount, expectedCbeHolder, expectedTeleHolder) {
  let targetUrl = "";
  const cleanInput = referenceInput.trim();

  if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
    targetUrl = cleanInput;
  } else {
    if (paymentMethod === "telebirr") {
      targetUrl = `https://transactioninfo.ethiotelecom.et/receipt/${cleanInput.toUpperCase()}`;
    } else {
      // Auto-prepend CBE receipt URL if only code is provided
      if (/^[a-zA-Z0-9_-]{10,40}$/.test(cleanInput)) {
        targetUrl = `https://mbreciept.cbe.com.et/${cleanInput}`;
      } else {
        return {
          success: false,
          error: "For CBE verification, please paste the full CBE Customer Receipt URL (e.g. starting with https://mbreciept.cbe.com.et/v2-...) or scan the receipt QR code."
        };
      }
    }
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });

    if (!res.ok) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        return {
          success: true,
          isPending: true,
          statusText: `Bank server returned HTTP ${res.status} Bad Gateway.`
        };
      }
      return {
        success: false,
        error: `Could not retrieve transaction details from bank server. HTTP Status: ${res.status}`
      };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    if (targetUrl.includes("ethiotelecom.et")) {
      // --- TELEBIRR PARSING ---
      let status = "";
      let payerName = "";
      let receiverName = "";
      let invoiceNo = "";
      let settledAmount = 0;

      $("td").each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes("transaction status") || text.includes("የክፍያው ሁኔታ")) {
          status = $(el).next("td").text().trim();
        }
        if (text.includes("Payer Name") || text.includes("የከፋይ ስም")) {
          payerName = $(el).next("td").text().trim();
        }
        if (text.includes("Credited Party name") || text.includes("የገንዘብ ተቀባይ ስም")) {
          receiverName = $(el).next("td").text().trim();
        }
        if (text.includes("Total Paid Amount") || text.includes("የክፍያ ጠቅላላ ድምር") || text.includes("Total Paid")) {
          const val = $(el).next("td").text().trim();
          const parsedVal = parseFloat(val.replace(/[^0-9.]/g, ""));
          if (!isNaN(parsedVal)) settledAmount = parsedVal;
        }
      });

      const invoiceHeader = $("td:contains('Invoice details')");
      if (invoiceHeader.length > 0) {
        const detailsTable = invoiceHeader.closest("table");
        const dataRow = detailsTable.find("tr").eq(2);
        if (dataRow.length > 0) {
          invoiceNo = dataRow.find("td").eq(0).text().trim();
          if (settledAmount === 0) {
            const amountStr = dataRow.find("td").eq(2).text().trim();
            settledAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
          }
        }
      }

      if (!invoiceNo) {
        return { success: false, error: "Failed to parse transaction reference from Telebirr receipt." };
      }

      if (status.toLowerCase() !== "completed") {
        return { success: false, error: `Transaction status is '${status}', not completed.` };
      }

      // Verify Receiver matches VC Cake Academy owner
      if (receiverName && !receiverName.toLowerCase().includes(expectedTeleHolder.toLowerCase())) {
        return {
          success: false,
          error: `Verification failed: This transfer was sent to '${receiverName}', not to VC Cake Academy (${expectedTeleHolder}).`
        };
      }

      const diff = Math.abs(settledAmount - targetAmount);
      if (diff > 0.05) {
        return { success: false, error: `Transaction amount discrepancy: Receipt reports ${settledAmount} ETB, but form expected ${targetAmount} ETB.` };
      }

      return {
        success: true,
        isPending: false,
        referenceId: invoiceNo,
        payerName
      };    } else if (targetUrl.includes("cbe.com.et")) {
      // Extract the path token
      const urlObj = new URL(targetUrl);
      const token = urlObj.pathname.split("/").pop();

      if (!token) {
        return { success: false, error: "Failed to parse Reference No. from CBE Customer Receipt page." };
      }

      // Call CBE Public API directly
      const apiRes = await fetch(`https://Mb.cbe.com.et/api/v1/transactions/public/transaction-detail/${token}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "X-App-ID": "d1292e42-7400-49de-a2d3-9731caa4c819",
          "X-App-Version": "0a01980b-9859-1369-8198-59f403820000"
        }
      });

      if (!apiRes.ok) {
        if (apiRes.status === 502 || apiRes.status === 503 || apiRes.status === 504) {
          return {
            success: true,
            isPending: true,
            statusText: `Bank server returned HTTP ${apiRes.status} Bad Gateway.`
          };
        }
        return {
          success: false,
          error: `Could not retrieve transaction details from bank server. HTTP Status: ${apiRes.status}`
        };
      }

      const json = await apiRes.json();
      const referenceNo = json.id;
      const payerName = json.debitAccountHolder;
      const receiverName = json.creditAccountHolder;
      const transferredAmount = parseFloat(json.amountCredited || json.debitAmount);

      if (!referenceNo) {
        return { success: false, error: "Failed to parse Reference No. from CBE Customer Receipt page." };
      }

      // Verify Receiver matches VC Cake Academy owner
      if (receiverName && !receiverName.toLowerCase().includes(expectedCbeHolder.toLowerCase())) {
        return {
          success: false,
          error: `Verification failed: This transfer was sent to '${receiverName}', not to VC Cake Academy (${expectedCbeHolder}).`
        };
      }

      const diff = Math.abs(transferredAmount - targetAmount);
      if (diff > 0.05) {
        return { success: false, error: `Transaction amount discrepancy: CBE receipt reports ${transferredAmount} ETB, but form expected ${targetAmount} ETB.` };
      }

      return {
        success: true,
        isPending: false,
        referenceId: referenceNo,
        payerName
      };

    } else {
      return { success: false, error: "Unsupported receipt portal URL." };
    }
  } catch (err) {
    console.error("Scraper execution error:", err);
    return { success: false, error: `Scraper execution error: ${err.message}` };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentName, studentPhone, studentEmail, shift, paymentReference, amountPaid, paymentMethod } = body;

    // Validate fields
    if (!studentName || !studentPhone || !studentEmail || !shift || !paymentReference || !amountPaid) {
      return NextResponse.json(
        { success: false, error: "Please fill all required registration details." },
        { status: 400 }
      );
    }

    const payMethod = paymentMethod || "cbe";
    const targetAmount = Number(amountPaid);

    // Verify shift option
    const validShifts = ["morning", "afternoon", "night"];
    const shiftLower = shift.toLowerCase();
    if (!validShifts.includes(shiftLower)) {
      return NextResponse.json({ success: false, error: "Invalid shift selection." }, { status: 400 });
    }

    const settings = await db.getHeroSettings() || {};

    // Validate global system enablement
    if (settings.coursesEnabled === 0 || settings.coursesEnabled === false) {
      return NextResponse.json({ success: false, error: "Course registrations are temporarily closed." }, { status: 400 });
    }

    // Validate specific shift enablement
    if (shiftLower === "morning" && (settings.morningShiftEnabled === 0 || settings.morningShiftEnabled === false)) {
      return NextResponse.json({ success: false, error: "Morning shift registration is currently closed." }, { status: 400 });
    }
    if (shiftLower === "afternoon" && (settings.afternoonShiftEnabled === 0 || settings.afternoonShiftEnabled === false)) {
      return NextResponse.json({ success: false, error: "Afternoon shift registration is currently closed." }, { status: 400 });
    }
    if (shiftLower === "night" && (settings.nightShiftEnabled === 0 || settings.nightShiftEnabled === false)) {
      return NextResponse.json({ success: false, error: "Night shift registration is currently closed." }, { status: 400 });
    }

    // Validate shift seats capacity
    const allRegs = await db.getCourseRegistrations();
    const currentShiftCount = allRegs.filter(r => r.shift.toLowerCase() === shiftLower && r.status !== 'rejected').length;
    let maxCapacity = 30;
    if (shiftLower === "morning") maxCapacity = settings.morningShiftCapacity !== undefined ? Number(settings.morningShiftCapacity) : 30;
    if (shiftLower === "afternoon") maxCapacity = settings.afternoonShiftCapacity !== undefined ? Number(settings.afternoonShiftCapacity) : 30;
    if (shiftLower === "night") maxCapacity = settings.nightShiftCapacity !== undefined ? Number(settings.nightShiftCapacity) : 30;

    if (currentShiftCount >= maxCapacity) {
      return NextResponse.json({ success: false, error: `Sorry, the ${shift} shift is fully booked (capacity: ${maxCapacity} seats).` }, { status: 400 });
    }

    const expectedCbeHolder = settings.cbeAccountHolder || "Biruk Tigistu Lugaba";
    const expectedTeleHolder = settings.telebirrAccountHolder || "Kibrom Haileselassie Abreha";

    const scraperResult = await scrapeRealTransaction(
      payMethod, 
      paymentReference, 
      targetAmount,
      expectedCbeHolder,
      expectedTeleHolder
    );

    if (!scraperResult.success) {
      return NextResponse.json({ success: false, error: scraperResult.error }, { status: 400 });
    }

    // Check if duplicate transaction reference exists in registrations
    const savedRefCode = scraperResult.isPending 
      ? paymentReference.trim().toUpperCase() 
      : scraperResult.referenceId;

    const regs = await db.getCourseRegistrations();
    const duplicateReg = regs.find(
      (r) => r.paymentReference.trim().toUpperCase() === savedRefCode
    );

    if (duplicateReg) {
      return NextResponse.json(
        { success: false, error: `This Payment Reference (${savedRefCode}) has already been submitted for course registration.` },
        { status: 400 }
      );
    }

    // Check cake orders to prevent reference reuse
    const orders = await db.getCakeOrders();
    const duplicateOrder = orders.find(
      (o) => o.paymentReference.trim().toUpperCase() === savedRefCode
    );

    if (duplicateOrder) {
      return NextResponse.json(
        { success: false, error: `This Payment Reference (${savedRefCode}) has already been claimed for a cake order.` },
        { status: 400 }
      );
    }

    // Determine status based on system availability
    const status = scraperResult.isPending ? "pending" : "approved";
    const verifiedAt = scraperResult.isPending ? null : new Date().toISOString();

    // Save registration
    const newReg = await db.createCourseRegistration({
      studentName,
      studentPhone,
      studentEmail,
      shift: shift.toLowerCase(),
      paymentReference: savedRefCode,
      amountPaid: targetAmount,
      status,
      paymentMethod: payMethod,
      verifiedAt
    });

    if (scraperResult.isPending) {
      return NextResponse.json({
        success: true,
        message: "The bank portal is currently offline (502 Bad Gateway). We have submitted your receipt details as PENDING for manual administrative verification.",
        registration: newReg,
        isPending: true
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment verified and registration approved successfully!`,
      registration: newReg,
      isPending: false
    });

  } catch (error) {
    console.error("Course registration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
