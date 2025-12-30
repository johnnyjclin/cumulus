import { NextRequest, NextResponse } from "next/server";
import { getReceiptsByWallet, receiptsToCSV } from "~~/utils/receiptManager";

/**
 * GET /api/receipts
 * Query payment receipts by wallet address
 * Supports CSV export
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("wallet");
    const format = searchParams.get("format"); // 'json' or 'csv'
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const resource = searchParams.get("resource");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
    }

    const options = {
      limit,
      offset,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      resource: resource || undefined,
    };

    const result = await getReceiptsByWallet(walletAddress, options);

    // CSV export
    if (format === "csv") {
      const csv = receiptsToCSV(result.receipts);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="receipts-${walletAddress}-${Date.now()}.csv"`,
        },
      });
    }

    // JSON response
    return NextResponse.json({
      success: true,
      data: result.receipts,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}

/**
 * Example query:
 * GET /api/receipts?wallet=0x123...&limit=20&offset=0
 * GET /api/receipts?wallet=0x123...&format=csv
 * GET /api/receipts?wallet=0x123...&startDate=2024-01-01&endDate=2024-12-31
 * GET /api/receipts?wallet=0x123...&resource=/api/payment/google-ai/chat
 */
