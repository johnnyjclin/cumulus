import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserUsage extends Document {
  walletAddress: string;
  totalSpent: number; // Total USD spent
  totalRequests: number; // Total number of requests
  serviceUsage: {
    [key: string]: {
      // e.g., "google-ai", "cloudflare", "stability-ai"
      requests: number;
      spent: number;
      lastUsed: Date;
    };
  };
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserUsageSchema: Schema<IUserUsage> = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    serviceUsage: {
      type: Map,
      of: {
        requests: { type: Number, default: 0 },
        spent: { type: Number, default: 0 },
        lastUsed: { type: Date, default: Date.now },
      },
      default: {},
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const UserUsage: Model<IUserUsage> =
  mongoose.models.UserUsage || mongoose.model<IUserUsage>("UserUsage", UserUsageSchema);

export default UserUsage;
