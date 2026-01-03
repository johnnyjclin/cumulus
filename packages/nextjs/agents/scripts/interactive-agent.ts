import { wrap as wrapFetch } from "@faremeter/fetch";
import { createPaymentHandler } from "@faremeter/payment-evm/exact";
import { createLocalWallet } from "@faremeter/wallet-evm";
import * as readline from "readline";
import { baseSepolia } from "viem/chains";

/**
 * Interactive AI Agent - Autonomous API Calling System
 *
 * This agent uses Google AI (Gemini) as the "brain" to:
 * 1. Understand user's natural language request
 * 2. Autonomously decide which APIs to call
 * 3. Make payments for each API call
 * 4. Coordinate the workflow to complete the task
 */

// Configuration
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY || "";
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

// Available tools the AI agent can use
const AVAILABLE_TOOLS = [
  {
    name: "generate_image",
    description:
      "Generate an image using Stability AI (sd3-medium). Cost: $0.15 USDC per image. Returns base64 data URL. TIP: Generate 2 images for landing pages (hero and about/feature).",
    parameters: {
      prompt:
        "string - Detailed, specific description of the image to generate (e.g., 'professional restaurant interior with warm lighting, wooden tables, vintage decor')",
    },
    example: {
      tool: "generate_image",
      parameters: {
        prompt:
          "elegant Italian restaurant interior, warm ambient lighting, rustic wooden tables, wine bottles on shelves",
      },
      reason: "Need a hero image for the landing page",
    },
  },
  {
    name: "generate_content",
    description:
      "Generate complete HTML website content using Google AI (gemini-2.0-flash-exp). Cost: $0.1 USDC. Returns full HTML page.",
    parameters: {
      prompt: "string - Description of the website to generate, including business type, style, and key sections",
    },
    example: {
      tool: "generate_content",
      parameters: {
        prompt:
          "Create a modern Italian restaurant landing page with hero section, about section, menu highlights, and contact form. Elegant and warm design.",
      },
      reason: "Generate the complete HTML structure and content",
    },
  },
  {
    name: "deploy_website",
    description: "Deploy HTML to Cloudflare Workers. Cost: $0.05 USDC. Returns live URL.",
    parameters: {
      html_content: "string - HTML content to deploy (use 'content from previous step' if referencing generated HTML)",
      site_name: "string - URL-friendly name (lowercase, hyphens only)",
    },
    example: {
      tool: "deploy_website",
      parameters: { html_content: "HTML from previous step", site_name: "modern-italian-restaurant" },
      reason: "Deploy the website to make it publicly accessible",
    },
  },
];

/**
 * AI Agent Brain - Analyzes request and decides what to do
 */
