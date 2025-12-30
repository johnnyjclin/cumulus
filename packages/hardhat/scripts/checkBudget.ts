import { ethers } from "hardhat";

/**
 * Script to check budget status for a user
 * Usage: npx hardhat run scripts/checkBudget.ts --network baseSepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // Get deployed BudgetManager contract
  const budgetManager = await ethers.getContract("BudgetManager");
  const budgetManagerAddress = await budgetManager.getAddress();

  console.log("\n📊 Budget Manager Status\n");
  console.log("Contract Address:", budgetManagerAddress);
  console.log("Default Budget Limit:", await budgetManager.DEFAULT_BUDGET_LIMIT(), "USDC base units (0.5 USDC)");
  console.log("\n");

  // Check deployer's budget
  const userAddress = deployer.address;
  console.log("Checking budget for:", userAddress);

  const [spent, limit, remaining, utilization] = await budgetManager.getUserStats(userAddress);

  console.log("\n💰 Budget Statistics:");
  console.log("  Total Spent:", ethers.formatUnits(spent, 6), "USDC");
  console.log("  Budget Limit:", ethers.formatUnits(limit, 6), "USDC");
  console.log("  Remaining:", ethers.formatUnits(remaining, 6), "USDC");
  console.log("  Utilization:", utilization.toString() + "%");

  // Check if a 0.1 USDC payment would be allowed
  const testPayment = ethers.parseUnits("0.1", 6);
  const [allowed, remainingAfter] = await budgetManager.checkBudget(userAddress, testPayment);

  console.log("\n🔍 Test Payment Check (0.1 USDC):");
  console.log("  Would be allowed:", allowed);
  if (allowed) {
    console.log("  Remaining after payment:", ethers.formatUnits(remainingAfter, 6), "USDC");
  } else {
    console.log("  ❌ Payment would exceed budget limit");
  }

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
