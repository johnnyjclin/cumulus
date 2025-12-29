#!/bin/bash

# AI Agent Demo Execution Script
# Using Faremeter + Base Network for automatic payment

set -e

# Check required environment variables
if [ -z "$EVM_PRIVATE_KEY" ]; then
  echo "❌ Error: EVM_PRIVATE_KEY is not set"
  echo ""
  echo "Please set your private key:"
  echo "  export EVM_PRIVATE_KEY=0x..."
  echo ""
  echo "⚠️  WARNING: Never commit your private key to git!"
  exit 1
fi

# Set default values
export GATEWAY_URL=${GATEWAY_URL:-"http://localhost:3000"}

# Display configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 AI Agent Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⛓️  Network: Base Sepolia"
echo "🌐 Gateway: $GATEWAY_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute Agent
PROJECT_DESC=${1:-"AI-powered landing page builder"}
echo "📋 Project: $PROJECT_DESC"
echo ""

yarn tsx scripts/agent-demo.ts "$PROJECT_DESC"
