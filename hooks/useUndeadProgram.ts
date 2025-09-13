import { AnchorWallet } from '@/context/mwa/AnchorAdapter'
import { useMWA, useMWAAnchorAdapter } from '@/context/mwa/MWAContext'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { GetCommitmentSignature } from '@magicblock-labs/ephemeral-rollups-sdk'
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROGRAM_ID, PROGRAM_IDL, authority } from '../config/program'

type UndeadProgram = Program<UndeadTypes>

// ===============================================================================
// TYPES & INTERFACES FOR PROGRAM
// ===============================================================================
interface WalletOption {
  publicKey: PublicKey
  walletType: 'mwa' | 'privy'
  name: string
  address: string
  isEmbedded: boolean
}

interface WalletInfo {
  publicKey: PublicKey | null
  isConnected: boolean
  isAuthenticated: boolean
  address: string | null
  walletType: 'mwa' | 'privy' | null
  name: string
  isEmbedded: boolean
  availableWallets: WalletOption[]
  switchWallet: (walletType: 'mwa' | 'privy') => void
  hasPrivyWallet: boolean
  hasMWAWallet: boolean
  isValidating: boolean
}

// ===============================================================================
// TRANSACTION DEDUPLICATION SYSTEM --- Might simplify later -- We have it because we are handling 3 wallet adapter setups
// ===============================================================================

const pendingTransactions = new Set<string>()

export const executeWithDeduplication = async (
  transactionFn: () => Promise<any>,
  operationKey: string,
  timeout: number = 10000,
  addRandomDelay: boolean = true,
) => {
  if (addRandomDelay) {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 50))
  }
  // Check if same operation is already pending
  if (pendingTransactions.has(operationKey)) {
    console.warn(`🚫 Duplicate transaction blocked: ${operationKey}`)
    throw new Error('Transaction already in progress')
  }

  // Mark as pending
  pendingTransactions.add(operationKey)

  try {
    // await result from trx and return
    const result = await transactionFn()
    return result
  } catch (error) {
    console.error(`❌ Transaction failed: ${operationKey}`, error)
    throw error
  } finally {
    // Clean up after timeout
    setTimeout(() => {
      pendingTransactions.delete(operationKey)
    }, timeout)
  }
}

// Utility to hash transaction content for deduplication
export const hashTxContent = async (tx: Transaction): Promise<string> => {
  const message: any = tx.compileMessage().serialize()
  const hashBuffer = await crypto.subtle.digest('SHA-256', message)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ===============================================================================
// UNIFIED WALLET STATE MANAGEMENT
// ===============================================================================
export const useWalletInfo = (): WalletInfo => {
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()

  const [selectedWalletType, setSelectedWalletType] = useState<'mwa' | 'privy' | null>(null)
  const switchWallet = useCallback((walletType: 'mwa' | 'privy') => {
    setSelectedWalletType(walletType)
  }, [])

  const availableWallets = useMemo(() => {
    const walletOptions: WalletOption[] = []

    // MWA wallets
    if (mwa.isConnected && mwa.wallet) {
      walletOptions.push({
        publicKey: mwa.wallet.publicKey,
        walletType: 'mwa' as const,
        name: `MWA Wallet (${mwa.wallet.label || 'Solana'})`,
        address: mwa.wallet.address,
        isEmbedded: false,
      })
    }

    // Privy wallets - only add if wallets is not null
    if (wallets && wallets.length > 0 && user) {
      try {
        const wallet = wallets[0]
        walletOptions.push({
          publicKey: new PublicKey(wallet.address),
          walletType: 'privy' as const,
          name: 'Privy Embedded Wallet',
          address: wallet.address,
          isEmbedded: true,
        })
      } catch (error) {
        console.error('Invalid Privy wallet address:', error)
      }
    }

    return walletOptions
  }, [mwa.isConnected, mwa.wallet, wallets, user])

  return useMemo(() => {
    if (wallets === null) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: 'Wallets not initialized',
        isEmbedded: false,
        availableWallets: [],
        switchWallet,
        hasPrivyWallet: false,
        hasMWAWallet: false,
        isValidating: true,
      }
    }

    // Loading state
    if (mwa.isCheckingWallets) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: 'Checking wallets...',
        isEmbedded: false,
        availableWallets: [],
        switchWallet,
        hasPrivyWallet: false,
        hasMWAWallet: false,
        isValidating: true,
      }
    }

    // No wallets available
    if (availableWallets.length === 0) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: 'No wallet connected',
        isEmbedded: false,
        availableWallets: [],
        switchWallet,
        hasPrivyWallet: false,
        hasMWAWallet: false,
        isValidating: false,
      }
    }

    // Select wallet
    let selectedWallet: WalletOption
    if (selectedWalletType === null) {
      const mwaWallet = availableWallets.find((w) => w.walletType === 'mwa')
      const privyWallet = availableWallets.find((w) => w.walletType === 'privy')
      selectedWallet = mwaWallet || privyWallet || availableWallets[0]
    } else {
      const requestedWallet = availableWallets.find((w) => w.walletType === selectedWalletType)
      selectedWallet = requestedWallet || availableWallets[0]
    }

    return {
      publicKey: selectedWallet.publicKey,
      isConnected: true,
      isAuthenticated: selectedWallet.walletType === 'privy' ? !!user : true,
      address: selectedWallet.address,
      walletType: selectedWallet.walletType,
      name: selectedWallet.name,
      isEmbedded: selectedWallet.isEmbedded,
      availableWallets,
      switchWallet,
      hasPrivyWallet: availableWallets.some((w) => w.walletType === 'privy'),
      hasMWAWallet: availableWallets.some((w) => w.walletType === 'mwa'),
      isValidating: false,
    }
  }, [availableWallets, selectedWalletType, switchWallet, user, mwa.isCheckingWallets, wallets])
}

