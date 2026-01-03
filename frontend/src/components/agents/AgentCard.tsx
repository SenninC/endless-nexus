"use client";

import { AIAgent } from "@/data/agents";
import { Clock, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: AIAgent;
  viewMode: "grid" | "list";
  onTryModel: () => void;
}

/**
 * AgentCard Component - Light Mode (Endless Style)
 * 
 * Displays an individual AI agent with category-based colors:
 * - Analytics → Violet (#8B87FF)
 * - Content → Sky (#0EA5E9)
 * - Security → Lime (#D9FF5B)
 * - Finance/DeFi → Rose/Pink (#F472B6)
 * - Development → Violet
 * - Creative → Orange
 */
export function AgentCard({ agent, viewMode, onTryModel }: AgentCardProps) {
  const Icon = agent.icon;

  // Category-based color system - Endless Charte Graphique
  const getCategoryColors = (category: string) => {
    switch (category.toLowerCase()) {
      case "analytics":
        return {
          iconBg: "bg-endless-violet/10",
          iconText: "text-endless-violet",
          border: "group-hover:border-endless-violet/30",
          shadow: "group-hover:shadow-md",
          badge: "bg-endless-violet/10 text-endless-violet border-endless-violet/20",
        };
      case "content":
        return {
          iconBg: "bg-sky-100",
          iconText: "text-sky-500",
          border: "group-hover:border-sky-300",
          shadow: "group-hover:shadow-md",
          badge: "bg-sky-100 text-sky-600 border-sky-200",
        };
      case "security":
        return {
          iconBg: "bg-endless-lime/20",
          iconText: "text-gray-900",
          border: "group-hover:border-endless-lime",
          shadow: "group-hover:shadow-md",
          badge: "bg-endless-lime/20 text-gray-900 border-endless-lime/50",
        };
      case "finance":
      case "defi":
        return {
          iconBg: "bg-pink-100",
          iconText: "text-pink-500",
          border: "group-hover:border-pink-300",
          shadow: "group-hover:shadow-md",
          badge: "bg-pink-100 text-pink-600 border-pink-200",
        };
      case "development":
        return {
          iconBg: "bg-cyan-100",
          iconText: "text-cyan-600",
          border: "group-hover:border-cyan-300",
          shadow: "group-hover:shadow-md",
          badge: "bg-cyan-100 text-cyan-600 border-cyan-200",
        };
      case "creative":
        return {
          iconBg: "bg-orange-100",
          iconText: "text-orange-600",
          border: "group-hover:border-orange-300",
          shadow: "group-hover:shadow-md",
          badge: "bg-orange-100 text-orange-600 border-orange-200",
        };
      default:
        return {
          iconBg: "bg-gray-100",
          iconText: "text-gray-600",
          border: "group-hover:border-gray-300",
          shadow: "group-hover:shadow-md",
          badge: "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };

  const colors = getCategoryColors(agent.category);

  // Grid View
  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "group relative bg-white rounded-xl p-5 flex flex-col",
          "border border-gray-200 transition-all duration-300",
          colors.border,
          colors.shadow,
          "hover:-translate-y-1"
        )}
      >
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border",
              colors.badge
            )}
          >
            {agent.category}
          </span>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
            colors.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", colors.iconText)} />
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {agent.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {agent.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{agent.latency}</span>
          </div>
          {agent.accuracy !== "N/A" && (
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{agent.accuracy}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Price */}
          <div>
            <span className="text-lg font-bold text-gray-900">
              {agent.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {agent.priceUnit}
            </span>
          </div>

          {/* Try Button */}
          <button
            onClick={onTryModel}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium",
              "bg-endless-lime hover:bg-endless-lime/80 transition-colors",
              "text-gray-900"
            )}
          >
            Try Model
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={cn(
        "group bg-white rounded-xl p-4 flex items-center gap-4",
        "border border-gray-200 transition-all duration-300",
        colors.border,
        "hover:bg-gray-50"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          colors.iconBg
        )}
      >
        <Icon className={cn("w-6 h-6", colors.iconText)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {agent.name}
          </h3>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
              colors.badge
            )}
          >
            {agent.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {agent.description}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{agent.latency}</span>
        </div>
        {agent.accuracy !== "N/A" && (
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>{agent.accuracy}</span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <span className="text-lg font-bold text-gray-900">{agent.price}</span>
        <span className="text-sm text-gray-500 ml-1">
          {agent.priceUnit}
        </span>
      </div>

      {/* Try Button */}
      <button
        onClick={onTryModel}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0",
          "bg-endless-lime hover:bg-endless-lime/80 transition-colors",
          "text-gray-900"
        )}
      >
        Try
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
