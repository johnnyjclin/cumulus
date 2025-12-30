"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CloudIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotoIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { BudgetDisplay } from "~~/components/BudgetDisplay";

interface Receipt {
  _id: string;
  txHash: string;
  walletAddress: string;
  amount: string;
  amountUSD: number;
  resource: string;
  description: string;
  network: string;
  timestamp: string;
  metadata?: {
    sessionHistory?: {
      userPrompt: string;
      assistantResponse: string;
      model: string;
      tokenUsage: any;
    };
    imageGeneration?: {
      prompt: string;
      model: string;
      aspectRatio: string;
      imageUrl: string;
    };
    deployment?: {
      projectName: string;
      deployUrl: string;
      version: string;
      status: string;
    };
  };
}

interface UsageData {
  walletAddress: string;
  totalSpent: number;
  totalRequests: number;
  serviceUsage: {
    [key: string]: {
      requests: number;
      spent: number;
      lastUsed: string;
    };
  };
  firstSeen: string;
  lastSeen: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"usage" | "resources">("usage");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    try {
      const response = await fetch(`/api/usage?wallet=${address}`);
      const data = await response.json();
      if (data.success) {
        setUsage(data.data);
      }
    } catch (err: any) {
      console.error("Error fetching usage:", err);
      setError("Failed to load usage data");
    }
  }, [address]);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/receipts?wallet=${address}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setReceipts(data.data);
      }
    } catch (err: any) {
      console.error("Error fetching receipts:", err);
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchUsageData();
      fetchReceipts();
    }
  }, [address, isConnected, fetchReceipts, fetchUsageData]);

  const downloadCSV = async () => {
    try {
      const response = await fetch(`/api/receipts?wallet=${address}&format=csv`);
      const csv = await response.text();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipts-${address}-${Date.now()}.csv`;
      a.click();
    } catch (err) {
      console.error("Error downloading CSV:", err);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <ChartBarIcon className="h-20 w-20 text-base-content/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-base-content/70 text-center max-w-md">
          Please connect your wallet to view your usage statistics and payment receipts.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-base-content/70">Track your spending, usage, and access cloud resources</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200 mb-8 p-1">
        <button
          className={`tab tab-lg ${activeTab === "usage" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("usage")}
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Usage & Receipts
        </button>
        <button
          className={`tab tab-lg ${activeTab === "resources" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          <CloudIcon className="h-5 w-5 mr-2" />
          Resource History
        </button>
      </div>

      {activeTab === "usage" ? (
        <UsageTab
          address={address!}
          usage={usage}
          receipts={receipts}
          loading={loading}
          error={error}
          downloadCSV={downloadCSV}
        />
      ) : (
        <ResourcesTab receipts={receipts} loading={loading} />
      )}
    </div>
  );
}

// Usage Tab Component
function UsageTab({
  address,
  usage,
  receipts,
  loading,
  error,
  downloadCSV,
}: {
  address: string;
  usage: UsageData | null;
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  downloadCSV: () => void;
}) {
  return (
    <>
      {/* On-Chain Budget Status */}
      {address && (
        <div className="mb-8">
          <BudgetDisplay address={address} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <CurrencyDollarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Spent</div>
            <div className="stat-value text-primary">${usage?.totalSpent.toFixed(3) || "0.000"}</div>
            <div className="stat-desc">All-time spending</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Squares2X2Icon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Requests</div>
            <div className="stat-value text-secondary">{usage?.totalRequests || 0}</div>
            <div className="stat-desc">API calls made</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <ClockIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Last Activity</div>
            <div className="stat-value text-accent text-2xl">
              {usage?.lastSeen ? new Date(usage.lastSeen).toLocaleDateString() : "N/A"}
            </div>
            <div className="stat-desc">Most recent use</div>
          </div>
        </div>
      </div>

      {/* Service Usage Breakdown */}
      {usage?.serviceUsage && Object.keys(usage.serviceUsage).length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <ChartBarIcon className="h-6 w-6" />
              Service Usage Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Requests</th>
                    <th>Spent</th>
                    <th>Last Used</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(usage.serviceUsage).map(([serviceName, data]: [string, any]) => (
                    <tr key={serviceName}>
                      <td className="font-semibold capitalize">{serviceName.replace(/-/g, " ")}</td>
                      <td>{data.requests}</td>
                      <td className="text-success">${data.spent.toFixed(3)}</td>
                      <td className="text-sm text-base-content/70">{new Date(data.lastUsed).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipts */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-2xl">
              <DocumentTextIcon className="h-6 w-6" />
              Payment Receipts
            </h2>
            <button onClick={downloadCSV} className="btn btn-outline btn-sm gap-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-base-content/30 mx-auto mb-3" />
              <p className="text-base-content/70">No payment receipts yet</p>
              <Link href="/services" className="btn btn-primary btn-sm mt-4">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Tx Hash</th>
                    <th>Network</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(receipt => (
                    <tr key={receipt._id}>
                      <td className="text-sm">{new Date(receipt.timestamp).toLocaleString()}</td>
                      <td className="font-medium">{receipt.description}</td>
                      <td className="text-success">{receipt.amount}</td>
                      <td>
                        <a
                          href={`https://sepolia.basescan.org/tx/${receipt.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-xs font-mono"
                        >
                          {receipt.txHash.substring(0, 10)}...
                        </a>
                      </td>
                      <td className="text-xs">{receipt.network}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}
    </>
  );
}

