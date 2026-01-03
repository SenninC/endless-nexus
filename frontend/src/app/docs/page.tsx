"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { 
  Rocket, 
  FileCode, 
  Terminal, 
  BookOpen, 
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Shield,
  Code2,
  Database,
  Wallet,
  ChevronRight
} from "lucide-react";
import { NEXUS_CONTRACT, NETWORK_CONFIG } from "@/config/contracts";

// ============================================
// TYPES
// ============================================

type TabId = "quickstart" | "contract" | "sdk" | "api" | "faq";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// ============================================
// TABS CONFIGURATION
// ============================================

const TABS: Tab[] = [
  { id: "quickstart", label: "Quick Start", icon: <Rocket className="w-4 h-4" /> },
  { id: "contract", label: "Smart Contract", icon: <FileCode className="w-4 h-4" /> },
  { id: "sdk", label: "SDK Integration", icon: <Terminal className="w-4 h-4" /> },
  { id: "api", label: "API Reference", icon: <BookOpen className="w-4 h-4" /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
];

// ============================================
// CODE BLOCK COMPONENT WITH SYNTAX HIGHLIGHTING
// ============================================

// Language mapping for react-syntax-highlighter
const languageMap: { [key: string]: string } = {
  typescript: "typescript",
  javascript: "javascript",
  move: "rust", // Move is similar to Rust syntax
  bash: "bash",
  shell: "shell",
  json: "json",
};

function CodeBlock({ 
  code, 
  language = "typescript",
  title 
}: { 
  code: string; 
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const syntaxLanguage = languageMap[language] || language;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {title && (
            <span className="text-xs text-gray-400 font-mono ml-2">{title}</span>
          )}
          <span className="text-xs text-gray-500 font-mono">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
            copied 
              ? "text-emerald-400 bg-emerald-500/10" 
              : "text-gray-400 hover:text-gray-900 hover:bg-gray-700"
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      
      {/* Code with Syntax Highlighting */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "none",
            backgroundColor: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              background: "none",
              backgroundColor: "transparent",
            }
          }}
          showLineNumbers={code.split("\n").length > 5}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "#4a5568",
            userSelect: "none",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// ============================================
// FAQ ITEM COMPONENT
// ============================================

function FaqItem({ 
  question, 
  children 
}: { 
  question: string; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("quickstart");

  return (
    <div className="min-h-screen py-12 bg-white relative">
      {/* Grid Background - Fixed behind content */}
      <div className="network-grid fixed inset-0 z-0" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
        
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-endless-violet/10 border border-endless-violet/20 mb-6">
              <BookOpen className="w-4 h-4 text-endless-violet" />
              <span className="text-sm text-endless-violet">Developer Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gray-900">Endless Nexus</span>
              <span className="text-endless-violet"> Docs</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to integrate AI agents into your dApp. 
              From quick start to advanced API reference.
            </p>
          </div>

          {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 p-2 bg-gray-100 rounded-2xl border border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-endless-lime text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          
          {/* ============================================ */}
          {/* QUICK START TAB */}
          {/* ============================================ */}
          {activeTab === "quickstart" && (
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-endless-violet/10 flex items-center justify-center text-endless-violet font-bold">1</div>
                  <h3 className="text-xl font-semibold text-gray-900">Install the SDK</h3>
                </div>
                <CodeBlock 
                  code="npm install @endlesslab/endless-ts-sdk"
                  language="bash"
                  title="terminal"
                />
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-endless-violet/10 flex items-center justify-center text-endless-violet font-bold">2</div>
                  <h3 className="text-xl font-semibold text-gray-900">Configure the Client</h3>
                </div>
                <CodeBlock 
                  code={`import { Endless, EndlessConfig, Network } from "@endlesslab/endless-ts-sdk";

const config = new EndlessConfig({ 
  network: Network.TESTNET,
  fullnodeUrl: "${NETWORK_CONFIG.fullnodeUrl}"
});

const endless = new Endless(config);`}
                  language="typescript"
                  title="config.ts"
                />
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-endless-violet/10 flex items-center justify-center text-endless-violet font-bold">3</div>
                  <h3 className="text-xl font-semibold text-gray-900">Call an AI Agent</h3>
                </div>
                <CodeBlock 
                  code={`// Build the transaction payload
const payload = {
  data: {
    function: "${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::request_ai_service_with_payment",
    typeArguments: [],
    functionArguments: [
      "code_auditor",           // model_id
      "Audit my smart contract", // prompt  
      "100000000"               // 1 EDS (1 EDS = 100,000,000 base units)
    ],
  },
};

// Sign and submit with wallet
const response = await signAndSubmitTransaction(payload);
console.log("TX Hash:", response.hash);`}
                  language="typescript"
                  title="callAgent.ts"
                />
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a 
                  href="/playground"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-gray-900 font-medium hover:shadow-neon-cyan transition-all"
                >
                  <Zap className="w-5 h-5" />
                  Try in Playground
                </a>
                <a 
                  href="/agents"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-gray-200 transition-colors"
                >
                  Browse Agents
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SMART CONTRACT TAB */}
          {/* ============================================ */}
          {activeTab === "contract" && (
            <div className="space-y-8">
              {/* Contract Info */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-endless-violet" />
                  Deployed Contract
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Network</span>
                    <p className="text-green-400 font-mono text-sm mt-1">Endless Testnet</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Module Name</span>
                    <p className="text-purple-400 font-mono text-sm mt-1">{NEXUS_CONTRACT.module}</p>
                  </div>
                  <div className="md:col-span-2 p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Module Address</span>
                    <p className="text-endless-violet font-mono text-sm mt-1 break-all">{NEXUS_CONTRACT.address}</p>
                  </div>
                </div>
              </div>

              {/* Entry Functions */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-green-400" />
                  Entry Functions
                </h3>
                <div className="space-y-4">
                  {/* Function 1 */}
                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">entry</span>
                      <code className="text-gray-900 font-mono">request_ai_service</code>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">Simple AI service request without payment.</p>
                    <CodeBlock 
                      code={`public entry fun request_ai_service(
    account: &signer,
    model_id: String,
    prompt: String
)`}
                      language="move"
                    />
                  </div>

                  {/* Function 2 */}
                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">entry</span>
                      <code className="text-gray-900 font-mono">request_ai_service_with_payment</code>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">AI service request with EDS payment. Recommended for production.</p>
                    <CodeBlock 
                      code={`public entry fun request_ai_service_with_payment(
    account: &signer,
    model_id: String,
    prompt: String,
    payment_amount: u128
)`}
                      language="move"
                    />
                  </div>
                </div>
              </div>

              {/* View Functions */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  View Functions
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">view</span>
                      <code className="text-gray-900 font-mono">get_service_price</code>
                    </div>
                    <p className="text-gray-600 text-sm">Returns the current service price in base units (u128).</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-100/50 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">view</span>
                      <code className="text-gray-900 font-mono">get_user_eds_balance</code>
                    </div>
                    <p className="text-gray-600 text-sm">Returns the EDS balance for a given address (u128).</p>
                  </div>
                </div>
              </div>

              {/* Explorer Link */}
              <div className="flex justify-center">
                <a 
                  href="https://scan.endless.link/account/0x3bc5719c343fcc717043df3b59051398ec357d7768c2f9dc78c89cbd1672fa79?network=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-gray-200 transition-colors"
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* SDK INTEGRATION TAB */}
          {/* ============================================ */}
          {activeTab === "sdk" && (
            <div className="space-y-8">
              {/* Initialize Client */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-endless-violet" />
                  Initialize the Endless Client
                </h3>
                <CodeBlock 
                  code={`import { Endless, EndlessConfig, Network } from "@endlesslab/endless-ts-sdk";

// Configuration for Endless Testnet
const config = new EndlessConfig({
  network: Network.TESTNET,
  fullnodeUrl: "${NETWORK_CONFIG.fullnodeUrl}",
});

// Initialize the client
const endless = new Endless(config);

// Now you can use 'endless' to interact with the blockchain`}
                  language="typescript"
                  title="endless-client.ts"
                />
              </div>

              {/* Wallet Connection */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-purple-400" />
                  Wallet Connection Pattern
                </h3>
                <p className="text-gray-600 mb-4">
                  Use the <code className="text-endless-violet">useEndlessWallet()</code> hook to access wallet functionality in your React components.
                </p>
                <CodeBlock 
                  code={`import { useEndlessWallet } from "@/context/EndlessWalletContext";

function MyComponent() {
  const { 
    connected,           // boolean - is wallet connected?
    account,             // { address, publicKey } | null
    connect,             // () => Promise<void>
    disconnect,          // () => Promise<void>
    signAndSubmitTransaction, // (payload) => Promise<{ hash }>
  } = useEndlessWallet();

  if (!connected) {
    return <button onClick={() => connect()}>Connect Wallet</button>;
  }

  return <p>Connected: {account?.address}</p>;
}`}
                  language="typescript"
                  title="WalletExample.tsx"
                />
              </div>

              {/* Submit Transaction */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Submit a Transaction
                </h3>
                <CodeBlock 
                  code={`import { useEndlessWallet } from "@/context/EndlessWalletContext";

// Helper: Convert EDS to base units (1 EDS = 100,000,000 units)
const EDS_DECIMALS = 100_000_000n;
const toBaseUnits = (eds: number) => BigInt(Math.floor(eds * 100_000_000));

async function callAiAgent(modelId: string, prompt: string, edsAmount: number) {
  const { signAndSubmitTransaction } = useEndlessWallet();
  
  // Convert EDS to base units
  const amountInBaseUnits = toBaseUnits(edsAmount);

  // Build the transaction payload
  const payload = {
    data: {
      function: \`${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::request_ai_service_with_payment\`,
      typeArguments: [],
      functionArguments: [
        modelId,                        // String - AI model identifier
        prompt,                         // String - Your prompt
        amountInBaseUnits.toString(),   // u128 - Payment in base units
      ],
    },
  };

  try {
    // Sign and submit the transaction
    const response = await signAndSubmitTransaction(payload);
    
    // Wait for confirmation
    await endless.waitForTransaction({ 
      transactionHash: response.hash 
    });

    console.log("✅ Transaction confirmed:", response.hash);
    return response.hash;
  } catch (error) {
    console.error("❌ Transaction failed:", error);
    throw error;
  }
}`}
                  language="typescript"
                  title="submitTransaction.ts"
                />
              </div>

              {/* Read View Functions */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Read On-Chain Data (View Functions)
                </h3>
                <CodeBlock 
                  code={`// Get the current service price
async function getServicePrice(): Promise<bigint> {
  const result = await endless.view({
    payload: {
      function: \`${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::get_service_price\`,
      typeArguments: [],
      functionArguments: [],
    },
  });
  return BigInt(result[0] as string);
}

// Get user's EDS balance
async function getUserBalance(userAddress: string): Promise<bigint> {
  const result = await endless.view({
    payload: {
      function: \`${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.module}::get_user_eds_balance\`,
      typeArguments: [],
      functionArguments: [userAddress],
    },
  });
  return BigInt(result[0] as string);
}

// Usage
const price = await getServicePrice();
console.log("Service price:", price, "base units");`}
                  language="typescript"
                  title="viewFunctions.ts"
                />
              </div>

              {/* Error Handling */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Error Handling
                </h3>
                <CodeBlock 
                  code={`try {
  const response = await signAndSubmitTransaction(payload);
  await endless.waitForTransaction({ transactionHash: response.hash });
} catch (error: any) {
  if (error.message?.includes("insufficient")) {
    console.error("Insufficient balance for transaction");
  } else if (error.message?.includes("rejected")) {
    console.error("User rejected the transaction");
  } else if (error.message?.includes("network")) {
    console.error("Network error - please try again");
  } else {
    console.error("Transaction failed:", error.message);
  }
}`}
                  language="typescript"
                  title="errorHandling.ts"
                />
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* API REFERENCE TAB */}
          {/* ============================================ */}
          {activeTab === "api" && (
            <div className="space-y-8">
              {/* Entry Functions Table */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Entry Functions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Function</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Parameters</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      <tr>
                        <td className="py-3 px-4">
                          <code className="text-endless-violet">request_ai_service</code>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <code className="text-xs bg-gray-200 px-1 rounded">model_id: String</code><br/>
                          <code className="text-xs bg-gray-200 px-1 rounded">prompt: String</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          Simple AI request without payment
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <code className="text-endless-violet">request_ai_service_with_payment</code>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <code className="text-xs bg-gray-200 px-1 rounded">model_id: String</code><br/>
                          <code className="text-xs bg-gray-200 px-1 rounded">prompt: String</code><br/>
                          <code className="text-xs bg-gray-200 px-1 rounded">payment_amount: u128</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          AI request with EDS payment
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* View Functions Table */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">View Functions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Function</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Parameters</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Returns</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      <tr>
                        <td className="py-3 px-4">
                          <code className="text-blue-400">get_service_price</code>
                        </td>
                        <td className="py-3 px-4 text-gray-500">—</td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-gray-200 px-1 rounded">u128</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          Current service price in base units
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <code className="text-blue-400">get_user_eds_balance</code>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <code className="text-xs bg-gray-200 px-1 rounded">user_addr: address</code>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-gray-200 px-1 rounded">u128</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          User's EDS balance
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Available Models */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Model IDs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "code_auditor", name: "Code Auditor", price: "0.5 EDS" },
                    { id: "creative_writer", name: "Creative Writer", price: "0.3 EDS" },
                    { id: "data_analyst", name: "Data Analyst", price: "0.4 EDS" },
                    { id: "blockchain_oracle", name: "Blockchain Oracle", price: "0.6 EDS" },
                    { id: "defi_advisor", name: "DeFi Advisor", price: "0.5 EDS" },
                    { id: "nft_generator", name: "NFT Generator", price: "1.0 EDS" },
                  ].map((model) => (
                    <div key={model.id} className="p-3 rounded-lg bg-gray-100/50 border border-slate-700/30">
                      <code className="text-endless-violet text-sm">{model.id}</code>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{model.name}</span>
                        <span className="text-xs text-yellow-400">{model.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Definitions */}
              <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">TypeScript Types</h3>
                <CodeBlock 
                  code={`// Transaction Payload
interface TransactionPayload {
  data: {
    function: string;
    typeArguments?: string[];
    functionArguments: (string | number | boolean | Uint8Array)[];
  };
}

// Transaction Response
interface TransactionResponse {
  hash: string;
  success?: boolean;
}

// Wallet Account
interface WalletAccount {
  address: string;
  publicKey: string;
}

// AI Agent Model
interface AIAgent {
  id: string;
  name: string;
  description: string;
  price: number;
  modelId: string;
  features: string[];
}`}
                  language="typescript"
                  title="types.ts"
                />
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* FAQ TAB */}
          {/* ============================================ */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <FaqItem question="How do I get EDS tokens for testing?">
                <p className="mb-2">
                  You can request Testnet tokens directly within the <strong className="text-endless-violet">Endless Wallet</strong> extension by clicking the <strong className="text-yellow-400">"Faucet"</strong> button.
                </p>
                <p className="mt-2 text-gray-500">
                  The tokens should arrive in your wallet within seconds.
                </p>
              </FaqItem>

              <FaqItem question="Which wallet should I use?">
                <p className="mb-2">
                  We recommend <strong className="text-endless-violet">Endless Wallet</strong> for the best experience. It's the official wallet for the Endless ecosystem.
                </p>
                <a 
                  href="https://wallet.endless.link/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-endless-violet hover:underline"
                >
                  Install Endless Wallet
                  <ExternalLink className="w-3 h-3" />
                </a>
              </FaqItem>

              <FaqItem question="How can I view my transaction on the blockchain?">
                <p className="mb-2">
                  After a successful transaction, you'll receive a transaction hash. You can view it on the Endless Explorer:
                </p>
                <a 
                  href={NETWORK_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-endless-violet hover:underline"
                >
                  {NETWORK_CONFIG.explorerUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="mt-2 text-gray-500">
                  Paste your transaction hash in the search bar to see full details.
                </p>
              </FaqItem>

              <FaqItem question="Are the AI responses real?">
                <p>
                  Currently, Endless Nexus uses <strong className="text-yellow-400">simulated (mock) responses</strong> for demonstration purposes. 
                  The blockchain transactions are real, but the AI responses are pre-defined.
                </p>
                <p className="mt-2 text-gray-500">
                  In a production environment, the smart contract would emit an event that triggers an off-chain AI oracle to generate real responses.
                </p>
              </FaqItem>

              <FaqItem question="What is the price unit for payments?">
                <p className="mb-2">
                  Prices are specified in <strong className="text-gray-900">base units</strong>. The conversion is:
                </p>
                <div className="p-3 rounded-lg bg-gray-100/50 font-mono text-sm">
                  <span className="text-endless-violet">1 EDS</span> = <span className="text-yellow-400">100,000,000</span> base units
                </div>
                <p className="mt-2 text-gray-500">
                  So if an agent costs 0.5 EDS, you would pass <code className="text-endless-violet">50000000</code> as the payment amount.
                </p>
              </FaqItem>

              <FaqItem question="Can I use this on mainnet?">
                <p>
                  Endless Nexus is currently deployed on <strong className="text-green-400">Testnet only</strong>. 
                  Do not use real funds. The contract address and network configuration would need to be updated for mainnet deployment.
                </p>
              </FaqItem>

              <FaqItem question="How do I integrate an agent into my own dApp?">
                <p className="mb-2">
                  Go to the <strong className="text-gray-900">Playground</strong>, select an agent, and click the <strong className="text-endless-violet">"Integrate"</strong> tab. 
                  You'll get ready-to-use TypeScript code with the correct module address, model ID, and all helper functions.
                </p>
                <a 
                  href="/playground"
                  className="inline-flex items-center gap-2 text-endless-violet hover:underline"
                >
                  Go to Playground
                  <ChevronRight className="w-3 h-3" />
                </a>
              </FaqItem>
            </div>
          )}

        </div>
      </div>
      </div>
    </div>
  );
}
