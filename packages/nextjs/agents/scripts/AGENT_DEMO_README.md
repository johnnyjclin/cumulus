# AI Agent Demo

展示使用 **Faremeter + Base Network** 實現完整的 Agentic Payment 流程。

AI Agent 會自動：

1. 使用 Google AI (Gemini) 生成網頁內容
2. 使用 Stability AI 生成 Hero 圖片
3. 部署到 Cloudflare Workers

**重點**：整個過程無需人工授權錢包交易，Agent 自動使用 EIP-3009 gasless USDC transfers 支付所有費用。

## 技術架構

### Faremeter + Base Network

- **Network**: Base Sepolia Testnet
- **Payment Protocol**: EIP-3009 (Transfer with Authorization)
- **Signature Standard**: EIP-712 (Typed Data Signing)
- **Token**: USDC (gasless transfers via facilitator)
- **Wallet**: `@faremeter/wallet-evm` with local private key
- **Payment Handler**: `@faremeter/payment-evm/exact` for precise amount transfers

### 費用結構

- Google AI (Content Generation): **$0.001 USDC**
- Stability AI (Image Generation): **$0.010 USDC**
- Cloudflare (Deployment): **$0.001 USDC**
- **Total**: **$0.012 USDC** per deployment

## 前置需求

### 1. 安裝依賴

```bash
yarn workspace @se-2/nextjs add @faremeter/fetch @faremeter/wallet-evm @faremeter/payment-evm viem tsx
```

### 2. 準備 Agent 錢包

```bash
# 創建新錢包
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# 或使用現有錢包
export EVM_PRIVATE_KEY=0x...
```

### 3. 獲取 Base Sepolia Testnet USDC

1. 從 [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet) 獲取 ETH
2. 從 [Circle USDC Faucet](https://faucet.circle.com/) 獲取 USDC
3. 確保錢包有至少 $0.05 USDC 用於測試

### 4. 配置環境變數

```bash
# Agent 錢包私鑰 (Base Sepolia)
export EVM_PRIVATE_KEY=0x...

# Gateway URL (本地開發)
export GATEWAY_URL=http://localhost:3000

# API Keys (已在 .env.local 配置)
# GOOGLE_AI_API_KEY=...
# STABILITY_AI_API_KEY=...
# CLOUDFLARE_ACCOUNT_ID=...
# CLOUDFLARE_API_TOKEN=...
```

## 使用方式

### 啟動 Gateway

```bash
cd packages/nextjs
yarn dev
```

### 執行 Agent Demo

```bash
# 使用預設描述
cd packages/nextjs
./scripts/run-agent-demo.sh

# 自訂網站描述
./scripts/run-agent-demo.sh "Web3 gaming platform landing page"

# 或直接執行 TypeScript
tsx scripts/agent-demo.ts "DeFi protocol landing page"
```

## 執行流程

```
🤖 AI Agent initialized
📍 Wallet Address: 0x...
⛓️  Network: Base Sepolia
🌐 Gateway URL: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 Starting automated website deployment...
📋 Task: "AI-powered landing page builder"

📝 Step 1: Generating content with Google AI...
   Prompt: "AI-powered landing page builder"
   [x402 Payment] Paying $0.001 USDC via EIP-3009...
   ✅ Content generated
   💵 Cost: $0.001 USDC

🎨 Step 2: Generating hero image with Stability AI...
   Description: "AI-powered landing page builder"
   [x402 Payment] Paying $0.010 USDC via EIP-3009...
   ✅ Image generated
   💵 Cost: $0.01 USDC

🚀 Step 3: Deploying to Cloudflare Workers...
   Site Name: ai-powered-landing-page-builder
   [x402 Payment] Paying $0.001 USDC via EIP-3009...
   ✅ Deployed successfully
   💵 Cost: $0.001 USDC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Deployment Complete!

🌐 Live URL: https://ai-powered-landing-page-builder.workers.dev
⏱️  Duration: 12.34s

💰 Total Cost Breakdown:
   - Google AI (Content):     $0.001
   - Stability AI (Image):    $0.010
   - Cloudflare (Deploy):     $0.001
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total:                     $0.012 USDC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 代碼架構

### Agent Script (`scripts/agent-demo.ts`)

```typescript
import { wrap as wrapFetch } from "@faremeter/fetch";
import { createPaymentHandler } from "@faremeter/payment-evm/exact";
import { createLocalWallet } from "@faremeter/wallet-evm";
import { baseSepolia } from "viem/chains";

// 創建 Base Sepolia wallet
const wallet = await createLocalWallet(baseSepolia, EVM_PRIVATE_KEY);

// 包裝 fetch 使其支持 x402 自動支付
const paymentFetch = wrapFetch(fetch, {
  handlers: [createPaymentHandler(wallet)],
});

// 使用 paymentFetch 發送請求，自動處理 402 付款
const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
  method: "POST",
  body: JSON.stringify({ prompt, model }),
});
```

### Payment Flow (EIP-3009)

1. Agent 發送請求到 Gateway
2. Gateway 返回 `402 Payment Required` + payment details
3. Faremeter handler 自動：
   - 構建 EIP-712 typed data
   - 使用 wallet 簽署 authorization
   - 將 signature 加入 request headers
   - 重試原始請求
4. Gateway facilitator 驗證 signature 並執行 gasless USDC transfer
5. 返回服務結果

## 關鍵特性

### ✅ 真正的 Agentic Payment

- Agent 完全自主決定和執行支付
- 無需人工點擊錢包彈窗
- 使用 EIP-3009 實現 gasless transfers

### ✅ 微支付友好

- 支持 $0.001 級別的小額支付
- 透過 facilitator 批次處理降低 gas 成本
- 使用穩定幣 USDC 避免價格波動

### ✅ 安全且透明

- EIP-712 typed data 確保簽名安全
- 每筆支付都有明確的金額和收款人
- Agent 私鑰本地儲存，不上傳到伺服器

## 故障排除

### Agent 錢包餘額不足

```bash
# 檢查餘額
cast balance $WALLET_ADDRESS --rpc-url https://sepolia.base.org

# 獲取測試 USDC
# 訪問 https://faucet.circle.com/
```

### Payment 失敗

- 檢查 Gateway 是否正常運行 (`yarn dev`)
- 確認環境變數 `EVM_PRIVATE_KEY` 已設置
- 確認錢包有足夠的 USDC 餘額
- 查看 Gateway logs 檢查 facilitator 配置

### 網路連接問題

```bash
# 測試 Gateway 連接
curl $GATEWAY_URL/api/health

# 測試 Base Sepolia RPC
curl https://sepolia.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```
