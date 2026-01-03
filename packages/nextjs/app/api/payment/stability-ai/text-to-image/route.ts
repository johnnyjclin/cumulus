import { NextResponse } from "next/server";
import { STABILITY_API_AMOUNT } from "~~/constants";
import { checkUserBudget, recordPaymentOnChain } from "~~/utils/budgetManager";
import { extractPaymentInfo } from "~~/utils/paymentHelpers";
import { recordPayment } from "~~/utils/receiptManager";

/**
 * Stability AI Text-to-Image API
 * Protected by x402 middleware.
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { prompt, model = "sd3-large", aspectRatio = "1:1" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Extract payment info from request
    const paymentInfo = extractPaymentInfo(request);

    // Check on-chain budget before processing
    try {
      const budgetCheck = await checkUserBudget(paymentInfo.walletAddress, `$${STABILITY_API_AMOUNT}`);
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
              requestedAmount: STABILITY_API_AMOUNT,
            },
          },
          { status: 402 },
        );
      }
    } catch (budgetError) {
      console.error("Budget check error:", budgetError);
      // Continue with payment if budget check fails
    }

    const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

    if (!STABILITY_API_KEY) {
      return NextResponse.json({ error: "Stability AI API Key not configured on server" }, { status: 500 });
    }

    console.log(`Generating image with Stability AI: ${model}`);

    // Map model names to API endpoints
    const modelEndpointMap: { [key: string]: string } = {
      "sd3-large": "sd3",
      "sd3-large-turbo": "sd3-turbo",
      "sd3-medium": "sd3",
    };

    const endpoint = modelEndpointMap[model] || "sd3";

    // Call Stability AI API
    // Reference: https://platform.stability.ai/docs/api-reference#tag/Generate/paths/~1v2beta~1stable-image~1generate~1sd3/post
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("output_format", "jpeg"); // Changed from png to jpeg for smaller file size
    formData.append("aspect_ratio", aspectRatio);
    if (model === "sd3-medium") {
      formData.append("model", "sd3-medium");
    }

    const response = await fetch(`https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: "image/*",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stability AI error:", errorText);
      return NextResponse.json({ error: "Stability AI API error", details: errorText }, { status: response.status });
    }

    // The API returns the image as a binary blob
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    if (!base64Image) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    const responseTime = Date.now() - startTime;

    // Record payment receipt to database with image data
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`; // Changed to jpeg

    await recordPayment({
      txHash: paymentInfo.txHash,
      walletAddress: paymentInfo.walletAddress,
      amount: `$${STABILITY_API_AMOUNT}`,
      resource: "/api/payment/stability-ai/text-to-image",
      description: "Stability AI Text-to-Image Generation",
      network: process.env.NETWORK || "base-sepolia",
      authorization: paymentInfo.authorization ?? undefined,
      metadata: {
        requestBody: { prompt, model, aspectRatio },
        response: {
          imageDataUrl: imageDataUrl,
          imageSize: imageBuffer.byteLength,
          format: "jpeg", // Changed to jpeg
        },
        imageGeneration: {
          prompt: prompt,
          model: model,
          aspectRatio: aspectRatio,
          imageUrl: imageDataUrl,
        },
        responseStatus: 200,
        responseTime,
      },
    });

    // Record payment on-chain to BudgetManager contract
    try {
      const onChainResult = await recordPaymentOnChain(paymentInfo.walletAddress, STABILITY_API_AMOUNT);
      if (!onChainResult.success) {
        console.warn("Failed to record payment on-chain:", onChainResult.error);
      } else {
        console.log("✅ Payment recorded on-chain:", onChainResult.txHash);
      }
    } catch (onChainError) {
      console.error("On-chain recording error:", onChainError);
    }

    return NextResponse.json({
      message: "Image generated successfully",
      image: base64Image,
      prompt: prompt,
      model: model,
      receipt: {
        txHash: paymentInfo.txHash,
        amount: `$${STABILITY_API_AMOUNT}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Stability AI API error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
