import { WalletSelectionModal } from '@/components/modal/Walletselectionmodal';
import { toast } from '@/components/ui/Toast';
import { GameFonts } from '@/constants/GameFonts';
import { useMWA } from '@/context/mwa';
import { useLoginWithOAuth, usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BACKGROUND_IMAGE =
  'https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeigrhentsbwqvi7rf5hfnxeduteggpiln6zq67rzubub6o5hyf46u4';

const Intro: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textPulse] = useState(new Animated.Value(1));
  const [buttonScale] = useState(new Animated.Value(1));
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const { user } = usePrivy();
  const { login, state: loginState } = useLoginWithOAuth();
  const { isConnected: isMWAConnected, wallet: mwaWallet, error: mwaError } = useMWA();

  // Check if any wallet is connected (Privy or MWA)
  const isAnyWalletConnected = !!user || isMWAConnected;

  // Handle initial authentication check and animations
  useEffect(() => {
    StatusBar.setHidden(true);

    if (isAnyWalletConnected && !hasNavigated) {
      setHasNavigated(true);
      console.log('User already authenticated, navigating to guide');
      router.replace('/guide');
      return;
    }

    // Start animations for unauthenticated users
    if (!isAnyWalletConnected) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        startTextPulsing();
      });
    }

    return () => {
      StatusBar.setHidden(false);
    };
  }, [isAnyWalletConnected, hasNavigated]);

  // Handle Privy login state changes
  useEffect(() => {
    if (loginState.status === 'done' && !hasNavigated) {
      setHasNavigated(true);
      setIsConnecting(false);
      setShowWalletModal(false);
      toast.success('Welcome to Rust Undead!', 'Your journey into the undead realm begins now!');
      console.log('Privy login successful, navigating to guide');
      router.replace('/guide');
    } else if (loginState.status === 'error') {
      setIsConnecting(false);
      setShowWalletModal(false);
      console.error('Privy login failed:', loginState.error);
      toast.error('Authentication Failed', loginState.error?.message || 'Failed to connect to the undead realm. Try again.');
    }
  }, [loginState, hasNavigated]);

  // Handle MWA connection success
  useEffect(() => {
    if (isMWAConnected && mwaWallet && !hasNavigated) {
      setHasNavigated(true);
      setIsConnecting(false);
      setShowWalletModal(false);
      console.log('MWA wallet connected, navigating to guide');
      router.replace('/guide');
    }
  }, [isMWAConnected, mwaWallet, hasNavigated]);

  // Handle MWA connection errors
  useEffect(() => {
    if (mwaError) {
      setIsConnecting(false);
      setShowWalletModal(false);
      toast.error('Wallet Connection Failed', mwaError);
    }
  }, [mwaError]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsConnecting(true);
      toast.info('Connecting to Realm', 'Establishing your connection to the undead realm...');
      await login({ provider: 'google' });
    } catch (error) {
      setIsConnecting(false);
      console.error('Google login error:', error);
      toast.error('Authentication Failed', 'Failed to connect to the undead realm. Try again.');
    }
  }, [login]);

  const handleWalletConnected = useCallback(
    async (walletType: 'privy' | 'mwa') => {
      if (walletType === 'privy') {
        await handleGoogleLogin();
      } else if (walletType === 'mwa') {
        setIsConnecting(true);
        toast.info('Connecting to Wallet', 'Please approve the connection in your wallet app...');
        // MWA connection is handled by useMWA hook
      }
    },
    [handleGoogleLogin],
  );

  const handleCloseWalletModal = useCallback(() => {
    setShowWalletModal(false);
    setIsConnecting(false);
  }, []);

  const onContinue = () => {
    if (!hasNavigated) {
      setShowWalletModal(true);
    }
  };

  const onButtonPressIn = () => {
    if (isConnecting || hasNavigated) return;
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onButtonPressOut = () => {
    if (isConnecting || hasNavigated) return;
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const startTextPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(textPulse, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  // Don't render anything if user is authenticated
  if (isAnyWalletConnected || hasNavigated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView style={styles.content}>
          <Animated.View
            style={[
              styles.mainContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/log33.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={[styles.titleText, GameFonts.title]}>RUST UNDEAD</Text>
            <Animated.Text
              style={[
                styles.pulsingText,
                GameFonts.epic,
                {
                  transform: [{ scale: textPulse }],
                },
              ]}
            >
              JOURNEY TO THE UNDEAD!!
            </Animated.Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.continueButton, (isConnecting || hasNavigated) && styles.disabledButton]}
              onPress={onContinue}
              onPressIn={onButtonPressIn}
              onPressOut={onButtonPressOut}
              activeOpacity={0.85}
              disabled={isConnecting || hasNavigated}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#cd7f32" />
                  <Text style={[styles.buttonText, GameFonts.button, styles.loadingText]}>CONNECTING...</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>BEGIN YOUR JOURNEY</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
      <WalletSelectionModal
        visible={showWalletModal}
        onClose={handleCloseWalletModal}
        onWalletConnected={handleWalletConnected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 4,
    height: 140,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontSize: 55,
    fontWeight: '400',
    color: '#cd7f32',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pulsingText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#cd7f32',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 5,
  },
  buttonContainer: {
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#121212',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#cd7f32',
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 220,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cd7f32',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default Intro;