async function analyzeRequest(userRequest: string, walletAddress: string, paymentFetch: any) {
  console.log("\n🧠 AI Agent analyzing your request...");

  const systemPrompt = `You are an autonomous AI agent that can use paid APIs to complete tasks.

AVAILABLE TOOLS:
${AVAILABLE_TOOLS.map(
  tool => `
${tool.name}:
  Description: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters)}
  Example: ${JSON.stringify(tool.example, null, 2)}`,
).join("\n")}

USER REQUEST: "${userRequest}"

IMPORTANT GUIDELINES:
- For landing pages/websites: Generate 3-5 diverse images FIRST (hero, about, features, products, team, etc.), then HTML content, then deploy
- Use exact tool names: "generate_image", "generate_content", "deploy_website"
- For deploy_website, use "html_content": "HTML from previous step" in parameters
- For images, be VERY specific and descriptive in prompts (mention colors, mood, elements, style)
- More images = richer page (3-5 recommended). JPEG format keeps file size small.
- Calculate total cost: ($0.15 × num_images) + $0.1 content + $0.05 deploy

Respond in JSON format:
{
  "task_summary": "brief summary of what you'll do",
  "estimated_cost": "$X.XX USDC",
  "steps": [
    {
      "tool": "exact_tool_name",
      "parameters": {"param": "value"},
      "reason": "why this step is needed"
    }
  ]
}

EXAMPLE for "create a coffee shop landing page":
{
  "task_summary": "Create a coffee shop landing page with 2 focused images",
  "estimated_cost": "$0.45 USDC",
  "steps": [
    {"tool": "generate_image", "parameters": {"prompt": "cozy coffee shop interior, warm ambient lighting, wooden furniture, customers chatting, rustic brick walls"}, "reason": "Generate hero image"},
    {"tool": "generate_image", "parameters": {"prompt": "artisan coffee cup with intricate latte art, steam rising, dark wooden table, morning light"}, "reason": "Generate about/product image"},
    {"tool": "generate_content", "parameters": {"prompt": "Professional coffee shop landing page with hero, about, menu highlights, contact"}, "reason": "Generate concise HTML"},
    {"tool": "deploy_website", "parameters": {"html_content": "HTML from previous step", "site_name": "cozy-coffee-shop"}, "reason": "Deploy live"}
  ]
}

Return ONLY valid JSON, no other text.`;

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify({
        prompt: systemPrompt,
        model: "gemini-2.0-flash-exp",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to analyze request");
    }

    // Parse AI response
    let planText = data.response.trim();

    // Remove markdown code blocks if present
    planText = planText.replace(/```json\n?/g, "");
    planText = planText.replace(/```\n?/g, "");
    planText = planText.trim();

    const plan = JSON.parse(planText);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🧠 AI REASONING & PLANNING`);
    console.log(`${"=".repeat(60)}`);
    console.log(`\n📋 Task Summary:\n   ${plan.task_summary}`);
    console.log(`\n💰 Estimated Cost: ${plan.estimated_cost} USDC`);
    console.log(`\n📝 Execution Plan (${plan.steps.length} steps):`);

    plan.steps.forEach((step: any, index: number) => {
      console.log(`\n   Step ${index + 1}: ${step.tool}`);
      console.log(`   └─ Reason: ${step.reason}`);
      console.log(
        `   └─ Parameters:`,
        JSON.stringify(step.parameters, null, 2)
          .split("\n")
          .map((line, i) => (i === 0 ? line : `      ${line}`))
          .join("\n"),
      );
    });

    console.log(`\n${"=".repeat(60)}\n`);

    return plan;
  } catch (error: any) {
    console.error("❌ Error analyzing request:", error.message);
    throw error;
  }
}

/**
 * Check if a string is a placeholder description rather than actual content
 */
function isPlaceholderText(text: string | undefined): boolean {
  if (!text || typeof text !== "string") return true;

  const placeholderKeywords = [
    "previous step",
    "generated from",
    "will be inserted",
    "content from above",
    "generated in the",
    "HTML content generated",
    "result from",
  ];

  const lowerText = text.toLowerCase();
  return placeholderKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Optimize images by limiting quantity if total size exceeds limit
 * Note: We don't compress because base64 sampling corrupts images
 */
function optimizeImages(images: string[], maxTotalKB: number = 2000): string[] {
  if (images.length === 0) return images;

  const totalSize = images.reduce((sum, img) => sum + img.length, 0);
  const totalKB = Math.round(totalSize / 1024);

  console.log(`📊 Original images total: ${totalKB} KB (${images.length} image(s))`);

  if (totalKB <= maxTotalKB) {
    console.log(`✅ Images within size limit (${maxTotalKB} KB)`);
    return images;
  }

  console.log(`⚠️  Images too large (${totalKB} KB > ${maxTotalKB} KB)`);
  console.log(`📉 Reducing to single image to stay under limit...`);

  // Use only the first image if total is too large
  const firstImageKB = Math.round(images[0].length / 1024);
  console.log(`   ✅ Using first image only: ${firstImageKB} KB`);

  return [images[0]];
}

/**
 * Inject images into HTML content
 */
function injectImagesIntoHTML(html: string, images: string[]): string {
  if (!images || images.length === 0) return html;

  console.log(`🖼️  Injecting ${images.length} image(s) into HTML...`);

  // Check image sizes
  const imageSizes = images.map(img => Math.round(img.length / 1024));
  console.log(`📊 Image sizes: ${imageSizes.join(" KB, ")} KB`);

  const totalImageSize = imageSizes.reduce((a, b) => a + b, 0);
  console.log(`📊 Total image data: ${totalImageSize} KB`);

  // Warning if images are too large
  if (totalImageSize > 1500) {
    console.warn(`⚠️  Warning: Images are very large (${totalImageSize} KB)`);
    console.warn(`⚠️  This may cause deployment issues. Consider using smaller images.`);
  }

  let updatedHtml = html;

  // Define image IDs to replace (limited to 2 for token efficiency)
  const imageIds = ["hero-image", "about-image"];

  // Replace img src attributes by ID
  imageIds.forEach((id, index) => {
    if (images[index]) {
      // Find and replace img tags with this ID
      // Match: <img ... id="hero-image" ... src="..." ...>
      const regex = new RegExp(`(<img[^>]*id=["']${id}["'][^>]*src=["'])[^"']*(["'][^>]*>)`, "gi");
      const replaced = updatedHtml.replace(regex, `$1${images[index]}$2`);

      if (replaced !== updatedHtml) {
        updatedHtml = replaced;
        console.log(`   ✅ Replaced ${id} src (${imageSizes[index]} KB)`);
      } else {
        console.log(`   ⚠️  Could not find img#${id} in HTML`);
      }
    } else {
      console.log(`   ℹ️  No image for ${id}`);
    }
  });

  // Legacy support: Also handle HTML comment placeholders if they exist
  const legacyComments = [
    { comment: "HERO_IMAGE", index: 0 },
    { comment: "ABOUT_IMAGE", index: 1 },
    { comment: "INTRO_IMAGE", index: 1 }, // Alias for about
  ];

  legacyComments.forEach(({ comment, index }) => {
    const regex = new RegExp(`<!--\\s*${comment}\\s*-->`, "gi");
    if (images[index]) {
      updatedHtml = updatedHtml.replace(
        regex,
        `<img src="${images[index]}" alt="${comment}" loading="lazy" style="width: 100%; height: auto; object-fit: cover;">`,
      );
    } else {
      updatedHtml = updatedHtml.replace(regex, "");
    }
  });

  // Also replace any existing img tags with placeholder sources
  const imgPlaceholders = [
    { pattern: /<img[^>]+src=["'][^"']*hero[^"']*["'][^>]*>/gi, index: 0, name: "hero" },
    { pattern: /<img[^>]+src=["'][^"']*intro[^"']*["'][^>]*>/gi, index: 1, name: "intro" },
    { pattern: /<img[^>]+src=["']https?:\/\/[^"']+["'][^>]*>/gi, index: 0, name: "generic" },
  ];

  for (const placeholder of imgPlaceholders) {
    if (images[placeholder.index]) {
      const matches = updatedHtml.match(placeholder.pattern);
      if (matches && matches.length > 0) {
        updatedHtml = updatedHtml.replace(placeholder.pattern, match => {
          // Add loading="lazy" if not present
          let newMatch = match.replace(/src=["'][^"']*["']/, `src="${images[placeholder.index]}"`);
          if (!newMatch.includes("loading=")) {
            newMatch = newMatch.replace(/<img/, '<img loading="lazy"');
          }
          return newMatch;
        });
        console.log(`   ✅ Replaced ${placeholder.name} image src`);
      }
    }
  }

  return updatedHtml;
}

/**
 * Execute a tool based on AI decision
 */
async function executeTool(tool: string, parameters: any, walletAddress: string, paymentFetch: any, context: any) {
  console.log(`🔧 Executing tool: "${tool}"`);
  console.log(`📦 Parameters:`, JSON.stringify(parameters, null, 2));

  // Normalize tool name (remove underscores, make lowercase)
  const normalizedTool = tool.toLowerCase().replace(/_/g, "");

  if (normalizedTool.includes("image") || normalizedTool === "generateimage") {
    if (!parameters.prompt) {
      throw new Error("❌ Missing required parameter: prompt");
    }
    console.log(`📸 Calling Stability AI...`);
    return await generateImage(parameters.prompt, walletAddress, paymentFetch);
  } else if (normalizedTool.includes("content") || normalizedTool === "generatecontent") {
    if (!parameters.prompt) {
      throw new Error("❌ Missing required parameter: prompt");
    }
    console.log(`📝 Calling Google AI...`);
    return await generateContent(parameters.prompt, walletAddress, paymentFetch);
  } else if (normalizedTool.includes("deploy") || normalizedTool.includes("website")) {
    // Detect if parameter contains placeholder text
    const paramHtml = parameters.html || parameters.html_content;
    let htmlToUse: string;

    if (isPlaceholderText(paramHtml)) {
      console.log(`🔍 Parameter contains placeholder text, using context.htmlContent`);
      htmlToUse = context.htmlContent;
    } else {
      console.log(`🔍 Using HTML from parameters`);
      htmlToUse = paramHtml || context.htmlContent;
    }

    // Validate we have actual HTML content
    if (!htmlToUse || htmlToUse.length < 100) {
      throw new Error(`❌ No valid HTML content found (length: ${htmlToUse?.length || 0})`);
    }

    const originalLength = htmlToUse.length;
    console.log(`📄 Original HTML: ${originalLength} characters (${Math.round(originalLength / 1024)} KB)`);
    console.log(`📄 First 100 chars: ${htmlToUse.substring(0, 100)}...`);

    // Inject images if available (do this just before deployment)
    if (context.images && context.images.length > 0) {
      console.log(`\n🎨 Processing ${context.images.length} images for injection...`);

      // Optimize images if they're too large
      const optimizedImages = optimizeImages(context.images, 2000); // Max 2MB for images

      console.log(`\n🖼️  Injecting images into HTML...`);
      htmlToUse = injectImagesIntoHTML(htmlToUse, optimizedImages);

      const finalLength = htmlToUse.length;
      const finalKB = Math.round(finalLength / 1024);
      console.log(`📄 After injection: ${finalLength} characters (${finalKB} KB)`);
      console.log(`📊 Size increase: +${Math.round((finalLength - originalLength) / 1024)} KB`);

      // Check if still too large
      if (finalKB > 3000) {
        console.warn(`\n⚠️  WARNING: Final size (${finalKB} KB) still exceeds 3MB limit`);
        console.warn(`⚠️  Trying with only 1 image to reduce size...`);

        // Retry with only the first (hero) image
        htmlToUse = htmlToUse.substring(0, originalLength); // Reset to original HTML
        htmlToUse = injectImagesIntoHTML(htmlToUse, [optimizedImages[0]]);

        const retryLength = htmlToUse.length;
        const retryKB = Math.round(retryLength / 1024);
        console.log(`📄 With 1 image: ${retryLength} characters (${retryKB} KB)`);
      }

      console.log();
    } else {
      console.log(`⚠️  No images in context to inject`);
    }

    return await deployWebsite(
      htmlToUse,
      parameters.siteName || parameters.site_name || "ai-generated-site",
      walletAddress,
      paymentFetch,
    );
  } else {
    throw new Error(`❌ Unknown tool: "${tool}" (normalized: "${normalizedTool}")`);
  }
}

/**
 * Generate image using Stability AI
 * Using 3:2 aspect ratio to reduce file size while maintaining quality
 */
async function generateImage(prompt: string, walletAddress: string, paymentFetch: any) {
  console.log(`🎨 Generating image: "${prompt.substring(0, 50)}..."`);

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/stability-ai/text-to-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify({
        prompt: `Professional image: ${prompt}`,
        model: "sd3-medium",
        aspectRatio: "3:2", // Valid ratio: 3:2 is smaller than 16:9
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed");
    }

    console.log("   ✅ Image generated (3:2 ratio, JPEG)");
    console.log(`   💵 Paid: $0.15 USDC\n`);

    return `data:image/jpeg;base64,${data.image}`; // Changed to jpeg
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Generate content using Google AI
 */
async function generateContent(prompt: string, walletAddress: string, paymentFetch: any) {
  console.log(`📝 Generating content: "${prompt.substring(0, 50)}..."`);

  // Simplified prompt to avoid MAX_TOKENS
  const enhancedPrompt = `Create a professional single-page HTML landing page for: ${prompt}

STRUCTURE (4 sections only):
1. Hero section: <img id="hero-image" src="#" alt="Hero" style="width: 100%; height: auto; max-height: 500px; object-fit: cover;">
2. About section: <img id="about-image" src="#" alt="About" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px;">
3. Services/Features (3-4 cards)
4. Contact form + Footer

REQUIREMENTS:
- Complete HTML5 with embedded CSS
- Modern responsive design
- Vibrant colors, smooth animations
- Keep under 500 lines
- Meta tags: title, description, viewport

Return ONLY HTML code, no explanations.`;

  try {
    const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        model: "gemini-2.0-flash-exp",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Content generation failed");
    }

    console.log("   ✅ Content generated");
    console.log(`   💵 Paid: $0.1 USDC\n`);

    // Clean up response
    let content = data.response.trim();
    content = content.replace(/```html\n?/g, "");
    content = content.replace(/```\n?/g, "");

    return content.trim();
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Deploy website to Cloudflare
 */
async function deployWebsite(html: string, siteName: string, walletAddress: string, paymentFetch: any) {
  console.log(`\n🚀 Deploying website: "${siteName}"`);

  // Final validation
  if (!html || html.length < 100) {
    throw new Error(`❌ Invalid HTML content for deployment (length: ${html?.length || 0})`);
  }

  if (isPlaceholderText(html)) {
    throw new Error(`❌ Cannot deploy placeholder text as HTML content`);
  }

  const htmlSizeKB = Math.round(html.length / 1024);
  console.log(`✅ HTML validation passed (${html.length} characters)`);
  console.log(`📊 HTML size: ${htmlSizeKB} KB`);

  const MAX_SIZE_KB = 3072; // 3MB limit

  // Auto-optimize if too large
  if (htmlSizeKB > MAX_SIZE_KB) {
    console.log(`\n⚠️  Size (${htmlSizeKB} KB) exceeds limit (${MAX_SIZE_KB} KB)`);
    console.log(`🔧 Auto-optimizing content...\n`);

    // Extract and compress images
    const imgRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*>/gi;
    const images: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    if (images.length > 0) {
      console.log(`🖼️  Found ${images.length} embedded images`);

      // Calculate total size
      const totalImageSize = images.reduce((sum: number, img: string) => sum + img.length, 0);
      const totalImageSizeKB = Math.round(totalImageSize / 1024);
      console.log(`📊 Total image size: ${totalImageSizeKB} KB\n`);

      if (htmlSizeKB > MAX_SIZE_KB) {
        console.warn(`⚠️  Warning: HTML size (${htmlSizeKB} KB) exceeds ${MAX_SIZE_KB} KB limit`);
        console.warn(`⚠️  Consider using fewer or smaller images\n`);
      }
    }
  }

  // Create Worker script with HTML data embedded as a constant
  // Using template literal but escaping properly to avoid issues
  const workerScript = `
const htmlContent = ${JSON.stringify(html)};

export default {
  async fetch(request) {
    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "public, max-age=3600",
      },
    });
  },
};
  `.trim();

  // Check worker script size
  const scriptSizeKB = Math.round(workerScript.length / 1024);
  console.log(`📊 Worker script size: ${scriptSizeKB} KB`);

  if (scriptSizeKB > 1024) {
    console.warn(`⚠️  Warning: Script size (${scriptSizeKB} KB) exceeds recommended limit (1024 KB)`);
    console.warn(`⚠️  Deployment may fail. Consider optimizing images or reducing content size.`);
  }

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
    console.log(`   💵 Paid: $0.05 USDC\n`);

    return data.url;
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    throw error;
  }
}

/**
 * Interactive prompt for user input
 */
async function promptUser(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question("\n💬 What would you like me to create? (or 'quit' to exit)\n> ", answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Simple yes/no confirmation
 */
async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`\n${message} (y/n): `, answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

/**
 * Main agent loop
 */
async function main() {
  // Validate configuration
  if (!AGENT_PRIVATE_KEY) {
    throw new Error("AGENT_PRIVATE_KEY environment variable is required");
  }

  // Create Agent wallet
  const wallet = await createLocalWallet(baseSepolia, AGENT_PRIVATE_KEY);

  // Setup payment handler
  const paymentFetch = wrapFetch(fetch, {
    handlers: [createPaymentHandler(wallet)],
  });

  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║     🤖 Autonomous AI Agent - Interactive Mode     ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log(`\n📍 Agent Wallet: ${wallet.address}`);
  console.log(`⛓️  Network: Base Sepolia`);
  console.log(`🌐 Gateway: ${GATEWAY_URL}`);
  console.log("\n💡 This AI agent can autonomously:");
  console.log("   • Analyze your natural language requests");
  console.log("   • Decide which APIs to call");
  console.log("   • Make payments for each service");
  console.log("   • Coordinate multi-step workflows");
  console.log("\n📝 Example requests:");
  console.log('   • "Create a landing page for my coffee shop"');
  console.log('   • "Generate a hero image for luxury watches"');
  console.log('   • "Build a website for a yoga studio"');

  // Interactive loop
  while (true) {
    try {
      const userInput = await promptUser();

      if (!userInput || userInput.toLowerCase() === "quit" || userInput.toLowerCase() === "exit") {
        console.log("\n👋 Goodbye!\n");
        break;
      }

      console.log("\n" + "─".repeat(60));
      const startTime = Date.now();

      // Step 1: AI analyzes the request and creates a plan
      console.log("📊 Analyzing your request with AI...\n");
      const plan = await analyzeRequest(userInput, wallet.address, paymentFetch);

      // Ask for confirmation
      console.log(
        `\n💡 This plan will make ${plan.steps.length} API calls and cost approximately ${plan.estimated_cost}`,
      );
      const confirmed = await promptConfirmation("⚠️  Ready to execute this plan. Continue?");

      console.log(`\n👤 User confirmation: ${confirmed ? "YES ✓" : "NO ✗"}\n`);

      if (!confirmed) {
        console.log("❌ Plan cancelled by user");
        continue;
      }

      // Step 2: Execute each step autonomously
      console.log("\n🚀 Executing autonomous workflow...\n");
      console.log(`📊 Total steps to execute: ${plan.steps.length}\n`);

      const context: any = {}; // Share data between steps
      const results: any[] = [];

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        console.log(`\n${"─".repeat(60)}`);
        console.log(`📍 STEP ${i + 1}/${plan.steps.length}: ${step.tool.toUpperCase()}`);
        console.log(`${"─".repeat(60)}`);
        console.log(`💭 Reasoning: ${step.reason}`);
        console.log(
          `⚙️  Parameters:`,
          JSON.stringify(step.parameters, null, 2)
            .split("\n")
            .map((line, idx) => (idx === 0 ? line : `   ${line}`))
            .join("\n"),
        );
        console.log(``);

        let result;
        try {
          result = await executeTool(step.tool, step.parameters, wallet.address, paymentFetch, context);
        } catch (toolError: any) {
          console.error(`\n❌ Tool execution failed: ${toolError.message}`);
          throw toolError;
        }

        results.push({ step: step.tool, result });

        // Store results in context for next steps (images stored separately, injected at deployment)
        if (step.tool === "generate_image") {
          if (!context.images) context.images = [];
          context.images.push(result);
          const imageKB = Math.round(result.length / 1024);
          console.log(`💾 Image stored in context (${context.images.length} total, ${imageKB} KB)`);
          console.log(
            `📊 Total images size: ${Math.round(context.images.reduce((sum: number, img: string) => sum + img.length, 0) / 1024)} KB`,
          );
        } else if (step.tool === "generate_content") {
          context.htmlContent = result;
          console.log(
            `💾 HTML content stored in context (${result.length} characters, ${Math.round(result.length / 1024)} KB)`,
          );
          console.log(`ℹ️  Images will be injected during deployment step`);
        } else if (step.tool === "deploy_website") {
          context.deploymentUrl = result;
          console.log(`💾 Deployment URL stored: ${result}`);
        }
      }

      // Summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n${"━".repeat(60)}`);
      console.log(`✅ TASK COMPLETED SUCCESSFULLY`);
      console.log(`${"━".repeat(60)}`);
      console.log(`⏱️  Total Duration: ${duration}s`);
      console.log(`💰 Total Cost: ${plan.estimated_cost}`);
      console.log(`📊 Steps Executed: ${results.length}/${plan.steps.length}`);

      if (context.images && context.images.length > 0) {
        console.log(`🖼️  Images Generated: ${context.images.length}`);
      }
      if (context.htmlContent) {
        console.log(`📄 HTML Content: ${context.htmlContent.length} characters`);
      }
      if (context.deploymentUrl) {
        console.log(`\n🌐 LIVE URL: ${context.deploymentUrl}`);
      }

      console.log(`${"━".repeat(60)}`);
    } catch (error: any) {
      console.error("\n❌ Error:", error.message);
      console.log("─".repeat(60));
    }
  }

  process.exit(0);
}

// Execute
main().catch(error => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
