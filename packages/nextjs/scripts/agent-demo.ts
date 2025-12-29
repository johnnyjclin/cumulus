import { wrap as wrapFetch } from "@faremeter/fetch";
import { createPaymentHandler } from "@faremeter/payment-evm/exact";
import { createLocalWallet } from "@faremeter/wallet-evm";
import { baseSepolia } from "viem/chains";

/**
 * AI Agent Demo - Automated Landing Page Generation & Deployment
 * Using Faremeter + Base Network for true Agentic Payment
 */

// Configuration
const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || "";
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

/**
 * Step 1: Generate hero image using Stability AI
 */
async function generateImage(description: string, paymentFetch: any) {
  console.log("🎨 Step 1: Generating hero image with Stability AI...");
  console.log(`   Description: "${description}"`);

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/stability-ai/text-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Simple hero image for ${description}, low quality, not too big, less token is better`,
        model: "sd3-medium",
        aspectRatio: "16:9",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed");
    }

    console.log("   ✅ Image generated");
    console.log(`   💵 Cost: $0.01 USDC\n`);

    return `data:image/png;base64,${data.image}`;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Step 2: Generate web content using Google AI
 */
async function generateContent(prompt: string, paymentFetch: any) {
  console.log("📝 Step 2: Generating content with Google AI...");
  console.log(`   Prompt: "${prompt}"`);

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `Generate a simple and clean HTML landing page for: ${prompt}. 
                 Requirements:
                 - Use inline CSS only (no external stylesheets)
                 - Keep it minimal and modern
                 - Include a hero section with id="hero-image" where I'll insert an image later
                 - Add a simple headline, description, and CTA button
                 - Total length should be under 100 lines
                 Return only the HTML code without any markdown formatting.`,
        model: "gemini-2.0-flash-exp",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Content generation failed");
    }

    console.log("   ✅ Content generated");
    console.log(`   💵 Cost: $0.001 USDC\n`);

    // Clean up markdown code blocks if present
    let cleanedResponse = data.response;
    cleanedResponse = cleanedResponse.replace(/```html\n?/g, "");
    cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    cleanedResponse = cleanedResponse.trim();

    return cleanedResponse;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Step 3: Deploy to Cloudflare Workers
 */
async function deployToCloudflare(html: string, siteName: string, paymentFetch: any) {
  console.log("🚀 Step 3: Deploying to Cloudflare Workers...");
  console.log(`   Site Name: ${siteName}`);

  // Create Worker script
  const workerScript = `
export default {
  async fetch(request) {
    const html = \`${html.replace(/`/g, "\\`")}\`;
    
    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
  `.trim();

  // Create ZIP file
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  zip.file("index.js", workerScript);

  const zipBlob = await zip.generateAsync({ type: "blob" });

  try {
    const formData = new FormData();
    formData.append("scriptName", siteName);
    formData.append("file", zipBlob, "worker.zip");

    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/cloudflare/worker`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Deployment failed");
    }

    console.log("   ✅ Deployed successfully");
    console.log(`   💵 Cost: $0.001 USDC\n`);

    return data.url;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Main flow: Automated website generation and deployment
 */
async function buildAndDeployWebsite(description: string, paymentFetch: any) {
  console.log("🎬 Starting automated website deployment...");
  console.log(`📋 Task: "${description}"\n`);

  const startTime = Date.now();

  try {
    // Step 1: Generate image first
    const heroImage = await generateImage(description, paymentFetch);

    // Step 2: Generate basic HTML structure
    const htmlTemplate = await generateContent(description, paymentFetch);

    // Step 2.5: Inject the hero image into the HTML
    console.log("🔧 Injecting hero image into HTML...");
    let htmlContent = htmlTemplate;

    // Try to find hero section and inject image
    if (htmlContent.includes('id="hero-image"')) {
      htmlContent = htmlContent.replace(
        'id="hero-image"',
        `id="hero-image"><img src="${heroImage}" alt="Hero Image" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"`,
      );
    } else {
      // Fallback: inject before closing body tag
      htmlContent = htmlContent.replace(
        "</body>",
        `<div style="text-align: center; padding: 2rem;"><img src="${heroImage}" alt="Hero Image" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px;"></div></body>`,
      );
    }
    console.log("   ✅ Image injected\n");

    // Step 3: Deploy
    const siteName = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 32);
    const deploymentUrl = await deployToCloudflare(htmlContent, siteName, paymentFetch);

    // Complete
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Deployment Complete!\n");
    console.log(`🌐 Live URL: ${deploymentUrl}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log("\n💰 Total Cost Breakdown:");
    console.log("   - Stability AI (Image):    $0.010");
    console.log("   - Google AI (Content):     $0.001");
    console.log("   - Cloudflare (Deploy):     $0.001");
    console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   Total:                     $0.012 USDC");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return deploymentUrl;
  } catch (error: any) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

/**
 * Main function: Initialize and execute
 */
async function main() {
  // Create Agent wallet (using Faremeter's Base Sepolia wallet)
  const wallet = await createLocalWallet(baseSepolia, EVM_PRIVATE_KEY);

  console.log("🤖 AI Agent initialized");
  console.log(`📍 Wallet Address: ${wallet.address}`);
  console.log(`⛓️  Network: Base Sepolia`);
  console.log(`🌐 Gateway URL: ${GATEWAY_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  /**
   * Wrap fetch to support x402 automatic payment (using EIP-3009 gasless USDC transfers)
   */
  const paymentFetch = wrapFetch(fetch, {
    handlers: [createPaymentHandler(wallet)],
  });

  const projectDescription = process.argv[2] || "AI-powered landing page builder";
  const url = await buildAndDeployWebsite(projectDescription, paymentFetch);
  console.log(`\n✨ Success! Visit: ${url}`);
}

/**
 * Execute
 */
main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
