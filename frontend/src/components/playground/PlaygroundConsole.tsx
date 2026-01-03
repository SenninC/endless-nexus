"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useEndlessWallet } from "@/context/EndlessWalletContext";
import { NEXUS_CONTRACT, NETWORK_CONFIG } from "@/config/contracts";
import { AIAgent, MOCK_AGENTS } from "@/data/agents";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Terminal, 
  Zap, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Send,
  Copy,
  ExternalLink,
  Code,
  Play,
  Check,
  ChevronDown,
  Sparkles
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface ConsoleMessage {
  id: number;
  text: string;
  type: "info" | "success" | "error" | "matrix" | "system";
  timestamp: Date;
}

type TransactionStatus = "idle" | "preparing" | "signing" | "confirming" | "success" | "error";
type TabType = "execute" | "integrate";

// ============================================
// MATRIX MESSAGES
// ============================================

const MATRIX_MESSAGES = [
  "Encrypting prompt with AES-256...",
  "Validating wallet signature...",
  "Routing via Endless Testnet...",
  "Waiting for AI response...",
];

// ============================================
// MOCK AI RESPONSES
// ============================================

const MOCK_AI_RESPONSES: Record<string, string[]> = {
  code_auditor: [
    "## Security Analysis Complete\n\n✅ No critical vulnerabilities detected.\n\n### Findings:\n- Line 42: Consider using SafeMath for arithmetic operations\n- Line 78: Recommend adding reentrancy guard\n- Line 156: Gas optimization possible with unchecked blocks\n\n**Overall Score: 94/100**",
    "## Smart Contract Audit Report\n\n⚠️ 2 Medium severity issues found.\n\n### Critical Path Analysis:\n1. `withdraw()` function lacks access control\n2. Missing event emission in `transfer()`\n\n**Recommendation:** Implement OpenZeppelin AccessControl",
  ],
  creative_writer: [
    "# The Neon Dream\n\nIn the sprawling megacity of Neo-Endless, where holographic advertisements painted the smog-filled sky, a lone hacker named Zero discovered something that would change everything...\n\nThe blockchain held secrets older than the corporations themselves.",
    "## Cyberpunk Haiku\n\n```\nNeon lights flicker\nBlockchain whispers ancient code\nEndless dreams awaken\n```",
  ],
  defi_analyst: [
    "## DeFi Analysis Report\n\n**Protocol:** EndlessSwap v2\n**TVL:** $42.5M\n**APY Range:** 12.4% - 89.2%\n\n### Risk Assessment:\n- Smart Contract Risk: LOW\n- Impermanent Loss Risk: MEDIUM\n- Liquidity Risk: LOW\n\n**Recommendation:** Consider LP position in EDS/USDC pool",
  ],
  pixel_forge: [
    "🎨 **Image Generation Complete**\n\n```ascii\n    ╔══════════════════╗\n    ║  ENDLESS NEXUS   ║\n    ║    ◈ ◇ ◈ ◇ ◈    ║\n    ║  CYBERPUNK 2077  ║\n    ╚══════════════════╝\n```\n\n*Generated in 2.3s using Diffusion-X model*",
  ],
  code_pilot: [
    "```typescript\n// Generated Move function for token transfer\npublic entry fun transfer_tokens(\n    sender: &signer,\n    recipient: address,\n    amount: u64\n) acquires TokenStore {\n    let sender_addr = signer::address_of(sender);\n    assert!(balance(sender_addr) >= amount, E_INSUFFICIENT_FUNDS);\n    \n    // Execute transfer\n    internal_transfer(sender_addr, recipient, amount);\n    \n    // Emit event\n    emit_transfer_event(sender_addr, recipient, amount);\n}\n```",
  ],
  sentiment_oracle: [
    "## Market Sentiment Analysis\n\n**Asset:** EDS Token\n**Timeframe:** 24h\n\n### Sentiment Score: 78/100 (BULLISH)\n\n📊 **Breakdown:**\n- Twitter Mentions: +45% ↑\n- Developer Activity: HIGH\n- Whale Movement: Accumulation Phase\n- Fear & Greed Index: 72 (Greed)\n\n**Prediction:** Potential breakout above resistance",
  ],
  default: [
    "## AI Processing Complete\n\nYour request has been analyzed and processed through the Endless neural network.\n\n**Status:** Success\n**Confidence:** 94.7%\n**Processing Time:** 1.2s",
  ],
};

