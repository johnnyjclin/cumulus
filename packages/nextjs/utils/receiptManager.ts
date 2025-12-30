import connectDB from "~~/lib/mongodb";
import PaymentReceipt from "~~/models/PaymentReceipt";
import UserUsage from "~~/models/UserUsage";

export interface RecordPaymentParams {
  txHash: string;
  walletAddress: string;
  amount: string; // e.g., "$0.1"
  resource: string; // e.g., "/api/payment/google-ai/chat"
  description: string;
  network: string;
  authorization?: string;
  metadata?: any;
}

/**
 * Record a successful 402 payment to database
 */
export async function recordPayment(params: RecordPaymentParams) {
  try {
    await connectDB();

    // Parse amount to USD number
    const amountUSD = parseFloat(params.amount.replace("$", ""));

    // Create payment receipt
    const receipt = await PaymentReceipt.create({
      txHash: params.txHash,
      walletAddress: params.walletAddress.toLowerCase(),
      amount: params.amount,
      amountUSD,
      resource: params.resource,
      description: params.description,
      network: params.network,
      authorization: params.authorization,
      timestamp: new Date(),
      metadata: params.metadata,
    });

    // Update user usage statistics
    const serviceName = extractServiceName(params.resource);

    await UserUsage.findOneAndUpdate(
      { walletAddress: params.walletAddress.toLowerCase() },
      {
        $inc: {
          totalSpent: amountUSD,
          totalRequests: 1,
          [`serviceUsage.${serviceName}.requests`]: 1,
          [`serviceUsage.${serviceName}.spent`]: amountUSD,
        },
        $set: {
          lastSeen: new Date(),
          [`serviceUsage.${serviceName}.lastUsed`]: new Date(),
        },
        $setOnInsert: {
          firstSeen: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    console.log(`💾 Payment recorded: ${params.txHash} - ${params.walletAddress} - ${params.amount}`);

    return receipt;
  } catch (error) {
    console.error("❌ Error recording payment:", error);
    // Don't throw - we don't want to fail the actual API call if DB recording fails
    return null;
  }
}

/**
 * Extract service name from resource path
 * e.g., "/api/payment/google-ai/chat" -> "google-ai"
 */
function extractServiceName(resource: string): string {
  const match = resource.match(/\/api\/payment\/([^\/]+)/);
  if (match) {
    return match[1];
  }
  return "unknown";
}

/**
 * Query receipts by wallet address
 */
export async function getReceiptsByWallet(
  walletAddress: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
    resource?: string;
  },
) {
  await connectDB();

  const query: any = { walletAddress: walletAddress.toLowerCase() };

  if (options?.startDate || options?.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = options.startDate;
    if (options.endDate) query.timestamp.$lte = options.endDate;
  }

  if (options?.resource) {
    query.resource = options.resource;
  }

  const receipts = await PaymentReceipt.find(query)
    .sort({ timestamp: -1 })
    .limit(options?.limit || 50)
    .skip(options?.offset || 0);

  const total = await PaymentReceipt.countDocuments(query);

  return {
    receipts,
    total,
    limit: options?.limit || 50,
    offset: options?.offset || 0,
  };
}

/**
 * Get user usage statistics
 */
export async function getUserUsage(walletAddress: string) {
  await connectDB();

  const usage = await UserUsage.findOne({
    walletAddress: walletAddress.toLowerCase(),
  });

  if (!usage) {
    return null;
  }

  return usage;
}

/**
 * Export receipts to CSV format
 */
export function receiptsToCSV(receipts: any[]): string {
  const headers = ["Timestamp", "Tx Hash", "Wallet", "Amount", "Resource", "Description", "Network"];

  const rows = receipts.map(receipt => [
    receipt.timestamp.toISOString(),
    receipt.txHash,
    receipt.walletAddress,
    receipt.amount,
    receipt.resource,
    receipt.description,
    receipt.network,
  ]);

  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

  return csvContent;
}
