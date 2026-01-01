import { NextResponse } from "next/server";
import { GOOGLE_AI_API_AMOUNT } from "~~/constants";
import { checkUserBudget, recordPaymentOnChain } from "~~/utils/budgetManager";
import { extractPaymentInfo } from "~~/utils/paymentHelpers";
import { recordPayment } from "~~/utils/receiptManager";

/**
 * Google AI (Gemini) Chat API
 * Protected by x402 middleware.
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { prompt, model = "gemini-2.0-flash-exp" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Extract payment info from request
    const paymentInfo = extractPaymentInfo(request);

    // Check on-chain budget before processing
    try {
      const budgetCheck = await checkUserBudget(paymentInfo.walletAddress, `$${GOOGLE_AI_API_AMOUNT}`);
      if (!budgetCheck.allowed) {
        return NextResponse.json(
          {
            error: "Budget limit exceeded",
            message: `You have reached your on-chain spending limit. Spent: $${budgetCheck.spent} / $${budgetCheck.limit} USDC. Please contact support to increase your limit.`,
            budgetInfo: {
              spent: budgetCheck.spent,
              limit: budgetCheck.limit,
              remaining: budgetCheck.remaining,
              utilization: budgetCheck.utilization,
              requestedAmount: GOOGLE_AI_API_AMOUNT,
            },
          },
          { status: 402 },
        );
      }
    } catch (budgetError) {
      console.error("Budget check error:", budgetError);
      // Continue with payment if budget check fails (to avoid blocking service)
    }

    const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

    if (!GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: "Google AI API Key not configured on server" }, { status: 500 });
    }

    console.log(`Processing Gemini request with model: ${model}`);

    // Call Google AI API
    // Reference: https://ai.google.dev/api/rest/v1beta/models/generateContent
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      return NextResponse.json({ error: "Google AI API error", details: data }, { status: response.status });
    }

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    const responseTime = Date.now() - startTime;

    // Record payment receipt to database with conversation history
    await recordPayment({
      txHash: paymentInfo.txHash,
      walletAddress: paymentInfo.walletAddress,
      amount: `$${GOOGLE_AI_API_AMOUNT}`,
      resource: "/api/payment/google-ai/chat",
      description: "Google AI (Gemini) Text Generation",
      network: process.env.NETWORK || "base-sepolia",
      authorization: paymentInfo.authorization ?? undefined,
      metadata: {
        requestBody: { prompt, model },
        response: { text: generatedText, usage: data.usageMetadata },
        sessionHistory: {
          userPrompt: prompt,
          assistantResponse: generatedText,
          model: model,
          tokenUsage: {
            promptTokens: data.usageMetadata?.promptTokenCount || 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata?.totalTokenCount || 0,
          },
        },
        responseStatus: 200,
        responseTime,
      },
    });

    // Record payment on-chain to BudgetManager contract
    try {
      const onChainResult = await recordPaymentOnChain(paymentInfo.walletAddress, GOOGLE_AI_API_AMOUNT);
      if (!onChainResult.success) {
        console.warn("Failed to record payment on-chain:", onChainResult.error);
      } else {
        console.log("✅ Payment recorded on-chain:", onChainResult.txHash);
      }
    } catch (onChainError) {
      console.error("On-chain recording error:", onChainError);
      // Don't fail the request if on-chain recording fails
    }

    return NextResponse.json({
      message: "Content generated successfully",
      response: generatedText,
      model: model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      receipt: {
        txHash: paymentInfo.txHash,
        amount: `$${GOOGLE_AI_API_AMOUNT}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Google AI API error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
