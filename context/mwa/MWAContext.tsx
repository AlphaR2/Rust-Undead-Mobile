import AsyncStorage from '@react-native-async-storage/async-storage'
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Linking } from 'react-native'
import { toByteArray } from 'react-native-quick-base64'

// Types
export interface MWAWalletInfo {
  address: string
  publicKey: PublicKey
  authToken?: string
  label?: string
}

export interface MWAContextState {
  isConnected: boolean
  isConnecting: boolean
  wallet: MWAWalletInfo | null
  hasWalletsInstalled: boolean
  isCheckingWallets: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>
  signAllTransactions: (
    transactions: (Transaction | VersionedTransaction)[],
  ) => Promise<(Transaction | VersionedTransaction)[]>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  checkWalletsAvailable: () => Promise<boolean>
  clearError: () => void
}

export interface WalletApp {
  name: string
  scheme: string
  packageName?: string
  bundleId?: string
  downloadUrl: {
    android?: string
    ios?: string
  }
  icon?: string
}

/**
 * Standard Anchor wallet interface
 */
export interface AnchorWallet {
  publicKey: PublicKey
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>
}

/**
 * @deprecated Legacy interface - use AnchorWallet instead
 */
export interface MWAAnchorWallet {
  publicKey: PublicKey
  signAndSendTransaction: (tx: Transaction | VersionedTransaction) => Promise<string>
  signAllTransactions: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>
}

const MWAContext = createContext<MWAContextState | undefined>(undefined)

// App Identity
export const APP_IDENTITY = {
  name: 'Rust Undead',
  uri: 'https://rustundead.fun',
  icon: 'favicon.ico',
}

// Storage keys
const AUTH_TOKEN_KEY = '@rust_undead:mwa_auth_token'
const WALLET_INFO_KEY = '@rust_undead:mwa_wallet_info'

// Supported wallets
export const SUPPORTED_WALLETS: WalletApp[] = [
  {
    name: 'Phantom',
    scheme: 'phantom://',
    packageName: 'app.phantom',
    bundleId: 'app.phantom',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=app.phantom',
      ios: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
    },
    icon: 'https://phantom.app/img/phantom-logo.svg',
  },
  {
    name: 'Solflare',
    scheme: 'solflare://',
    packageName: 'com.solflare.mobile',
    bundleId: 'com.solflare.mobile',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      ios: 'https://apps.apple.com/app/solflare/id1580902717',
    },
    icon: 'https://solflare.com/favicon.ico',
  },
]

// Helper function to validate base58 address
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}

