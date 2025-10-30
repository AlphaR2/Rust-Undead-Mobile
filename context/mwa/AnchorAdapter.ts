import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { useMemo } from 'react'
import { useMWA } from './MWAContext'

/**
 * Standard Anchor wallet interface
 */
export interface AnchorWallet {
  publicKey: PublicKey
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>
}

/**
 * Simple MWA Anchor Adapter following official MWA documentation
 * Uses the legacy signTransactions method for Anchor compatibility
 */
export const useMWAAnchorAdapter = (): AnchorWallet | null => {
  const { wallet, isConnected, signAllTransactions } = useMWA()

  return useMemo(() => {
    if (!isConnected || !wallet) {
      return null
    }

    const anchorWallet: AnchorWallet = {
      publicKey: wallet.publicKey,

      // Single transaction signing using signAllTransactions
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
        try {
          console.log('🔐 [MWA Adapter] Signing single transaction...')
          const signedTxs = await signAllTransactions([tx])
          return signedTxs[0] as T
        } catch (error) {
          console.error('❌ [MWA Adapter] Failed to sign transaction:', error)
          throw error
        }
      },

      // Multiple transaction signing
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        try {
          console.log(`🔐 [MWA Adapter] Signing ${txs.length} transactions...`)
          return await signAllTransactions(txs) as T[]
        } catch (error) {
          console.error('❌ [MWA Adapter] Failed to sign transactions:', error)
          throw error
        }
      },
    }

    return anchorWallet
  }, [isConnected, wallet, signAllTransactions])
}

/**
 * Get a default Solana connection for MWA usage
 */
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

/**
 * Utility to check if we should use MWA signing vs regular signing
 */
export const shouldUseMWASigning = (wallet: any): boolean => {
  return wallet && typeof wallet.address === 'string' && wallet.publicKey instanceof PublicKey && !wallet.connector
}