// ============================================
// ENDLESS SDK HELPERS
// ============================================
// COMPONENT
// ============================================

interface PlaygroundConsoleProps {
  /** List of agents to display (defaults to MOCK_AGENTS) */
  agents?: AIAgent[];
  /** Initial agent ID to select (optional, defaults to first agent) */
  initialAgentId?: string;
  /** Callback when modal should close */
  onClose?: () => void;
  /** Callback when agent changes */
  onAgentChange?: (agent: AIAgent) => void;
}

export default function PlaygroundConsole({ 
  agents = MOCK_AGENTS,
  initialAgentId, 
  onClose,
  onAgentChange 
}: PlaygroundConsoleProps) {
  // ============================================
  // URL PARAMS
  // ============================================
  const searchParams = useSearchParams();
  const agentIdFromUrl = searchParams.get("agentId");

  // ============================================
  // AGENT STATE
  // ============================================
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(() => {
    // Priority: URL param > initialAgentId prop > first agent
    if (agentIdFromUrl) {
      const found = agents.find(a => a.id === agentIdFromUrl);
      if (found) return found;
    }
    if (initialAgentId) {
      const found = agents.find(a => a.id === initialAgentId);
      if (found) return found;
    }
    return agents[0];
  });
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  // Sync agent when URL changes
  useEffect(() => {
    if (agentIdFromUrl) {
      const found = agents.find(a => a.id === agentIdFromUrl);
      if (found && found.id !== selectedAgent.id) {
        setSelectedAgent(found);
        setPrompt("");
        clearConsole();
        setStatus("idle");
      }
    }
  }, [agentIdFromUrl, agents]);

  // Handle agent change
  const handleAgentChange = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setIsAgentDropdownOpen(false);
    // Reset console state when agent changes
    clearConsole();
    setStatus("idle");
    setPrompt("");
    // Notify parent if callback provided
    onAgentChange?.(agent);
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("agentId", agent.id);
    window.history.pushState({}, "", newUrl.toString());
  };

  // ============================================
  // OTHER STATE
  // ============================================
  const [prompt, setPrompt] = useState("");
  const [servicePrice, setServicePrice] = useState<string>("...");
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("execute");
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Refs
  const consoleRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Wallet
  const { connected, account, signAndSubmitTransaction } = useEndlessWallet();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAgentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================
  // CONSOLE HELPERS
  // ============================================

  const addMessage = useCallback((text: string, type: ConsoleMessage["type"] = "info") => {
    const newMessage: ConsoleMessage = {
      id: messageIdRef.current++,
      text,
      type,
      timestamp: new Date(),
    };
    setConsoleMessages(prev => [...prev, newMessage]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
    setAiResponse(null);
    setTxHash(null);
  }, []);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  // ============================================
  // FETCH SERVICE PRICE
  // ============================================

  // Sync service price with selected agent price for consistency
  useEffect(() => {
    // Use the agent's defined price directly for consistency
    // The price displayed under the agent name should match Service Price
    setServicePrice(selectedAgent.price.toString());
  }, [selectedAgent.price]);

  // ============================================
  // MATRIX ANIMATION
  // ============================================

  const runMatrixAnimation = useCallback(async () => {
    for (const message of MATRIX_MESSAGES) {
      addMessage(message, "matrix");
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    }
  }, [addMessage]);

  // ============================================
  // EXECUTE TRANSACTION
  // ============================================

  const executeAiTask = async () => {
    if (!connected || !account) {
      addMessage("ERROR: Wallet not connected", "error");
      return;
    }

    if (!prompt.trim()) {
      addMessage("ERROR: Please enter a prompt", "error");
      return;
    }

    clearConsole();
    setStatus("preparing");
    
    addMessage("=".repeat(50), "system");
    addMessage(`ENDLESS NEXUS - AI TASK EXECUTION`, "system");
    addMessage("=".repeat(50), "system");
    addMessage(`Agent: ${selectedAgent.name}`, "info");
    addMessage(`Model ID: ${selectedAgent.id}`, "info");
    addMessage(`Price: ${servicePrice} EDS`, "info");
    addMessage(`Wallet: ${account.address.toString().slice(0, 10)}...${account.address.toString().slice(-8)}`, "info");
    addMessage("", "info");

    try {
      // Start matrix animation
      setStatus("signing");
      addMessage(">>> Initiating secure transaction...", "system");
      
      // Run matrix effect in parallel
      const matrixPromise = runMatrixAnimation();

      // Prepare transaction payload - Endless format
      // function: "address::module::function"
      // arguments: [arg1, arg2, ...] (strings for Move String type)
      const functionId = `${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::request_ai_service_with_payment`;
      const paymentAmount = Math.floor(parseFloat(servicePrice) * 100_000_000).toString();
      
      const payload = {
        function: functionId,
        type_arguments: [] as string[],
        arguments: [
          selectedAgent.id,     // model_id: String
          prompt,               // prompt: String
          paymentAmount,        // payment_amount: u128 (as string)
        ],
      };

      // Debug log
      console.log("[Playground] Final Payload:", JSON.stringify(payload, null, 2));
      addMessage(`>>> Requesting wallet signature...`, "matrix");
      
      // Sign and submit transaction
      let response;
      try {
        response = await signAndSubmitTransaction(payload);
      } catch (txError: any) {
        console.error("[Playground] Transaction error details:", txError);
        throw new Error(`Transaction failed: ${txError.message || 'Unknown error'}`);
      }
      
      // Wait for matrix animation to complete
      await matrixPromise;
      
      setStatus("confirming");
      addMessage(">>> Transaction broadcasted!", "success");
      addMessage(`>>> Hash: ${response.hash}`, "success");
      setTxHash(response.hash);

      // Simulate block confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus("success");
      addMessage("", "info");
      addMessage("✓ TRANSACTION CONFIRMED", "success");
      addMessage(`✓ Block validation complete`, "success");
      addMessage("", "info");
      
      // Generate mock AI response
      addMessage(">>> Decrypting AI response...", "matrix");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const responses = MOCK_AI_RESPONSES[selectedAgent.id] || MOCK_AI_RESPONSES.default;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      
      addMessage(">>> AI RESPONSE RECEIVED", "success");
      
    } catch (error) {
      setStatus("error");
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addMessage(`ERROR: ${errorMessage}`, "error");
      addMessage(">>> Transaction failed. Please try again.", "error");
    }
  };

  // ============================================
  // COPY HASH
  // ============================================

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============================================
  // GENERATE INTEGRATION CODE
  // ============================================

  const generateIntegrationCode = (): string => {
    const functionName = selectedAgent.name.replace(/\s+/g, '');
    const moduleAddress = NEXUS_CONTRACT.address;
    const moduleName = NEXUS_CONTRACT.module;
    const networkUrl = NETWORK_CONFIG.fullnodeUrl;
    const modelId = selectedAgent.id;
    const priceInUnits = Math.floor(selectedAgent.price * 100_000_000);
    
    const code = [
      '// ============================================',
      '// ' + selectedAgent.name + ' - Integration Code',
      '// Generated by Endless Nexus',
      '// ============================================',
      '',
      'import { Endless, EndlessConfig, Network } from "@endlesslab/endless-ts-sdk";',
      '',
      '// Configuration',
      'const MODULE_ADDRESS = "' + moduleAddress + '";',
      'const MODULE_NAME = "' + moduleName + '";',
      'const FUNCTION_NAME = "request_ai_service_with_payment";',
      'const MODEL_ID = "' + modelId + '";',
      '',
      '// Network Configuration',
      'const NETWORK_CONFIG = {',
      '  network: Network.TESTNET,',
      '  fullnodeUrl: "' + networkUrl + '",',
      '};',
      '',
      '// Initialize Endless Client',
      'const config = new EndlessConfig(NETWORK_CONFIG);',
      'const endless = new Endless(config);',
      '',
      '/**',
      ' * Call ' + selectedAgent.name + ' Agent',
      ' * ',
      ' * @param walletClient - Your wallet adapter instance',
      ' * @param prompt - The prompt to send to the AI agent',
      ' * @param paymentAmount - Payment in EDS base units (1 EDS = 100_000_000 units)',
      ' * @returns Transaction hash',
      ' */',
      'export async function call' + functionName + '(',
      '  walletClient: { signAndSubmitTransaction: (payload: any) => Promise<{ hash: string }> },',
      '  prompt: string,',
      '  paymentAmount: bigint = ' + priceInUnits + 'n // ' + selectedAgent.price + ' EDS',
      '): Promise<string> {',
      '  // Build transaction payload',
      '  const payload = {',
      '    data: {',
      '      function: `${MODULE_ADDRESS}::${MODULE_NAME}::${FUNCTION_NAME}`,',
      '      typeArguments: [],',
      '      functionArguments: [',
      '        MODEL_ID,           // model_id: String',
      '        prompt,             // prompt: String  ',
      '        paymentAmount.toString(), // payment_amount: u128',
      '      ],',
      '    },',
      '  };',
      '',
      '  // Sign and submit transaction',
      '  const response = await walletClient.signAndSubmitTransaction(payload);',
      '  ',
      '  // Wait for transaction confirmation',
      '  await endless.waitForTransaction({ ',
      '    transactionHash: response.hash ',
      '  });',
      '',
      '  console.log(`✅ Transaction confirmed: ${response.hash}`);',
      '  return response.hash;',
      '}',
      '',
      '/**',
      ' * Get current service price from contract',
      ' * @returns Price in EDS base units',
      ' */',
      'export async function getServicePrice(): Promise<bigint> {',
      '  const result = await endless.view({',
      '    payload: {',
      '      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_service_price`,',
      '      typeArguments: [],',
      '      functionArguments: [],',
      '    },',
      '  });',
      '  return BigInt(result[0] as string);',
      '}',
      '',
      '/**',
      ' * Check user\'s EDS balance',
      ' * @param userAddress - User wallet address',
      ' * @returns Balance in EDS base units',
      ' */',
      'export async function getUserBalance(userAddress: string): Promise<bigint> {',
      '  const result = await endless.view({',
      '    payload: {',
      '      function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_eds_balance`,',
      '      typeArguments: [],',
      '      functionArguments: [userAddress],',
      '    },',
      '  });',
      '  return BigInt(result[0] as string);',
      '}',
      '',
      '// ============================================',
      '// USAGE EXAMPLE',
      '// ============================================',
      '/*',
      'import { useEndlessWallet } from "@/context/EndlessWalletContext";',
      '',
      'function MyComponent() {',
      '  const { signAndSubmitTransaction } = useEndlessWallet();',
      '',
      '  const handleRunAgent = async () => {',
      '    try {',
      '      const txHash = await call' + functionName + '(',
      '        { signAndSubmitTransaction },',
      '        "Your prompt here...",',
      '        ' + priceInUnits + 'n // ' + selectedAgent.price + ' EDS',
      '      );',
      '      console.log("Success! TX:", txHash);',
      '    } catch (error) {',
      '      console.error("Failed:", error);',
      '    }',
      '  };',
      '',
      '  return (',
      '    <button onClick={handleRunAgent}>',
      '      Run ' + selectedAgent.name,
      '    </button>',
      '  );',
      '}',
      '*/',
    ];
    
    return code.join('\n');
  };

  const copyIntegrationCode = () => {
    navigator.clipboard.writeText(generateIntegrationCode());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ============================================
  // RENDER
  // ============================================

  // Get the icon for the selected agent
  const AgentIcon = selectedAgent.icon;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with Agent Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${selectedAgent.color === "cyan" ? "bg-endless-violet/10 border border-endless-violet/20" : ""}
            ${selectedAgent.color === "purple" ? "bg-purple-100 border border-purple-200" : ""}
            ${selectedAgent.color === "green" ? "bg-emerald-100 border border-emerald-200" : ""}
            ${selectedAgent.color === "orange" ? "bg-orange-100 border border-orange-200" : ""}
          `}>
            <AgentIcon className={`w-5 h-5
              ${selectedAgent.color === "cyan" ? "text-endless-violet" : ""}
              ${selectedAgent.color === "purple" ? "text-purple-600" : ""}
              ${selectedAgent.color === "green" ? "text-emerald-600" : ""}
              ${selectedAgent.color === "orange" ? "text-orange-600" : ""}
            `} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h2>
            <p className="text-sm text-gray-500">{selectedAgent.price} {selectedAgent.priceUnit}</p>
          </div>
        </div>

        {/* Agent Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 
                       rounded-xl hover:border-endless-violet/30 transition-all text-sm shadow-sm"
          >
            <span className="text-gray-700">Switch Agent</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isAgentDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {isAgentDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 
                            rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider px-2">Select Agent</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentChange(agent)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
                        ${selectedAgent.id === agent.id ? "bg-endless-lime/20 border-l-2 border-endless-violet" : "border-l-2 border-transparent"}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${agent.color === "cyan" ? "bg-endless-violet/10" : ""}
                        ${agent.color === "purple" ? "bg-purple-100" : ""}
                        ${agent.color === "green" ? "bg-emerald-100" : ""}
                        ${agent.color === "orange" ? "bg-orange-100" : ""}
                      `}>
                        <Icon className={`w-4 h-4
                          ${agent.color === "cyan" ? "text-endless-violet" : ""}
                          ${agent.color === "purple" ? "text-purple-600" : ""}
                          ${agent.color === "green" ? "text-emerald-600" : ""}
                          ${agent.color === "orange" ? "text-orange-600" : ""}
                        `} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-gray-500 text-xs truncate">{agent.description}</p>
                      </div>
                      <span className="text-xs text-endless-violet font-mono shrink-0">{agent.price} EDS</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Description */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-gray-600 text-sm">{selectedAgent.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedAgent.features.slice(0, 4).map((feature, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-white border border-gray-200 rounded-full 
                         text-xs text-gray-600 font-mono"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2
          ${status === "idle" ? "bg-gray-100 text-gray-600" : ""}
          ${status === "preparing" ? "bg-yellow-100 text-yellow-700" : ""}
          ${status === "signing" ? "bg-endless-violet/10 text-endless-violet" : ""}
          ${status === "confirming" ? "bg-purple-100 text-purple-700" : ""}
          ${status === "success" ? "bg-emerald-100 text-emerald-700" : ""}
          ${status === "error" ? "bg-red-100 text-red-700" : ""}
        `}>
          {status === "idle" && <Shield className="w-3 h-3" />}
          {(status === "preparing" || status === "signing" || status === "confirming") && 
            <Loader2 className="w-3 h-3 animate-spin" />}
          {status === "success" && <CheckCircle className="w-3 h-3" />}
          {status === "error" && <AlertCircle className="w-3 h-3" />}
          <span className="uppercase">{status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("execute")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
            ${activeTab === "execute"
              ? "bg-endless-lime text-gray-900 shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Play className="w-4 h-4" />
          Execute
        </button>
        <button
          onClick={() => setActiveTab("integrate")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
            ${activeTab === "integrate"
              ? "bg-endless-lime text-gray-900 shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Code className="w-4 h-4" />
          Integrate
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "execute" ? (
        <>
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Panel - Input */}
        <div className="space-y-4">
          {/* Price Display */}
          <div className="bg-white border border-endless-violet/20 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service Price</span>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-endless-violet" />
                <span className="text-lg font-mono font-bold text-endless-violet">
                  {servicePrice} EDS
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <label className="block text-sm text-gray-600 mb-2">Your Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for the AI agent..."
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3
                         text-gray-900 placeholder-gray-400 font-mono text-sm resize-none
                         focus:outline-none focus:border-endless-lime focus:ring-2 focus:ring-endless-lime/20
                         transition-all duration-200"
              disabled={status !== "idle" && status !== "success" && status !== "error"}
            />
            
            {/* Prompt Templates */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-endless-violet" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">Quick Prompts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.promptTemplates?.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(template.prompt)}
                    disabled={status !== "idle" && status !== "success" && status !== "error"}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200
                      ${prompt === template.prompt
                        ? "bg-endless-lime/30 border-endless-lime text-gray-900"
                        : "bg-gray-100 border-gray-200 text-gray-600 hover:border-endless-violet/30 hover:text-endless-violet hover:bg-endless-violet/5"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={executeAiTask}
            disabled={!connected || status === "signing" || status === "confirming" || status === "preparing"}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                       transition-all duration-300 group
              ${connected 
                ? "bg-endless-lime hover:bg-endless-lime/80 text-gray-900 shadow-md hover:shadow-lg" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"}
              ${(status === "signing" || status === "confirming" || status === "preparing") 
                ? "opacity-75 cursor-wait" : ""}
            `}
          >
            {(status === "signing" || status === "confirming" || status === "preparing") ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Execute AI Task
              </>
            )}
          </button>

          {!connected && (
            <p className="text-center text-sm text-gray-500">
              Connect your wallet to execute tasks
            </p>
          )}
        </div>

        {/* Right Panel - Console */}
        <div className="space-y-4">
          {/* Terminal - Light Mode */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
            {/* Terminal Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-gray-400 text-xs font-mono ml-2">endless-nexus-terminal</span>
            </div>
            
            {/* Terminal Content */}
            <div 
              ref={consoleRef}
              className="h-64 overflow-y-auto p-4 font-mono text-sm"
            >
              {consoleMessages.length === 0 ? (
                <div className="text-gray-500">
                  {`> Awaiting command...`}
                  <span className="inline-block w-2 h-4 bg-endless-lime ml-1 animate-pulse" />
                </div>
              ) : (
                consoleMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`mb-1 ${
                      msg.type === "system" ? "text-endless-lime" :
                      msg.type === "matrix" ? "text-gray-400" :
                      msg.type === "success" ? "text-emerald-400" :
                      msg.type === "error" ? "text-red-400" :
                      "text-gray-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyTxHash}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy hash"
                  >
                    <Copy className={`w-4 h-4 ${copied ? "text-emerald-500" : "text-gray-500"}`} />
                  </button>
                  <a
                    href={`https://scan.endless.link/txn/${txHash}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </div>
              </div>
              <code className="text-xs text-emerald-600 font-mono break-all">
                {txHash}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* AI Response - Clean Light Style */}
      {aiResponse && (
        <div className="mt-6 bg-white border border-endless-violet/30 rounded-xl overflow-hidden shadow-lg">
          {/* Response Header */}
          <div className="bg-endless-violet/5 border-b border-endless-violet/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-endless-violet" />
              <span className="text-endless-violet font-mono text-sm font-bold">AI RESPONSE</span>
            </div>
            <span className="text-gray-500 text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          
          {/* Response Content */}
          <div className="p-6 font-mono text-sm leading-relaxed bg-gray-50">
            <div className="text-gray-800 whitespace-pre-wrap">
              {aiResponse}
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        /* Integrate Tab Content */
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-endless-violet/5 border border-endless-violet/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-endless-violet/10 flex items-center justify-center shrink-0">
                <Code className="w-5 h-5 text-endless-violet" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Integration Guide</h3>
                <p className="text-gray-600 text-sm">
                  Copy this TypeScript code to integrate <span className="text-endless-violet">{selectedAgent.name}</span> into your own application. 
                  The code includes all necessary imports, configuration, and helper functions.
                </p>
              </div>
            </div>
          </div>

          {/* Contract Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Module Address</span>
              <p className="text-endless-violet font-mono text-sm mt-1 break-all">{NEXUS_CONTRACT.address}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Function</span>
              <p className="text-purple-600 font-mono text-sm mt-1">{NEXUS_CONTRACT.module}::request_ai_service_with_payment</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Model ID</span>
              <p className="text-emerald-600 font-mono text-sm mt-1">{selectedAgent.id}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Default Price</span>
              <p className="text-amber-600 font-mono text-sm mt-1">{selectedAgent.price} EDS ({Math.floor(selectedAgent.price * 100_000_000)} base units)</p>
            </div>
          </div>

          {/* Code Block */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
            {/* Code Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-gray-400 text-xs font-mono ml-2">{selectedAgent.id}-integration.ts</span>
              </div>
              <button
                onClick={copyIntegrationCode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${codeCopied 
                    ? "bg-emerald-500/20 text-emerald-400" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                  }`}
              >
                {codeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Content with Syntax Highlighting */}
            <div className="relative group max-h-[500px] overflow-auto">
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                lineNumberStyle={{
                  minWidth: '2.5em',
                  paddingRight: '1em',
                  color: 'rgb(75, 85, 99)',
                  userSelect: 'none',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                  }
                }}
              >
                {generateIntegrationCode()}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* SDK Installation Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-gray-900 font-medium mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-endless-violet" />
              Installation
            </h4>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500">$</span>
              <span className="text-emerald-400 ml-2">npm install @endlesslab/endless-ts-sdk</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        /* Scrollbar styles for vertical scrolling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 1);
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(209, 213, 219, 1);
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 1);
        }
      `}</style>
    </div>
  );
}
