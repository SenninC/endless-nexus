import { AgentGrid } from "@/components/agents";

/**
 * Agents Page - Light Mode
 * 
 * Displays the AI Agent Marketplace grid
 */
export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Grid Background - Fixed behind content */}
      <div className="network-grid fixed inset-0 z-0" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <AgentGrid />
        </div>
      </div>
    </div>
  );
}
