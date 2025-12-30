import { NextResponse } from "next/server";
import { checkUserBudget } from "~~/utils/budgetManager";

/**
 * API endpoint to check if a payment is within budget
 * GET /api/budget/check?address=0x...&amount=0.1
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const amount = searchParams.get("amount");

    if (!address || !amount) {
      return NextResponse.json({ error: "Missing required parameters: address and amount" }, { status: 400 });
    }

    const result = await checkUserBudget(address, amount);

    return NextResponse.json({
      allowed: result.allowed,
      remaining: result.remaining,
      amount: amount,
      address: address,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Budget check API error:", error);
    return NextResponse.json(
      {
        error: "Failed to check budget",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