export const MWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [wallet, setWallet] = useState<MWAWalletInfo | any>(null)
  const [hasWalletsInstalled, setHasWalletsInstalled] = useState(false)
  const [isCheckingWallets, setIsCheckingWallets] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentWalletRef = useRef<MWAWalletInfo | null>(null)
  const isTransactingRef = useRef(false)

  useEffect(() => {
    currentWalletRef.current = wallet
  }, [wallet])

  // Check wallets and load stored info
  useEffect(() => {
    const init = async () => {
      try {
        setIsCheckingWallets(true)
        const walletResults = await checkSpecificWalletApps()
        const hasWallets = walletResults.some((result) => result.isInstalled)
        setHasWalletsInstalled(hasWallets)
        console.log(`🔍 [MWA] Wallets available: ${hasWallets}`)
      } catch (err) {
        console.error('❌ [MWA] Error checking wallets:', err)
        setHasWalletsInstalled(false)
      } finally {
        setIsCheckingWallets(false)
      }
      await loadStoredWalletInfo()
    }
    init()
  }, [])

  // Load stored wallet info
  const loadStoredWalletInfo = useCallback(async () => {
    try {
      const storedWalletInfo = await AsyncStorage.getItem(WALLET_INFO_KEY)
      const storedAuthToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY)

      console.log('📥 [MWA] Retrieved stored wallet info:', storedWalletInfo)
      console.log('📥 [MWA] Retrieved stored auth_token:', storedAuthToken)

      if (storedWalletInfo && storedAuthToken) {
        const walletInfo = JSON.parse(storedWalletInfo)
        if (!walletInfo.address || !isValidSolanaAddress(walletInfo.address)) {
          console.warn('⚠️ [MWA] Invalid stored wallet address, clearing storage:', walletInfo.address)
          await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY])
          return
        }
        try {
          const walletInfoWithToken: MWAWalletInfo = {
            address: walletInfo.address,
            publicKey: new PublicKey(walletInfo.address),
            authToken: storedAuthToken,
            label: walletInfo.label,
          }
          setWallet(walletInfoWithToken)
          setIsConnected(true)
          console.log('✅ [MWA] Restored wallet session:', walletInfo.address, 'with auth_token:', storedAuthToken)
        } catch (publicKeyError) {
          console.error('❌ [MWA] Error creating PublicKey from stored address:', publicKeyError)
          await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY])
        }
      } else {
        console.log('ℹ️ [MWA] No stored wallet info or auth_token found')
      }
    } catch (error) {
      console.error('❌ [MWA] Error loading stored wallet:', error)
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY])
    }
  }, [])

  // Store wallet info
  const storeWalletInfo = useCallback(async (walletInfo: MWAWalletInfo) => {
    try {
      if (!isValidSolanaAddress(walletInfo.address)) {
        console.error('❌ [MWA] Cannot store invalid wallet address:', walletInfo.address)
        return
      }
      const storableInfo = {
        address: walletInfo.address,
        label: walletInfo.label,
      }
      await AsyncStorage.setItem(WALLET_INFO_KEY, JSON.stringify(storableInfo))
      if (walletInfo.authToken) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, walletInfo.authToken)
        console.log('💾 [MWA] Stored wallet info:', storableInfo, 'with auth_token:', walletInfo.authToken)
      } else {
        console.warn('⚠️ [MWA] No auth_token provided for storage')
      }
    } catch (error) {
      console.error('❌ [MWA] Error storing wallet info:', error)
    }
  }, [])

  // Clear stored wallet info
  const clearStoredWalletInfo = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([WALLET_INFO_KEY, AUTH_TOKEN_KEY])
      console.log('🗑️ [MWA] Stored wallet info and auth_token cleared')
    } catch (error) {
      console.error('❌ [MWA] Error clearing stored wallet info:', error)
    }
  }, [])

  const connect = useCallback(
    async (forceReauthorize = false) => {
      if (isConnecting || isTransactingRef.current) {
        console.warn('⚠️ [MWA] Connection already in progress - waiting...')

        // Wait for current operation to finish instead of throwing error
        let attempts = 0
        while ((isConnecting || isTransactingRef.current) && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (isConnecting || isTransactingRef.current) {
          throw new Error('Connection timeout - another operation is still in progress')
        }

        // If already connected after waiting, return early
        if (isConnected && wallet && !forceReauthorize) {
          console.log('✅ [MWA] Already connected after waiting')
          return
        }
      }

      try {
        setIsConnecting(true)
        setError(null)
        console.log('🔌 [MWA] Initiating connection...', { forceReauthorize })

        const storedAuthToken = forceReauthorize ? null : await AsyncStorage.getItem(AUTH_TOKEN_KEY)
        console.log('📥 [MWA] Using stored auth_token for connection:', storedAuthToken ? 'exists' : 'none')

        const authorizationResult = await transact(async (mwaWallet: Web3MobileWallet) => {
          const authResult = await mwaWallet.authorize({
            chain: 'devnet',
            identity: APP_IDENTITY,
            auth_token: storedAuthToken || undefined,
          })
          console.log('🔑 [MWA] Received auth_token from authorize')
          return authResult
        })

        if (authorizationResult.accounts.length === 0) {
          throw new Error('No accounts authorized')
        }

        const account = authorizationResult.accounts[0]
        let publicKey: PublicKey
        let base58Address: string

        try {
          console.log('📝 [MWA] Converting wallet address...')
          const addressBytes = toByteArray(account.address)
          publicKey = new PublicKey(addressBytes)
          base58Address = publicKey.toString()
          console.log('✅ [MWA] Converted address to base58:', base58Address)
        } catch (conversionError: any) {
          console.error('❌ [MWA] Error converting address:', conversionError)
          throw new Error(`Failed to convert wallet address: ${conversionError.message}`)
        }

        const walletInfo: MWAWalletInfo = {
          address: base58Address,
          publicKey,
          authToken: authorizationResult.auth_token,
          label: account.label || 'MWA Wallet',
        }

        setWallet(walletInfo)
        setIsConnected(true)
        await storeWalletInfo(walletInfo)

        console.log('✅ [MWA] Connected successfully:', base58Address)
      } catch (error: any) {
        console.error('❌ [MWA] Connection failed:', error)
        let errorMessage = 'Failed to connect to wallet'
        if (error.message?.includes('rejected')) {
          errorMessage = 'Connection rejected by user'
        } else if (error.message?.includes('not installed')) {
          errorMessage = 'No compatible wallets found'
        } else if (error.message?.includes('Failed to convert')) {
          errorMessage = 'Invalid wallet address format'
        }
        setError(errorMessage)
        setIsConnected(false)
        setWallet(null)
        throw error
      } finally {
        setIsConnecting(false)
      }
    },
    [isConnecting, storeWalletInfo],
  )

  // Disconnect from MWA wallet
  const disconnect = useCallback(async () => {
    try {
      setError(null)
      console.log('🔌 [MWA] Disconnecting...')

      if (wallet?.authToken) {
        console.log('🔑 [MWA] Using auth_token for deauthorize:', wallet.authToken)
        await transact(async (mwaWallet: Web3MobileWallet) => {
          try {
            await mwaWallet.deauthorize({ auth_token: wallet.authToken })
            console.log('✅ [MWA] Wallet deauthorized with auth_token:', wallet.authToken)
          } catch (deauthError) {
            console.warn('⚠️ [MWA] Deauthorization failed, continuing disconnect:', deauthError)
          }
        })
      }

      setWallet(null)
      setIsConnected(false)
      await clearStoredWalletInfo()
      console.log('🗑️ [MWA] Disconnected successfully')
    } catch (error) {
      console.error('❌ [MWA] Disconnect error:', error)
      setWallet(null)
      setIsConnected(false)
      await clearStoredWalletInfo()
      console.log('🗑️ [MWA] Disconnected despite error')
    }
  }, [wallet?.authToken, clearStoredWalletInfo])

  // Sign and send transaction
  const signAndSendTransaction = useCallback(
    async (transaction: Transaction | VersionedTransaction): Promise<string> => {
      if (!wallet || !isConnected) {
        throw new Error('Wallet not connected')
      }

      if (isTransactingRef.current) {
        throw new Error('Another transaction is in progress')
      }

      try {
        isTransactingRef.current = true
        setError(null)
        console.log('🔐 [MWA] Attempting to sign and send transaction with auth_token:', wallet.authToken)

        const signature = await transact(async (mwaWallet: Web3MobileWallet) => {
          try {
            const signatures = await mwaWallet.signAndSendTransactions({
              transactions: [transaction],
            })
            console.log('✅ [MWA] Transaction signed and sent with auth_token:', wallet.authToken)
            return signatures[0]
          } catch (error: any) {
            if (error.message?.includes('auth_token not valid')) {
              console.warn('⚠️ [MWA] Invalid auth_token:', wallet.authToken, 'attempting re-authorization')
              await connect(true) // Force re-authorization
              const newWallet = currentWalletRef.current
              if (!newWallet?.authToken) {
                throw new Error('Failed to obtain new auth_token')
              }
              console.log('🔑 [MWA] Re-authorized with new auth_token:', newWallet.authToken)
              const signatures = await mwaWallet.signAndSendTransactions({
                transactions: [transaction],
              })
              console.log('✅ [MWA] Transaction signed and sent with new auth_token:', newWallet.authToken)
              return signatures[0]
            }
            throw error
          }
        })

        console.log('✅ [MWA] Transaction signed and sent:', signature)
        return signature
      } catch (error: any) {
        console.error('❌ [MWA] Transaction signing/sending failed:', error)
        const errorMessage = error.message?.includes('rejected')
          ? 'Transaction rejected by user'
          : `Failed to send transaction: ${error.message}`
        setError(errorMessage)
        throw error
      } finally {
        isTransactingRef.current = false
      }
    },
    [wallet, isConnected, connect],
  )

  // Fix the signAllTransactions method in your MWAContext
  const signAllTransactions = useCallback(
    async (transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> => {
      if (!wallet || !isConnected) {
        throw new Error('Wallet not connected')
      }

      if (isTransactingRef.current) {
        throw new Error('Another transaction is in progress')
      }

      try {
        isTransactingRef.current = true
        setError(null)
        console.log(
          `🔐 [MWA] Attempting to sign ${transactions.length} transactions with auth_token:`,
          wallet.authToken,
        )

        const signedTransactions = await transact(async (mwaWallet: Web3MobileWallet) => {
          try {
            console.warn('⚠️ [MWA] Using signTransactions for Anchor compatibility')
            const signedTxs = await mwaWallet.signTransactions({
              transactions,
            })
            console.log('✅ [MWA] Transactions signed with auth_token:', wallet.authToken)
            return signedTxs
          } catch (error: any) {
            if (error.message?.includes('auth_token not valid')) {
              console.warn('⚠️ [MWA] Invalid auth_token, attempting fresh authorization...')

              // Clear the old token and force fresh authorization
              await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
              setWallet((prev: any) => (prev ? { ...prev, authToken: undefined } : null))

              // Get fresh authorization
              const authResult = await mwaWallet.authorize({
                chain: 'devnet',
                identity: APP_IDENTITY,
              })

              if (!authResult.auth_token) {
                throw new Error('Failed to obtain new auth_token')
              }

              console.log('🔑 [MWA] Fresh authorization successful with new auth_token:', authResult.auth_token)

              // Update wallet with new token
              const updatedWallet = {
                ...wallet,
                authToken: authResult.auth_token,
              }
              setWallet(updatedWallet)
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, authResult.auth_token)

              // Retry signing with new token
              const signedTxs = await mwaWallet.signTransactions({
                transactions,
              })
              console.log('✅ [MWA] Transactions signed with fresh auth_token')
              return signedTxs
            }
            throw error
          }
        })

        console.log(`✅ [MWA] ${signedTransactions.length} transactions signed successfully`)
        return signedTransactions
      } catch (error: any) {
        console.error('❌ [MWA] Batch transaction signing failed:', error)
        const errorMessage = error.message?.includes('rejected')
          ? 'Transaction signing rejected by user'
          : `Failed to sign transactions: ${error.message}`
        setError(errorMessage)
        throw error
      } finally {
        isTransactingRef.current = false
      }
    },
    [wallet, isConnected],
  )

  // Sign message
  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!wallet || !isConnected) {
        throw new Error('Wallet not connected')
      }

      if (isTransactingRef.current) {
        throw new Error('Another transaction is in progress')
      }

      try {
        isTransactingRef.current = true
        setError(null)
        console.log('🔐 [MWA] Attempting to sign message with auth_token:', wallet.authToken)

        const signedMessage = await transact(async (mwaWallet: Web3MobileWallet) => {
          try {
            const signatures = await mwaWallet.signMessages({
              addresses: [wallet.address],
              payloads: [message],
            })
            console.log('✅ [MWA] Message signed with auth_token:', wallet.authToken)
            return signatures[0]
          } catch (error: any) {
            if (error.message?.includes('auth_token not valid')) {
              console.warn('⚠️ [MWA] Invalid auth_token:', wallet.authToken, 'attempting re-authorization')
              await connect(true) // Force re-authorization
              const newWallet = currentWalletRef.current
              if (!newWallet?.authToken) {
                throw new Error('Failed to obtain new auth_token')
              }
              console.log('🔑 [MWA] Re-authorized with new auth_token:', newWallet.authToken)
              const signatures = await mwaWallet.signMessages({
                addresses: [wallet.address],
                payloads: [message],
              })
              console.log('✅ [MWA] Message signed with new auth_token:', newWallet.authToken)
              return signatures[0]
            }
            throw error
          }
        })

        console.log('✅ [MWA] Message signed successfully')
        return signedMessage
      } catch (error: any) {
        console.error('❌ [MWA] Message signing failed:', error)
        const errorMessage = error.message?.includes('rejected')
          ? 'Message signing rejected by user'
          : `Failed to sign message: ${error.message}`
        setError(errorMessage)
        throw error
      } finally {
        isTransactingRef.current = false
      }
    },
    [wallet, isConnected, connect],
  )

  // Check wallets available
  const checkWalletsAvailable = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingWallets(true)
      setError(null)

      const walletResults = await checkSpecificWalletApps()
      const hasWallets = walletResults.some((result) => result.isInstalled)

      setHasWalletsInstalled(hasWallets)
      console.log(`🔍 [MWA] Wallets available: ${hasWallets}`)
      return hasWallets
    } catch (error) {
      console.error('❌ [MWA] Error checking wallets:', error)
      setHasWalletsInstalled(false)
      return false
    } finally {
      setIsCheckingWallets(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const contextValue: MWAContextState = {
    isConnected,
    isConnecting,
    wallet,
    hasWalletsInstalled,
    isCheckingWallets,
    error,
    connect,
    disconnect,
    signAndSendTransaction,
    signAllTransactions,
    signMessage,
    checkWalletsAvailable,
    clearError,
  }

  return <MWAContext.Provider value={contextValue}>{children}</MWAContext.Provider>
}

// Hook to use MWA context
export const useMWA = (): MWAContextState => {
  const context = useContext(MWAContext)
  if (context === undefined) {
    throw new Error('useMWA must be used within a MWAProvider')
  }
  return context
}

// Utility hook for wallet detection
export const useMWAWalletDetection = () => {
  const { hasWalletsInstalled, isCheckingWallets, checkWalletsAvailable } = useMWA()
  return {
    hasWalletsInstalled,
    isCheckingWallets,
    recheckWallets: checkWalletsAvailable,
  }
}

// ===============================================================================
// ANCHOR COMPATIBILITY ADAPTERS
// ===============================================================================

/**
 * Standard Anchor-compatible wallet adapter
 * Uses MWA's legacy signTransactions method for full Anchor compatibility
 */
export const useMWAAnchorAdapter = (): AnchorWallet | null => {
  const { wallet, isConnected, signAllTransactions } = useMWA()

  return useMemo(() => {
    if (!isConnected || !wallet) {
      return null
    }

    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey,

      // Single transaction signing - uses signAllTransactions with array of one
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        try {
          console.log('🔐 [MWA Anchor Adapter] Signing single transaction...')
          const signedTxs = await signAllTransactions([tx])
          return signedTxs[0] as T
        } catch (error) {
          console.error('❌ [MWA Anchor Adapter] Failed to sign transaction:', error)
          throw error
        }
      },

      // Multiple transaction signing - uses existing signAllTransactions
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        try {
          console.log(`🔐 [MWA Anchor Adapter] Signing ${txs.length} transactions...`)
          return (await signAllTransactions(txs)) as T[]
        } catch (error) {
          console.error('❌ [MWA Anchor Adapter] Failed to sign transactions:', error)
          throw error
        }
      },
    }

    return anchorWallet
  }, [isConnected, wallet, signAllTransactions])
}

