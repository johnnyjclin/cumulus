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
- **Agentic payment demo (simulation):** An agent script generates an image + HTML and deploys a landing page, paying per step automatically.

## Paid endpoints & pricing

All paid routes are enforced by middleware in [packages/nextjs/middleware.ts](packages/nextjs/middleware.ts).

- `POST /api/payment/cloudflare/worker` — `$0.001`
- `POST /api/payment/google-ai/chat` — `$0.001`
- `POST /api/payment/stability-ai/text-to-image` — `$0.01`

## 2-minute live demo (submission requirement)

- **Demo URL:** <ADD_PUBLIC_DEMO_URL>
- **Video (2 minutes):** <ADD_VIDEO_URL>

Suggested demo flow:
1. Open `http://localhost:3000/payment/google-ai` and send one message (paid).
2. Open `http://localhost:3000/payment/stability-ai` and generate one image (paid).
3. Open `http://localhost:3000/payment/cloudflare` and deploy a ZIP (paid).
4. Run the agent script and show it pays for each step automatically.

## Requirements

- Node.js (>= v20)
- Yarn
- Git

## Setup

### 1) Install dependencies

```bash
yarn
```

### 2) Configure environment variables

Create a `.env` file (or `.env.local` under `packages/nextjs` depending on your setup) with:

```bash
# x402
NEXT_PUBLIC_FACILITATOR_URL=
RESOURCE_WALLET_ADDRESS=
NETWORK=baseSepolia

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
- For user-facing pages, you’ll need a wallet funded on the selected network (Base Sepolia by default).
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

### Agentic payment demo

From the Next.js package:

```bash
cd packages/nextjs
export EVM_PRIVATE_KEY=0x...
./scripts/run-agent-demo.sh "AI landing page for a coffee subscription"
```

This script:
1. Generates a hero image (paid)
2. Generates minimal HTML (paid)
3. Injects the image into the HTML locally
4. Deploys the page to Cloudflare Workers (paid)

## Repository structure

- [packages/nextjs](packages/nextjs): Next.js app, x402 middleware, paid API routes, and UI pages
- [packages/hardhat](packages/hardhat): smart contract workspace (Scaffold-ETH 2)

## Submission checklist (Jan 5, 2026)

- Public GitHub repo with full source + README + scripts + license
- 2-minute end-to-end demo (URL or video)
- Short description (what it does, who it’s for, how x402 is used)
- Team contact info
- Additional notes (limitations + roadmap)

## Team contact info

- Team name: <ADD_TEAM_NAME>
- Telegram: <ADD_TELEGRAM>
- Email: <ADD_EMAIL>
- GitHub: <ADD_GITHUB>
- X/Twitter: <ADD_TWITTER>

## Additional notes

Limitations:
- This is a hackathon prototype (no production-grade auth, rate limiting, or usage dashboard yet).
- Some providers require server-side credentials; the gateway currently runs those calls on behalf of users.

Roadmap:
- Plugin-based “service registry” to add providers without changing core gateway logic
- Usage receipts + billing export (CSV/Webhooks)
- Agent-to-agent (A2A) workflows with budgets and spend limits

---

Built on top of Scaffold-ETH 2.