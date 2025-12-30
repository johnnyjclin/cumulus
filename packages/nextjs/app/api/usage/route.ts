import { NextRequest, NextResponse } from "next/server";
import { getUserUsage } from "~~/utils/receiptManager";

/**
 * GET /api/usage
 * Get user usage statistics by wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
    }

    const usage = await getUserUsage(walletAddress);

    if (!usage) {
      return NextResponse.json({
        success: true,
        data: {
          walletAddress,
          totalSpent: 0,
          totalRequests: 0,
          serviceUsage: {},
          firstSeen: null,
          lastSeen: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        walletAddress: usage.walletAddress,
        totalSpent: usage.totalSpent,
        totalRequests: usage.totalRequests,
        serviceUsage: usage.serviceUsage,
        firstSeen: usage.firstSeen,
        lastSeen: usage.lastSeen,
      },
    });
  } catch (error: any) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}

/**
 * Example query:
 * GET /api/usage?wallet=0x123...
 */
