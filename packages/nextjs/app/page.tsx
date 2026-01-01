import Link from "next/link";
import type { NextPage } from "next";
import {
  BoltIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { GOOGLE_AI_API_AMOUNT, STABILITY_API_AMOUNT } from "~~/constants";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6">Cumulus</h1>
            <p className="text-2xl text-base-content/80 mb-4 max-w-3xl mx-auto leading-relaxed">
              Unified Pay-Per-Call API Gateway for Cloud & AI Services
            </p>
            <p className="text-lg text-base-content/60 mb-8 max-w-2xl mx-auto">
              No signup. No API keys. Just connect your wallet and pay per request using{" "}
              <strong>x402 micropayments</strong>.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link href="/services" className="btn btn-primary btn-lg gap-2">
                <RocketLaunchIcon className="h-5 w-5" />
                Browse Services
              </Link>
              <Link href="/dashboard" className="btn btn-outline btn-lg gap-2">
                <CurrencyDollarIcon className="h-5 w-5" />
                View Dashboard
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <div className="badge badge-lg">⚡ Instant Access</div>
              <div className="badge badge-lg">🔐 x402 Protected</div>
              <div className="badge badge-lg">💰 Micropayments</div>
              <div className="badge badge-lg">🤖 Agent-Friendly</div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">What is Cumulus?</h2>
              <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
                A unified gateway that lets developers and AI agents access multiple cloud/AI services through a single
                API surface.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-2xl mb-3">
                    <CpuChipIcon className="h-8 w-8 text-primary" />
                    For Developers
                  </h3>
                  <p className="text-base-content/70 mb-4">
                    Access paid capabilities (AI + cloud deployment) through a single API surface with simple per-call
                    pricing. No need to manage multiple API keys or billing accounts.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>One gateway, multiple services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Pay only for what you use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Transparent pricing & receipts</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-2xl mb-3">
                    <BoltIcon className="h-8 w-8 text-secondary" />
                    For AI Agents
                  </h3>
                  <p className="text-base-content/70 mb-4">
                    Autonomous payments for tool/service access without human wallet confirmations. Perfect for agent
                    workflows that need to make API calls automatically.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Fully autonomous payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>Multi-step workflow support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>No manual intervention needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Services */}
        <div className="bg-base-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Available Services</h2>
              <p className="text-xl text-base-content/70">
                Pay-per-use access to cloud deployment and AI generation services
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <div className="card-body items-center text-center">
                  <CloudArrowUpIcon className="h-12 w-12 text-primary mb-3" />
                  <h3 className="card-title">Cloudflare Workers</h3>
                  <p className="text-base-content/70 mb-3">Deploy serverless functions to the edge in seconds</p>
                  <div className="badge badge-primary badge-lg">${STABILITY_API_AMOUNT} per deploy</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <div className="card-body items-center text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-secondary mb-3" />
                  <h3 className="card-title">Google AI (Gemini)</h3>
                  <p className="text-base-content/70 mb-3">Advanced text generation with multiple Gemini models</p>
                  <div className="badge badge-secondary badge-lg">${GOOGLE_AI_API_AMOUNT} per request</div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow">
                <div className="card-body items-center text-center">
                  <PhotoIcon className="h-12 w-12 text-accent mb-3" />
                  <h3 className="card-title">Stability AI</h3>
                  <p className="text-base-content/70 mb-3">Generate high-quality images from text descriptions</p>
                  <div className="badge badge-accent badge-lg">${STABILITY_API_AMOUNT} per image</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/services" className="btn btn-primary">
                Explore All Services →
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-base-content/70">Simple 3-step process powered by x402 protocol</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Connect Wallet</h3>
                <p className="text-base-content/70">
                  Connect your Web3 wallet (MetaMask, Coinbase, etc.) to the gateway. Make sure you have USDC on Base
                  Sepolia for testnet.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary text-secondary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Choose Service</h3>
                <p className="text-base-content/70">
                  Browse available services and select what you need. Each service shows clear pricing before you make
                  any payment.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent text-accent-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Pay & Use</h3>
                <p className="text-base-content/70">
                  Make a request to any service. x402 automatically handles the micropayment, and you get instant access
                  to the service.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="alert bg-base-100 border-2 border-primary/30 inline-flex max-w-2xl">
                <ShieldCheckIcon className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <h4 className="font-bold">Built on x402 Protocol</h4>
                  <p className="text-sm">
                    HTTP 402 (Payment Required) enables seamless micropayments for API access. All payments are recorded
                    on-chain with full transparency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-base-content/70 mb-8">
              Connect your wallet and start using cloud & AI services with pay-per-call pricing
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/services" className="btn btn-primary btn-lg">
                Browse Services
              </Link>
              <Link href="/dashboard" className="btn btn-outline btn-lg">
                View Your Usage
              </Link>
              <a
                href="https://github.com/johnnyjclin/cumulus"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
