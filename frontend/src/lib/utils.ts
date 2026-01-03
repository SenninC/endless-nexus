import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and removes conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate an address for display
 * @example truncateAddress("0x1234567890abcdef") => "0x1234...cdef"
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format EDS amount (8 decimals)
 */
export function formatEDS(amount: bigint | number, decimals = 8): string {
  const divisor = BigInt(10 ** decimals);
  const amountBigInt = typeof amount === "number" ? BigInt(Math.floor(amount)) : amount;
  
  const whole = amountBigInt / divisor;
  const fraction = amountBigInt % divisor;
  
  if (fraction === BigInt(0)) {
    return `${whole} EDS`;
  }
  
  const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fractionStr} EDS`;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
