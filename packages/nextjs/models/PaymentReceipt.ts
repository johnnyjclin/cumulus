import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPaymentReceipt extends Document {
  txHash: string; // Transaction hash from blockchain
  walletAddress: string; // User's wallet address (payer)
  amount: string; // Payment amount (e.g., "$0.1")
  amountUSD: number; // Numeric amount in USD
  resource: string; // API endpoint path (e.g., "/api/payment/google-ai/chat")
  description: string; // Service description (e.g., "Google AI Chat")
  network: string; // Network used (e.g., "base-sepolia")
  authorization?: string; // Authorization header/proof (optional)
  timestamp: Date; // Payment timestamp
  metadata?: {
    requestBody?: any; // Request details (optional)
    responseStatus?: number; // HTTP status code
    responseTime?: number; // Response time in ms
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentReceiptSchema: Schema<IPaymentReceipt> = new Schema(
  {
    txHash: {
      type: String,
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    amountUSD: {
      type: Number,
      required: true,
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    authorization: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
PaymentReceiptSchema.index({ walletAddress: 1, timestamp: -1 });
PaymentReceiptSchema.index({ resource: 1, timestamp: -1 });

const PaymentReceipt: Model<IPaymentReceipt> =
  mongoose.models.PaymentReceipt || mongoose.model<IPaymentReceipt>("PaymentReceipt", PaymentReceiptSchema);

export default PaymentReceipt;
