# Cumulus

Hackathon: https://www.x402hackathon.com/

## What this is

**Cumulus** is a unified “pay-per-call” API gateway that lets developers or AI agents access multiple cloud/AI services via a single set of endpoints.

Instead of signing up for each provider, managing API keys, and wiring billing individually, users can simply call our gateway and pay **per request** using **x402 micropayments**.

## Who it’s for

- **Developers** who want a single API surface to access paid capabilities (AI + deployment) with simple per-call pricing.
- **AI agents** that need autonomous payments to use tools/services without a human clicking wallet popups.

## How x402 is used

- The gateway protects routes using `x402-next` middleware.
- When a client calls a protected route, the server responds with **HTTP 402 Payment Required**.
- The client retries with proof-of-payment:
  - **User flow:** browser uses `x402-fetch` with a connected wallet.
  - **Agent flow:** a script uses `@faremeter/fetch` + Base EVM payment handler for automated payment.

## Implemented features

- **Pay-to-Deploy:** Upload a ZIP and deploy a Cloudflare Worker (serverless) through the gateway.
- **Pay-to-Chat:** Call Google AI (Gemini) through a paid API endpoint.
- **Pay-to-Generate:** Call Stability AI text-to-image through a paid API endpoint.
- **On-Chain Budget Control:** BudgetManager smart contract enforces spending limits (default: $0.5 USDC per user).
- **Usage Dashboard:** Track spending, view receipts, and access historical resources (images, conversations, deployments).
- **MongoDB Integration:** Fast querying of payment history and stored resources.
- **Agentic payment demo:** An agent script generates an image + HTML and deploys a landing page, paying per step automatically.

## Paid endpoints & pricing

All paid routes are enforced by middleware in [packages/nextjs/middleware.ts](packages/nextjs/middleware.ts).

- `POST /api/payment/cloudflare/worker` — `$0.05`
- `POST /api/payment/google-ai/chat` — `$0.1`
- `POST /api/payment/stability-ai/text-to-image` — `$0.15`

## Requirements

- Node.js (>= v20)
- Yarn
- Git

## Setup

### 1) Install dependencies

```bash
yarn
```

### 2) Install and start MongoDB

This project uses MongoDB to store payment receipts and usage statistics.

#### macOS

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community@7.0

# Verify MongoDB is running
brew services list | grep mongodb
```

To stop MongoDB later:
```bash
brew services stop mongodb/brew/mongodb-community@7.0
```

#### Windows

1. **Download MongoDB:**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select version 7.0 or higher
   - Choose Windows x64
   - Download and run the installer

2. **Install MongoDB:**
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Use default data and log directories

3. **Start MongoDB:**
   - MongoDB should start automatically as a Windows service
   - To verify, open Services (Win+R, type `services.msc`)
   - Look for "MongoDB Server" and ensure it's running

4. **Manual start/stop (if needed):**
   ```bash
   # Start MongoDB
   net start MongoDB

   # Stop MongoDB
   net stop MongoDB
   ```

#### Verify MongoDB Connection

Test the connection:
```bash
mongosh
```

You should see the MongoDB shell prompt. Type `exit` to quit.

### 3) Configure environment variables

Create a `.env` file (or `.env.local` under `packages/nextjs` depending on your setup) with:

```bash
# x402
NEXT_PUBLIC_FACILITATOR_URL=
RESOURCE_WALLET_ADDRESS=
NETWORK=baseSepolia

# BudgetManager Smart Contract
BUDGET_MANAGER_ADDRESS=0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cumulus

# Provider keys (server-side)
GOOGLE_AI_API_KEY=
STABILITY_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# Agent demo (local-only)
EVM_PRIVATE_KEY=
GATEWAY_URL=http://localhost:3000
```

Notes:
- Fo4 user-facing pages, you’ll need a wallet funded on the selected network (Base Sepolia by default).
- For the agent demo, `EVM_PRIVATE_KEY` is only used locally to sign payments. Never commit it.

### 3) Start the app

```bash
yarn start
```

Visit: `http://localhost:3000`

## Usage

### User-facing paid pages

- Cloudflare Worker deploy UI: `http://localhost:3000/payment/cloudflare`
- Google AI chat UI: `http://localhost:3000/payment/google-ai`
- Stability AI image UI: `http://localhost:3000/payment/stability-ai`

