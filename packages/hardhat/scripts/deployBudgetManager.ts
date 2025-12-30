import { ethers, network } from "hardhat";

/**
 * Direct deployment script for BudgetManager
 * Usage:
 *   DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deployBudgetManager.ts --network baseSepolia
 */
async function main() {
  console.log("\n🚀 Deploying BudgetManager Contract\n");
  console.log("Network:", network.name);

  // Get deployer from private key
  const deployerPK = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerPK) {
    throw new Error("Please set DEPLOYER_PRIVATE_KEY environment variable");
  }

  const deployer = new ethers.Wallet(deployerPK, ethers.provider);
  console.log("Deploying from:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer has no ETH. Please fund the address first.");
  }

  // Deploy BudgetManager
  console.log("\n📄 Deploying BudgetManager...");
  const BudgetManager = await ethers.getContractFactory("BudgetManager", deployer);
  const budgetManager = await BudgetManager.deploy();

  await budgetManager.waitForDeployment();
  const address = await budgetManager.getAddress();

  console.log("✅ BudgetManager deployed to:", address);

  // Display contract info
  const defaultLimit = await budgetManager.DEFAULT_BUDGET_LIMIT();
  console.log("\n📊 Contract Configuration:");
  console.log("  Default Budget Limit:", ethers.formatUnits(defaultLimit, 6), "USDC");
  console.log("  Owner:", await budgetManager.owner());

  // Check deployer's budget
  const [spent, limit, remaining, utilization] = await budgetManager.getUserStats(deployer.address);
  console.log("\n💰 Deployer Budget:");
  console.log("  Spent:", ethers.formatUnits(spent, 6), "USDC");
  console.log("  Limit:", ethers.formatUnits(limit, 6), "USDC");
  console.log("  Remaining:", ethers.formatUnits(remaining, 6), "USDC");
  console.log("  Utilization:", utilization.toString() + "%");

  console.log("\n🔗 Next Steps:");
  console.log("  1. Verify on BaseScan:");
  console.log("     npx hardhat verify --network baseSepolia", address);
  console.log("\n  2. Check budget status:");
  console.log(
    "     BUDGET_MANAGER_ADDRESS=" + address,
    "npx hardhat run scripts/checkBudgetDirect.ts --network baseSepolia",
  );
  console.log("\n  3. Update your .env file with:");
  console.log("     BUDGET_MANAGER_ADDRESS=" + address);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
