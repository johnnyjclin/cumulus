import { wrap as wrapFetch } from "@faremeter/fetch";
import { createPaymentHandler } from "@faremeter/payment-evm/exact";
import { createLocalWallet } from "@faremeter/wallet-evm";
import { baseSepolia } from "viem/chains";

/**
 * AI Agent Demo - Automated Landing Page Generation & Deployment
 * Using Faremeter + Base Network for true Agentic Payment
 */

// Configuration
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";
const AGENT_WALLET_ADDRESS = process.env.AGENT_WALLET_ADDRESS || "";
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

/**
 * Step 1: Generate hero image using Stability AI
 */
async function generateImage(description: string, walletAddress: string, paymentFetch: any) {
  console.log("🎨 Step 1: Generating hero image with Stability AI...");
  console.log(`   Description: "${description}"`);

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/stability-ai/text-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify({
        prompt: `Professional business hero image: ${description}. High-quality commercial photography, appealing presentation, good lighting, modern aesthetic. Professional ambiance, welcoming atmosphere.`,
        model: "sd3-medium",
        aspectRatio: "16:9",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed");
    }

    console.log("   ✅ Image generated");
    console.log(`   💵 Cost: $0.15 USDC\n`);

    return `data:image/png;base64,${data.image}`;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Step 2: Generate web content using Google AI
 */
async function generateContent(prompt: string, walletAddress: string, paymentFetch: any) {
  console.log("📝 Step 2: Generating content with Google AI...");
  console.log(`   Prompt: "${prompt}"`);

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify({
        prompt: `Generate a complete HTML landing page for: ${prompt}.
                 
                 Required Structure:
                 1. HEADER: Simple navigation bar with business logo placeholder (use text logo for now)
                 2. HERO SECTION: Full-width banner with id="hero-image" where I'll insert an image. Include business name overlay and tagline
                 3. INTRODUCTION SECTION: About the business with placeholder for an introduction image (id="intro-image"). Include 2-3 paragraphs about offerings, atmosphere, and philosophy
                 4. FOOTER: Contact info, hours, address, social media links
                 
                 Design Requirements:
                 - Use inline CSS only (no external stylesheets or JavaScript)
                 - Modern, clean design with appropriate brand colors
                 - Responsive layout using flexbox
                 - Elegant typography with good spacing
                 - Professional business aesthetic
                 - Keep code simple and readable (under 150 lines)
                 
                 Return ONLY the HTML code without any markdown formatting or code blocks.`,
        model: "gemini-2.0-flash-exp",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Content generation failed");
    }

    console.log("   ✅ Content generated");
    console.log(`   💵 Cost: $0.1 USDC\n`);

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
async function deployToCloudflare(html: string, siteName: string, walletAddress: string, paymentFetch: any) {
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
      headers: {
        "x-wallet-address": walletAddress,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Deployment failed");
    }

    console.log("   ✅ Deployed successfully");
    console.log(`   💵 Cost: $0.05 USDC\n`);

    return data.url;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Main flow: Automated website generation and deployment
 */
async function buildAndDeployWebsite(description: string, walletAddress: string, paymentFetch: any) {
  console.log("🎬 Starting automated website deployment...");
  console.log(`📋 Task: "${description}"\n`);

  const startTime = Date.now();

  try {
    // Step 1: Generate hero image
    const heroImage = await generateImage(description, walletAddress, paymentFetch);

    // Step 1.5: Generate introduction image
    console.log("🎨 Generating introduction image...");
    const introImage = await generateImage(
      `${description} - interior view, inviting atmosphere, professional setting`,
      walletAddress,
      paymentFetch,
    );

    // Step 2: Generate basic HTML structure
    const htmlTemplate = await generateContent(description, walletAddress, paymentFetch);

    // Step 2.5: Inject both images into the HTML
    console.log("🔧 Injecting images into HTML...");
    let htmlContent = htmlTemplate;

    // Inject hero image
    if (htmlContent.includes('id="hero-image"')) {
      htmlContent = htmlContent.replace(
        'id="hero-image"',
        `id="hero-image" style="background-image: url('${heroImage}'); background-size: cover; background-position: center;"`,
      );
    } else {
      // Fallback: inject before closing body tag
      htmlContent = htmlContent.replace(
        "</body>",
        `<div style="text-align: center; padding: 2rem;"><img src="${heroImage}" alt="Hero Image" style="width: 100%; height: auto;"></div></body>`,
      );
    }

    // Inject introduction image
    if (htmlContent.includes('id="intro-image"')) {
      htmlContent = htmlContent.replace(
        'id="intro-image"',
        `id="intro-image"><img src="${introImage}" alt="Restaurant Interior" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"`,
      );
    }

    console.log("   ✅ Images injected\n");

    // Step 3: Deploy
    const siteName = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 32);
    const deploymentUrl = await deployToCloudflare(htmlContent, siteName, walletAddress, paymentFetch);

    // Complete
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Deployment Complete!\n");
    console.log(`🌐 Live URL: ${deploymentUrl}`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log("\n💰 Total Cost Breakdown:");
    console.log("   - Stability AI (Hero):     $0.150");
    console.log("   - Stability AI (Intro):    $0.150");
    console.log("   - Google AI (Content):     $0.100");
    console.log("   - Cloudflare (Deploy):     $0.050");
    console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   Total:                     $0.450 USDC");
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
  // Validate configuration
  if (!AGENT_PRIVATE_KEY) {
    throw new Error("AGENT_PRIVATE_KEY environment variable is required");
  }

  // Create Agent wallet (using existing private key)
  const wallet = await createLocalWallet(baseSepolia, AGENT_PRIVATE_KEY);

  // Verify wallet address if provided
  if (AGENT_WALLET_ADDRESS && wallet.address.toLowerCase() !== AGENT_WALLET_ADDRESS.toLowerCase()) {
    console.warn(`⚠️  Warning: Wallet address mismatch`);
    console.warn(`   Expected: ${AGENT_WALLET_ADDRESS}`);
    console.warn(`   Actual:   ${wallet.address}`);
  }

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

  const projectDescription = process.argv[2] || "Modern Coffee Shop - Artisan Roastery & Cafe";
  const url = await buildAndDeployWebsite(projectDescription, wallet.address, paymentFetch);
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
