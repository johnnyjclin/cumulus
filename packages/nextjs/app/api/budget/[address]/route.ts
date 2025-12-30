import { NextResponse } from "next/server";
import { getUserBudgetStats } from "~~/utils/budgetManager";

/**
 * GET /api/budget/[address]
 * Get on-chain budget statistics for a user
 */
export async function GET(request: Request, { params }: { params: { address: string } }) {
  try {
    const { address } = params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    const stats = await getUserBudgetStats(address);

    if (!stats) {
      return NextResponse.json({ error: "Budget Manager not configured or failed to fetch stats" }, { status: 503 });
    }

    return NextResponse.json({
      address,
      ...stats,
      network: process.env.NETWORK || "base-sepolia",
      explorerUrl: `https://sepolia.basescan.org/address/${stats.contractAddress}`,
    });
  } catch (error) {
    console.error("Budget API error:", error);
    return NextResponse.json({ error: "Failed to fetch budget information" }, { status: 500 });
  }
}
