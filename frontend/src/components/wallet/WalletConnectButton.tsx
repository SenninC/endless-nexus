"use client";

import { useState, useRef, useEffect } from "react";
import { useEndlessWallet } from "@/context/EndlessWalletContext";
import { 
  Wallet, 
  ChevronDown, 
  LogOut, 
  Copy, 
  ExternalLink, 
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NETWORK_CONFIG } from "@/config/contracts";

/**
 * WalletConnectButton Component - Light Mode (Endless Bridge Style)
 * 
 * Uses the official @endlesslab/endless-web3-sdk via EndlessWalletContext.
 * - Lime button style when disconnected
 * - Clean dropdown with violet accents when connected
 */
export function WalletConnectButton() {
  const {
    connected,
    connecting: walletConnecting,
    account,
    connect,
    disconnect,
    error: walletError,
    clearError,
    sdkReady,
    extensionDetected,
    rescanExtensions,
  } = useEndlessWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
    
    // Log extension status on mount
    if (typeof window !== "undefined") {
      console.log("[WalletButton] Checking extensions on mount:");
      console.log("  Endless Object:", (window as any).endless);
      console.log("  Aptos Object:", (window as any).aptos);
    }
  }, []);

  // Sync wallet error to local state
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  // Truncate address for display
  const truncatedAddress = account?.address 
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle wallet connection via Endless SDK
  const handleConnect = async () => {
    try {
      setError(null);
      clearError();
      await connect();
      setShowOptions(false);
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  // Handle rescan
  const handleRescan = () => {
    console.log("[WalletButton] Manual rescan triggered");
    rescanExtensions();
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnect();
      setIsDropdownOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!account?.address) return;
    
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Open explorer - Opens in new tab with proper security attributes
  const handleOpenExplorer = () => {
    if (!account?.address) return;
    const explorerUrl = `https://scan.endless.link/account/${account.address}?network=testnet`;
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  // SSR placeholder - render minimal button during server render
  if (!mounted) {
    return (
      <button
        disabled
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-endless-lime",
          "text-gray-900 font-semibold text-sm",
          "opacity-50"
        )}
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  // ============================================
  // DISCONNECTED STATE
  // ============================================
  if (!connected) {
    return (
      <div className="relative" ref={dropdownRef}>
        {/* Error Message */}
        {error && (
          <div className="absolute right-0 bottom-full mb-2 w-72 z-50">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-red-600">{error}</p>
                  <button 
                    onClick={() => { setError(null); clearError(); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Connect Button with dropdown */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleConnect}
            disabled={walletConnecting || !sdkReady}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-l-xl",
              "bg-endless-lime",
              "text-gray-900 font-semibold text-sm",
              "hover:bg-endless-lime/80",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {walletConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : !sdkReady ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
          
          {/* Options dropdown toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={cn(
              "px-2 py-2.5 rounded-r-xl",
              "bg-endless-lime",
              "text-gray-900",
              "hover:bg-endless-lime/80",
              "transition-all duration-200",
              "border-l border-black/10"
            )}
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", showOptions && "rotate-180")} />
          </button>
        </div>

        {/* Options Dropdown */}
        {showOptions && (
          <div className="absolute right-0 top-full mt-2 w-72 z-50">
            <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-3">
                Status: {sdkReady ? "✅ SDK Ready" : "⏳ Loading SDK..."} | 
                Extension: {extensionDetected ? "✅ Detected" : "❌ Not found"}
              </div>

              {/* Direct connect if extension detected */}
              {extensionDetected && (
                <button
                  onClick={handleConnect}
                  disabled={walletConnecting}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                    "text-left transition-colors",
                    "bg-endless-lime/20 hover:bg-endless-lime/40 text-gray-900",
                    "border border-endless-lime"
                  )}
                >
                  <Wallet className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Endless Wallet</div>
                    <div className="text-xs text-gray-600">
                      Connecter directement
                    </div>
                  </div>
                </button>
              )}

              {/* Help link - Official Endless Wallet */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href="https://wallet.endless.link/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-endless-violet"
                >
                  <ExternalLink className="w-3 h-3" />
                  Installer Endless Wallet
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // CONNECTED STATE
  // ============================================
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Connected Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl",
          "bg-white border border-gray-200",
          "hover:border-gray-300 hover:bg-gray-50",
          "transition-all duration-200"
        )}
      >
        {/* Status Indicator */}
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        
        {/* Address */}
        <span className="text-sm font-mono text-gray-700">
          {truncatedAddress}
        </span>
        
        {/* Dropdown Arrow */}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform",
            isDropdownOpen && "rotate-180"
          )}
        />
      </button>

      {/* Connected Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 z-50">
          <div className="bg-white rounded-xl p-2 border border-gray-200 shadow-lg">
            {/* Account Info Header */}
            <div className="px-3 py-3 border-b border-gray-100 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-endless-lime flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-gray-900" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Endless Wallet
                  </div>
                  <div className="text-xs text-gray-500">
                    Connected to Testnet
                  </div>
                </div>
              </div>

              {/* Full Address (copyable) */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100">
                <code className="flex-1 text-xs text-gray-600 font-mono truncate">
                  {account?.address}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="space-y-1">
              {/* View on Explorer */}
              <button
                onClick={handleOpenExplorer}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">View on Explorer</span>
              </button>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-red-50 transition-colors group"
              >
                {disconnecting ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                )}
                <span className="text-sm text-gray-700 group-hover:text-red-500">
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
