import { AuthBottomSheet, AuthBottomSheetRef } from '@/components/modal/Walletselectionmodal'
import { toast } from '@/components/ui/Toast'
import { GameFonts } from '@/constants/GameFonts'
import { useMWA } from '@/context/mwa/MWAContext'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import WELCOME_BACKGROUND from '../assets/images/bg-assets/bg-01.png'

const Intro: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [textPulse] = useState(new Animated.Value(1))
  const [buttonScale] = useState(new Animated.Value(1))
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)

  const authSheetRef = useRef<AuthBottomSheetRef>(null)

  const { user } = usePrivy()
  const { isConnected: isMWAConnected, wallet: mwaWallet, error: mwaError } = useMWA()

  const isAnyWalletConnected = useMemo(() => !!user || isMWAConnected, [user, isMWAConnected])

  useEffect(() => {
    if (isAnyWalletConnected && !hasNavigated) {
      setHasNavigated(true)
      router.replace('/guide')
      return
    }

    if (!isAnyWalletConnected) {
      requestAnimationFrame(() => {
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
          startTextPulsing()
        })
      })
    }
  }, [isAnyWalletConnected, hasNavigated])

  useEffect(() => {
    if (user && !hasNavigated) {
      setHasNavigated(true)
      setIsConnecting(false)
      authSheetRef.current?.close()
      toast.success('Welcome to the Undead Realm!', 'Your dark journey begins now, mortal soul!')
      router.replace('/guide')
    }
  }, [user, hasNavigated])

  useEffect(() => {
    if (isMWAConnected && mwaWallet && !hasNavigated) {
      setHasNavigated(true)
      setIsConnecting(false)
      authSheetRef.current?.close()
      toast.success('Spirit Wallet Connected!', 'The undead realm recognizes your spiritual essence!')
      router.replace('/guide')
    }
  }, [isMWAConnected, mwaWallet, hasNavigated])

  useEffect(() => {
    if (mwaError) {
      setIsConnecting(false)
      toast.error('Spirit Connection Failed', 'Your spiritual essence could not be awakened. Try again.')
    }
  }, [mwaError])

  const handleWalletConnected = useCallback(async (walletType: 'email' | 'mwa') => {
    setIsConnecting(true)

    if (walletType === 'email') {
      toast.info('Summoning Sacred Portal', 'Preparing your mystical gateway to the undead realm...')
    } else if (walletType === 'mwa') {
      toast.info('Awakening Spirit Wallet', 'Please approve the spiritual connection in your wallet...')
    }
  }, [])

  const onContinue = () => {
    if (!hasNavigated) {
      authSheetRef.current?.snapToIndex(0)
    }
  }

  const onButtonPressIn = () => {
    if (isConnecting || hasNavigated) return
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }

  const onButtonPressOut = () => {
    if (isConnecting || hasNavigated) return
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }

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
    ).start()
  }

  if (isAnyWalletConnected || hasNavigated) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <ImageBackground source={WELCOME_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
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
              <Text style={[styles.titleText, GameFonts.title]}>RUST UNDEAD</Text>
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
                onPress={onContinue}
                onPressIn={onButtonPressIn}
                onPressOut={onButtonPressOut}
                activeOpacity={0.85}
                disabled={isConnecting || hasNavigated}
              >
                <ImageBackground
                  source={require('../assets/onboarding/button-bg-main.png')}
                  style={styles.buttonBackground}
                  resizeMode="stretch"
                >
                  <Text style={[styles.buttonText, GameFonts.button]}>AWAKEN FROM DEATH</Text>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          </SafeAreaView>
        </ImageBackground>

        <AuthBottomSheet ref={authSheetRef} onWalletConnected={handleWalletConnected} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '125%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
  },
  content: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  titleText: {
    fontSize: 50,
    fontWeight: '400',
    color: '#cd7f32',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  buttonBackground: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 280,
    minHeight: 60,
  },
  buttonText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
})

export default Intro
