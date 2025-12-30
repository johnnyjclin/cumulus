"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
] as const;

// USDC contract addresses by chain
const USDC_ADDRESSES: Record<number, Address> = {
  84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Mainnet
};

interface USDCBalanceProps {
  address: Address;
  style?: React.CSSProperties;
}

export const USDCBalance = ({ address, style }: USDCBalanceProps) => {
  const { targetNetwork } = useTargetNetwork();
  const [displayBalance, setDisplayBalance] = useState("0.00");

  const usdcAddress = USDC_ADDRESSES[targetNetwork.id];

  const { data: balance, isLoading } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [address],
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  useEffect(() => {
    if (typeof balance === "bigint") {
      // USDC has 6 decimals
      const formattedBalance = formatUnits(balance, 6);
      const numBalance = parseFloat(formattedBalance);
      // Format to 2 decimal places for display
      if (numBalance < 0.01 && numBalance > 0) {
        setDisplayBalance("< 0.01");
      } else {
        setDisplayBalance(numBalance.toFixed(2));
      }
    }
  }, [balance]);

  if (!usdcAddress) {
    return <div style={style}>USDC not available</div>;
  }

  if (isLoading) {
    return <div style={style}>Loading...</div>;
  }

  return (
    <div style={style} className="font-mono">
      {displayBalance} USDC
    </div>
  );
};
