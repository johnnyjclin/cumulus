import { Network, Resource, paymentMiddleware } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;

export const middleware = paymentMiddleware(
  payTo,
  {
    "/api/payment/builder": {
      price: "$0.001",
      network,
      config: {
        description: "Access to protected content",
      },
    },
    "/payment/builder": {
      price: "$0.001",
      network,
      config: {
        description: "Access to protected content",
      },
    },
    "/api/payment/cloudflare/pages": {
      price: "$0.001",
      network,
      config: {
        description: "Cloudflare Pages Deployment",
      },
    },
    "/api/payment/cloudflare/worker": {
      price: "$0.001",
      network,
      config: {
        description: "Cloudflare Worker Deployment",
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
