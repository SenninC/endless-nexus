import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { WalletProvider } from "@/components/WalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Endless Nexus | AI Agent Marketplace",
  description: "Discover, test, and integrate AI Agents on the Endless blockchain",
  keywords: ["Endless", "AI", "Blockchain", "Web3", "Agents", "Marketplace"],
  authors: [{ name: "Endless Nexus Team" }],
  openGraph: {
    title: "Endless Nexus",
    description: "AI Agent Marketplace on Endless Blockchain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-nexus-black min-h-screen`}>
        <WalletProvider>
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Cyber Grid */}
            <div className="absolute inset-0 cyber-grid opacity-50" />
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-nexus-cyan/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-nexus-purple/5 rounded-full blur-3xl" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="relative z-20 border-t border-gray-200 py-6 mt-auto bg-white">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-500 text-sm">
                  Built on{" "}
                  <span className="text-endless-violet">Endless Network</span>
                  {" "}• {new Date().getFullYear()}
                </p>
              </div>
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
