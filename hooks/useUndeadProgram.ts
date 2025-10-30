import { AnchorWallet } from '@/context/mwa/AnchorAdapter'
import { useMWA, useMWAAnchorAdapter } from '@/context/mwa/MWAContext'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { withDeduplication } from '@/utils/helper'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { GetCommitmentSignature } from '@magicblock-labs/ephemeral-rollups-sdk'
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PROGRAM_IDL } from '../config/program'

type UndeadProgram = Program<UndeadTypes>

// ===============================================================================
// TYPES & INTERFACES
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
  isSigningTransaction: boolean
  isSigningBatch: boolean
  currentOperation: string | null
}

// ===============================================================================
// LOADING STATE MANAGEMENT
// ===============================================================================
export const useWalletLoadingState = () => {
  const [isSigningTransaction, setIsSigningTransaction] = useState<boolean>(false)
  const [isSigningBatch, setIsSigningBatch] = useState<boolean>(false)
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

  const transactionLoading = useCallback(
    async <T>(operation: () => Promise<T>, operationName: string = 'transaction'): Promise<T> => {
      if (isSigningTransaction) {
        throw new Error(`Cannot start ${operationName} - another transaction is in progress`)
      }

      setIsSigningTransaction(true)
      setCurrentOperation(operationName)

      try {
        const result = await operation()
        return result
      } finally {
        setIsSigningTransaction(false)
        setCurrentOperation(null)
      }
    },
    [isSigningTransaction],
  )

  const batchLoading = useCallback(
    async <T>(operation: () => Promise<T>, operationName: string = 'batch transaction'): Promise<T> => {
      if (isSigningBatch) {
        throw new Error(`Cannot start ${operationName} - another batch operation is in progress`)
      }

      setIsSigningBatch(true)
      setCurrentOperation(operationName)
      try {
        const result = await operation()
        return result
      } finally {
        setIsSigningBatch(false)
        setCurrentOperation(null)
      }
    },
    [isSigningBatch],
  )

  return {
    isSigningTransaction,
    isSigningBatch,
    currentOperation,
    transactionLoading,
    batchLoading,
    isAnyOperationActive: isSigningTransaction || isSigningBatch,
  }
}

