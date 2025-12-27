import { NextResponse } from "next/server";
import JSZip from "jszip";

/**
 * Cloudflare Worker Deployment API
 * Protected by x402 middleware.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const scriptName = formData.get("scriptName") as string;
    const file = formData.get("file") as File;

    // Validate script name (lowercase, alphanumeric, hyphens)
    const nameRegex = /^[a-z0-9-]+$/;
    if (!scriptName || !nameRegex.test(scriptName)) {
      return NextResponse.json(
        { error: "Invalid script name. Use only lowercase letters, numbers, and hyphens." },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json({ error: "ZIP file is required" }, { status: 400 });
    }

    const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!CF_API_TOKEN || !CF_ACCOUNT_ID) {
      return NextResponse.json({ error: "Cloudflare configuration missing on server" }, { status: 500 });
    }

    // 1. Process ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const contents = await zip.loadAsync(arrayBuffer);

    // Find the entry point (index.js or the first .js file)
    let scriptContent = "";
    if (contents.files["index.js"]) {
      scriptContent = await contents.files["index.js"].async("string");
    } else {
      const jsFile = Object.keys(contents.files).find(name => name.endsWith(".js"));
      if (jsFile) {
        scriptContent = await contents.files[jsFile].async("string");
      }
    }

    if (!scriptContent) {
      return NextResponse.json(
        { error: "No .js entry point found in ZIP. Please include an index.js file." },
        { status: 400 },
      );
    }

    console.log(`Deploying Worker: ${scriptName}`);

    // 2. Upload the Worker script as an ES Module
    // For ES modules, Cloudflare requires a multipart/form-data upload
    // Reference: https://developers.cloudflare.com/api/operations/worker-script-upload-worker-module
    const uploadFormData = new FormData();

    // The metadata part defines the entry point and format
    const metadata = {
      main_module: "index.js",
    };
    uploadFormData.append("metadata", JSON.stringify(metadata));

    // The script part contains the actual code
    // We use a Blob to specify the filename and type
    const scriptBlob = new Blob([scriptContent], { type: "application/javascript+module" });
    uploadFormData.append("index.js", scriptBlob, "index.js");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${scriptName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          // Note: fetch will automatically set the correct multipart/form-data boundary
        },
        body: uploadFormData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: "Cloudflare API error", details: data }, { status: response.status });
    }

    // 2. Enable the workers.dev subdomain for this script
    // Reference: https://developers.cloudflare.com/api/operations/worker-subdomain-create-subdomain
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${scriptName}/subdomain`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: true }),
      },
    );

    // Note: We need to know the account's workers.dev subdomain to construct the URL
    // For this demo, we'll try to fetch it or assume a pattern
    const subdomainResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/subdomain`,
      {
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
        },
      },
    );
    const subdomainData = await subdomainResponse.json();
    const subdomain = subdomainData.result?.subdomain || "your-subdomain";

    return NextResponse.json({
      message: "Worker deployed successfully!",
      url: `https://${scriptName}.${subdomain}.workers.dev`,
      scriptName: scriptName,
      receipt: "x402-payment-confirmed",
    });
  } catch (error: any) {
    console.error("Worker deployment error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
