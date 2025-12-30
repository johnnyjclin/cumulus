import { Network, Resource, paymentMiddleware } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;

export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/payment/cloudflare/worker": {
      price: "$0.005",
      network,
      config: {
        description: "Cloudflare Worker Deployment",
      },
    },
    "/api/payment/google-ai/chat": {
      price: "$0.1",
      network,
      config: {
        description: "Google AI (Gemini) Text Generation",
      },
    },
    "/api/payment/stability-ai/text-to-image": {
      price: "$0.15",
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
