import { useMWA } from '@/context/mwa/MWAContext'
import { getMWAConnection, useMWAAnchorAdapter } from '@/context/mwa/AnchorAdapter'
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

interface WalletInfo {
  publicKey: PublicKey | null
  isConnected: boolean
  isAuthenticated: boolean
  address: string | null
  walletType: 'privy' | 'mwa' | null
  name: string
  isLoading: boolean
  connection: Connection | null
}

// ===============================================================================
// TRANSACTION DEDUPLICATION SYSTEM
// ===============================================================================

const pendingTransactions = new Set<string>()

const useTransactionDeduplication = () => {
  const executeWithDeduplication = useCallback(
    async <T>(transactionFn: () => Promise<T>, operationKey: string, timeout: number = 15000): Promise<T> => {
      if (pendingTransactions.has(operationKey)) {
        console.warn(`Duplicate transaction blocked: ${operationKey}`)
        throw new Error('Transaction already in progress')
      }

      pendingTransactions.add(operationKey)

      try {
        console.log(`[TX] Starting: ${operationKey}`)
        const result = await transactionFn()
        console.log(`[TX] Completed: ${operationKey}`)
        return result
      } catch (error) {
        console.error(`[TX] Failed: ${operationKey}`, error)
        throw error
      } finally {
        setTimeout(() => {
          pendingTransactions.delete(operationKey)
          console.log(`[TX] Cleaned up: ${operationKey}`)
        }, timeout)
      }
    },
    [],
  )

  return { executeWithDeduplication }
}

// ===============================================================================
// UNIFIED WALLET STATE MANAGEMENT
// ===============================================================================

export const useWalletInfo = (): WalletInfo => {
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()
  const [connection, setConnection] = useState<Connection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setupConnection = async () => {
      setIsLoading(true)

      try {
        let conn: Connection | null = null
        if (!wallets) {
          return
        }

        // Priority: MWA connection if available
        if (mwa.isConnected && mwa.wallet) {
          console.log('🔗 [Unified] Setting up MWA connection...')
          conn = getMWAConnection('devnet')
        }

        // Fallback: Privy connection
        else if (wallets?.length > 0 && user) {
          console.log('🔗 [Unified] Setting up Privy connection...')
          conn = new Connection('https://api.devnet.solana.com', 'confirmed')
        }
        // No wallet connected
        else {
          conn = new Connection('https://api.devnet.solana.com', 'confirmed')
        }

        setConnection(conn)
        if (conn) {
          console.log(`✅ [Unified] Connection established: ${conn.rpcEndpoint}`)
        }
      } catch (error) {
        console.error('❌ [Unified] Connection setup failed:', error)
        setConnection(new Connection('https://api.devnet.solana.com', 'confirmed'))
      } finally {
        setIsLoading(false)
      }
    }

    setupConnection()
  }, [mwa.isConnected, mwa.wallet?.address, wallets?.length, user])

  return useMemo(() => {
    // Check MWA wallet first (higher priority)
    if (mwa.isConnected && mwa.wallet) {
      return {
        publicKey: mwa.wallet.publicKey,
        isConnected: true,
        isAuthenticated: true,
        address: mwa.wallet.address,
        walletType: 'mwa',
        name: `MWA Wallet (${mwa.wallet.label || 'Solana'})`,
        isLoading: false,
        connection,
      }
    }

    if (!wallets) {
      return {
        publicKey: PublicKey.default,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: 'mwa',
        name: `MWA Wallet (${'Solana'})`,
        isLoading: false,
        connection,
      }
    }

    // Check Privy wallet
    if (wallets?.length > 0 && user) {
      const wallet = wallets[0]
      let publicKey: PublicKey | null = null
      try {
        publicKey = new PublicKey(wallet.address)
      } catch (error) {
        console.error('❌ [Unified] Invalid Privy PublicKey:', error)
        return {
          publicKey: null,
          isConnected: false,
          isAuthenticated: false,
          address: null,
          walletType: null,
          name: 'Invalid wallet address',
          isLoading: false,
          connection: null,
        }
      }

      return {
        publicKey,
        isConnected: true,
        isAuthenticated: !!user,
        address: wallet.address,
        walletType: 'privy',
        name: 'Privy Embedded Wallet',
        isLoading,
        connection,
      }
    }

    // No wallet connected or still loading
    if (mwa.isCheckingWallets) {
      return {
        publicKey: null,
        isConnected: false,
        isAuthenticated: false,
        address: null,
        walletType: null,
        name: 'Loading wallets...',
        isLoading: true,
        connection: null,
      }
    }

    // No wallet connected
    return {
      publicKey: null,
      isConnected: false,
      isAuthenticated: false,
      address: null,
      walletType: null,
      name: 'No wallet connected',
      isLoading: false,
      connection: null,
    }
  }, [
    mwa.isConnected,
    mwa.wallet?.address,
    mwa.wallet?.publicKey,
    mwa.wallet?.label,
    mwa.isCheckingWallets,
    wallets,
    user,
    connection,
    isLoading,
  ])
}

// ===============================================================================
// UNIFIED PROGRAM INTEGRATION
// ===============================================================================

