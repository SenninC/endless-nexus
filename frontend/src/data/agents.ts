import { 
  Shield, 
  Pencil, 
  BarChart3, 
  Image, 
  Code, 
  Brain,
  MessageSquare,
  Sparkles,
  LucideIcon
} from "lucide-react";

/**
 * AI Agent Data Model
 */
export interface AIAgent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  priceUnit: string;
  icon: LucideIcon;
  category: string;
  latency: string;
  accuracy: string;
  color: "cyan" | "purple" | "green" | "orange";
  features: string[];
  promptTemplates: { label: string; prompt: string }[];
  examplePrompt: string;
  exampleResponse: string;
}

/**
 * Mock AI Agents Data
 */
export const MOCK_AGENTS: AIAgent[] = [
  {
    id: "endless-auditor",
    name: "Endless Auditor",
    description: "Smart contract security analysis powered by AI. Detect vulnerabilities before deployment.",
    longDescription: "A specialized AI agent trained on thousands of Move smart contracts to identify security vulnerabilities, gas optimizations, and best practice violations. Perfect for auditing your Endless dApps before mainnet deployment.",
    price: 0.1,
    priceUnit: "EDS",
    icon: Shield,
    category: "Security",
    latency: "~30s",
    accuracy: "94%",
    color: "cyan",
    features: [
      "Vulnerability detection",
      "Gas optimization suggestions",
      "Best practices analysis",
      "Detailed report generation"
    ],
    promptTemplates: [
      { label: "🔍 Audit Move Module", prompt: "Audit this Move module for security vulnerabilities and best practices:" },
      { label: "⚡ Gas Optimization", prompt: "Analyze this smart contract for gas optimization opportunities:" },
      { label: "🛡️ Reentrancy Check", prompt: "Check this function for reentrancy vulnerabilities:" },
      { label: "📋 Full Security Report", prompt: "Generate a comprehensive security audit report for this contract:" },
    ],
    examplePrompt: "Audit this Move module for security issues:\n\nmodule example::token {\n  public fun transfer(from: &signer, to: address, amount: u64) {\n    // transfer logic\n  }\n}",
    exampleResponse: "## Security Analysis Report\n\n**Risk Level: Medium**\n\n### Issues Found:\n1. **Missing access control** - The transfer function lacks proper authorization checks\n2. **No balance verification** - Should verify sender has sufficient balance\n\n### Recommendations:\n- Add `assert!(balance >= amount, ERROR_INSUFFICIENT_BALANCE)`\n- Consider implementing a whitelist for large transfers"
  },
  {
    id: "creative-writer",
    name: "Creative Writer",
    description: "Generate engaging content, stories, and marketing copy with a creative AI assistant.",
    longDescription: "An advanced language model fine-tuned for creative writing tasks. From blog posts to marketing copy, this agent helps you create compelling content that resonates with your audience.",
    price: 0.05,
    priceUnit: "EDS",
    icon: Pencil,
    category: "Content",
    latency: "~10s",
    accuracy: "N/A",
    color: "purple",
    features: [
      "Blog post generation",
      "Marketing copy",
      "Story writing",
      "Social media content"
    ],
    promptTemplates: [
      { label: "🐦 Twitter Thread", prompt: "Write a Twitter thread about:" },
      { label: "📝 Blog Post", prompt: "Write an engaging blog post about:" },
      { label: "📢 Marketing Copy", prompt: "Create compelling marketing copy for:" },
      { label: "📖 Short Story", prompt: "Write a short cyberpunk story involving:" },
    ],
    examplePrompt: "Write a short Twitter thread about the benefits of decentralized AI agents.",
    exampleResponse: "🧵 Thread: Why Decentralized AI Agents are the Future\n\n1/ Imagine AI that no single entity controls. That's the promise of decentralized AI agents. Here's why they matter 👇\n\n2/ **Censorship Resistant** - No central authority can shut down or manipulate the AI's responses\n\n3/ **Transparent Pricing** - Pay per use, on-chain. No hidden fees or subscription traps\n\n4/ **Community Owned** - Token holders govern the model's development and training data\n\n5/ The future is autonomous, permissionless AI. And it's being built right now on @EndlessNetwork 🚀"
  },
  {
    id: "defi-analyst",
    name: "DeFi Analyst",
    description: "Real-time DeFi analytics and yield optimization strategies for your portfolio.",
    longDescription: "A specialized agent that analyzes DeFi protocols, tracks yields, and provides personalized recommendations for optimizing your portfolio across the Endless ecosystem.",
    price: 0.15,
    priceUnit: "EDS",
    icon: BarChart3,
    category: "Finance",
    latency: "~15s",
    accuracy: "89%",
    color: "green",
    features: [
      "Yield comparison",
      "Risk assessment",
      "Portfolio optimization",
      "Impermanent loss calculator"
    ],
    promptTemplates: [
      { label: "📊 Yield Analysis", prompt: "Analyze the best yield farming opportunities on Endless with $1000 USDC" },
      { label: "⚠️ Risk Assessment", prompt: "Assess the risk profile of this DeFi protocol:" },
      { label: "💼 Portfolio Review", prompt: "Review and optimize my DeFi portfolio:" },
      { label: "📉 IL Calculator", prompt: "Calculate impermanent loss for this LP position:" },
    ],
    examplePrompt: "Analyze the best yield farming opportunities on Endless with $1000 USDC",
    exampleResponse: "## DeFi Analysis Report\n\n**Portfolio: $1,000 USDC**\n\n### Top Opportunities:\n\n| Protocol | APY | Risk | Recommendation |\n|----------|-----|------|----------------|\n| EndlessSwap USDC/EDS | 24.5% | Medium | ✅ Recommended |\n| NexusLend USDC | 8.2% | Low | ✅ Safe option |\n| YieldMax USDC | 45% | High | ⚠️ Caution |\n\n**Suggested Split:**\n- 60% EndlessSwap LP ($600)\n- 40% NexusLend ($400)\n\n**Projected Monthly Yield:** ~$15.40"
  },
  {
    id: "image-gen",
    name: "Pixel Forge",
    description: "Generate stunning AI artwork and NFT-ready images from text descriptions.",
    longDescription: "A state-of-the-art image generation model capable of creating unique artwork, illustrations, and NFT-ready images from simple text prompts. Supports various styles from photorealistic to anime.",
    price: 0.2,
    priceUnit: "EDS",
    icon: Image,
    category: "Creative",
    latency: "~45s",
    accuracy: "N/A",
    color: "orange",
    features: [
      "Text-to-image generation",
      "Multiple art styles",
      "NFT-ready outputs",
      "High resolution (1024x1024)"
    ],
    promptTemplates: [
      { label: "🌃 Cyberpunk Scene", prompt: "A cyberpunk city at night with neon signs, flying cars, and rain reflections" },
      { label: "🎨 NFT Avatar", prompt: "Generate a unique NFT avatar with futuristic cybernetic enhancements" },
      { label: "🏙️ Sci-Fi Landscape", prompt: "A futuristic sci-fi landscape with alien technology and glowing structures" },
      { label: "🤖 Robot Portrait", prompt: "A detailed portrait of an advanced humanoid robot with glowing eyes" },
    ],
    examplePrompt: "A cyberpunk city at night with neon signs, flying cars, and rain reflections, digital art style",
    exampleResponse: "[Image Generation Complete]\n\n🖼️ Generated: cyberpunk_city_001.png\n📐 Resolution: 1024x1024\n🎨 Style: Digital Art / Cyberpunk\n\n✅ Image ready for download\n✅ NFT metadata generated\n✅ IPFS hash: Qm..."
  },
  {
    id: "code-assistant",
    name: "Code Pilot",
    description: "AI-powered coding assistant for Move, TypeScript, and smart contract development.",
    longDescription: "Your personal coding companion specialized in blockchain development. Get help with Move smart contracts, TypeScript SDK integration, and debugging complex dApp issues.",
    price: 0.08,
    priceUnit: "EDS",
    icon: Code,
    category: "Development",
    latency: "~8s",
    accuracy: "92%",
    color: "cyan",
    features: [
      "Code completion",
      "Bug detection",
      "Documentation generation",
      "Code refactoring"
    ],
    promptTemplates: [
      { label: "📜 Move Contract", prompt: "Write a Move function to:" },
      { label: "🔧 TypeScript SDK", prompt: "Show me how to integrate with the Endless SDK to:" },
      { label: "🐛 Debug Code", prompt: "Help me debug this code issue:" },
      { label: "📚 Generate Docs", prompt: "Generate documentation for this function:" },
    ],
    examplePrompt: "Write a Move function to mint an NFT with custom metadata",
    exampleResponse: "```move\npublic entry fun mint_nft(\n    creator: &signer,\n    name: String,\n    description: String,\n    uri: String,\n) acquires NFTCollection {\n    let creator_addr = signer::address_of(creator);\n    let collection = borrow_global_mut<NFTCollection>(creator_addr);\n    \n    let token_id = collection.next_token_id;\n    collection.next_token_id = token_id + 1;\n    \n    let nft = NFT {\n        id: token_id,\n        name,\n        description,\n        uri,\n        creator: creator_addr,\n        created_at: timestamp::now_seconds(),\n    };\n    \n    table::add(&mut collection.tokens, token_id, nft);\n    \n    event::emit_event(&mut collection.mint_events, MintEvent {\n        token_id,\n        creator: creator_addr,\n    });\n}\n```"
  },
  {
    id: "sentiment-ai",
    name: "Sentiment Oracle",
    description: "Analyze market sentiment from social media and news for trading insights.",
    longDescription: "An AI oracle that aggregates and analyzes sentiment data from Twitter, Discord, and crypto news sources to provide actionable trading insights and market mood indicators.",
    price: 0.12,
    priceUnit: "EDS",
    icon: Brain,
    category: "Analytics",
    latency: "~20s",
    accuracy: "87%",
    color: "purple",
    features: [
      "Social media analysis",
      "News sentiment tracking",
      "Trend detection",
      "Alert system"
    ],
    promptTemplates: [
      { label: "📈 Token Sentiment", prompt: "Analyze current sentiment for $EDS token across social platforms" },
      { label: "🔥 Trending Topics", prompt: "What are the top trending topics in the Endless ecosystem?" },
      { label: "🐋 Whale Activity", prompt: "Detect and analyze recent whale activity for:" },
      { label: "📰 News Analysis", prompt: "Summarize recent crypto news sentiment about:" },
    ],
    examplePrompt: "Analyze current sentiment for $EDS token across social platforms",
    exampleResponse: "## Sentiment Analysis: $EDS\n\n**Overall Sentiment: Bullish 📈**\n\n### Platform Breakdown:\n- Twitter: 72% Positive\n- Discord: 68% Positive  \n- News: 65% Neutral-Positive\n\n### Key Themes:\n- 🔥 \"Endless AI agents\" trending\n- 💰 Whale accumulation detected\n- 🚀 Mainnet launch anticipation\n\n### Risk Indicators:\n- FUD Level: Low (12%)\n- Bot Activity: Minimal\n\n**Recommendation:** Favorable conditions for accumulation"
  },
];

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AIAgent | undefined {
  return MOCK_AGENTS.find(agent => agent.id === id);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: string): AIAgent[] {
  return MOCK_AGENTS.filter(agent => agent.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(MOCK_AGENTS.map(agent => agent.category)));
}