**Default Cloudflare Template:**
The system includes a professional pre-built template (`packages/nextjs/samples/cloudflare/index.js`) featuring:
- **Elegant Fashion** - A premium clothing store website
- Modern responsive design with Tailwind CSS
- Product showcase with featured collections
- Customer benefits section (free shipping, secure payment, easy returns)
- Professional animations and glass morphism effects
- Mobile-friendly layout
- Under 5 KB (well under Cloudflare's 3 MB limit)

### Dashboard

View your usage statistics and resource history at `http://localhost:3000/dashboard`

**Tab 1: Usage & Receipts**
- **Budget Display**: Real-time on-chain budget status (default: $0.5 USDC limit per user)
- **Usage Statistics**: Total spent, request count, last activity timestamp
- **Service Breakdown**: Per-service usage and costs (Google AI, Stability AI, Cloudflare)
- **Payment Receipts**: Complete transaction history with blockchain links

**Tab 2: Resource History**
- **AI Conversations**: View all Google AI chat sessions with prompts, responses, and token counts
- **Generated Images**: Gallery of Stability AI images with generation parameters
- **Worker Deployments**: List of Cloudflare Workers with deployment URLs and versions

All payment data is stored in MongoDB and synchronized with the BudgetManager smart contract on Base Sepolia.

### Agentic payment demo (simulation)

We've created a TypeScript script that simulates an autonomous agent making payments. This demonstrates how an AI agent could potentially access the gateway's paid services.

**Note:** This is a simulation using `@faremeter/fetch` to show the concept. A production agent would require additional implementation (LLM integration, decision-making logic, etc.).

Run the demo:

```bash
cd packages/nextjs
export EVM_PRIVATE_KEY=0x...  # Agent's wallet private key
./agents/scripts/run-agent-demo.sh "YOUR_BUSINESS_DESCRIPTION"
```

The script simulates an agent workflow:
1. **Generate hero image** (Stability AI) - pays $0.15 USDC
2. **Generate about image** (Stability AI) - pays $0.15 USDC
3. **Generate HTML content** (Google AI) - pays $0.1 USDC  
4. **Inject images into HTML** (local processing)
5. **Deploy to Cloudflare Workers** - pays $0.05 USDC

**Total cost:** $0.45 USDC per deployment

**Example Prompts for Hackathon Demo:**

```bash
# Fashion & Retail
./agents/scripts/run-agent-demo.sh "Premium Clothing Store - Fall Winter Collection"
./agents/scripts/run-agent-demo.sh "Luxury Watch Boutique - Swiss Timepieces"
./agents/scripts/run-agent-demo.sh "Artisan Coffee Roastery - Single Origin Beans"

# Food & Dining
./agents/scripts/run-agent-demo.sh "Modern Italian Restaurant - Fine Dining Experience"
./agents/scripts/run-agent-demo.sh "Japanese Sushi Bar - Authentic Omakase"
./agents/scripts/run-agent-demo.sh "Farm-to-Table Bistro - Organic Local Cuisine"

# Services & Professional
./agents/scripts/run-agent-demo.sh "Boutique Hotel - Luxury Accommodations Downtown"
./agents/scripts/run-agent-demo.sh "Yoga Studio - Mindfulness and Wellness Center"
./agents/scripts/run-agent-demo.sh "Photography Studio - Professional Portrait Services"

# Creative & Tech
./agents/scripts/run-agent-demo.sh "Design Agency - Creative Digital Solutions"
./agents/scripts/run-agent-demo.sh "Coworking Space - Modern Collaborative Workspace"
```

Each prompt generates a unique landing page with:
- **2 AI-generated images**: Hero banner + About/interior shot (optimized for token efficiency)
- **4 core sections**: Hero, About, Services/Features, Contact (concise structure)
- **Professional styling**: Modern responsive design under 500 lines
- **Live deployment**: Cloudflare Worker with instant URL

For comprehensive agent documentation including setup, payment flow, and troubleshooting, see [agents/scripts/AGENT_DEMO_README.md](packages/nextjs/agents/scripts/AGENT_DEMO_README.md)

### AI Agent (Autonomous Decision Making)

We've also created an **AI agent** that uses Google AI as an orchestrator to autonomously decide which APIs to call based on natural language prompts. Unlike the scripted demo above, this agent can intelligently choose to call one, two, or all three functions depending on your request.

Run the agent:

```bash
cd packages/nextjs
export AGENT_PRIVATE_KEY=0x...  # Agent's wallet private key
./agents/scripts/run-interactive-agent.sh
```

The agent will enter an interactive mode where you can type natural language prompts. The AI will autonomously decide which paid APIs to call:

**Example Prompts for Restaurant Websites:**

```
# Simple prompt - AI decides what to do
Create a complete Italian restaurant website with hero images and deploy it

# Detailed prompt - Full specifications
Build a full website for a modern Italian restaurant called "La Dolce Vita" - fine dining experience. Generate hero images, create elegant HTML content, and deploy to Cloudflare

# Quick test
Create a sushi restaurant website with images and deploy it
```

**Other Business Examples:**

```
# Retail Store
Build a luxury watch boutique website with elegant product showcases and deploy it

# Coffee Shop  
Generate a modern coffee shop landing page with artisan roastery vibes and images

# Services
Create a yoga studio website with calming imagery and wellness focus

# Tech Business
Deploy a coworking space website with modern collaborative workspace design
```

**How It Works:**
1. You input a natural language prompt
2. Google AI analyzes your request and decides which tools to call:
   - `generateImage` - For creating visual assets ($0.15 each)
   - `generateContent` - For creating HTML/text content ($0.1)
   - `deployWebsite` - For deploying to Cloudflare Workers ($0.05)
3. The agent autonomously executes the chosen functions and pays for each API call
4. You receive the final result (deployed website URL or generated assets)
5. Type `exit` to quit the interactive session


This demonstrates true **autonomous agentic payments** - the AI decides what services to use and pays for them automatically without human intervention.

## Testing the System

### 1. Test Budget Enforcement

The BudgetManager smart contract enforces a $0.5 USDC spending limit per user address.

**Check your current budget:**
1. Connect your wallet
2. Visit `http://localhost:3000/dashboard`
3. View budget status in the top card

**Test budget limit:**
1. Make 5 Google AI requests ($0.1 each = $0.5 total) - should succeed
2. Try a 6th request - should fail with "Budget limit exceeded"
3. Verify on-chain: [Base Sepolia Explorer](https://sepolia.basescan.org/address/0x62aECDaf1ffD2DD3D919C1b6919dd252290E9Da0)

### 2. Test Payment Tracking

Each successful payment is recorded in both MongoDB and on-chain:

**MongoDB (for fast queries):**
```bash
mongosh cumulus --eval "db.paymentreceipts.find().pretty()"
```

**On-Chain (for verification):**
- View transactions on [Base Sepolia Explorer](https://sepolia.basescan.org/)
- Check budget updates in BudgetManager contract

### 3. Test Resource Storage

After making payments, verify resource storage:

**Google AI:**
```bash
# Check conversation history stored in MongoDB
mongosh cumulus --eval "db.paymentreceipts.find({'metadata.sessionHistory': {\$exists: true}}).pretty()"
```

**Stability AI:**
```bash
# Check generated images stored with base64 data
mongosh cumulus --eval "db.paymentreceipts.find({'metadata.imageGeneration': {\$exists: true}}).pretty()"
```

**Cloudflare:**
```bash
# Check deployment information
mongosh cumulus --eval "db.paymentreceipts.find({'metadata.deployment': {\$exists: true}}).pretty()"
```

Or simply visit the Dashboard's "Resource History" tab to see all stored resources.

### 4. Test Agent Automation (Simulation)

Run the agent simulation script to test autonomous payment flow:

```bash
cd packages/nextjs
export EVM_PRIVATE_KEY=0x...  # Use a funded wallet on Base Sepolia
./agents/scripts/run-agent-demo.sh "Landing page for a coffee shop"
```

The script will make 3 paid API calls:
1. Generate an image (pay $0.15)
2. Generate HTML content (pay $0.1)
3. Deploy to Cloudflare Workers (pay $0.05)

**Verify the results:**
- Check terminal output for payment confirmations
- Visit `http://localhost:3000/dashboard` to see all 3 payments recorded
- View the deployed Cloudflare Worker URL (printed in terminal)

**Requirements:**
- Wallet must have at least $0.3 USDC on Base Sepolia
- MongoDB must be running
- All cloud provider API keys must be configured

### 5. Clear Test Data

To reset your local database for fresh testing:

```bash
# Clear all MongoDB data
mongosh cumulus --eval "db.dropDatabase()"

# Note: This only clears local DB, not on-chain budget
# On-chain spending remains in the BudgetManager contract
```

## Repository structure

- [packages/nextjs](packages/nextjs): Next.js app, x402 middleware, paid API routes, and UI pages
- [packages/hardhat](packages/hardhat): BudgetManager smart contract, deployment scripts, and tests

<!-- ## Submission checklist (Jan 5, 2026)

- Public GitHub repo with full source + README + scripts + license
- 2-minute end-to-end demo (URL or video)
- Short description (what it does, who it’s for, how x402 is used)
- Team contact info
- Additional notes (limitations + roadmap) -->

<!-- ## Team contact info

- Team name: <ADD_TEAM_NAME>
- Telegram: <ADD_TELEGRAM>
- Email: <ADD_EMAIL>
- GitHub: <ADD_GITHUB>
- X/Twitter: <ADD_TWITTER>

## Additional notes -->

Limitations:
- This is a hackathon prototype (no production-grade auth, rate limiting, or usage dashboard yet).
- Some providers require server-side credentials; the gateway currently runs those calls on behalf of users.

<!-- Roadmap:
- Plugin-based “service registry” to add providers without changing core gateway logic
- Usage receipts + billing export (CSV/Webhooks)
- Agent-to-agent (A2A) workflows with budgets and spend limits -->

---

Built on top of Scaffold-ETH 2.