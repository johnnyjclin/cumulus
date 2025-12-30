"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import { CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { BUDGET_MANAGER_ABI } from "~~/contracts/budgetManagerABI";

const BUDGET_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS as `0x${string}`;
interface BudgetStatusProps {
  address: Address;
}

export const OnChainBudgetStatus = ({ address }: BudgetStatusProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: stats,
    isLoading,
    error,
  } = useReadContract({
    address: BUDGET_MANAGER_ADDRESS,
    abi: BUDGET_MANAGER_ABI,
    functionName: "getUserStats",
    args: [address],
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  if (!mounted || !BUDGET_MANAGER_ADDRESS) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            On-Chain Budget Limit
          </h3>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            On-Chain Budget Limit
          </h3>
          <div className="alert alert-warning">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>Unable to load on-chain budget data</span>
          </div>
        </div>
      </div>
    );
  }

  const [spent, limit, remaining, utilization] = stats;
  const percentUsed = Number(utilization);

  // Format values for display
  const spentUSD = (Number(spent) / 1_000_000).toFixed(2);
  const limitUSD = (Number(limit) / 1_000_000).toFixed(2);
  const remainingUSD = (Number(remaining) / 1_000_000).toFixed(2);

  // Determine alert level
  const getAlertClass = () => {
    if (percentUsed >= 100) return "alert-error";
    if (percentUsed >= 80) return "alert-warning";
    return "alert-success";
  };

  const getProgressClass = () => {
    if (percentUsed >= 100) return "progress-error";
    if (percentUsed >= 80) return "progress-warning";
    return "progress-primary";
  };

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-primary" />
          On-Chain Budget Limit
          <div className="badge badge-primary badge-sm ml-auto">Verified on Base</div>
        </h3>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-xs">Total Spent</div>
            <div className="stat-value text-2xl">${spentUSD}</div>
            <div className="stat-desc">USDC on Base Sepolia</div>
          </div>

          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-xs">Budget Limit</div>
            <div className="stat-value text-2xl">${limitUSD}</div>
            <div className="stat-desc">Smart contract enforced</div>
          </div>

          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-title text-xs">Remaining</div>
            <div className="stat-value text-2xl">${remainingUSD}</div>
            <div className="stat-desc">{percentUsed}% utilized</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Usage</span>
            <span className="font-semibold">{percentUsed}%</span>
          </div>
          <progress className={`progress w-full ${getProgressClass()}`} value={percentUsed} max="100" />
        </div>

        {/* Status Alert */}
        {percentUsed >= 80 && (
          <div className={`alert ${getAlertClass()} mt-4`}>
            {percentUsed >= 100 ? (
              <>
                <ExclamationTriangleIcon className="h-5 w-5" />
                <div>
                  <h4 className="font-bold">Budget Limit Reached</h4>
                  <p className="text-sm">
                    You have reached your on-chain spending limit. Further payments will be rejected by the smart
                    contract.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="h-5 w-5" />
                <div>
                  <h4 className="font-bold">High Budget Usage Warning</h4>
                  <p className="text-sm">
                    You&apos;ve used {percentUsed}% of your budget. Only ${remainingUSD} USDC remaining.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {percentUsed < 80 && (
          <div className="alert alert-success mt-4">
            <CheckCircleIcon className="h-5 w-5" />
            <div>
              <h4 className="font-bold">Budget Status: Healthy</h4>
              <p className="text-sm">
                ${remainingUSD} USDC available for services. All payments are verified on-chain.
              </p>
            </div>
          </div>
        )}

        {/* Contract Link */}
        <div className="mt-4 text-center">
          <a
            href={`https://sepolia.basescan.org/address/${BUDGET_MANAGER_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary text-sm"
          >
            View Contract on BaseScan →
          </a>
        </div>
      </div>
    </div>
  );
};