// ===============================================================================
// UNIFIED PROGRAM INTEGRATION
// ===============================================================================
export const useUndeadProgram = (): {
  program: UndeadProgram | null
  isReady: boolean
  error: string | null
} => {
  const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwaAnchorAdapter = useMWAAnchorAdapter()
  const { publicKey, isConnected, walletType, isValidating } = useWalletInfo()

  const [program, setProgram] = useState<UndeadProgram | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeProgram = async () => {
      if (isValidating || !isConnected || !publicKey) {
        setProgram(null)
        setIsReady(false)
        return
      }

      if (!rpcUrl) {
        console.error('❌ [Program] RPC URL not found')
        setError('RPC URL not configured')
        setProgram(null)
        setIsReady(false)
        return
      }

      try {
        setError(null)
        console.log(`🔧 [Program] Initializing with ${walletType} wallet...`)

        const connection = new Connection(rpcUrl, 'confirmed')
        let walletAdapter: AnchorWallet

        if (walletType === 'mwa' && mwaAnchorAdapter) {
          walletAdapter = mwaAnchorAdapter
          console.log('🔗 [Program] Using MWA anchor adapter')
        } else if (walletType === 'privy' && wallets && wallets.length > 0) {
          const wallet = wallets[0]
          walletAdapter = {
            publicKey,
            signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
              const provider = await wallet.getProvider()
              // Fetch recent blockhash for standard Solana transactions
              if ('recentBlockhash' in tx) {
                try {
                  const { blockhash } = await connection.getLatestBlockhash('confirmed')
                  tx.recentBlockhash = blockhash
                  console.log('🔗 [Program] Fetched recent blockhash:', blockhash)
                } catch (blockhashError) {
                  console.error('❌ [Program] Failed to fetch blockhash:', blockhashError)
                  throw new Error('Failed to fetch recent blockhash')
                }
              }
              await provider.request({
                method: 'signTransaction',
                params: { transaction: tx },
              })
              return tx
            },
            signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
              const provider = await wallet.getProvider()
              const signedTxs: T[] = []
              try {
                const { blockhash } = await connection.getLatestBlockhash('confirmed')
                console.log('🔗 [Program] Fetched recent blockhash for batch:', blockhash)
                for (const tx of txs) {
                  if ('recentBlockhash' in tx) {
                    tx.recentBlockhash = blockhash
                  }
                  await provider.request({
                    method: 'signTransaction',
                    params: { transaction: tx },
                  })
                  signedTxs.push(tx)
                }
              } catch (blockhashError) {
                console.error('❌ [Program] Failed to fetch blockhash for batch:', blockhashError)
                throw new Error('Failed to fetch recent blockhash for batch')
              }
              return signedTxs
            },
          }
          console.log('🔗 [Program] Using Privy wallet adapter')
        } else {
          throw new Error(`No wallet adapter available for ${walletType}`)
        }

        const provider = new AnchorProvider(connection, walletAdapter, {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        })

        const idl = PROGRAM_IDL as UndeadTypes
        const programInstance = new Program(idl, provider) as UndeadProgram

        setProgram(programInstance)
        setIsReady(true)
        console.log(`✅ [Program] Initialized successfully with ${walletType}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ [Program] Initialization failed:`, error)
        setError(errorMsg)
        setProgram(null)
        setIsReady(false)
      }
    }

    initializeProgram()
  }, [
    isValidating,
    isConnected,
    publicKey?.toString(),
    walletType,
    mwaAnchorAdapter,
    wallets?.length,
    user?.id,
    rpcUrl,
  ])

  return { program, isReady, error }
}
// ===============================================================================
// UNIFIED MAGIC BLOCK PROVIDER
// ===============================================================================

