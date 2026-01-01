import { ethers } from "ethers";
import { BUDGET_MANAGER_ABI } from "~~/contracts/budgetManagerABI";

const BUDGET_MANAGER_ADDRESS = process.env.BUDGET_MANAGER_ADDRESS || process.env.NEXT_PUBLIC_BUDGET_MANAGER_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

/**
 * Check if a user has enough budget for a payment
 */
export async function checkUserBudget(
  userAddress: string,
  amountUSD: string,
): Promise<{
  allowed: boolean;
  remaining: string;
  spent: string;
  limit: string;
  utilization: number;
  error?: string;
}> {
  try {
    if (!BUDGET_MANAGER_ADDRESS) {
      console.warn("Budget Manager not configured, skipping check");
      return {
        allowed: true,
        remaining: "0",
        spent: "0",
        limit: "0",
        utilization: 0,
      };
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const budgetManager = new ethers.Contract(BUDGET_MANAGER_ADDRESS, BUDGET_MANAGER_ABI, provider);

    // Convert USD amount to USDC base units (6 decimals)
    const amountInBaseUnits = ethers.parseUnits(amountUSD.replace("$", ""), 6);

    // Get user stats
    const [spent, limit, remaining, utilizationPercent] = await budgetManager.getUserStats(userAddress);

    // Check if payment would be allowed
    const [allowed] = await budgetManager.checkBudget(userAddress, amountInBaseUnits);

    return {
      allowed,
      remaining: ethers.formatUnits(remaining, 6),
      spent: ethers.formatUnits(spent, 6),
      limit: ethers.formatUnits(limit, 6),
      utilization: Number(utilizationPercent),
      error: allowed ? undefined : "Budget limit exceeded",
    };
  } catch (error) {
    console.error("Error checking budget:", error);
    throw error;
  }
}

/**
 * Record a payment on-chain (admin function - requires private key)
 */
export async function recordPaymentOnChain(
  userAddress: string,
  amountUSD: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!BUDGET_MANAGER_ADDRESS) {
      return { success: false, error: "Budget Manager not configured" };
    }

    const deployerPK = process.env.DEPLOYER_PRIVATE_KEY;
    if (!deployerPK) {
      return { success: false, error: "No deployer key configured" };
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(deployerPK, provider);
    const budgetManager = new ethers.Contract(BUDGET_MANAGER_ADDRESS, BUDGET_MANAGER_ABI, wallet);

    const amountInBaseUnits = ethers.parseUnits(amountUSD, 6);

    const tx = await budgetManager.recordPayment(userAddress, amountInBaseUnits);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return {
      success: false,
      error: error.message || "Failed to record payment on-chain",
    };
  }
}

/**
 * Get user budget statistics
 */
export async function getUserBudgetStats(userAddress: string) {
  try {
    if (!BUDGET_MANAGER_ADDRESS) {
      return null;
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const budgetManager = new ethers.Contract(BUDGET_MANAGER_ADDRESS, BUDGET_MANAGER_ABI, provider);

    const [spent, limit, remaining, utilizationPercent] = await budgetManager.getUserStats(userAddress);

    return {
      spent: ethers.formatUnits(spent, 6),
      limit: ethers.formatUnits(limit, 6),
      remaining: ethers.formatUnits(remaining, 6),
      utilization: Number(utilizationPercent),
      contractAddress: BUDGET_MANAGER_ADDRESS,
    };
  } catch (error) {
    console.error("Error getting budget stats:", error);
    return null;
  }
}
