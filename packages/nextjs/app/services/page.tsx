"use client";

import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  PhotoIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  price: string;
  path: string;
  category: "Cloud" | "AI";
  features: string[];
}

const services: Service[] = [
  {
    id: "cloudflare-worker",
    name: "Cloudflare Workers",
    description: "Deploy serverless functions to the edge in seconds",
    icon: CloudArrowUpIcon,
    price: "$0.05",
    path: "/payment/cloudflare",
    category: "Cloud",
    features: ["Instant deployment", "Global CDN", "ZIP upload support", "workers.dev subdomain"],
  },
  {
    id: "google-ai",
    name: "Google AI (Gemini)",
    description: "Advanced text generation with Gemini models",
    icon: ChatBubbleLeftRightIcon,
    price: "$0.1",
    path: "/payment/google-ai",
    category: "AI",
    features: ["Multiple models", "Real-time chat", "Context-aware", "Fast responses"],
  },
  {
    id: "stability-ai",
    name: "Stability AI",
    description: "Generate stunning images from text descriptions",
    icon: PhotoIcon,
    price: "$0.15",
    path: "/payment/stability-ai",
    category: "AI",
    features: ["SD3 models", "Multiple aspect ratios", "High quality", "Fast generation"],
  },
];

export default function ServicesPage() {
  const cloudServices = services.filter(s => s.category === "Cloud");
  const aiServices = services.filter(s => s.category === "AI");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <RocketLaunchIcon className="h-12 w-12 text-primary mr-3" />
              <h1 className="text-5xl font-bold">Service Discovery</h1>
            </div>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              Pay-per-use cloud and AI services with x402 micropayments. No subscriptions, no API keys - just connect
              your wallet and go.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <div className="badge badge-lg badge-primary">🔐 x402 Protected</div>
            <div className="badge badge-lg badge-secondary">⚡ Instant Access</div>
            <div className="badge badge-lg badge-accent">💰 Micropayments</div>
            <div className="badge badge-lg">🔗 No API Keys</div>
          </div>
        </div>
      </div>

      {/* Cloud Services Section */}
      <div className="container mx-auto px-4 max-w-6xl py-12">
        <div className="flex items-center mb-8">
          <CpuChipIcon className="h-8 w-8 text-primary mr-3" />
          <h2 className="text-3xl font-bold">Cloud Services</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {cloudServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* AI Services Section */}
        <div className="flex items-center mb-8">
          <SparklesIcon className="h-8 w-8 text-secondary mr-3" />
          <h2 className="text-3xl font-bold">AI Services</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-base-200 py-12 mt-auto">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to start building?</h3>
          <p className="text-base-content/70 mb-6">
            Connect your wallet and start using any service. View your usage history and receipts in the dashboard.
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            View My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;

  return (
    <Link
      href={service.path}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <Icon className="h-10 w-10 text-primary" />
          <span className="badge badge-secondary badge-lg">{service.price}</span>
        </div>

        <h3 className="card-title text-xl">{service.name}</h3>
        <p className="text-base-content/70 text-sm mb-4">{service.description}</p>

        <div className="space-y-2">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-sm">
              <span className="text-success mr-2">✓</span>
              <span className="text-base-content/80">{feature}</span>
            </div>
          ))}
        </div>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary btn-sm">Try Now →</button>
        </div>
      </div>
    </Link>
  );
}