export const useMagicBlockProvider = (): AnchorProvider | null => {
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()
  const { publicKey, isConnected, walletType } = useWalletInfo()

  const providerRef = useRef<AnchorProvider | null>(null)
  const lastConfigRef = useRef<string>('')

  return useMemo(() => {
    if (!isConnected || !publicKey || (!wallets?.length && !mwa.wallet)) {
      return null
    }

    const currentConfig = `${publicKey.toString()}_${walletType}`

    if (providerRef.current && lastConfigRef.current === currentConfig) {
      return providerRef.current
    }

    try {
      let walletAdapter: any

      if (walletType === 'mwa' && mwa.wallet) {
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `magicblock_mwa_sign_${publicKey.toString()}_${Date.now()}`
            return executeWithDeduplication(async () => {
              console.log('🔐 [MagicBlock] Signing transaction with MWA wallet...')
              return await mwa.signAndSendTransaction(tx)
            }, operationKey)
          },
        }
      } else if (walletType === 'privy' && wallets && wallets?.length > 0) {
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const wallet = wallets[0]
            const provider = await wallet.getProvider()
            const operationKey = `magicblock_privy_sign_${publicKey.toString()}_${Date.now()}`
            return executeWithDeduplication(async () => {
              console.log('🔐 [MagicBlock] Signing transaction with Privy wallet...')
              if ('recentBlockhash' in tx) {
                tx.recentBlockhash = '11111111111111111111111111111111'
              }

              await provider.request({
                method: 'signAndSendTransaction',
                params: {
                  transaction: tx,
                  connection: createMagicBlockConnection(),
                },
              })

              return tx
            }, operationKey)
          },
        }
      } else {
        return null
      }

      const magicBlockConnection = createMagicBlockConnection()
      const provider = new AnchorProvider(magicBlockConnection, walletAdapter, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })

      providerRef.current = provider
      lastConfigRef.current = currentConfig

      console.log(`✅ [MagicBlock] Provider created successfully with ${walletType}`)
      return provider
    } catch (error) {
      console.error(`❌ [MagicBlock] Provider creation failed with ${walletType}:`, error)
      return null
    }
  }, [
    isConnected,
    publicKey?.toString(),
    walletType,
    mwa.wallet?.address,
    mwa.signAndSendTransaction,
    wallets?.length,
    user?.id,
  ])
}

// ===============================================================================
// PROGRAM HOOKS
// ===============================================================================

