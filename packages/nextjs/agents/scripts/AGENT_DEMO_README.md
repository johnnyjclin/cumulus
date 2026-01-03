# AI Agent Demo - Autonomous Payment System

This demo showcases a complete **Agentic Payment** workflow using **Faremeter + Base Network**.

The AI Agent autonomously:

1. Generates web content using Google AI (Gemini)
2. Creates images using Stability AI
3. Deploys websites to Cloudflare Workers

**Key Feature**: The entire process requires no human wallet approval - the agent automatically handles all payments using EIP-3009 gasless USDC transfers.

## Two Demo Modes

### 1. Scripted Agent Demo (`run-agent-demo.sh`)
Pre-programmed workflow that generates 2 images, HTML content, and deploys automatically.

### 2. Interactive AI Agent (`run-interactive-agent.sh`)
Natural language interface where Google AI orchestrates which APIs to call based on your prompts.

---

## Technical Architecture

### Faremeter + Base Network

- **Network**: Base Sepolia Testnet
- **Payment Protocol**: EIP-3009 (Transfer with Authorization)
- **Signature Standard**: EIP-712 (Typed Data Signing)
- **Token**: USDC (gasless transfers via facilitator)
- **Wallet**: `@faremeter/wallet-evm` with local private key
- **Payment Handler**: `@faremeter/payment-evm/exact` for precise amount transfers

### Pricing

- Google AI (Content Generation): **$0.10 USDC**
- Stability AI (Image Generation): **$0.15 USDC** each
- Cloudflare (Deployment): **$0.05 USDC**
- **Total (2 images + HTML + deploy)**: **$0.45 USDC**

### Optimizations (Latest)

To avoid Gemini's MAX_TOKENS limit (2048 output tokens):
- **Limited to 2 images** (hero + about) instead of 3-5
- **4 core sections** (Hero, About, Services, Contact) instead of 7+
- **500-line HTML limit** instead of 1200
- **Simplified prompt**: ~150 tokens (vs 462 previously)
- **Output tokens**: ~1200-1500 (well under 2048 limit)

---

## Prerequisites

### 1. Install Dependencies

```bash
yarn workspace @se-2/nextjs add @faremeter/fetch @faremeter/wallet-evm @faremeter/payment-evm viem tsx
```

### 2. Prepare Agent Wallet

```bash
# Create new wallet
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

# Or use existing wallet
export EVM_PRIVATE_KEY=0x...
```

### 3. Get Base Sepolia Testnet USDC

