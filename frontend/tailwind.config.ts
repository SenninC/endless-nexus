import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Endless Official Colors
        endless: {
          lime: "#D9FF5B",
          violet: "#8B87FF",
        },
        // Endless Light Mode Theme
        nexus: {
          // Light backgrounds
          white: "#FFFFFF",
          light: "#FAFAFA",
          gray: "#F3F4F6",
          border: "#E5E7EB",
          "border-light": "#F3F4F6",
          
          // Primary accent - Lime/Yellow-Green
          lime: "#D9FF5B",
          "lime-hover": "#c8f04a",
          "lime-dark": "#b8e03a",
          
          // Secondary accent - Violet
          violet: "#8B87FF",
          "violet-light": "#a5a2ff",
          "violet-dim": "#6b67e0",
          
          // Legacy support (for gradual migration)
          cyan: "#8B87FF",
          purple: "#8B87FF",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          
          // Text colors - Dark on light
          text: "#111827",
          "text-dim": "#374151",
          "text-muted": "#6B7280",
          "text-light": "#9CA3AF",
          
          // Legacy dark (keep for compatibility)
          black: "#111827",
          dark: "#1F2937",
          darker: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
        "lime-glow": "0 0 20px rgba(217, 255, 91, 0.3)",
        "violet-glow": "0 0 20px rgba(139, 135, 255, 0.3)",
        // Legacy
        "neon-cyan": "0 0 20px rgba(139, 135, 255, 0.2)",
        "neon-purple": "0 0 20px rgba(139, 135, 255, 0.2)",
        "neon-success": "0 0 20px rgba(16, 185, 129, 0.2)",
        "glass": "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "network-grid": `
          linear-gradient(#F3F4F6 1px, transparent 1px),
          linear-gradient(90deg, #F3F4F6 1px, transparent 1px)
        `,
        "dots-pattern": "radial-gradient(#E5E7EB 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
        "dots": "20px 20px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
