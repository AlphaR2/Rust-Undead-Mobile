import { RustUndead as UndeadTypes } from "@/types/idlTypes";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useDynamic } from "@/context/wallet";
import { useMWA} from "@/context/mwa";
import { useMWAAnchorAdapter, getMWAConnection } from "@/context/mwa/AnchorAdapter";
import { GetCommitmentSignature } from "@magicblock-labs/ephemeral-rollups-sdk";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROGRAM_ID, PROGRAM_IDL, authority } from "../config/program";

type UndeadProgram = Program<UndeadTypes>;

// ===============================================================================
// TYPES & INTERFACES FOR PROGRAM
// ===============================================================================

interface WalletInfo {
  publicKey: PublicKey | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  walletType: "dynamic_embedded" | "mwa" | null;
  name: string;
  isLoading: boolean;
  connection: Connection | null;
}

// ===============================================================================
// TRANSACTION DEDUPLICATION SYSTEM
// ===============================================================================

const pendingTransactions = new Set<string>();

const useTransactionDeduplication = () => {
  const executeWithDeduplication = useCallback(
    async <T>(
      transactionFn: () => Promise<T>,
      operationKey: string,
      timeout: number = 15000
    ): Promise<T> => {
      if (pendingTransactions.has(operationKey)) {
        console.warn(`Duplicate transaction blocked: ${operationKey}`);
        throw new Error("Transaction already in progress");
      }

      pendingTransactions.add(operationKey);

      try {
        console.log(`[TX] Starting: ${operationKey}`);
        const result = await transactionFn();
        console.log(`[TX] Completed: ${operationKey}`);
        return result;
      } catch (error) {
        console.error(`[TX] Failed: ${operationKey}`, error);
        throw error;
      } finally {
        setTimeout(() => {
          pendingTransactions.delete(operationKey);
          console.log(`[TX] Cleaned up: ${operationKey}`);
        }, timeout);
      }
    },
    []
  );

  return { executeWithDeduplication };
};

// ===============================================================================
// UNIFIED WALLET STATE MANAGEMENT
// ===============================================================================

/**
 * Unified wallet info hook that works with both Dynamic and MWA wallets
 */
export const useWalletInfo = (): WalletInfo => {
  const dynamic = useDynamic();
  const mwa = useMWA();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Early return if no Dynamic primary wallet
  if (!dynamic.wallets?.primary) { 
    return {
      publicKey: null,
      isConnected: false,
      isAuthenticated: false,
      address: null,
      walletType: null,
      name: "No wallet connected",
      isLoading: false,
      connection: null,
    };
  }

  const dynamicWalletAddress = dynamic.wallets.primary.address;

  // Handle connection setup when wallet becomes available
  useEffect(() => {
    const setupConnection = async () => {
      setIsLoading(true);
      
      try {
        let conn: Connection | null = null;

        // Priority: MWA connection if available
        if (mwa.isConnected && mwa.wallet) {
          console.log('🔗 [Unified] Setting up MWA connection...');
          conn = getMWAConnection('devnet');
        }
        // Fallback: Dynamic connection
        else if (dynamic.wallets?.primary && dynamic.sdk.loaded) {
          console.log('🔗 [Unified] Setting up Dynamic connection...');
          try {
            conn = dynamic.solana.getConnection();
          } catch (error) {
            console.error('❌ [Unified] Dynamic connection failed:', error);
            conn = new Connection("https://api.devnet.solana.com", "confirmed");
          }
        }
        // No wallet connected
        else {
          conn = new Connection("https://api.devnet.solana.com", "confirmed");
        }

        setConnection(conn);
        
        if (conn) {
          console.log(`✅ [Unified] Connection established: ${conn.rpcEndpoint}`);
        }
      } catch (error) {
        console.error('❌ [Unified] Connection setup failed:', error);
        setConnection(new Connection("https://api.devnet.solana.com", "confirmed"));
      } finally {
        setIsLoading(false);
      }
    };

    setupConnection();
  }, [
    mwa.isConnected,
    mwa.wallet?.address,
    dynamicWalletAddress,
    dynamic.sdk.loaded,
  ]);

  return useMemo(() => {
    // Check MWA wallet first (higher priority)
    if (mwa.isConnected && mwa.wallet) {
      return {
        publicKey: mwa.wallet.publicKey,
        isConnected: true,
        isAuthenticated: true, // MWA connection implies authentication
        address: mwa.wallet.address,
        walletType: "mwa",
        name: `MWA Wallet (${mwa.wallet.label || 'Solana'})`,
        isLoading: false,
        connection,
      };
    }

    // Check Dynamic wallet (embedded only)
    if (dynamic.sdk.loaded && dynamic.wallets?.primary && dynamic.auth.authenticatedUser) {
      const primaryWallet = dynamic.wallets.primary;
      
      // Fixed wallet type - only embedded supported
      const walletType = "dynamic_embedded";
      const walletName = "Dynamic Embedded Wallet";
      
      // Create PublicKey from address
      let publicKey: PublicKey | null = null;
      try {
        publicKey = new PublicKey(primaryWallet.address);
      } catch (error) {
        console.error("❌ [Unified] Invalid Dynamic PublicKey:", error);
        return {
          publicKey: null,
          isConnected: false,
          isAuthenticated: false,
          address: null,
          walletType: null,
          name: "Invalid wallet address",
          isLoading: false,
          connection: null,
        };
      }

      return {
        publicKey,
        isConnected: true,
        isAuthenticated: !!dynamic.auth.authenticatedUser,
        address: primaryWallet.address,
        walletType,
        name: walletName,
        isLoading,
        connection,
      };
    }

    // No wallet connected or still loading
    if (!dynamic.sdk.loaded || mwa.isCheckingWallets) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: "Loading wallets...",
        isLoading: true,
        connection: null,
      };
    }

    // No wallet connected
    return {
      publicKey: null,
      isConnected: false,
      isAuthenticated: false,
      address: null,
      walletType: null,
      name: "No wallet connected",
      isLoading: false,
      connection: null,
    };
  }, [
    // MWA dependencies
    mwa.isConnected,
    mwa.wallet?.address,
    mwa.wallet?.publicKey,
    mwa.wallet?.label,
    mwa.isCheckingWallets,
    // Dynamic dependencies
    dynamic.sdk.loaded,
    dynamicWalletAddress,
    dynamic.auth.authenticatedUser,
    // Connection state
    connection,
    isLoading,
  ]);
};

