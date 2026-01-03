"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { EndlessJsSdk } from "@endlesslab/endless-web3-sdk";
import { Network } from "@endlesslab/endless-ts-sdk";

// ============================================
// Types
// ============================================

interface WalletAccount {
  address: string;
  publicKey?: string;
}

interface EndlessWalletContextType {
  // Connection state
  connected: boolean;
  connecting: boolean;
  account: WalletAccount | null;
  
  // SDK instance
  sdk: EndlessJsSdk | null;
  sdkReady: boolean;
  extensionDetected: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (payload: TransactionPayload) => Promise<TransactionResponse>;
  rescanExtensions: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

interface TransactionPayload {
  function?: string;
  type_arguments?: string[];
  arguments?: any[];
  // Alternative property names
  typeArguments?: string[];
  functionArguments?: any[];
  // Support legacy format with data wrapper
  data?: {
    function: string;
    typeArguments?: string[];
    type_arguments?: string[];
    functionArguments?: any[];
    arguments?: any[];
  };
}

interface TransactionResponse {
  hash: string;
}

// ============================================
// Context
// ============================================

const EndlessWalletContext = createContext<EndlessWalletContextType | null>(null);

// ============================================
// Provider Component
// ============================================

interface EndlessWalletProviderProps {
  children: ReactNode;
}

export function EndlessWalletProvider({ children }: EndlessWalletProviderProps) {
  const [sdk, setSdk] = useState<EndlessJsSdk | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [extensionDetected, setExtensionDetected] = useState(false);

  // Initialize SDK on mount with 1000ms delay to let extension inject
  useEffect(() => {
    setMounted(true);
    
    if (typeof window === "undefined") return;

    // First, check for extension early
    const checkExtension = () => {
      const endlessObj = (window as any).endless;
      const aptosObj = (window as any).aptos;
      
      console.log("[EndlessWallet] Extension check:");
      console.log("  Endless Object:", endlessObj);
      console.log("  Aptos Object:", aptosObj);
      
      if (endlessObj || aptosObj) {
        setExtensionDetected(true);
        console.log("[EndlessWallet] ✅ Extension detected!");
      } else {
        console.log("[EndlessWallet] ❌ No extension found yet");
      }
    };

    // Check immediately
    checkExtension();
    
    // Check again after 500ms (extension might be slow to inject)
    const earlyCheck = setTimeout(checkExtension, 500);

    // Delay SDK initialization by 1000ms to ensure extension is ready
    const initTimer = setTimeout(() => {
      console.log("[EndlessWallet] Initializing SDK after 1000ms delay...");
      
      // Final extension check
      checkExtension();
      
      try {
        const jssdk = new EndlessJsSdk({
          network: Network.TESTNET,
        });
        
        setSdk(jssdk);
        setSdkReady(true);
        console.log("[EndlessWallet] SDK initialized successfully with Network.TESTNET");
        
      } catch (err: any) {
        console.error("[EndlessWallet] SDK init error:", err);
        setError(err.message || "Failed to initialize wallet SDK");
      }
    }, 1000); // 1000ms delay as requested

    return () => {
      clearTimeout(earlyCheck);
      clearTimeout(initTimer);
    };
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    if (!sdk || !mounted || !sdkReady) return;
    
    const autoConnect = async () => {
      try {
        // Check if user was previously connected
        const wasConnected = localStorage.getItem("endless_wallet_connected");
        if (wasConnected === "true") {
          console.log("[EndlessWallet] Auto-connecting...");
          await handleConnect();
        }
      } catch (err) {
        console.log("[EndlessWallet] Auto-connect failed, user needs to reconnect");
        localStorage.removeItem("endless_wallet_connected");
      }
    };
    
    autoConnect();
  }, [sdk, mounted]);

  // Connect wallet
  const handleConnect = useCallback(async () => {
    if (!sdk) {
      setError("SDK not initialized");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      console.log("[EndlessWallet] Connecting...");
      
      let response: any = null;
      
      // Try direct window.endless first (avoids SDK UI issues)
      if (typeof window !== "undefined" && (window as any).endless) {
        console.log("[EndlessWallet] Using window.endless directly...");
        response = await (window as any).endless.connect();
      } else if (sdk) {
        // Fallback to SDK connect
        console.log("[EndlessWallet] Using SDK connect...");
        response = await sdk.connect();
      } else {
        throw new Error("No wallet provider available");
      }
      
      // Log full response for debugging
      console.log("[EndlessWallet] Connect response:", response);
      console.log("[EndlessWallet] Full Response Data:", JSON.stringify(response, null, 2));
      
      // Extract address from various possible response structures
      let address: string | undefined;
      let publicKey: string | undefined;
      
      // Check different response structures
      if (response?.address) {
        address = response.address;
        publicKey = response.publicKey;
      } else if (response?.args?.address) {
        address = response.args.address;
        publicKey = response.args.publicKey;
      } else if (response?.data?.address) {
        address = response.data.address;
        publicKey = response.data.publicKey;
      } else if (response?.account?.address) {
        address = response.account.address;
        publicKey = response.account.publicKey;
      }
      
      // If still no address, try to get account from SDK
      if (!address && sdk) {
        console.log("[EndlessWallet] No address in response, trying sdk.account()...");
        try {
          const accountData = await (sdk as any).account?.() || (sdk as any).getAccount?.();
          console.log("[EndlessWallet] SDK account data:", accountData);
          if (accountData?.address) {
            address = accountData.address;
            publicKey = accountData.publicKey;
          }
        } catch (e) {
          console.log("[EndlessWallet] SDK account() failed:", e);
        }
      }
      
      // If still no address, check if response has status: 'Approved' and try getAccount
      if (!address && response?.status === 'Approved' && sdk) {
        console.log("[EndlessWallet] Approved but no address, trying alternative methods...");
        
        // Try various SDK methods to get account
        const sdkAny = sdk as any;
        
        if (sdkAny.getAccount) {
          try {
            const acc = await sdkAny.getAccount();
            console.log("[EndlessWallet] getAccount result:", acc);
            address = acc?.address;
            publicKey = acc?.publicKey;
          } catch (e) {
            console.log("[EndlessWallet] getAccount failed:", e);
          }
        }
        
        if (!address && sdkAny.account) {
          try {
            const acc = typeof sdkAny.account === 'function' ? await sdkAny.account() : sdkAny.account;
            console.log("[EndlessWallet] account result:", acc);
            address = acc?.address;
            publicKey = acc?.publicKey;
          } catch (e) {
            console.log("[EndlessWallet] account failed:", e);
          }
        }

        // Check if args contains the address differently
        if (!address && response?.args) {
          console.log("[EndlessWallet] Checking args structure:", JSON.stringify(response.args, null, 2));
          // Sometimes it's nested
          if (typeof response.args === 'object') {
            const argsKeys = Object.keys(response.args);
            console.log("[EndlessWallet] Args keys:", argsKeys);
            for (const key of argsKeys) {
              const val = response.args[key];
              if (typeof val === 'string' && val.startsWith('0x') && val.length > 60) {
                console.log("[EndlessWallet] Found potential address in args:", key, val);
                address = val;
                break;
              }
              if (val?.address) {
                address = val.address;
                publicKey = val.publicKey;
                break;
              }
            }
          }
        }
      }
      
      if (address) {
        setAccount({
          address: address,
          publicKey: publicKey,
        });
        setConnected(true);
        localStorage.setItem("endless_wallet_connected", "true");
        console.log("[EndlessWallet] ✅ Connected successfully:", address);
      } else {
        console.error("[EndlessWallet] Could not extract address from response");
        throw new Error("No address returned from wallet. Response: " + JSON.stringify(response));
      }
      
    } catch (err: any) {
      console.error("[EndlessWallet] Connect error:", err);
      setError(err.message || "Failed to connect wallet");
      setConnected(false);
      setAccount(null);
    } finally {
      setConnecting(false);
    }
  }, [sdk]);

  // Disconnect wallet
  const handleDisconnect = useCallback(async () => {
    try {
      console.log("[EndlessWallet] Disconnecting...");
      
      if (sdk) {
        await sdk.disconnect();
      }
      
      setConnected(false);
      setAccount(null);
      localStorage.removeItem("endless_wallet_connected");
      console.log("[EndlessWallet] Disconnected");
      
    } catch (err: any) {
      console.error("[EndlessWallet] Disconnect error:", err);
      // Still clear state even if disconnect fails
      setConnected(false);
      setAccount(null);
      localStorage.removeItem("endless_wallet_connected");
    }
  }, [sdk]);

  // Sign and submit transaction
  const signAndSubmitTransaction = useCallback(async (payload: TransactionPayload): Promise<TransactionResponse> => {
    if (!connected || !account) {
      throw new Error("Wallet not connected");
    }

    console.log("[EndlessWallet] Signing transaction, raw payload:", payload);

    try {
      // Support multiple payload formats
      const txFunction = payload.function || payload.data?.function;
      const txTypeArgs = payload.type_arguments || payload.typeArguments || payload.data?.type_arguments || payload.data?.typeArguments || [];
      const txFunctionArgs = payload.arguments || payload.functionArguments || payload.data?.arguments || payload.data?.functionArguments || [];

      if (!txFunction) {
        throw new Error("Transaction function is required");
      }

      console.log("[EndlessWallet] Parsed transaction:");
      console.log("  Function:", txFunction);
      console.log("  Type Args:", txTypeArgs);
      console.log("  Args:", txFunctionArgs);

      let txResponse: any;

      // Try direct window.endless first (if extension is available)
      if (typeof window !== "undefined" && (window as any).endless?.signAndSubmitTransaction) {
        console.log("[EndlessWallet] Using window.endless for transaction...");
        
        // Format for Endless extension - entry_function_payload
        const txPayload = {
          type: "entry_function_payload",
          function: txFunction,
          type_arguments: txTypeArgs,
          arguments: txFunctionArgs,
        };
        
        console.log("[EndlessWallet] TX Payload (window.endless):", JSON.stringify(txPayload, null, 2));
        
        try {
          txResponse = await (window as any).endless.signAndSubmitTransaction(txPayload);
        } catch (extError: any) {
          console.error("[EndlessWallet] Extension error:", extError);
          throw extError;
        }
        
      } else if (sdk) {
        // Use SDK - it expects a specific format with payload.data
        console.log("[EndlessWallet] Using SDK for transaction...");
        
        // SDK format: { payload: { function, functionArguments, typeArguments } }
        // The SDK internally calls: transaction.build.simple({ sender, data: payload })
        const txPayload = {
          payload: {
            function: txFunction as `${string}::${string}::${string}`,
            functionArguments: txFunctionArgs,
            typeArguments: txTypeArgs,
          }
        };
        
        console.log("[EndlessWallet] TX Payload (SDK):", JSON.stringify(txPayload, null, 2));
        
        try {
          txResponse = await sdk.signAndSubmitTransaction(txPayload as any);
          console.log("[EndlessWallet] SDK raw response:", txResponse);
        } catch (sdkError: any) {
          console.error("[EndlessWallet] SDK error:", sdkError);
          console.error("[EndlessWallet] SDK error message:", sdkError?.message);
          throw sdkError;
        }
      } else {
        throw new Error("No wallet provider available");
      }
      
      console.log("[EndlessWallet] Transaction response:", txResponse);
      
      // Extract hash from various response formats
      let hash: string;
      if (txResponse?.status === "Approved" && txResponse?.args?.hash) {
        hash = txResponse.args.hash;
      } else if (txResponse?.hash) {
        hash = txResponse.hash;
      } else if (txResponse?.result?.hash) {
        hash = txResponse.result.hash;
      } else if (typeof txResponse === "string") {
        hash = txResponse;
      } else {
        console.error("[EndlessWallet] Unexpected response format:", txResponse);
        throw new Error("Could not extract transaction hash from response");
      }
      
      console.log("[EndlessWallet] Transaction hash:", hash);
      
      return { hash };
      
    } catch (err: any) {
      console.error("[EndlessWallet] Transaction error:", err);
      console.error("[EndlessWallet] Error stack:", err.stack);
      throw new Error(err.message || "Transaction failed");
    }
  }, [sdk, connected, account]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Rescan for extensions
  const rescanExtensions = useCallback(() => {
    console.log("[EndlessWallet] Rescanning for extensions...");
    
    const endlessObj = (window as any).endless;
    const aptosObj = (window as any).aptos;
    
    console.log("  Endless Object:", endlessObj);
    console.log("  Aptos Object:", aptosObj);
    
    if (endlessObj || aptosObj) {
      setExtensionDetected(true);
      setError(null);
      console.log("[EndlessWallet] ✅ Extension found on rescan!");
    } else {
      setExtensionDetected(false);
      setError("No wallet extension detected. Please install Endless Wallet.");
      console.log("[EndlessWallet] ❌ No extension found on rescan");
    }
  }, []);

  // Context value
  const contextValue: EndlessWalletContextType = {
    connected,
    connecting,
    account,
    sdk,
    sdkReady,
    extensionDetected,
    connect: handleConnect,
    disconnect: handleDisconnect,
    signAndSubmitTransaction,
    rescanExtensions,
    error,
    clearError,
  };

  return (
    <EndlessWalletContext.Provider value={contextValue}>
      {children}
    </EndlessWalletContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useEndlessWallet() {
  const context = useContext(EndlessWalletContext);
  
  if (!context) {
    throw new Error("useEndlessWallet must be used within EndlessWalletProvider");
  }
  
  return context;
}

// Also export as useWallet for compatibility
export const useWallet = useEndlessWallet;

export default EndlessWalletProvider;
