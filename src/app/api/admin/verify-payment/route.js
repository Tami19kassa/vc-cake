import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, type, reference, expectedAmount } = body;

    if (!id || !type || !reference || !expectedAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (id, type, reference, expectedAmount)." },
        { status: 400 }
      );
    }

    const refCode = reference.trim().toUpperCase();
    const targetAmount = Number(expectedAmount);

    // 1. Dynamic Host Resolution for Scraping
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const portalUrl = `${protocol}://${host}/cbe-bank-portal`;

    console.log(`[Scraper] Initializing scraping agent targeting: ${portalUrl}`);
    
    // 2. Fetch target HTML (simulate browser request)
    const res = await fetch(portalUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch bank portal. Status code: ${res.status}`);
    }

    const html = await res.text();
    
    // 3. Load HTML into Cheerio parser
    const $ = cheerio.load(html);
    let matchedTransaction = null;

    // 4. Scrape the table structure
    $("table tbody tr").each((index, element) => {
      const cols = $(element).find("td");
      if (cols.length >= 5) {
        const parsedRef = $(cols[0]).text().trim().toUpperCase();
        const parsedAmountStr = $(cols[1]).text().trim().replace(/,/g, "");
        const parsedAmount = parseFloat(parsedAmountStr);
        const parsedSender = $(cols[2]).text().trim();
        const parsedTag = $(cols[4]).text().trim().toUpperCase(); // "UNCLAIMED" or "CLAIMED"

        if (parsedRef === refCode) {
          matchedTransaction = {
            referenceId: parsedRef,
            amount: parsedAmount,
            senderName: parsedSender,
            isClaimed: parsedTag === "CLAIMED"
          };
          return false; // Break loop
        }
      }
    });

    console.log(`[Scraper] Scraping complete. Match found:`, matchedTransaction);

    // 5. Verification Validation
    if (!matchedTransaction) {
      return NextResponse.json({
        success: false,
        error: `Transaction Reference '${refCode}' was not found in CBE bank records. Scraper completed parsing but found no matching records.`
      });
    }

    if (matchedTransaction.isClaimed) {
      return NextResponse.json({
        success: false,
        error: `Transaction '${refCode}' was already claimed for another order or registration in the bank portal.`
      });
    }

    // Verify amount matches
    const difference = Math.abs(matchedTransaction.amount - targetAmount);
    if (difference > 0.01) {
      return NextResponse.json({
        success: false,
        error: `Amount discrepancy! Bank reported ${matchedTransaction.amount} ETB transfer, but this order expected ${targetAmount} ETB.`
      });
    }

    // 6. DB Updates (Approve order/registration and mark transaction as claimed)
    await db.claimCBEMockTransaction(refCode);

    if (type === "registration") {
      await db.updateCourseRegistrationStatus(id, "approved");
    } else if (type === "order") {
      await db.updateCakeOrderStatus(id, "approved");
    } else {
      return NextResponse.json({ success: false, error: "Invalid transaction type." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Payment verified successfully via CBE web scraping! Approved for ${matchedTransaction.senderName} (${matchedTransaction.amount} ETB).`
    });

  } catch (error) {
    console.error("Scraper API execution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