/**
 * @deprecated Legacy adapter for sign+send pattern
 * Use useMWAAnchorAdapter for standard Anchor compatibility
 */
export const useMWASignAndSendAdapter = (): MWAAnchorWallet | null => {
  console.warn('⚠️ useMWASignAndSendAdapter is deprecated. Use useMWAAnchorAdapter for standard Anchor compatibility.')

  const { wallet, isConnected, signAndSendTransaction, signAllTransactions } = useMWA()

  return useMemo(() => {
    if (!isConnected || !wallet) {
      return null
    }

    return {
      publicKey: wallet.publicKey,
      signAndSendTransaction: async (tx: Transaction | VersionedTransaction) => {
        console.log('🔐 [MWA Legacy Adapter] Using signAndSendTransaction...')
        return await signAndSendTransaction(tx)
      },
      signAllTransactions: async (txs: (Transaction | VersionedTransaction)[]) => {
        console.log(`🔐 [MWA Legacy Adapter] Signing ${txs.length} transactions...`)
        return await signAllTransactions(txs)
      },
    }
  }, [isConnected, wallet, signAndSendTransaction, signAllTransactions])
}

// ===============================================================================
// UTILITY FUNCTIONS
// ===============================================================================

// Check specific wallet apps
export const checkSpecificWalletApps = async (): Promise<{ wallet: WalletApp; isInstalled: boolean }[]> => {
  const results = await Promise.all(
    SUPPORTED_WALLETS.map(async (wallet) => {
      try {
        const canOpen = await Linking.canOpenURL(wallet.scheme)
        return {
          wallet,
          isInstalled: canOpen,
        }
      } catch (error) {
        console.warn(`Could not check wallet ${wallet.name}:`, error)
        return {
          wallet,
          isInstalled: false,
        }
      }
    }),
  )

  const installedWallets = results.filter((r) => r.isInstalled)
  console.log(
    `📱 [MWA] Found ${installedWallets.length} installed wallets:`,
    installedWallets.map((r) => r.wallet.name),
  )

  return results
}

