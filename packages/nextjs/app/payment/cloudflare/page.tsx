"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "x402-fetch";
import { CheckCircleIcon, ExclamationCircleIcon, GlobeAltIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const CloudflareDeployPage: NextPage = () => {
  const { data: walletClient } = useWalletClient();
  const [scriptName, setScriptName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; scriptName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!file) return;
    if (!walletClient) {
      setError("Please connect your wallet first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("scriptName", scriptName);
      formData.append("file", file);

      console.log("Submitting Worker deployment request with x402...");
      // Wrap the standard fetch with x402 payment logic
      const fetchWithPayment = wrapFetchWithPayment(fetch, walletClient as any);

      const response = await fetchWithPayment("/api/payment/cloudflare/worker", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Deployment failed");
      }

      setResult({
        url: data.url,
        scriptName: data.scriptName,
      });
    } catch (err: any) {
      console.error("Deployment error:", err);
      setError(err.message || "An error occurred during deployment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 max-w-3xl w-full">
        <div className="bg-base-100 shadow-xl rounded-3xl p-8 border border-base-300">
          <div className="flex items-center gap-3 mb-6">
            <RocketLaunchIcon className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">Pay-to-Deploy</h1>
          </div>

          <p className="text-base-content/70 mb-8">
            Deploy a serverless Cloudflare Worker instantly.
            <span className="font-bold text-secondary ml-1">Price: $0.10 per deployment</span>
          </p>

          <div className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Worker Name</span>
              </label>
              <input
                type="text"
                placeholder="my-awesome-worker"
                className="input input-bordered w-full"
                value={scriptName}
                onChange={e => {
                  // Sanitize: lowercase, replace spaces/underscores with hyphens, remove other invalid chars
                  const sanitized = e.target.value
                    .toLowerCase()
                    .replace(/[\s_]+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  setScriptName(sanitized);
                }}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Only lowercase letters, numbers, and hyphens allowed.
                </span>
              </label>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Worker Script (ZIP file)</span>
              </label>
              <input
                type="file"
                accept=".zip"
                className="file-input file-input-bordered w-full"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Upload a .zip file containing index.js as the entry point.
                </span>
              </label>
            </div>

            <button
              className={`btn btn-primary w-full text-lg ${loading ? "loading" : ""}`}
              onClick={handleDeploy}
              disabled={!scriptName || !file || loading}
            >
              {loading ? "Processing Payment & Deploying..." : "Deploy Now ($0.10)"}
            </button>
          </div>

          {error && (
            <div className="alert alert-error mt-6 shadow-sm">
              <ExclamationCircleIcon className="h-6 w-6" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-2xl">
              <div className="flex items-center gap-2 text-success mb-4">
                <CheckCircleIcon className="h-6 w-6" />
                <h3 className="font-bold text-lg">Worker Deployed!</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm">Your worker is live at:</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline font-mono bg-base-100 p-3 rounded-lg border border-base-300"
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  {result.url}
                </a>
                <p className="text-xs text-base-content/50 mt-2">Worker Name: {result.scriptName}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-base-content/50">Powered by x402 Protocol & Cloudflare Workers</p>
        </div>
      </div>
    </div>
  );
};

export default CloudflareDeployPage;
