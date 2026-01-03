"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AIAgent, MOCK_AGENTS } from "@/data/agents";
import { AgentCard } from "./AgentCard";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AgentGrid Component - Light Mode
 * 
 * Displays a grid of AI agent cards with:
 * - Search functionality
 * - Category filtering
 * - Grid/List view toggle
 * - Redirect to Playground on "Try Model"
 */
export function AgentGrid() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get unique categories
  const categories = Array.from(new Set(MOCK_AGENTS.map((agent) => agent.category)));

  // Filter agents based on search and category
  const filteredAgents = MOCK_AGENTS.filter((agent) => {
    const matchesSearch =
      searchQuery === "" ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || agent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle agent selection - redirect to Playground
  const handleTryModel = (agent: AIAgent) => {
    router.push(`/playground?agentId=${agent.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Agent <span className="text-endless-violet">Marketplace</span>
          </h2>
          <p className="text-gray-500 mt-1">
            {filteredAgents.length} agents available
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "grid"
                ? "bg-white text-endless-violet shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === "list"
                ? "bg-white text-endless-violet shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-light pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
              selectedCategory === null
                ? "bg-endless-lime text-gray-900 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-endless-lime text-gray-900 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          )}
        >
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              viewMode={viewMode}
              onTryModel={() => handleTryModel(agent)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No agents found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
