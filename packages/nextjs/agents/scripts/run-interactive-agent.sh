#!/bin/bash

# Interactive AI Agent Runner
# This script starts an autonomous agent that can understand natural language
# and autonomously call paid APIs to complete tasks

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Starting Interactive AI Agent...           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if AGENT_PRIVATE_KEY is set
if [ -z "$AGENT_PRIVATE_KEY" ]; then
    echo -e "${RED}Error: AGENT_PRIVATE_KEY environment variable is not set${NC}"
    echo ""
    echo "Please set it before running:"
    echo "  export AGENT_PRIVATE_KEY=0x..."
    echo ""
    exit 1
fi

# Check if EVM_PRIVATE_KEY is set (fallback)
if [ -z "$EVM_PRIVATE_KEY" ] && [ -n "$AGENT_PRIVATE_KEY" ]; then
    export EVM_PRIVATE_KEY=$AGENT_PRIVATE_KEY
fi

# Set gateway URL if not set
if [ -z "$GATEWAY_URL" ]; then
    export GATEWAY_URL="http://localhost:3000"
fi

echo -e "${GREEN}✓ Environment configured${NC}"
echo "  Gateway: $GATEWAY_URL"
echo ""

# Compile and run the TypeScript agent
npx tsx agents/scripts/interactive-agent.ts
