export { MWAProvider, useMWA, useMWAWalletDetection, APP_IDENTITY } from './MWAContext';
export type { MWAWalletInfo, MWAContextState } from './MWAContext';

// Wallet detection utilities
import { Linking } from 'react-native';

export interface WalletApp {
  name: string;
  scheme: string;
  packageName?: string;
  bundleId?: string;
  downloadUrl: {
    android?: string;
    ios?: string;
  };
  icon?: string;
}

// Popular MWA-compatible wallets
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
  {
    name: 'Glow',
    scheme: 'glow://',
    packageName: 'com.luma.wallet',
    bundleId: 'com.luma.wallet',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.luma.wallet',
      ios: 'https://apps.apple.com/app/glow-solana-wallet/id1599584512',
    },
  },
  {
    name: 'Ultimate',
    scheme: 'ultimate://',
    packageName: 'com.ultimate.wallet',
    bundleId: 'com.ultimate.wallet',
    downloadUrl: {
      android: 'https://play.google.com/store/apps/details?id=com.ultimate.wallet',
      ios: 'https://apps.apple.com/app/ultimate-wallet/id1538986861',
    },
  },
];

/**
 * Check if specific wallet apps are likely installed by testing their URL schemes
 */
export const checkSpecificWalletApps = async (): Promise<{ wallet: WalletApp; isInstalled: boolean }[]> => {
  const results = await Promise.all(
    SUPPORTED_WALLETS.map(async (wallet) => {
      try {
        const canOpen = await Linking.canOpenURL(wallet.scheme);
        return {
          wallet,
          isInstalled: canOpen,
        };
      } catch (error) {
        console.warn(`Could not check wallet ${wallet.name}:`, error);
        return {
          wallet,
          isInstalled: false,
        };
      }
    })
  );

  const installedWallets = results.filter(r => r.isInstalled);
  console.log(`📱 [MWA] Found ${installedWallets.length} installed wallets:`, 
    installedWallets.map(r => r.wallet.name));

  return results;
};

/**
 * Get only the installed wallets
 */
export const getInstalledWallets = async (): Promise<WalletApp[]> => {
  const results = await checkSpecificWalletApps();
  return results.filter(r => r.isInstalled).map(r => r.wallet);
};

/**
 * Open wallet app download page
 */
export const openWalletDownload = (wallet: WalletApp, platform: 'android' | 'ios' = 'android') => {
  const url = wallet.downloadUrl[platform];
  if (url) {
    Linking.openURL(url).catch(err => 
      console.error(`Failed to open download link for ${wallet.name}:`, err)
    );
  }
};

/**
 * Open a specific wallet app directly (if installed)
 */
export const openWalletApp = async (wallet: WalletApp): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(wallet.scheme);
    if (canOpen) {
      await Linking.openURL(wallet.scheme);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to open ${wallet.name}:`, error);
    return false;
  }
};

/**
 * Utility to get human-readable wallet status
 */
export const getWalletStatusMessage = (hasWalletsInstalled: boolean, isChecking: boolean): string => {
  if (isChecking) {
    return 'Checking for installed wallets...';
  }
  
  if (hasWalletsInstalled) {
    return 'Compatible wallets found! You can connect with your existing wallet.';
  }
  
  return 'No Solana wallets detected. You can create a new embedded wallet or install a wallet app.';
};