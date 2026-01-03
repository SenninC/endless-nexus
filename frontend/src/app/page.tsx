import { AgentGrid } from "@/components/agents";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Code } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Light Grid Background - Fixed behind content */}
      <div className="network-grid fixed inset-0 z-0" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center py-20">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gray-900">ENDLESS</span>
              <span className="text-endless-violet"> NEXUS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover, test, and integrate{" "}
              <span className="text-endless-violet font-semibold">AI Agents</span> on the Endless blockchain
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agents" className="btn-primary inline-flex items-center gap-2">
                Explore Agents
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/docs" className="btn-secondary inline-flex items-center gap-2">
                View Documentation
              </Link>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[
              { label: "AI Agents", value: "6+", icon: "🤖" },
              { label: "Transactions", value: "1.2K", icon: "⚡" },
              { label: "Developers", value: "500+", icon: "👥" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft hover:shadow-card transition-shadow">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-endless-violet mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </section>

          {/* Features Preview - How it Works */}
          <section className="py-12">
            <h2 className="text-3xl font-bold text-center mb-12">
              <span className="text-gray-900">How it</span>{" "}
              <span className="text-endless-violet">Works</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description: "Link your Endless-compatible wallet to get started",
                  icon: Shield,
                  borderColor: "border-l-endless-lime",
                  iconBg: "bg-endless-lime/20",
                  iconColor: "text-gray-900",
                },
                {
                  step: "02",
                  title: "Choose Agent",
                  description: "Browse and select from our curated AI agents",
                  icon: Zap,
                  borderColor: "border-l-endless-violet",
                  iconBg: "bg-endless-violet/10",
                  iconColor: "text-endless-violet",
                },
                {
                  step: "03",
                  title: "Pay & Run",
                  description: "Execute the agent and receive results on-chain",
                  icon: Code,
                  borderColor: "border-l-sky-400",
                  iconBg: "bg-sky-100",
                  iconColor: "text-sky-500",
                },
              ].map((item, i) => (
                <div key={i} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${item.borderColor} p-6 group hover:shadow-card hover:border-gray-300 transition-all`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                      {item.step}
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Agent Grid Section */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">
                <span className="text-gray-900">Featured</span>{" "}
                <span className="text-endless-violet">Agents</span>
              </h2>
              <Link 
                href="/agents" 
                className="text-endless-violet hover:text-endless-violet/80 transition-colors flex items-center gap-2"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <AgentGrid />
          </section>
        </div>
      </div>
    </div>
  );
}