export const useUndeadProgram = (): {
  program: UndeadProgram | null
  isReady: boolean
  error: string | null
} => {
  const { user, getAccessToken } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()
  const mwaAnchorAdapter = useMWAAnchorAdapter()
  const { publicKey, isConnected, connection, isLoading, walletType } = useWalletInfo()
  const { executeWithDeduplication } = useTransactionDeduplication()

  const [program, setProgram] = useState<UndeadProgram | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeProgram = async () => {
      if (isLoading || !isConnected || !publicKey || !connection || (!wallets?.length && !mwa.wallet)) {
        setProgram(null)
        setIsReady(false)
        return
      }

      try {
        setError(null)
        console.log(`🔧 [Unified Program] Initializing with ${walletType} wallet...`)

        let walletAdapter: any
        if (!wallets) {
          return
        }

        if (walletType === 'mwa' && mwaAnchorAdapter) {
          walletAdapter = mwaAnchorAdapter
          console.log('🔗 [Unified Program] Using MWA wallet adapter')
        } else if (walletType === 'privy' && wallets?.length > 0) {
          const wallet = wallets[0]
          const provider = await wallet.getProvider()
          walletAdapter = {
            publicKey,
            signTransaction: async (tx: Transaction | VersionedTransaction) => {
              const operationKey = `sign_${publicKey.toString()}_${Date.now()}`
              return executeWithDeduplication(async () => {
                console.log('🔐 [Unified Program] Signing transaction with Privy wallet...')
                // Set dummy blockhash for Privy gas sponsorship
                if ('recentBlockhash' in tx) {
                  tx.recentBlockhash = '11111111111111111111111111111111'
                }
                const signature = await provider.request({
                  method: 'signTransaction',
                  params: { transaction: tx },
                })
                tx.addSignature(publicKey, Buffer.from('base64'))
                return tx
              }, operationKey)
            },
            signAllTransactions: async (txs: (Transaction | VersionedTransaction)[]) => {
              const operationKey = `sign_all_${publicKey.toString()}_${Date.now()}`
              return executeWithDeduplication(async () => {
                console.log(`🔐 [Unified Program] Signing ${txs.length} transactions with Privy wallet...`)
                const signedTxs = []
                for (const tx of txs) {
                  if ('recentBlockhash' in tx) {
                    tx.recentBlockhash = '11111111111111111111111111111111'
                  }
                  const signature = await provider.request({
                    method: 'signTransaction',
                    params: { transaction: tx },
                  })
                  tx.addSignature(publicKey, Buffer.from('base64'))
                  signedTxs.push(tx)
                }
                return signedTxs
              }, operationKey)
            },
          }
          console.log('🔗 [Unified Program] Using Privy wallet adapter')
        } else {
          setError(`Unsupported wallet type: ${walletType}`)
          setProgram(null)
          setIsReady(false)
          return
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

        console.log(`✅ [Unified Program] Program initialized successfully with ${walletType}:`, {
          programId: programInstance.programId.toString(),
          wallet: publicKey.toString(),
          endpoint: connection.rpcEndpoint,
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ [Unified Program] Initialization failed with ${walletType}:`, error)
        setError(errorMsg)
        setProgram(null)
        setIsReady(false)
      }
    }

    initializeProgram()
  }, [
    isLoading,
    isConnected,
    publicKey?.toString(),
    connection?.rpcEndpoint,
    walletType,
    mwaAnchorAdapter,
    wallets,
    user,
    executeWithDeduplication,
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
  const { executeWithDeduplication } = useTransactionDeduplication()

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
      if (!wallets) {
        return null
      }

      if (walletType === 'mwa' && mwa.wallet) {
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `magicblock_mwa_sign_${publicKey.toString()}_${Date.now()}`
            return executeWithDeduplication(async () => {
              console.log('🔐 [MagicBlock] Signing transaction with MWA wallet...')
              return await mwa.signTransaction(tx)
            }, operationKey)
          },
        }
      } else if (walletType === 'privy' && wallets?.length > 0) {
        const wallet = wallets[0]
        const provider = wallet.getProvider()
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            const operationKey = `magicblock_privy_sign_${publicKey.toString()}_${Date.now()}`
            return executeWithDeduplication(async () => {
              console.log('🔐 [MagicBlock] Signing transaction with Privy wallet...')
              if ('recentBlockhash' in tx) {
                tx.recentBlockhash = '11111111111111111111111111111111'
              }
              const signature = (await provider).request({
                method: 'signTransaction',
                params: { transaction: tx },
              })
              tx.addSignature(publicKey, Buffer.from('base64'))
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
    mwa.signTransaction,
    wallets,
    user,
    executeWithDeduplication,
  ])
}

// ===============================================================================
// EXISTING HOOKS (UNCHANGED)
// ===============================================================================

export const useWalletAndProgramReady = () => {
  const { publicKey, isConnected } = useWalletInfo()
  const program = useUndeadProgram()

  return useMemo(() => {
    const walletReady = isConnected && publicKey
    const programReady = program && program.program?.programId
    const bothReady = walletReady && programReady

    return {
      walletReady,
      programReady,
      bothReady,
      publicKey,
      program,
    }
  }, [isConnected, publicKey, program?.program?.programId])
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
