import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the BudgetManager contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployBudgetManager: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BudgetManager", {
    from: deployer,
    // Contract constructor arguments (none for BudgetManager)
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to display info
  const budgetManager = await hre.ethers.getContract("BudgetManager", deployer);
  console.log("📊 BudgetManager deployed to:", await budgetManager.getAddress());
  console.log("💰 Default budget limit:", await budgetManager.DEFAULT_BUDGET_LIMIT(), "USDC base units (0.5 USDC)");
};

export default deployBudgetManager;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags BudgetManager
deployBudgetManager.tags = ["BudgetManager"];
