import { NextResponse } from "next/server";

/**
 * Google AI (Gemini) Chat API
 * Protected by x402 middleware.
 */
export async function POST(request: Request) {
  try {
    const { prompt, model = "gemini-2.0-flash-exp" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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

    return NextResponse.json({
      message: "Content generated successfully",
      response: generatedText,
      model: model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      receipt: "x402-payment-confirmed",
    });
  } catch (error: any) {
    console.error("Google AI API error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