// Get installed wallets
export const getInstalledWallets = async (): Promise<WalletApp[]> => {
  const results = await checkSpecificWalletApps()
  return results.filter((r) => r.isInstalled).map((r) => r.wallet)
}

// Open wallet download
export const openWalletDownload = (wallet: WalletApp, platform: 'android' | 'ios' = 'android') => {
  const url = wallet.downloadUrl[platform]
  if (url) {
    Linking.openURL(url).catch((err) => console.error(`Failed to open download link for ${wallet.name}:`, err))
  }
}

// Open wallet app
export const openWalletApp = async (wallet: WalletApp): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(wallet.scheme)
    if (canOpen) {
      await Linking.openURL(wallet.scheme)
      return true
    }
    return false
  } catch (error) {
    console.error(`Failed to open ${wallet.name}:`, error)
    return false
  }
}

// Get wallet status message
export const getWalletStatusMessage = (hasWalletsInstalled: boolean, isChecking: boolean): string => {
  if (isChecking) {
    return 'Checking for installed wallets...'
  }

  if (hasWalletsInstalled) {
    return 'Compatible wallets found! You can connect with your existing wallet.'
  }

  return 'No Solana wallets detected. You can create a new embedded wallet or install a wallet app.'
}

// Get default Solana connection
export const getMWAConnection = (network: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'): Connection => {
  const endpoints = {
    devnet: 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com',
  }

  return new Connection(endpoints[network], {
    commitment: 'confirmed',
    wsEndpoint: endpoints[network].replace('https://', 'wss://'),
  })
}

// Check if MWA signing should be used
export const shouldUseMWASigning = (wallet: any): boolean => {
  return wallet && typeof wallet.address === 'string' && wallet.publicKey instanceof PublicKey && !wallet.connector
}
