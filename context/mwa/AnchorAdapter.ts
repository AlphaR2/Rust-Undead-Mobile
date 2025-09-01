import { PublicKey, Transaction, VersionedTransaction, Connection } from '@solana/web3.js';
import { useMWA } from './MWAContext';
import { useMemo } from 'react';

/**
 * Anchor-compatible wallet adapter for MWA wallets
 */
export interface MWAAnchorWallet {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions: (txs: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
}

/**
 * Hook that provides an Anchor-compatible wallet adapter for MWA
 */
export const useMWAAnchorAdapter = (): MWAAnchorWallet | null => {
  const { wallet, isConnected, signTransaction, signAllTransactions } = useMWA();

  return useMemo(() => {
    if (!isConnected || !wallet) {
      return null;
    }

    const anchorWallet: MWAAnchorWallet = {
      publicKey: wallet.publicKey,
      
      signTransaction: async (tx: Transaction | VersionedTransaction) => {
        try {
          console.log('🔐 [MWA Adapter] Signing single transaction...');
          return await signTransaction(tx);
        } catch (error) {
          console.error('❌ [MWA Adapter] Failed to sign transaction:', error);
          throw error;
        }
      },
      
      signAllTransactions: async (txs: (Transaction | VersionedTransaction)[]) => {
        try {
          console.log(`🔐 [MWA Adapter] Signing ${txs.length} transactions...`);
          return await signAllTransactions(txs);
        } catch (error) {
          console.error('❌ [MWA Adapter] Failed to sign transactions:', error);
          throw error;
        }
      },
    };

    return anchorWallet;
  }, [isConnected, wallet, signTransaction, signAllTransactions]);
};

/**
 * Get a default Solana connection for MWA usage
 */
export const getMWAConnection = (network: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'): Connection => {
  const endpoints = {
    'devnet': 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com', 
    'testnet': 'https://api.testnet.solana.com',
  };

  return new Connection(endpoints[network], {
    commitment: 'confirmed',
    wsEndpoint: endpoints[network].replace('https://', 'wss://'),
  });
};

/**
 * Utility to check if we should use MWA signing vs regular signing
 */
export const shouldUseMWASigning = (wallet: any): boolean => {
  // Check if this is an MWA wallet (has the specific properties)
  return wallet && 
         typeof wallet.address === 'string' && 
         wallet.publicKey instanceof PublicKey &&
         !wallet.connector;
};