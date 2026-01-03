/**
 * Endless Nexus - Contract Configuration
 * 
 * Update this file with your deployed contract address after running
 * the deployment script.
 */

export const NEXUS_CONTRACT = {
  // Deployed module address on Endless Testnet
  address: "0x3bc5719c343fcc717043df3b59051398ec357d7768c2f9dc78c89cbd1672fa79",
  module: "nexus_mock",
  
  // Entry functions
  functions: {
    requestAiService: "nexus_mock::request_ai_service",
    requestWithPayment: "nexus_mock::request_ai_service_with_payment",
  },
  
  // View functions
  views: {
    isInitialized: "nexus_mock::is_initialized",
    getServicePrice: "nexus_mock::get_service_price",
    getTreasury: "nexus_mock::get_treasury",
    getTotalRequests: "nexus_mock::get_total_requests",
    getUserBalance: "nexus_mock::get_user_eds_balance",
  },
};

/**
 * Network Configuration
 */
export const NETWORK_CONFIG = {
  name: "Endless Testnet",
  chainId: "endless-testnet",
  fullnodeUrl: "https://rpc-testnet.endless.link/v1",
  faucetUrl: "https://faucet-testnet.endless.link",
  explorerUrl: "https://explorer.endless.link",
  networkParam: "testnet", // Used for explorer URL query param
};

/**
 * Get full function ID for contract calls
 */
export function getFunctionId(functionName: keyof typeof NEXUS_CONTRACT.functions): string {
  return `${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.functions[functionName]}`;
}

/**
 * Get full view function ID
 */
export function getViewFunctionId(viewName: keyof typeof NEXUS_CONTRACT.views): string {
  return `${NEXUS_CONTRACT.address}::${NEXUS_CONTRACT.views[viewName]}`;
}
