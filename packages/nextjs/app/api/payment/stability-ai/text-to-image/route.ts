import { NextResponse } from "next/server";

/**
 * Stability AI Text-to-Image API
 * Protected by x402 middleware.
 */
export async function POST(request: Request) {
  try {
    const { prompt, model = "sd3-large", aspectRatio = "1:1" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
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
    formData.append("output_format", "png");
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

    return NextResponse.json({
      message: "Image generated successfully",
      image: base64Image,
      prompt: prompt,
      model: model,
      receipt: "x402-payment-confirmed",
    });
  } catch (error: any) {
    console.error("Stability AI API error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