// ===============================================================================
// UNIFIED PROGRAM INTEGRATION
// ===============================================================================

/**
 * Unified Undead Program hook that works with both Dynamic and MWA wallets
 */
export const useUndeadProgram = (): {
  program: UndeadProgram | null;
  isReady: boolean;
  error: string | null;
} => {
  const dynamic = useDynamic();
  const wallet = dynamic.wallets.primary;
  
  const mwa = useMWA();
  const mwaAnchorAdapter = useMWAAnchorAdapter();
  const { publicKey, isConnected, connection, isLoading, walletType } = useWalletInfo();
  const { executeWithDeduplication } = useTransactionDeduplication();

  const [program, setProgram] = useState<UndeadProgram | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProgram = async () => {
      if (isLoading || !isConnected || !publicKey || !connection || !wallet) {
        setProgram(null);
        setIsReady(false);
        return;
      }

      try {
        setError(null);
        console.log(`🔧 [Unified Program] Initializing with ${walletType} wallet...`);

        let walletAdapter: any;

        // Create wallet adapter based on wallet type
        if (walletType === 'mwa' && mwaAnchorAdapter) {
          // Use MWA adapter
          walletAdapter = mwaAnchorAdapter;
          console.log('🔗 [Unified Program] Using MWA wallet adapter');
        } 
        else if (walletType === 'dynamic_embedded' && dynamic.wallets?.primary) {
          // Use Dynamic embedded wallet adapter
          walletAdapter = {
            publicKey,
            
            signTransaction: async (tx: Transaction | VersionedTransaction) => {
              const operationKey = `sign_${publicKey.toString()}_${Date.now()}`;
              
              return executeWithDeduplication(async () => {
                const signer = await dynamic.solana.getSigner({wallet});
                console.log('🔐 [Unified Program] Signing transaction with Dynamic embedded wallet...');
                return await signer.signTransaction(tx);
              }, operationKey);
            },
            
            signAllTransactions: async (txs: (Transaction | VersionedTransaction)[]) => {
              const operationKey = `sign_all_${publicKey.toString()}_${Date.now()}`;
              
              return executeWithDeduplication(async () => {
                const signer = await dynamic.solana.getSigner({wallet});
                console.log(`🔐 [Unified Program] Signing ${txs.length} transactions with Dynamic embedded wallet...`);
                
                const signedTxs = [];
                for (const tx of txs) {
                  const signedTx = await signer.signTransaction(tx);
                  signedTxs.push(signedTx);
                }
                return signedTxs;
              }, operationKey);
            },
          };
          console.log('🔗 [Unified Program] Using Dynamic embedded wallet adapter');
        } 
        else {
          setError(`Unsupported wallet type: ${walletType}`);
          setProgram(null);
          setIsReady(false);
          return;
        }

        // Create Anchor provider
        const provider = new AnchorProvider(connection, walletAdapter, {
          commitment: "confirmed",
          preflightCommitment: "confirmed",
          skipPreflight: false,
        });

        // Initialize program
        const idl = PROGRAM_IDL as UndeadTypes;
        const programInstance = new Program(idl, provider) as UndeadProgram;

        setProgram(programInstance);
        setIsReady(true);

        console.log(`✅ [Unified Program] Program initialized successfully with ${walletType}:`, {
          programId: programInstance.programId.toString(),
          wallet: publicKey.toString(),
          endpoint: connection.rpcEndpoint,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ [Unified Program] Initialization failed with ${walletType}:`, error);
        setError(errorMsg);
        setProgram(null);
        setIsReady(false);
      }
    };

    initializeProgram();
  }, [
    isLoading,
    isConnected,
    publicKey?.toString(),
    connection?.rpcEndpoint,
    walletType,
    // MWA dependencies
    mwaAnchorAdapter,
    // Dynamic dependencies
    dynamic.wallets?.primary?.address,
    executeWithDeduplication,
  ]);

  return { program, isReady, error };
};

// ===============================================================================
// UNIFIED MAGIC BLOCK PROVIDER
// ===============================================================================

export const useMagicBlockProvider = (): AnchorProvider | null => {
  const { publicKey, isConnected, walletType } = useWalletInfo();
  const dynamic = useDynamic();
  const wallet = dynamic.wallets.primary;
  const mwa = useMWA();
  const { executeWithDeduplication } = useTransactionDeduplication();

  const providerRef = useRef<AnchorProvider | null>(null);
  const lastConfigRef = useRef<string>("");

  return useMemo(() => {
    if (!isConnected || !publicKey ||!wallet) {
      return null;
    }

    // Create cache key for this configuration
    const currentConfig = `${publicKey.toString()}_${walletType}`;

    // Return cached provider if configuration hasn't changed
    if (providerRef.current && lastConfigRef.current === currentConfig) {
      return providerRef.current;
    }

    try {
      let walletAdapter: any;

      if (walletType === 'mwa' && mwa.wallet) {
        // MWA wallet adapter for MagicBlock
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `magicblock_mwa_sign_${publicKey.toString()}_${Date.now()}`;

            return executeWithDeduplication(async () => {
              console.log("🔐 [MagicBlock] Signing transaction with MWA wallet...");
              return await mwa.signTransaction(tx);
            }, operationKey);
          },
        };
      } 
      else if (walletType === 'dynamic_embedded' && dynamic.wallets?.primary) {
        // Dynamic embedded wallet adapter for MagicBlock
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `magicblock_dynamic_sign_${publicKey.toString()}_${Date.now()}`;

            return executeWithDeduplication(async () => {
              const signer = await dynamic.solana.getSigner({wallet});
              console.log("🔐 [MagicBlock] Signing transaction with Dynamic embedded wallet...");
              return await signer.signTransaction(tx);
            }, operationKey);
          },
        };
      } 
      else {
        return null;
      }

      // Create MagicBlock connection
      const magicBlockConnection = createMagicBlockConnection();
      const provider = new AnchorProvider(magicBlockConnection, walletAdapter, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
        skipPreflight: false,
      });

      // Cache the provider
      providerRef.current = provider;
      lastConfigRef.current = currentConfig;

      console.log(`✅ [MagicBlock] Provider created successfully with ${walletType}`);
      return provider;
    } catch (error) {
      console.error(`❌ [MagicBlock] Provider creation failed with ${walletType}:`, error);
      return null;
    }
  }, [
    isConnected,
    publicKey?.toString(),
    walletType,
    // MWA dependencies
    mwa.wallet?.address,
    mwa.signTransaction,
    // Dynamic dependencies
    dynamic.wallets?.primary?.address,
    executeWithDeduplication,
  ]);
};

// ===============================================================================
// EXISTING HOOKS (UPDATED TO WORK WITH UNIFIED SYSTEM)
// ===============================================================================

export const useWalletAndProgramReady = () => {
  const { publicKey, isConnected } = useWalletInfo();
  const program = useUndeadProgram();

  return useMemo(() => {
    const walletReady = isConnected && publicKey;
    const programReady = program && program.program?.programId;
    const bothReady = walletReady && programReady;

    return {
      walletReady,
      programReady,
      bothReady,
      publicKey,
      program,
    };
  }, [isConnected, publicKey, program?.program?.programId]);
};

export const usePDAs = (userPublicKey?: PublicKey | null) => {
  return useMemo(() => {
    if (!userPublicKey) {
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      };
    }

    try {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config"), authority.toBuffer()],
        PROGRAM_ID
      );

      const [leaderboardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("leaderboard"), authority.toBuffer()],
        PROGRAM_ID
      );

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), userPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const [achievementsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_achievements"), userPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const getWarriorPda = (name: string) => {
        if (!name || name.trim().length === 0) {
          throw new Error("Warrior name cannot be empty");
        }

        const [warriorPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("undead_warrior"),
            userPublicKey.toBuffer(),
            Buffer.from(name.trim()),
          ],
          PROGRAM_ID
        );
        return warriorPda;
      };

      const getUsernameRegistryPda = (username: string) => {
        if (!username || username.trim().length === 0) {
          throw new Error("Username cannot be empty");
        }

        const [userNameRegistryPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_registry"), Buffer.from(username)],
          PROGRAM_ID
        );
        return userNameRegistryPda;
      };

      return {
        configPda,
        leaderboardPda,
        profilePda,
        achievementsPda,
        getWarriorPda,
        getUsernameRegistryPda,
      };
    } catch (error) {
      console.error("Error generating PDAs:", error);
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      };
    }
  }, [userPublicKey?.toString()]);
};

export const useCurrentWallet = () => {
  const walletInfo = useWalletInfo();

  return useMemo(() => {
    if (!walletInfo.isConnected || !walletInfo.publicKey) {
      return {
        address: null,
        shortAddress: null,
        type: null,
        name: null,
        isConnected: false,
        isEmbedded: false,
        isMWA: false,
      };
    }

    const shortAddress = `${walletInfo.address!.slice(0, 4)}...${walletInfo.address!.slice(-4)}`;
    const isEmbedded = walletInfo.walletType === "dynamic_embedded";
    const isMWA = walletInfo.walletType === "mwa";

    return {
      address: walletInfo.address,
      shortAddress,
      type: walletInfo.walletType,
      name: walletInfo.name,
      isConnected: true,
      isEmbedded,
      isMWA,
    };
  }, [walletInfo]);
};

// ===============================================================================
// MAGICBLOCK CONNECTION HELPER
// ===============================================================================

let magicBlockConnectionCache: Connection | null = null;
const createMagicBlockConnection = () => {
  if (!magicBlockConnectionCache) {
    magicBlockConnectionCache = new Connection(
      process.env.NEXT_PUBLIC_ER_PROVIDER_ENDPOINT || "https://devnet.magicblock.app/",
      {
        wsEndpoint: process.env.NEXT_PUBLIC_ER_WS_ENDPOINT || "wss://devnet.magicblock.app/",
        commitment: "confirmed",
      }
    );
  }
  return magicBlockConnectionCache;
};

// ===============================================================================
// EPHEMERAL PROGRAM HOOKS (UPDATED)
// ===============================================================================

export async function sendERTransaction(
  program: any,
  methodBuilder: any,
  signer: PublicKey,
  provider: AnchorProvider | any,
  description: string
): Promise<string> {
  try {
    let tx = await methodBuilder.transaction();

    tx.feePayer = provider.wallet.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;

    tx = await provider.wallet.signTransaction(tx);

    const rawTx = tx.serialize();
    const txHash = await provider.connection.sendRawTransaction(rawTx);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const txCommitSgn = await GetCommitmentSignature(txHash, provider.connection);
      return txCommitSgn;
    } catch (commitError: any) {
      return txHash;
    }
  } catch (error: any) {
    console.error(`❌ [ER] ${description} failed:`, error);
    throw error;
  }
}

export const useEphemeralProgram = (erProgramId?: PublicKey): UndeadProgram | null => {
  const magicBlockProvider = useMagicBlockProvider();

  return useMemo(() => {
    if (!magicBlockProvider || !erProgramId) {
      return null;
    }

    try {
      const idl = PROGRAM_IDL as UndeadTypes;
      const ephemeralProgram = new Program(idl, magicBlockProvider) as UndeadProgram;
      return ephemeralProgram;
    } catch (error) {
      console.error("❌ Error creating ephemeral program instance:", error);
      return null;
    }
  }, [magicBlockProvider, erProgramId?.toString()]);
};

export const createEphemeralProgram = (erProgramId: PublicKey, wallet: any): UndeadProgram => {
  const magicBlockConnection = createMagicBlockConnection();
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });

  const idl = PROGRAM_IDL as UndeadTypes;
  const ephemeralProgram = new Program(idl, provider) as UndeadProgram;

  return ephemeralProgram;
};

export const createERProvider = (wallet: any): AnchorProvider => {
  const magicBlockConnection = createMagicBlockConnection();
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });

  return provider;
};