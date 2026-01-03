"use client";

import { ReactNode } from "react";
import { EndlessWalletProvider } from "@/context/EndlessWalletContext";

/**
 * WalletProvider Component
 * 
 * Wraps the application with the official Endless Wallet SDK.
 * Uses @endlesslab/endless-web3-sdk for wallet interactions.
 */

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <EndlessWalletProvider>
      {children}
    </EndlessWalletProvider>
  );
}

export default WalletProvider;