1. Get ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Get USDC from [Circle USDC Faucet](https://faucet.circle.com/)
3. Ensure wallet has at least $0.50 USDC for testing

### 4. Configure Environment Variables

```bash
# Agent wallet private key (Base Sepolia)
export EVM_PRIVATE_KEY=0x...

# Gateway URL (local development)
export GATEWAY_URL=http://localhost:3000

# API Keys (configured in .env.local)
# GOOGLE_AI_API_KEY=...
# STABILITY_API_KEY=...
# CLOUDFLARE_ACCOUNT_ID=...
# CLOUDFLARE_API_TOKEN=...
```

---

## Usage

### Start the Gateway

```bash
cd packages/nextjs
yarn dev
```

### Option 1: Scripted Agent Demo

Pre-programmed workflow with fixed steps:

```bash
# Default description
cd packages/nextjs
./agents/scripts/run-agent-demo.sh

# Custom website description
./agents/scripts/run-agent-demo.sh "Modern Italian Restaurant - Fine Dining"

# Or run TypeScript directly
tsx agents/scripts/agent-demo.ts "Luxury Spa & Wellness Center"
```

**What it does:**
1. Generates hero image ($0.15)
2. Generates about image ($0.15)
3. Generates HTML content ($0.10)
4. Injects images into HTML
5. Deploys to Cloudflare Workers ($0.05)

**Total: $0.45 USDC**

### Option 2: Interactive AI Agent

Natural language interface with AI decision-making:

```bash
cd packages/nextjs
export AGENT_PRIVATE_KEY=0x...  # Your funded wallet
./agents/scripts/run-interactive-agent.sh
```

**How it works:**
1. You type a natural language prompt
2. Google AI analyzes your request
3. AI autonomously decides which tools to call:
   - `generate_image` - Create images ($0.15 each)
   - `generate_content` - Create HTML ($0.10)
   - `deploy_website` - Deploy to Cloudflare ($0.05)
4. Agent executes and pays for each API call automatically
5. You receive the final result (deployed URL or assets)
6. Type `exit` to quit

**Example Prompts:**

```
# Simple
Create a complete Italian restaurant website with images and deploy it

# Detailed
Build a luxury spa website with calming hero image, about section with interior photo, services showcase, and contact form. Deploy to Cloudflare.

# Comprehensive
I need a professional landing page for "Bella Trattoria - Authentic Tuscan Cuisine". Generate a hero image showing elegant Italian dining ambiance, an about image with rustic interior, create HTML with hero section, about our family recipes, signature dishes section, and contact form. Deploy everything.
```

**Cost varies:** $0.30 - $0.45 depending on AI's decision

---

## Execution Flow

### Scripted Demo Output:

```
🤖 AI Agent initialized
📍 Wallet Address: 0x...
⛓️  Network: Base Sepolia
🌐 Gateway URL: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 Starting automated website deployment...
📋 Task: "Modern Italian Restaurant"

🎨 Step 1: Generating hero image...
   [x402 Payment] Paying $0.15 USDC via EIP-3009...
   ✅ Image generated (Hero banner)
   💵 Cost: $0.15 USDC

🎨 Step 2: Generating about image...
   [x402 Payment] Paying $0.15 USDC via EIP-3009...
   ✅ Image generated (About section)
   💵 Cost: $0.15 USDC

📝 Step 3: Generating HTML content...
   [x402 Payment] Paying $0.10 USDC via EIP-3009...
   ✅ Content generated (4 sections, ~500 lines)
   💵 Cost: $0.10 USDC

🚀 Step 4: Deploying to Cloudflare...
   [x402 Payment] Paying $0.05 USDC via EIP-3009...
   ✅ Deployed successfully
   💵 Cost: $0.05 USDC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Deployment Complete!

🌐 Live URL: https://modern-italian-restaurant.workers.dev
⏱️  Duration: 35.2s

💰 Total Cost Breakdown:
   - Stability AI (2 images):  $0.30
   - Google AI (HTML):         $0.10
   - Cloudflare (Deploy):      $0.05
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Total:                      $0.45 USDC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Interactive Agent Output:

```
🤖 Interactive AI Agent
Type your request (or 'exit' to quit):
> Create a sushi restaurant website with images and deploy it

🧠 AI Planning: Analyzing request...
   ✅ Plan created: 4 steps, estimated $0.45 USDC

📋 Execution Plan:
   1. generate_image: Hero banner (sushi bar ambiance)
   2. generate_image: About section (chef preparing sushi)
   3. generate_content: HTML landing page
   4. deploy_website: Cloudflare Workers

💰 Estimated Cost: $0.45 USDC
Proceed? (y/n): y

🎨 Generating hero image...
   ✅ Done ($0.15)

🎨 Generating about image...
   ✅ Done ($0.15)

📝 Generating HTML content...
   ✅ Done ($0.10)

🚀 Deploying to Cloudflare...
   ✅ Done ($0.05)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Task Complete!

🌐 Live URL: https://sushi-restaurant.workers.dev
💰 Total Spent: $0.45 USDC

Type your request (or 'exit' to quit):
>
```

---

## Code Architecture

### Agent Script (`agents/scripts/agent-demo.ts`)

```typescript
import { wrap as wrapFetch } from "@faremeter/fetch";
import { createPaymentHandler } from "@faremeter/payment-evm/exact";
import { createLocalWallet } from "@faremeter/wallet-evm";
import { baseSepolia } from "viem/chains";

// Create Base Sepolia wallet
const wallet = await createLocalWallet(baseSepolia, EVM_PRIVATE_KEY);

// Wrap fetch to support x402 automatic payments
const paymentFetch = wrapFetch(fetch, {
  handlers: [createPaymentHandler(wallet)],
});

// Use paymentFetch to send request, automatically handles 402 payment
const response = await paymentFetch(`${GATEWAY_URL}/api/payment/google-ai/chat`, {
  method: "POST",
  body: JSON.stringify({ prompt, model }),
});
```

### Payment Flow (EIP-3009)

1. Agent sends request to Gateway
2. Gateway returns `402 Payment Required` + payment details
3. Faremeter handler automatically:
   - Builds EIP-712 typed data
   - Signs authorization with wallet
   - Adds signature to request headers
   - Retries original request
4. Gateway facilitator verifies signature and executes gasless USDC transfer
5. Returns service result

---

## Key Features

### ✅ True Agentic Payment

- Agent fully autonomously decides and executes payments
- No human wallet popup clicks required
- Uses EIP-3009 for gasless transfers

### ✅ Micropayment Friendly

- Supports payments as low as $0.05
- Batch processing via facilitator reduces gas costs
- Uses stablecoin USDC to avoid price volatility

### ✅ Secure & Transparent

- EIP-712 typed data ensures signature security
- Each payment has explicit amount and recipient
- Agent private key stored locally, never uploaded to server

### ✅ AI Orchestration (Interactive Mode)

- Google AI analyzes natural language prompts
- Autonomously decides which APIs to call
- Provides cost estimates before execution
- True autonomous decision-making

---

## Troubleshooting

### Insufficient Agent Wallet Balance

```bash
# Check balance
cast balance $WALLET_ADDRESS --rpc-url https://sepolia.base.org

# Get test USDC
# Visit https://faucet.circle.com/
```

### Payment Failure

- Check if Gateway is running (`yarn dev`)
- Confirm `EVM_PRIVATE_KEY` environment variable is set
- Verify wallet has sufficient USDC balance
- Check Gateway logs for facilitator configuration

### Network Connection Issues

```bash
# Test Gateway connection
curl $GATEWAY_URL/api/health

# Test Base Sepolia RPC
curl https://sepolia.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### MAX_TOKENS Error (Fixed)

If you see `finishReason: 'MAX_TOKENS'` in logs:
- ✅ **Already fixed** in latest version
- System now limits to 2 images and 4 sections
- Prompt optimized to ~150 tokens (from 462)
- HTML limited to 500 lines (from 1200)
- Output stays under 1500 tokens (well below 2048 limit)
