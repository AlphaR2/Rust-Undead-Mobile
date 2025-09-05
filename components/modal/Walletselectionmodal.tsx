import { useLoginWithOAuth } from '@privy-io/expo';
import { GameFonts } from '@/constants/GameFonts';
import { useMWA } from '@/context/mwa';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface WalletSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: 'privy' | 'mwa') => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  visible,
  onClose,
  onWalletConnected,
}) => {
  console.log('Loaded WalletSelectionModal version: 2025-09-05-v6');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { connect: connectMWA, isConnecting: isConnectingMWA, hasWalletsInstalled } = useMWA();
  const { login, state: loginState } = useLoginWithOAuth();
  const [isConnectingPrivy, setIsConnectingPrivy] = useState(false);

  const handleMWAConnect = async () => {
    console.log('handleMWAConnect triggered');
    if (!hasWalletsInstalled) {
      console.log('No Solana wallets installed');
      onClose();
      return;
    }
    try {
      onWalletConnected('mwa');
      await connectMWA();
    } catch (error) {
      console.error('MWA connection failed:', error);
      // Error is handled by Intro's useEffect
    }
  };

  const handlePrivyConnect = useCallback(async () => {
    console.log('handlePrivyConnect triggered');
    try {
      setIsConnectingPrivy(true);
      await login({ provider: 'google' });
      // Success is handled by Intro's useEffect
    } catch (error) {
      console.error('Privy connection failed:', error);
      setIsConnectingPrivy(false);
      // Error is handled by Intro's useEffect
    }
  }, [login]);

  useEffect(() => {
    if (visible) {
      console.log('WalletSelectionModal opened');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setIsConnectingPrivy(false);
    }
  }, [visible]);

  const handleCancel = () => {
    console.log('Cancel button pressed');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={[styles.cancelButtonText, GameFonts.button]}>✕</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={[styles.title, GameFonts.title]}>Choose Your Wallet</Text>
            <Text style={[styles.subtitle, GameFonts.body]}>Select a wallet to enter the undead realm</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.walletButton, isConnectingPrivy && styles.disabledButton]}
              onPress={() => {
                onWalletConnected('privy');
                handlePrivyConnect();
              }}
              disabled={isConnectingPrivy || isConnectingMWA}
            >
              {isConnectingPrivy ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="#121212" />
                  <Text style={[styles.buttonText, GameFonts.button]}>Opening...</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>Login with Google</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.walletButton, !hasWalletsInstalled && styles.disabledButton]}
              onPress={handleMWAConnect}
              disabled={isConnectingMWA || isConnectingPrivy || !hasWalletsInstalled}
            >
              {isConnectingMWA ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="#121212" />
                  <Text style={[styles.buttonText, GameFonts.button]}>Connecting...</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>
                  {hasWalletsInstalled ? 'Solana MWA' : 'No Solana Wallets'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cd7f32',
    width: '100%',
    maxWidth: 400,
    paddingVertical: 20,
    position: 'relative',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#cd7f32',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cancelButtonText: {
    color: '#cd7f32',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#cd7f32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  walletButton: {
    backgroundColor: '#cd7f32',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#121212',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});