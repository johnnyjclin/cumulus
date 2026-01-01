import { CLOUDFLARE_WORKER_API_AMOUNT, GOOGLE_AI_API_AMOUNT, STABILITY_API_AMOUNT } from "./constants";
import { Network, Resource, paymentMiddleware } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;

export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/payment/cloudflare/worker": {
      price: `$${CLOUDFLARE_WORKER_API_AMOUNT}`,
      network,
      config: {
        description: "Cloudflare Worker Deployment",
      },
    },
    "/api/payment/google-ai/chat": {
      price: `$${GOOGLE_AI_API_AMOUNT}`,
      network,
      config: {
        description: "Google AI (Gemini) Text Generation",
      },
    },
    "/api/payment/stability-ai/text-to-image": {
      price: `$${STABILITY_API_AMOUNT}`,
      network,
      config: {
        description: "Stability AI Text-to-Image Generation",
      },
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    appName: "Next x402 Demo",
    appLogo: "/x402-icon-blue.png",
  },
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/payment/:path*", "/payment/:path*"],
};
