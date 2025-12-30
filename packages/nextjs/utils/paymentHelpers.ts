/**
 * Helper to extract payment information from x402 request headers
 * The x402 middleware should populate these headers after successful payment verification
 */
export function extractPaymentInfo(request: Request) {
  // x402 middleware adds payment info to headers
  const walletAddress = request.headers.get("x-wallet-address");

  // Try to extract tx hash from x-payment-response header (base64 encoded JSON)
  let txHash = request.headers.get("x-payment-tx-hash");
  if (!txHash) {
    const paymentResponse = request.headers.get("x-payment-response");
    if (paymentResponse) {
      try {
        // x402 encodes payment response as base64 JSON
        const decoded = JSON.parse(Buffer.from(paymentResponse, "base64").toString());
        console.log("📦 Decoded x-payment-response:", decoded);
        // x402 uses 'transaction' as the key for tx hash
        txHash = decoded.transaction || decoded.txHash || decoded.transactionHash || decoded.hash;
      } catch (e) {
        console.error("Failed to decode x-payment-response:", e);
      }
    }
  }

  // Log all payment-related headers for debugging
  console.log("🔍 Payment Headers:", {
    walletAddress,
    txHash,
    hasPaymentResponse: !!request.headers.get("x-payment-response"),
  });

  const authorization = request.headers.get("authorization");

  return {
    txHash: txHash || `mock-tx-${Date.now()}`, // Fallback for development
    walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
    authorization,
  };
}

/**
 * For local development without real payments, generate a mock receipt
 */
export function generateMockPaymentInfo(walletAddress?: string) {
  return {
    txHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
    walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
    authorization: "mock-auth",
  };
}
