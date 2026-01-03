"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { useEndlessWallet } from "@/context/EndlessWalletContext";

/**
 * Navbar Component - Endless Nexus
 * 
 * Features:
 * - Clean Light Mode design (Endless Bridge style)
 * - Logo with lime accent
 * - Navigation links
 * - Connect Wallet button
 * - Mobile responsive menu
 */
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { connected } = useEndlessWallet();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/agents", label: "Agents" },
    { href: "/playground", label: "Playground" },
    { href: "/docs", label: "Documentation" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Light background with subtle border */}
      <div className="absolute inset-0 bg-white border-b border-gray-200" />
      
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Icon - Lightning in Lime */}
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:shadow-md transition-shadow duration-300">
                <Zap className="w-6 h-6 text-endless-lime" />
              </div>
            </div>
            
            {/* Logo Text - ENDLESS black, NEXUS violet */}
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider">
                <span className="text-gray-900">ENDLESS</span>
                <span className="text-endless-violet"> NEXUS</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                AI Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-endless-violet transition-colors duration-200 relative group"
              >
                {link.label}
                {/* Hover underline */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-endless-lime group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Network Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-600">Testnet</span>
            </div>

            {/* Wallet Connect Button */}
            <WalletConnectButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-endless-violet transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-600 hover:text-endless-violet hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Network Status (Mobile) */}
              <div className="flex items-center gap-2 px-4 py-3 text-gray-500">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="text-sm">
                  {connected ? "Connected to Testnet" : "Not connected"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
