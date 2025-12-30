"use client";

import { useEffect, useState } from "react";
import { Address } from "viem";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface BudgetStats {
  spent: string;
  limit: string;
  remaining: string;
  utilization: number;
  contractAddress: string;
  network: string;
  explorerUrl: string;
}

interface OnChainBudgetDisplayProps {
  address: Address;
  className?: string;
}

export const OnChainBudgetDisplay = ({ address, className = "" }: OnChainBudgetDisplayProps) => {
  const [budgetStats, setBudgetStats] = useState<BudgetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/budget/${address}`);

        if (!response.ok) {
          throw new Error("Failed to fetch budget stats");
        }

        const data = await response.json();
        setBudgetStats(data);
      } catch (err) {
        console.error("Error fetching budget:", err);
        setError("Unable to load budget information");
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchBudgetStats();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBudgetStats, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  if (isLoading) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6" />
            <h3 className="card-title">On-Chain Budget Limit</h3>
          </div>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-base-300 rounded w-3/4"></div>
            <div className="h-8 bg-base-300 rounded"></div>
            <div className="h-4 bg-base-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !budgetStats) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6" />
            <h3 className="card-title">On-Chain Budget Limit</h3>
          </div>
          <div className="alert alert-warning">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>Budget tracking unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  const percentUsed = budgetStats.utilization;
  const spentNum = parseFloat(budgetStats.spent);
  const limitNum = parseFloat(budgetStats.limit);
  const remainingNum = parseFloat(budgetStats.remaining);

  const getProgressColor = () => {
    if (percentUsed >= 100) return "progress-error";
    if (percentUsed >= 80) return "progress-warning";
    return "progress-primary";
  };

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            <h3 className="card-title">On-Chain Budget Limit</h3>
          </div>
          <a
            href={budgetStats.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs gap-1"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Verify
          </a>
        </div>

        <div className="space-y-4 mt-2">
          {/* Main Stats */}
          <div className="stats shadow w-full">
            <div className="stat place-items-center">
              <div className="stat-title">Spent</div>
              <div className="stat-value text-2xl">${spentNum.toFixed(2)}</div>
              <div className="stat-desc">of ${limitNum.toFixed(2)}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Remaining</div>
              <div className={`stat-value text-2xl ${remainingNum === 0 ? "text-error" : "text-success"}`}>
                ${remainingNum.toFixed(2)}
              </div>
              <div className="stat-desc">{percentUsed}% used</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Budget Usage</span>
              <span className="font-semibold">{percentUsed}%</span>
            </div>
            <progress className={`progress ${getProgressColor()} w-full`} value={percentUsed} max="100" />
          </div>

          {/* Alert Messages */}
          {percentUsed >= 100 && (
            <div className="alert alert-error">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <div className="text-sm">
                <strong>Budget Limit Reached!</strong>
                <br />
                You cannot make new payments until your budget is reset or increased.
              </div>
            </div>
          )}

          {percentUsed >= 80 && percentUsed < 100 && (
            <div className="alert alert-warning">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <div className="text-sm">
                <strong>Approaching Budget Limit</strong>
                <br />
                You&apos;ve used {percentUsed}% of your allocated budget.
              </div>
            </div>
          )}

          {percentUsed < 80 && (
            <div className="alert alert-success">
              <CheckCircleIcon className="h-5 w-5" />
              <div className="text-sm">Budget is healthy. You have ${remainingNum.toFixed(2)} remaining.</div>
            </div>
          )}

          {/* Contract Info */}
          <div className="text-xs text-base-content/60 pt-2 border-t border-base-300">
            <div className="flex items-center justify-between">
              <span>Enforced on {budgetStats.network}</span>
              <span className="font-mono text-xs">
                {budgetStats.contractAddress.slice(0, 6)}...{budgetStats.contractAddress.slice(-4)}
              </span>
            </div>
            <p className="mt-1">✓ Budget limits are enforced on-chain and cannot be bypassed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
