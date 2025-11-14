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
import { useKora } from './useKora'

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

/** GENERAL LOADING STATE MANAGEMENT */
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

/**UNIFIED WALLET STATE MANAGEMENT */
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

/**
 * This is the central hook for wallet adapters across the two supported signing types
 */
export const useUndeadProgram = (): {
  program: UndeadProgram | null
  isReady: boolean
  error: string | null
} => {
  const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL
  const { user } = usePrivy()
  const { wallets } = useEmbeddedSolanaWallet()
  const { service: koraService, checkHealth } = useKora()
  const mwaAnchorAdapter = useMWAAnchorAdapter()
  const { publicKey, isConnected, walletType, isValidating } = useWalletInfo()
  const { transactionLoading, batchLoading } = useWalletLoadingState()

  const [program, setProgram] = useState<UndeadProgram | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const publicKeyString = useMemo(() => publicKey?.toString() || null, [publicKey])
  const walletsLength = useMemo(() => wallets?.length || 0, [wallets?.length])
  const userId = useMemo(() => user?.id || null, [user?.id])

  useEffect(() => {
    const initializeProgram = async () => {
      if (isValidating || !isConnected || !publicKey) {
        setProgram(null)
        setIsReady(false)
        return
      }

      if (!rpcUrl) {
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
                    const isKoraActive = await checkHealth()

                    if (isKoraActive) {
                      try {
                        const signedTx = await koraService.signTransaction(tx as Transaction)

                        return signedTx as T
                      } catch (koraError: any) {
                        // Fallback below
                      }
                    } else {
                      console.error('⚠️ Kora not active, using wallet signing')
                    }

                    const provider = await wallet.getProvider()

                    // Blockhash should already be set by buildAndExecuteTransaction
                    if (!('recentBlockhash' in tx) || !tx.recentBlockhash) {
                      throw new Error('Transaction blockhash not set before signing')
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
                    const isKoraActive = await checkHealth()
                    if (isKoraActive) {
                      try {
                        const signedTxs: T[] = []
                        for (const tx of txs) {
                          const signedTx = await koraService.signTransaction(tx as Transaction)
                          signedTxs.push(signedTx as T)
                        }
                        return signedTxs
                      } catch (koraError: any) {
                        // Fallback below
                      }
                    }

                    for (const tx of txs) {
                      if (!('recentBlockhash' in tx) || !tx.recentBlockhash) {
                        throw new Error('Transaction blockhash not set before signing')
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
        setError(errorMsg)
        setProgram(null)
        setIsReady(false)
      }
    }

    initializeProgram()
  }, [isValidating, isConnected, publicKeyString, walletType, mwaAnchorAdapter, walletsLength, userId, rpcUrl])

  return { program, isReady, error }
}

/**MAGICBLOCK PROVIDER */
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
  const { service: koraService, checkHealth } = useKora()
  const publicKeyString = useMemo(() => publicKey?.toString() || null, [publicKey])

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
                try {
                  const isKoraActive = await checkHealth()

                  if (isKoraActive) {
                    try {
                      const signedTx = await koraService.signTransaction(tx as Transaction)
                      return signedTx
                    } catch (koraError: any) {
                      //fail silently for gameplay
                      // console.error('Kora signing failed, falling back to Privy:', koraError)
                    }
                  } else {
                    console.error('⚠️ Kora not active, using wallet signing')
                  }

                  const provider = await wallet.getProvider()

                  if (!('recentBlockhash' in tx) || !tx.recentBlockhash) {
                    throw new Error('Transaction blockhash not set before signing')
                  }

                  await provider.request({
                    method: 'signTransaction',
                    params: {
                      transaction: tx,
                    },
                  })

                  return tx
                } catch (error: any) {
                  if (
                    error.message?.includes('already been processed') ||
                    error.message?.includes('already processed')
                  ) {
                    return tx
                  }
                  throw error
                }
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
    publicKeyString,
    walletType,
    koraService,
    checkHealth,
    mwa.wallet?.address,
    mwa.signAllTransactions,
    wallets?.length,
    user?.id,
    transactionLoading,
  ])
}

export async function sendERTransaction(
  program: any,
  methodBuilder: any,
  signer: PublicKey,
  provider: AnchorProvider | any,
  koraBlockhash?: string,
): Promise<string> {
  const operationKey = `er_tx_${signer.toString()}_${Date.now()}`

  return withDeduplication(operationKey, async () => {
    try {
      let blockhash: string
      let lastValidBlockHeight: number

      try {
        if (koraBlockhash && typeof koraBlockhash === 'string' && koraBlockhash.length > 0) {
          blockhash = koraBlockhash
          const blockHashInfo = await provider.connection.getLatestBlockhash('confirmed')
          lastValidBlockHeight = blockHashInfo.lastValidBlockHeight
        } else {
          const blockHashInfo = await provider.connection.getLatestBlockhash('confirmed')
          blockhash = blockHashInfo.blockhash
          lastValidBlockHeight = blockHashInfo.lastValidBlockHeight
        }
      } catch (error: any) {
        throw new Error(`Failed to get blockhash: ${error.message}`)
      }

      let tx = await methodBuilder.transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = provider.wallet.publicKey

      const signedTx = await provider.wallet.signTransaction(tx)
      const serializedTx = signedTx.serialize()

      const txHash = await provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      })

      await provider.connection.confirmTransaction(
        {
          signature: txHash,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      )

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const txCommitSgn = await GetCommitmentSignature(txHash, provider.connection)
        return txCommitSgn
      } catch (commitError: any) {
        if (commitError.message?.includes('already processed')) {
          return txHash
        }
        return txHash
      }
    } catch (error: any) {
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
