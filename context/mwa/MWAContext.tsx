import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toByteArray } from "react-native-quick-base64";
import { checkSpecificWalletApps } from ".";

// Types
export interface MWAWalletInfo {
  address: string;
  publicKey: PublicKey;
  authToken?: string;
  label?: string;
}

export interface MWAContextState {
  isConnected: boolean;
  isConnecting: boolean;
  wallet: MWAWalletInfo | null;
  hasWalletsInstalled: boolean;
  isCheckingWallets: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[]
  ) => Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction: (
    transaction: Transaction | VersionedTransaction
  ) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  checkWalletsAvailable: () => Promise<boolean>;
  clearError: () => void;
}

const MWAContext = createContext<MWAContextState | undefined>(undefined);

// App Identity for MWA
export const APP_IDENTITY = {
  name: "Rust Undead",
  uri: "https://rustundead.fun",
  icon: "favicon.ico",
};

// Storage keys
const AUTH_TOKEN_KEY = "@rust_undead:mwa_auth_token";
const WALLET_INFO_KEY = "@rust_undead:mwa_wallet_info";

// Helper function to validate base58 address
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export const MWAProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallet, setWallet] = useState<MWAWalletInfo | null>(null);
  const [hasWalletsInstalled, setHasWalletsInstalled] = useState(false);
  const [isCheckingWallets, setIsCheckingWallets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for managing state during transactions
  const currentWalletRef = useRef<MWAWalletInfo | null>(null);
  const isTransactingRef = useRef(false);

  // Update refs when wallet changes
  useEffect(() => {
    currentWalletRef.current = wallet;
  }, [wallet]);

  // Check for installed wallets and load stored wallet info on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsCheckingWallets(true);
        // Check for installed wallets using passive detection
        const walletResults = await checkSpecificWalletApps();
        const hasWallets = walletResults.some((result) => result.isInstalled);
        setHasWalletsInstalled(hasWallets);
        console.log(`🔍 [MWA] Wallets available: ${hasWallets}`);
      } catch (err) {
        console.error("❌ [MWA] Error checking wallets:", err);
        setHasWalletsInstalled(false);
      } finally {
        setIsCheckingWallets(false);
      }

      // Load stored wallet info
      await loadStoredWalletInfo();
    };

    init();
  }, []);

  // Wallet detection function (user-initiated)
  const checkWalletsAvailable = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingWallets(true);
      setError(null);

      const walletResults = await checkSpecificWalletApps();
      const hasWallets = walletResults.some((result) => result.isInstalled);

      setHasWalletsInstalled(hasWallets);
      console.log(`🔍 [MWA] Wallets available: ${hasWallets}`);

      return hasWallets;
    } catch (error) {
      console.error("❌ [MWA] Error checking wallets:", error);
      setHasWalletsInstalled(false);
      return false;
    } finally {
      setIsCheckingWallets(false);
    }
  }, []);

  // Load stored wallet info
  const loadStoredWalletInfo = useCallback(async () => {
    try {
      const storedWalletInfo = await AsyncStorage.getItem(WALLET_INFO_KEY);
      const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (storedWalletInfo && storedAuthToken) {
        const walletInfo = JSON.parse(storedWalletInfo);

        // Validate the stored address before creating PublicKey
        if (!walletInfo.address || !isValidSolanaAddress(walletInfo.address)) {
          console.warn(
            "⚠️ [MWA] Invalid stored wallet address, clearing storage"
          );
          await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
          return;
        }

        try {
          const walletInfoWithToken: MWAWalletInfo = {
            address: walletInfo.address,
            publicKey: new PublicKey(walletInfo.address),
            authToken: storedAuthToken,
            label: walletInfo.label,
          };

          setWallet(walletInfoWithToken);
          setIsConnected(true);

          console.log("✅ [MWA] Restored wallet session:", walletInfo.address);
        } catch (publicKeyError) {
          console.error(
            "❌ [MWA] Error creating PublicKey from stored address:",
            publicKeyError
          );
          await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
        }
      }
    } catch (error) {
      console.error("❌ [MWA] Error loading stored wallet:", error);
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
    }
  }, []);

  // Store wallet info
  const storeWalletInfo = useCallback(async (walletInfo: MWAWalletInfo) => {
    try {
      // Validate address before storing
      if (!isValidSolanaAddress(walletInfo.address)) {
        console.error(
          "❌ [MWA] Cannot store invalid wallet address:",
          walletInfo.address
        );
        return;
      }

      const storableInfo = {
        address: walletInfo.address,
        label: walletInfo.label,
      };

      await AsyncStorage.setItem(WALLET_INFO_KEY, JSON.stringify(storableInfo));

      if (walletInfo.authToken) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, walletInfo.authToken);
      }

      console.log("💾 [MWA] Wallet info stored");
    } catch (error) {
      console.error("❌ [MWA] Error storing wallet info:", error);
    }
  }, []);

  // Clear stored wallet info
  const clearStoredWalletInfo = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY]);
      console.log("🗑️ [MWA] Stored wallet info cleared");
    } catch (error) {
      console.error("❌ [MWA] Error clearing stored wallet info:", error);
    }
  }, []);

  // Connect to MWA wallet
  const connect = useCallback(async () => {
    if (isConnecting || isTransactingRef.current) {
      console.warn("⚠️ [MWA] Connection already in progress");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);
      console.log("🔌 [MWA] Initiating connection...");

      const authorizationResult = await transact(
        async (mwaWallet: Web3MobileWallet) => {
          const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

          const authResult = await mwaWallet.authorize({
            // cluster: "devnet",
            identity: APP_IDENTITY,
            auth_token: storedAuthToken || undefined,
          });

          return authResult;
        }
      );

      if (authorizationResult.accounts.length === 0) {
        throw new Error("No accounts authorized");
      }

      const account = authorizationResult.accounts[0];

      // Convert base64 address to PublicKey (as per MWA docs)
      let publicKey: PublicKey;
      let base58Address: string;

      try {
        console.log("📝 [MWA] Raw address from wallet:", account.address);

        // Convert base64 address to byte array, then to PublicKey
        const addressBytes = toByteArray(account.address);
        publicKey = new PublicKey(addressBytes);
        base58Address = publicKey.toString();

        console.log("✅ [MWA] Converted address to base58:", base58Address);
      } catch (conversionError: any) {
        console.error("❌ [MWA] Error converting address:", conversionError);
        throw new Error(
          `Failed to convert wallet address: ${conversionError.message}`
        );
      }

      const walletInfo: MWAWalletInfo = {
        address: base58Address, // Store as base58 string
        publicKey,
        authToken: authorizationResult.auth_token,
        label: account.label || "MWA Wallet",
      };

      setWallet(walletInfo);
      setIsConnected(true);

      await storeWalletInfo(walletInfo);

      console.log("✅ [MWA] Connected successfully:", base58Address);
    } catch (error: any) {
      console.error("❌ [MWA] Connection failed:", error);

      let errorMessage = "Failed to connect to wallet";
      if (error.message?.includes("rejected")) {
        errorMessage = "Connection rejected by user";
      } else if (error.message?.includes("not installed")) {
        errorMessage = "No compatible wallets found";
      } else if (error.message?.includes("Failed to convert")) {
        errorMessage = "Invalid wallet address format";
      }

      setError(errorMessage);
      setIsConnected(false);
      setWallet(null);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, storeWalletInfo]);

  // Disconnect from MWA wallet
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      console.log("🔌 [MWA] Disconnecting...");

      if (wallet?.authToken) {
        try {
          await transact(async (mwaWallet: Web3MobileWallet) => {
            await mwaWallet.deauthorize({
              auth_token: wallet.authToken!,
            });
          });
        } catch (deauthError) {
          console.warn(
            "⚠️ [MWA] Deauthorization failed, but continuing disconnect:",
            deauthError
          );
        }
      }

      setWallet(null);
      setIsConnected(false);

      await clearStoredWalletInfo();

      console.log("✅ [MWA] Disconnected successfully");
    } catch (error) {
      console.error("❌ [MWA] Disconnect error:", error);
      setWallet(null);
      setIsConnected(false);
      await clearStoredWalletInfo();
    }
  }, [wallet?.authToken, clearStoredWalletInfo]);

  // Sign a single transaction
  const signTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction
    ): Promise<Transaction | VersionedTransaction> => {
      if (!wallet || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (isTransactingRef.current) {
        throw new Error("Another transaction is in progress");
      }

      try {
        isTransactingRef.current = true;
        setError(null);

        const signedTransaction = await transact(
          async (mwaWallet: Web3MobileWallet) => {
            const signedTxs = await mwaWallet.signTransactions({
              transactions: [transaction],
            });
            return signedTxs[0];
          }
        );

        console.log("✅ [MWA] Transaction signed");
        return signedTransaction;
      } catch (error: any) {
        console.error("❌ [MWA] Transaction signing failed:", error);
        const errorMessage = error.message?.includes("rejected")
          ? "Transaction signing rejected by user"
          : "Failed to sign transaction";
        setError(errorMessage);
        throw error;
      } finally {
        isTransactingRef.current = false;
      }
    },
    [wallet, isConnected]
  );

  // Sign multiple transactions
  const signAllTransactions = useCallback(
    async (
      transactions: (Transaction | VersionedTransaction)[]
    ): Promise<(Transaction | VersionedTransaction)[]> => {
      if (!wallet || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (isTransactingRef.current) {
        throw new Error("Another transaction is in progress");
      }

      try {
        isTransactingRef.current = true;
        setError(null);

        const signedTransactions = await transact(
          async (mwaWallet: Web3MobileWallet) => {
            return await mwaWallet.signTransactions({
              transactions,
            });
          }
        );

        console.log(`✅ [MWA] ${transactions.length} transactions signed`);
        return signedTransactions;
      } catch (error: any) {
        console.error("❌ [MWA] Batch transaction signing failed:", error);
        const errorMessage = error.message?.includes("rejected")
          ? "Transaction signing rejected by user"
          : "Failed to sign transactions";
        setError(errorMessage);
        throw error;
      } finally {
        isTransactingRef.current = false;
      }
    },
    [wallet, isConnected]
  );

  // Sign and send transaction
  const signAndSendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction
    ): Promise<string> => {
      if (!wallet || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (isTransactingRef.current) {
        throw new Error("Another transaction is in progress");
      }

      try {
        isTransactingRef.current = true;
        setError(null);

        const signature = await transact(
          async (mwaWallet: Web3MobileWallet) => {
            const signatures = await mwaWallet.signAndSendTransactions({
              transactions: [transaction],
            });
            return signatures[0];
          }
        );

        console.log("✅ [MWA] Transaction signed and sent:", signature);
        return signature;
      } catch (error: any) {
        console.error("❌ [MWA] Transaction signing/sending failed:", error);
        const errorMessage = error.message?.includes("rejected")
          ? "Transaction rejected by user"
          : "Failed to send transaction";
        setError(errorMessage);
        throw error;
      } finally {
        isTransactingRef.current = false;
      }
    },
    [wallet, isConnected]
  );

  // Sign message
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (isTransactingRef.current) {
        throw new Error("Another transaction is in progress");
      }

      try {
        isTransactingRef.current = true;
        setError(null);

        const signedMessage = await transact(
          async (mwaWallet: Web3MobileWallet) => {
            const signatures = await mwaWallet.signMessages({
              addresses: [wallet.address],
              payloads: [message],
            });
            return signatures[0];
          }
        );

        console.log("✅ [MWA] Message signed");
        return signedMessage;
      } catch (error: any) {
        console.error("❌ [MWA] Message signing failed:", error);
        const errorMessage = error.message?.includes("rejected")
          ? "Message signing rejected by user"
          : "Failed to sign message";
        setError(errorMessage);
        throw error;
      } finally {
        isTransactingRef.current = false;
      }
    },
    [wallet, isConnected]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: MWAContextState = {
    isConnected,
    isConnecting,
    wallet,
    hasWalletsInstalled,
    isCheckingWallets,
    error,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signAndSendTransaction,
    signMessage,
    checkWalletsAvailable,
    clearError,
  };

  return (
    <MWAContext.Provider value={contextValue}>{children}</MWAContext.Provider>
  );
};

// Hook to use MWA context
export const useMWA = (): MWAContextState => {
  const context = useContext(MWAContext);
  if (context === undefined) {
    throw new Error("useMWA must be used within a MWAProvider");
  }
  return context;
};

// Utility hook for wallet detection
export const useMWAWalletDetection = () => {
  const { hasWalletsInstalled, isCheckingWallets, checkWalletsAvailable } =
    useMWA();

  return {
    hasWalletsInstalled,
    isCheckingWallets,
    recheckWallets: checkWalletsAvailable,
  };
};