// ===============================================================================
// UNIFIED WALLET STATE MANAGEMENT
// ===============================================================================
export const useWalletInfo = (): WalletInfo => {
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()
  const { isSigningTransaction, isSigningBatch, currentOperation } = useWalletLoadingState()

  const [selectedWalletType, setSelectedWalletType] = useState<'mwa' | 'privy' | null>(null)

  const switchWallet = useCallback((walletType: 'mwa' | 'privy') => {
    setSelectedWalletType(walletType)
  }, [])

  const availableWallets = useMemo(() => {
    const walletOptions: WalletOption[] = []

    if (mwa.isConnected && mwa.wallet) {
      walletOptions.push({
        publicKey: mwa.wallet.publicKey,
        walletType: 'mwa' as const,
        name: `MWA Wallet (${mwa.wallet.label || 'Solana'})`,
        address: mwa.wallet.address,
        isEmbedded: false,
      })
    }

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
        isSigningTransaction: false,
        isSigningBatch: false,
        currentOperation: null,
      }
    }

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
        isSigningTransaction: false,
        isSigningBatch: false,
        currentOperation: null,
      }
    }

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
        isSigningTransaction: false,
        isSigningBatch: false,
        currentOperation: null,
      }
    }

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
      isSigningTransaction,
      isSigningBatch,
      currentOperation,
    }
  }, [
    availableWallets,
    selectedWalletType,
    switchWallet,
    user,
    mwa.isCheckingWallets,
    wallets,
    isSigningTransaction,
    isSigningBatch,
    currentOperation,
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
  const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwaAnchorAdapter = useMWAAnchorAdapter()
  const { publicKey, isConnected, walletType, isValidating } = useWalletInfo()
  const { transactionLoading, batchLoading } = useWalletLoadingState()

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
        console.error('[Program] RPC URL not found')
        setError('RPC URL not configured')
        setProgram(null)
        setIsReady(false)
        return
      }

      try {
        setError(null)
        const connection = new Connection(rpcUrl, 'confirmed')
        let walletAdapter: AnchorWallet

        if (walletType === 'mwa' && mwaAnchorAdapter) {
          walletAdapter = mwaAnchorAdapter
        } else if (walletType === 'privy' && wallets && wallets.length > 0) {
          const wallet = wallets[0]
          walletAdapter = {
            publicKey,

            signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
              return transactionLoading(async () => {
                const operationKey = `privy_sign_${publicKey.toString()}_${Date.now()}`
                return withDeduplication(operationKey, async () => {
                  try {
                    const provider = await wallet.getProvider()

                    const { blockhash } = await connection.getLatestBlockhash('confirmed')

                    if ('recentBlockhash' in tx) {
                      tx.recentBlockhash = blockhash
                    }

                    await provider.request({
                      method: 'signTransaction',
                      params: { transaction: tx },
                    })

                    return tx
                  } catch (error: any) {
                    if (
                      error.message?.includes('already been processed') ||
                      error.message?.includes('already processed')
                    ) {
                      console.warn('[Program] Transaction already processed, returning original')
                      return tx
                    }
                    throw error
                  }
                })
              }, 'sign transaction')
            },

            signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
              return batchLoading(async () => {
                const operationKey = `privy_batch_${publicKey.toString()}_${Date.now()}`
                return withDeduplication(operationKey, async () => {
                  const provider = await wallet.getProvider()
                  const signedTxs: T[] = []

                  try {
                    const { blockhash } = await connection.getLatestBlockhash('confirmed')

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

                    return signedTxs
                  } catch (error: any) {
                    if (
                      error.message?.includes('already been processed') ||
                      error.message?.includes('already processed')
                    ) {
                      console.warn('[Program] Batch already processed, returning partially signed')
                      return signedTxs.length > 0 ? signedTxs : txs
                    }

                    if (error.message?.includes('blockhash')) {
                      throw new Error('Failed to fetch blockhash - network issue')
                    }

                    throw error
                  }
                })
              }, `sign ${txs.length} transactions`)
            },
          }
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
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Program] Initialization failed:`, error)
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
    transactionLoading,
    batchLoading,
  ])

  return { program, isReady, error }
}

// ===============================================================================
// MAGICBLOCK PROVIDER
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

export const useMagicBlockProvider = (): AnchorProvider | null => {
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const mwa = useMWA()
  const { publicKey, isConnected, walletType } = useWalletInfo()
  const { transactionLoading } = useWalletLoadingState()

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
            return transactionLoading(async () => {
              const operationKey = `magicblock_mwa_sign_${publicKey.toString()}_${Date.now()}`
              return withDeduplication(operationKey, async () => {
                const signedTxs = await mwa.signAllTransactions([tx])
                return signedTxs[0]
              })
            }, 'MagicBlock MWA sign')
          },
        }
      } else if (walletType === 'privy' && wallets && wallets.length > 0) {
        const wallet = wallets[0]
        walletAdapter = {
          publicKey,
          signTransaction: async (tx: Transaction | VersionedTransaction) => {
            return transactionLoading(async () => {
              const operationKey = `magicblock_privy_sign_${publicKey.toString()}_${Date.now()}`
              return withDeduplication(operationKey, async () => {
                const provider = await wallet.getProvider()

                const { blockhash } = await createMagicBlockConnection().getLatestBlockhash('confirmed')

                if ('recentBlockhash' in tx) {
                  tx.recentBlockhash = blockhash
                }

                await provider.request({
                  method: 'signTransaction',
                  params: {
                    transaction: tx,
                  },
                })

                return tx
              })
            }, 'MagicBlock Privy sign')
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

      return provider
    } catch (error) {
      console.error(` [MagicBlock] Provider creation failed:`, error)
      return null
    }
  }, [
    isConnected,
    publicKey?.toString(),
    walletType,
    mwa.wallet?.address,
    mwa.signAllTransactions,
    wallets?.length,
    user?.id,
    transactionLoading,
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

// ===============================================================================
// EPHEMERAL PROGRAM HOOKS
// ===============================================================================
export async function sendERTransaction(
  program: any,
  methodBuilder: any,
  signer: PublicKey,
  provider: AnchorProvider | any,
  description: string,
): Promise<string> {
  const operationKey = `er_tx_${signer.toString()}_${Date.now()}`

  return withDeduplication(operationKey, async () => {
    try {
      let tx = await methodBuilder.transaction()
      let { blockhash } = await provider.connection.getLatestBlockhash('confirmed')

      tx.feePayer = provider.wallet.publicKey
      tx.recentBlockhash = blockhash

      tx = await provider.wallet.signTransaction(tx)

      const rawTx = tx.serialize()
      const txHash = await provider.connection.sendRawTransaction(rawTx)

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const txCommitSgn = await GetCommitmentSignature(txHash, provider.connection)
        return txCommitSgn
      } catch (commitError: any) {
        if (commitError.message?.includes('already processed')) {
          console.warn(`[ER] ${description} already processed, returning hash`)
          return txHash
        }
        return txHash
      }
    } catch (error: any) {
      console.error(`[ER] ${description} failed:`, error)

      if (error.message?.includes('already processed')) {
        throw new Error('Transaction already processed - refresh to see updated state')
      }

      throw error
    }
  })
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
      console.error('Error creating ephemeral program:', error)
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