export const useWalletAndProgramReady = () => {
  const { publicKey, isConnected } = useWalletInfo()
  const { program, isReady } = useUndeadProgram()

  return useMemo(() => {
    const walletReady = isConnected && publicKey
    const programReady = isReady && program?.programId
    const bothReady = walletReady && programReady

    return {
      walletReady,
      programReady,
      bothReady,
      publicKey,
      program,
    }
  }, [isConnected, publicKey, isReady, program?.programId])
}

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
      }
    }

    try {
      const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config'), authority.toBuffer()], PROGRAM_ID)

      const [leaderboardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('leaderboard'), authority.toBuffer()],
        PROGRAM_ID,
      )

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), userPublicKey.toBuffer()],
        PROGRAM_ID,
      )

      const [achievementsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_achievements'), userPublicKey.toBuffer()],
        PROGRAM_ID,
      )

      const getWarriorPda = (name: string) => {
        if (!name || name.trim().length === 0) {
          throw new Error('Warrior name cannot be empty')
        }

        const [warriorPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('undead_warrior'), userPublicKey.toBuffer(), Buffer.from(name.trim())],
          PROGRAM_ID,
        )
        return warriorPda
      }

      const getUsernameRegistryPda = (username: string) => {
        if (!username || username.trim().length === 0) {
          throw new Error('Username cannot be empty')
        }

        const [userNameRegistryPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_registry'), Buffer.from(username)],
          PROGRAM_ID,
        )
        return userNameRegistryPda
      }

      return {
        configPda,
        leaderboardPda,
        profilePda,
        achievementsPda,
        getWarriorPda,
        getUsernameRegistryPda,
      }
    } catch (error) {
      console.error('Error generating PDAs:', error)
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      }
    }
  }, [userPublicKey?.toString()])
}

export const useCurrentWallet = () => {
  const walletInfo = useWalletInfo()

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
      }
    }

    const shortAddress = `${walletInfo.address!.slice(0, 4)}...${walletInfo.address!.slice(-4)}`
    const isEmbedded = walletInfo.walletType === 'privy'
    const isMWA = walletInfo.walletType === 'mwa'

    return {
      address: walletInfo.address,
      shortAddress,
      type: walletInfo.walletType,
      name: walletInfo.name,
      isConnected: true,
      isEmbedded,
      isMWA,
    }
  }, [walletInfo])
}

// ===============================================================================
// MAGICBLOCK CONNECTION HELPER
// ===============================================================================

let magicBlockConnectionCache: Connection | null = null
const createMagicBlockConnection = () => {
  if (!magicBlockConnectionCache) {
    magicBlockConnectionCache = new Connection(
      process.env.NEXT_PUBLIC_ER_PROVIDER_ENDPOINT || 'https://devnet.magicblock.app/',
      {
        wsEndpoint: process.env.NEXT_PUBLIC_ER_WS_ENDPOINT || 'wss://devnet.magicblock.app/',
        commitment: 'confirmed',
      },
    )
  }
  return magicBlockConnectionCache
}

// ===============================================================================
// EPHEMERAL PROGRAM HOOKS (UPDATED)
// ===============================================================================

export async function sendERTransaction(
  program: any,
  methodBuilder: any,
  signer: PublicKey,
  provider: AnchorProvider | any,
  description: string,
): Promise<string> {
  try {
    let tx = await methodBuilder.transaction()

    tx.feePayer = provider.wallet.publicKey
    tx.recentBlockhash = '11111111111111111111111111111111' // Privy handles gas sponsorship

    tx = await provider.wallet.signTransaction(tx)

    const rawTx = tx.serialize()
    const txHash = await provider.connection.sendRawTransaction(rawTx)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const txCommitSgn = await GetCommitmentSignature(txHash, provider.connection)
      return txCommitSgn
    } catch (commitError: any) {
      return txHash
    }
  } catch (error: any) {
    console.error(`❌ [ER] ${description} failed:`, error)
    throw error
  }
}

export const useEphemeralProgram = (erProgramId?: PublicKey): UndeadProgram | null => {
  const magicBlockProvider = useMagicBlockProvider()

  return useMemo(() => {
    if (!magicBlockProvider || !erProgramId) {
      return null
    }

    try {
      const idl = PROGRAM_IDL as UndeadTypes
      const ephemeralProgram = new Program(idl, magicBlockProvider) as UndeadProgram
      return ephemeralProgram
    } catch (error) {
      console.error('❌ Error creating ephemeral program instance:', error)
      return null
    }
  }, [magicBlockProvider, erProgramId?.toString()])
}

export const createEphemeralProgram = (erProgramId: PublicKey, wallet: any): UndeadProgram => {
  const magicBlockConnection = createMagicBlockConnection()
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
    skipPreflight: false,
  })

  const idl = PROGRAM_IDL as UndeadTypes
  const ephemeralProgram = new Program(idl, provider) as UndeadProgram

  return ephemeralProgram
}

export const createERProvider = (wallet: any): AnchorProvider => {
  const magicBlockConnection = createMagicBlockConnection()
  const provider = new AnchorProvider(magicBlockConnection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
    skipPreflight: false,
  })

  return provider
}
