"use client";

import { useState, useEffect } from "react";
import { AIAgent } from "@/data/agents";
import { useEndlessWallet } from "@/context/EndlessWalletContext";
import { NEXUS_CONTRACT } from "@/config/contracts";
import {
  X,
  Play,
  Copy,
  Check,
  Loader2,
  Clock,
  Zap,
  ExternalLink,
  Code,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentModalProps {
  agent: AIAgent;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "playground" | "code";
type TransactionStatus = "idle" | "signing" | "processing" | "success" | "error";

/**
 * AgentModal Component
 * 
 * Modal for testing AI agents with:
 * - Playground tab for running prompts
 * - Code tab for integration snippets
 * - Transaction status feedback
 */
export function AgentModal({ agent, isOpen, onClose }: AgentModalProps) {
  const { connected, signAndSubmitTransaction } = useEndlessWallet();
  
  const [activeTab, setActiveTab] = useState<TabType>("playground");
  const [prompt, setPrompt] = useState(agent.examplePrompt);
  const [response, setResponse] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const Icon = agent.icon;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrompt(agent.examplePrompt);
      setResponse(null);
      setTxStatus("idle");
      setTxHash(null);
      setError(null);
    }
  }, [isOpen, agent]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Pay & Run
  const handlePayAndRun = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setError(null);
      setResponse(null);
      setTxStatus("signing");

      // Build transaction payload for official adapter
      const payload = {
        data: {
          function: `${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::request_ai_service` as `${string}::${string}::${string}`,
          typeArguments: [] as [],
          functionArguments: [agent.id, prompt],
        },
      };

      // Sign and submit transaction
      setTxStatus("processing");
      const txResponse = await signAndSubmitTransaction(payload);
      setTxHash(txResponse.hash);

      // Simulate AI response delay
      setTxStatus("success");
      
      // Simulate response after a short delay
      setTimeout(() => {
        setResponse(agent.exampleResponse);
      }, 1500);

    } catch (err: any) {
      console.error("Transaction failed:", err);
      setTxStatus("error");
      setError(err.message || "Transaction failed. Please try again.");
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    const code = generateIntegrationCode(agent);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Generate integration code
  const generateIntegrationCode = (agent: AIAgent): string => {
    return `import { useEndlessWallet } from "@/context/EndlessWalletContext";

// Hook to interact with ${agent.name}
export function use${agent.name.replace(/\s+/g, "")}() {
  const { signAndSubmitTransaction } = useEndlessWallet();

  const runAgent = async (prompt: string) => {
    const payload = {
      function: "${NEXUS_CONTRACT.address}::nexus_mock::request_ai_service",
      functionArguments: ["${agent.id}", prompt],
    };

    const response = await signAndSubmitTransaction(payload);
    return response.hash;
  };

  return { runAgent };
}

// Usage example:
// const { runAgent } = use${agent.name.replace(/\s+/g, "")}();
// const txHash = await runAgent("Your prompt here");`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-nexus-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-nexus-dark border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                agent.color === "cyan" && "bg-nexus-cyan/10",
                agent.color === "purple" && "bg-nexus-purple/10",
                agent.color === "green" && "bg-nexus-success/10",
                agent.color === "orange" && "bg-orange-500/10"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6",
                  agent.color === "cyan" && "text-nexus-cyan",
                  agent.color === "purple" && "text-nexus-purple",
                  agent.color === "green" && "text-nexus-success",
                  agent.color === "orange" && "text-orange-400"
                )}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-nexus-text">{agent.name}</h2>
              <div className="flex items-center gap-3 text-sm text-nexus-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {agent.latency}
                </span>
                <span>•</span>
                <span>{agent.price} {agent.priceUnit}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-nexus-text-muted hover:text-nexus-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab("playground")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "playground"
                ? "text-nexus-cyan border-b-2 border-nexus-cyan"
                : "text-nexus-text-muted hover:text-nexus-text"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Playground
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "code"
                ? "text-nexus-cyan border-b-2 border-nexus-cyan"
                : "text-nexus-text-muted hover:text-nexus-text"
            )}
          >
            <Code className="w-4 h-4" />
            Integration Code
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "playground" ? (
            <div className="space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-nexus-text mb-2">
                  Your Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt..."
                  rows={4}
                  className="input-cyber resize-none font-mono text-sm"
                />
              </div>

              {/* Transaction Status */}
              {txStatus !== "idle" && (
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    txStatus === "signing" && "bg-nexus-cyan/5 border-nexus-cyan/30",
                    txStatus === "processing" && "bg-nexus-cyan/5 border-nexus-cyan/30",
                    txStatus === "success" && "bg-nexus-success/5 border-nexus-success/30",
                    txStatus === "error" && "bg-red-500/5 border-red-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {(txStatus === "signing" || txStatus === "processing") && (
                      <Loader2 className="w-5 h-5 text-nexus-cyan animate-spin" />
                    )}
                    {txStatus === "success" && (
                      <CheckCircle className="w-5 h-5 text-nexus-success" />
                    )}
                    {txStatus === "error" && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p
                        className={cn(
                          "font-medium",
                          txStatus === "error" ? "text-red-400" : "text-nexus-text"
                        )}
                      >
                        {txStatus === "signing" && "Waiting for wallet signature..."}
                        {txStatus === "processing" && "Processing transaction..."}
                        {txStatus === "success" && "Transaction confirmed!"}
                        {txStatus === "error" && "Transaction failed"}
                      </p>
                      {txHash && (
                        <a
                          href={`https://scan.endless.link/txn/${txHash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-nexus-cyan hover:underline flex items-center gap-1 mt-1"
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && txStatus !== "error" && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <div>
                  <label className="block text-sm font-medium text-nexus-text mb-2">
                    AI Response
                  </label>
                  <div className="p-4 rounded-lg bg-nexus-darker border border-white/5">
                    <pre className="text-sm text-nexus-text-dim whitespace-pre-wrap font-mono">
                      {response}
                    </pre>
                  </div>
                </div>
              )}

              {/* Pay & Run Button */}
              <button
                onClick={handlePayAndRun}
                disabled={!connected || txStatus === "signing" || txStatus === "processing"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg",
                  "font-medium transition-all duration-300",
                  connected
                    ? "btn-neon-solid"
                    : "bg-nexus-gray text-nexus-text-muted cursor-not-allowed"
                )}
              >
                {txStatus === "signing" || txStatus === "processing" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Pay {agent.price} {agent.priceUnit} & Run
                  </>
                )}
              </button>

              {!connected && (
                <p className="text-center text-sm text-nexus-text-muted">
                  Connect your wallet to use this agent
                </p>
              )}
            </div>
          ) : (
            /* Code Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-nexus-text-muted">
                  Copy this code to integrate {agent.name} in your dApp
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-nexus-success" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              <div className="code-block">
                <pre className="text-sm">
                  <code className="text-nexus-text-dim">
                    {generateIntegrationCode(agent)}
                  </code>
                </pre>
              </div>

              {/* Features List */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-nexus-text mb-3">
                  Agent Features
                </h4>
                <ul className="grid grid-cols-2 gap-2">
                  {agent.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-nexus-text-muted"
                    >
                      <Zap className="w-3.5 h-3.5 text-nexus-cyan" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