// Resources Tab Component
function ResourcesTab({ receipts, loading }: { receipts: Receipt[]; loading: boolean }) {
  const googleAIReceipts = receipts.filter(r => r.resource.includes("google-ai") && r.metadata?.sessionHistory);
  const stabilityReceipts = receipts.filter(r => r.resource.includes("stability-ai") && r.metadata?.imageGeneration);
  const cloudflareReceipts = receipts.filter(r => r.resource.includes("cloudflare") && r.metadata?.deployment);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <CloudIcon className="h-20 w-20 text-base-content/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Resources Yet</h3>
        <p className="text-base-content/70 mb-4">Start using our cloud services to see your resources here</p>
        <Link href="/services" className="btn btn-primary">
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Google AI Conversations */}
      {googleAIReceipts.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
              AI Conversations
              <span className="badge badge-primary">{googleAIReceipts.length}</span>
            </h2>
            <div className="space-y-4">
              {googleAIReceipts.map(receipt => (
                <div key={receipt._id} className="border border-base-300 rounded-lg p-4 hover:bg-base-200/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="badge badge-primary badge-sm">
                        {receipt.metadata?.sessionHistory?.model || "Gemini"}
                      </div>
                      <span className="text-xs text-base-content/60">
                        {new Date(receipt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="badge badge-outline">
                      {receipt.metadata?.sessionHistory?.tokenUsage?.totalTokens || 0} tokens
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-primary/10 rounded-lg p-3">
                      <p className="text-xs font-semibold text-primary mb-1">Your Prompt:</p>
                      <p className="text-sm">{receipt.metadata?.sessionHistory?.userPrompt}</p>
                    </div>
                    <div className="bg-base-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-base-content/70 mb-1">AI Response:</p>
                      <p className="text-sm whitespace-pre-wrap">
                        {receipt.metadata?.sessionHistory?.assistantResponse?.substring(0, 300)}
                        {receipt.metadata?.sessionHistory?.assistantResponse &&
                        receipt.metadata.sessionHistory.assistantResponse.length > 300
                          ? "..."
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stability AI Images */}
      {stabilityReceipts.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <PhotoIcon className="h-6 w-6 text-secondary" />
              Generated Images
              <span className="badge badge-secondary">{stabilityReceipts.length}</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stabilityReceipts.map(receipt => (
                <div key={receipt._id} className="card bg-base-200 shadow-md">
                  <figure className="px-4 pt-4">
                    <Image
                      src={receipt.metadata?.imageGeneration?.imageUrl || ""}
                      alt={receipt.metadata?.imageGeneration?.prompt || "Generated image"}
                      className="rounded-lg w-full h-48 object-cover"
                      width={400}
                      height={192}
                      unoptimized
                    />
                  </figure>
                  <div className="card-body p-4">
                    <div className="flex gap-2 mb-2">
                      <div className="badge badge-secondary badge-sm">{receipt.metadata?.imageGeneration?.model}</div>
                      <div className="badge badge-outline badge-sm">
                        {receipt.metadata?.imageGeneration?.aspectRatio}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/80 line-clamp-2">
                      {receipt.metadata?.imageGeneration?.prompt}
                    </p>
                    <p className="text-xs text-base-content/60 mt-2">{new Date(receipt.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare Deployments */}
      {cloudflareReceipts.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <CloudIcon className="h-6 w-6 text-accent" />
              Worker Deployments
              <span className="badge badge-accent">{cloudflareReceipts.length}</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Deploy URL</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudflareReceipts.map(receipt => (
                    <tr key={receipt._id}>
                      <td className="font-semibold">{receipt.metadata?.deployment?.projectName}</td>
                      <td>
                        <a
                          href={receipt.metadata?.deployment?.deployUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-accent text-sm"
                        >
                          {receipt.metadata?.deployment?.deployUrl?.substring(0, 40)}...
                        </a>
                      </td>
                      <td className="text-xs font-mono">
                        {new Date(receipt.metadata?.deployment?.version || "").toLocaleDateString()}
                      </td>
                      <td>
                        <div className="badge badge-success badge-sm">
                          {receipt.metadata?.deployment?.status || "deployed"}
                        </div>
                      </td>
                      <td className="text-sm">{new Date(receipt.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
