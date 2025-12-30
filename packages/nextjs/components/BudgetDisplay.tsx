"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { getUserBudgetStats } from "~~/utils/budgetManager";

interface BudgetStats {
  spent: string;
  limit: string;
  remaining: string;
  utilizationPercent: number;
}

interface BudgetDisplayProps {
  address: string;
  className?: string;
}

export function BudgetDisplay({ address, className = "" }: BudgetDisplayProps) {
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const fetchBudget = async () => {
      try {
        setLoading(true);
        setError(null);
        const budgetStats = await getUserBudgetStats(address);
        if (budgetStats) {
          let utilizationPercent = 0;
          if (
            "utilizationPercent" in budgetStats &&
            typeof (budgetStats as Record<string, unknown>).utilizationPercent === "number"
          ) {
            utilizationPercent = (budgetStats as { utilizationPercent: number }).utilizationPercent;
          } else if (
            "utilization" in budgetStats &&
            typeof (budgetStats as Record<string, unknown>).utilization === "number"
          ) {
            utilizationPercent = (budgetStats as { utilization: number }).utilization;
          }
          setStats({
            spent: budgetStats.spent,
            limit: budgetStats.limit,
            remaining: budgetStats.remaining,
            utilizationPercent,
          });
        } else {
          setStats(null);
        }
      } catch (err) {
        console.error("Failed to fetch budget:", err);
        setError("Failed to load budget information");
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();

    // Refresh every 10 seconds
    const interval = setInterval(fetchBudget, 10000);
    return () => clearInterval(interval);
  }, [address]);

  if (!address) {
    return (
      <div className={`alert alert-info ${className}`}>
        <ShieldCheckIcon className="h-6 w-6" />
        <span>Connect your wallet to view budget status</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-xl ${className}`}>
        <div className="card-body">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`alert alert-warning ${className}`}>
        <ExclamationTriangleIcon className="h-6 w-6" />
        <span>{error || "Budget information unavailable"}</span>
      </div>
    );
  }

  const percentUsed = stats.utilizationPercent;
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = percentUsed >= 100;

  const getProgressColor = () => {
    if (isAtLimit) return "progress-error";
    if (isNearLimit) return "progress-warning";
    return "progress-primary";
  };

  const getBadgeColor = () => {
    if (isAtLimit) return "badge-error";
    if (isNearLimit) return "badge-warning";
    return "badge-success";
  };

  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      <div className="card-body">
        <div className="flex items-start justify-between">
          <h3 className="card-title text-lg flex items-center gap-2">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            On-Chain Budget Limit
          </h3>
          <div className={`badge ${getBadgeColor()} badge-lg`}>{percentUsed}%</div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Progress Bar */}
          <div>
            <progress className={`progress ${getProgressColor()} w-full h-3`} value={percentUsed} max="100" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="stat p-0">
              <div className="stat-title text-xs">Spent</div>
              <div className="stat-value text-lg">${stats.spent}</div>
            </div>
            <div className="stat p-0">
              <div className="stat-title text-xs">Limit</div>
              <div className="stat-value text-lg">${stats.limit}</div>
            </div>
            <div className="stat p-0">
              <div className="stat-title text-xs">Remaining</div>
              <div className="stat-value text-lg">${stats.remaining}</div>
            </div>
          </div>

          {/* Alerts */}
          {isAtLimit && (
            <div className="alert alert-error">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <div className="text-sm">
                <strong>Budget limit reached!</strong>
                <br />
                You&apos;ve used 100% of your budget. Contact support to increase your limit.
              </div>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="alert alert-warning">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <div className="text-sm">
                <strong>Approaching budget limit</strong>
                <br />
                You&apos;ve used {percentUsed}% of your allocated budget.
              </div>
            </div>
          )}

          {!isNearLimit && (
            <div className="alert alert-success">
              <CheckCircleIcon className="h-5 w-5" />
              <div className="text-sm">Budget is healthy. Continue using services!</div>
            </div>
          )}

          {/* Blockchain Badge */}
          <div className="text-center">
            <a
              href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-outline badge-sm gap-1"
            >
              🔗 Verified on Base Sepolia
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
