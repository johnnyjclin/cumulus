# Hardhat - BudgetManager Smart Contract

## Overview

BudgetManager is a smart contract that enforces on-chain spending limits for Cumulus gateway users (default: 0.5 USDC per user).

## Deployment Steps

### 1. Install Dependencies

```bash
cd packages/hardhat
yarn install
```

### 2. Configure Environment Variables

Ensure your `.env` file contains:

```bash
DEPLOYER_PRIVATE_KEY=your_deployer_wallet_private_key
```

### 3. Deploy Contract to Base Sepolia

```bash
yarn deploy --network baseSepolia
```

Successful deployment will display:
```
✅ BudgetManager deployed to: 0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0
```

### 4. Verify Contract

```bash
npx hardhat verify --network baseSepolia 0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0
```

After verification, view the contract on [Base Sepolia Explorer](https://sepolia.basescan.org/).

## Testing

Run the test suite:

```bash
yarn hardhat test test/BudgetManager.ts
```

## Backend Integration

Add to `packages/nextjs/.env.development`:

```bash
BUDGET_MANAGER_ADDRESS=0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## Usage

### Check User Budget

```typescript
import { checkUserBudget } from "~/utils/budgetManager";

const result = await checkUserBudget(
  "0x1cF1fb97E6A4AfaA4167FA19d52AD19D6689C677",
  "$0.1"
);

console.log("Allowed:", result.allowed);
console.log("Remaining:", result.remaining);
```

### Record Payment On-Chain

```typescript
import { recordPaymentOnChain } from "~/utils/budgetManager";

const result = await recordPaymentOnChain(
  "0x1cF1fb97E6A4AfaA4167FA19d52AD19D6689C677",
  "$0.1"
);

if (result.success) {
  console.log("✅ Payment recorded on-chain:", result.txHash);
} else {
  console.error("❌ Failed:", result.error);
}
```

## Contract Features

- **Default Budget Limit**: 0.5 USDC (500,000 base units with 6 decimals)
- **Tracking**: Cumulative spending per user address
- **Enforcement**: Transactions exceeding budget are rejected

## Admin Functions

### Reset User Spending

```bash
npx hardhat run scripts/resetUserBudget.ts --network baseSepolia
```

### Set Custom Budget Limit

```solidity
// Only contract owner can call
budgetManager.setUserBudgetLimit(userAddress, 1000000); // 1 USDC
```

## Troubleshooting

### "Budget limit exceeded"

**Cause**: User has reached their 0.5 USDC limit

**Solution**:
- Admin can reset: `budgetManager.resetUserSpending(userAddress)`
- Or increase limit: `budgetManager.setUserBudgetLimit(userAddress, newLimit)`

### Cannot Connect to Contract

**Check**:
- Verify `BUDGET_MANAGER_ADDRESS` is correct
- Confirm RPC URL is accessible: `https://sepolia.base.org`
- Ensure network is Base Sepolia

## On-Chain Verification

All transactions and budget information can be viewed on the blockchain explorer:

- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Contract Address**: `0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0`

## Key Features

✅ **On-Chain Enforcement** - Cannot be bypassed or tampered with  
✅ **Real-Time Validation** - Check before payment processing  
✅ **Independent Budgets** - Separate tracking per address  
✅ **Custom Limits** - Admin can set user-specific limits  
✅ **Transparent & Verifiable** - All spending verifiable on-chain  
✅ **Low Gas Cost** - Runs on Base L2 for minimal fees

## More Information

For detailed integration guide, see: [BUDGET_MANAGER_INTEGRATION.md](./BUDGET_MANAGER_INTEGRATION.md)
