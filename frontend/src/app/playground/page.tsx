"use client";

import { Suspense } from "react";
import { MOCK_AGENTS } from "@/data/agents";
import PlaygroundConsole from "@/components/playground/PlaygroundConsole";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Playground Page - Light Mode
 * 
 * Dedicated page for testing AI agents with the clean console.
 * Can receive agent ID via URL param: /playground?agentId=creative-writer
 * Agent selection is now managed inside PlaygroundConsole which reads URL params directly.
 */
function PlaygroundContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none network-grid" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/agents"
            className="flex items-center gap-2 text-gray-600 hover:text-endless-violet transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Agents</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-endless-violet/10 border border-endless-violet/20 
                          rounded-full text-endless-violet text-sm font-mono mb-4">
            <Bot className="w-4 h-4" />
            LIVE TESTING ENVIRONMENT
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Agent <span className="text-endless-violet">Playground</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test AI agents in real-time. Your prompts are encrypted, sent to the Endless blockchain,
            and processed by decentralized AI models.
          </p>
        </div>

        {/* Playground Console - handles its own agent selection from URL */}
        <PlaygroundConsole agents={MOCK_AGENTS} />
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-endless-violet animate-spin" />
          <span className="text-endless-violet font-mono text-sm">Initializing Playground...</span>
        </div>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
