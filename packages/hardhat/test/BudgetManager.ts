import { expect } from "chai";
import { ethers } from "hardhat";
import { BudgetManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BudgetManager", function () {
  let budgetManager: BudgetManager;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const DEFAULT_BUDGET = 500000n; // 0.5 USDC (6 decimals)
  const PAYMENT_AMOUNT = 100000n; // 0.1 USDC

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const budgetManagerFactory = await ethers.getContractFactory("BudgetManager");
    budgetManager = (await budgetManagerFactory.deploy()) as BudgetManager;
    await budgetManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await budgetManager.owner()).to.equal(owner.address);
    });

    it("Should have correct default budget limit", async function () {
      expect(await budgetManager.DEFAULT_BUDGET_LIMIT()).to.equal(DEFAULT_BUDGET);
    });
  });

  describe("Budget Checking", function () {
    it("Should allow payment within budget", async function () {
      const [allowed, remaining] = await budgetManager.checkBudget(user1.address, PAYMENT_AMOUNT);
      expect(allowed).to.equal(true);
      expect(remaining).to.equal(DEFAULT_BUDGET - PAYMENT_AMOUNT);
    });

    it("Should reject payment exceeding budget", async function () {
      const overBudget = DEFAULT_BUDGET + 1n;
      const [allowed] = await budgetManager.checkBudget(user1.address, overBudget);
      expect(allowed).to.equal(false);
    });

    it("Should return correct remaining budget", async function () {
      const remaining = await budgetManager.getRemainingBudget(user1.address);
      expect(remaining).to.equal(DEFAULT_BUDGET);
    });
  });

  describe("Payment Recording", function () {
    it("Should record payment successfully", async function () {
      await expect(budgetManager.recordPayment(user1.address, PAYMENT_AMOUNT))
        .to.emit(budgetManager, "PaymentRecorded")
        .withArgs(user1.address, PAYMENT_AMOUNT, PAYMENT_AMOUNT);

      expect(await budgetManager.userSpent(user1.address)).to.equal(PAYMENT_AMOUNT);
    });

    it("Should accumulate multiple payments", async function () {
      await budgetManager.recordPayment(user1.address, PAYMENT_AMOUNT);
      expect(await budgetManager.userSpent(user1.address)).to.equal(PAYMENT_AMOUNT * 2n);
    });

    it("Should revert when budget is exceeded", async function () {
      const remaining = await budgetManager.getRemainingBudget(user1.address);
      const overPayment = remaining + 1n;

      await expect(budgetManager.recordPayment(user1.address, overPayment)).to.be.revertedWith("Budget limit exceeded");
    });

    it("Should allow different users to have independent budgets", async function () {
      await budgetManager.recordPayment(user2.address, PAYMENT_AMOUNT);
      expect(await budgetManager.userSpent(user2.address)).to.equal(PAYMENT_AMOUNT);
      expect(await budgetManager.userSpent(user1.address)).to.equal(PAYMENT_AMOUNT * 2n);
    });
  });

  describe("Custom Budget Limits", function () {
    const CUSTOM_LIMIT = 1000000n; // 1 USDC

    it("Should allow owner to set custom budget limit", async function () {
      await expect(budgetManager.setUserBudgetLimit(user2.address, CUSTOM_LIMIT))
        .to.emit(budgetManager, "BudgetLimitUpdated")
        .withArgs(user2.address, CUSTOM_LIMIT);

      expect(await budgetManager.getUserBudgetLimit(user2.address)).to.equal(CUSTOM_LIMIT);
    });

    it("Should use custom limit for budget checks", async function () {
      const remaining = await budgetManager.getRemainingBudget(user2.address);
      expect(remaining).to.equal(CUSTOM_LIMIT - PAYMENT_AMOUNT);
    });

    it("Should not allow non-owner to set budget limit", async function () {
      await expect(budgetManager.connect(user1).setUserBudgetLimit(user1.address, CUSTOM_LIMIT)).to.be.revertedWith(
        "Only owner can call this",
      );
    });
  });

  describe("User Statistics", function () {
    it("Should return correct user statistics", async function () {
      const [spent, limit, remaining, utilization] = await budgetManager.getUserStats(user1.address);

      expect(spent).to.equal(PAYMENT_AMOUNT * 2n);
      expect(limit).to.equal(DEFAULT_BUDGET);
      expect(remaining).to.equal(DEFAULT_BUDGET - PAYMENT_AMOUNT * 2n);

      // Check utilization percentage (200000 / 500000 * 100 = 40%)
      expect(utilization).to.equal(40n);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to reset user spending", async function () {
      await budgetManager.resetUserSpending(user1.address);
      expect(await budgetManager.userSpent(user1.address)).to.equal(0n);
    });

    it("Should not allow non-owner to reset spending", async function () {
      await expect(budgetManager.connect(user1).resetUserSpending(user1.address)).to.be.revertedWith(
        "Only owner can call this",
      );
    });

    it("Should allow ownership transfer", async function () {
      await budgetManager.transferOwnership(user1.address);
      expect(await budgetManager.owner()).to.equal(user1.address);

      // Transfer back to original owner for other tests
      await budgetManager.connect(user1).transferOwnership(owner.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle exact budget limit payment", async function () {
      const newUser = user2;
      await budgetManager.resetUserSpending(newUser.address);
      await budgetManager.setUserBudgetLimit(newUser.address, 0); // Use default

      const limit = await budgetManager.getUserBudgetLimit(newUser.address);
      await budgetManager.recordPayment(newUser.address, limit);

      expect(await budgetManager.getRemainingBudget(newUser.address)).to.equal(0n);
    });

    it("Should return 0 remaining budget when at limit", async function () {
      const remaining = await budgetManager.getRemainingBudget(user2.address);
      expect(remaining).to.equal(0n);
    });
  });
});
