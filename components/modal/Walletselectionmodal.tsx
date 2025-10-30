import { GameFonts } from '@/constants/GameFonts'
import { useMWA } from '@/context/mwa/MWAContext'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import { useLoginWithEmail } from '@privy-io/expo'
import * as Haptics from 'expo-haptics'
import React, { forwardRef, useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface AuthBottomSheetProps {
  onWalletConnected: (walletType: 'email' | 'mwa') => void
}

export interface AuthBottomSheetRef {
  snapToIndex: (index: number) => void
  close: () => void
}

export const AuthBottomSheet = forwardRef<AuthBottomSheetRef, AuthBottomSheetProps>(({ onWalletConnected }, ref) => {
  console.log('Loaded Gorhom AuthBottomSheet version: 2025-09-11-v1')

  const bottomSheetRef = React.useRef<BottomSheet>(null)
  const insets = useSafeAreaInsets()

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['60%'], [])

  const [toggleAnim] = useState(new Animated.Value(0))
  const [errorMessage, setErrorMessage] = useState('')

  const [isEmailAuth, setIsEmailAuth] = useState(true)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, code: false })

  const { connect: connectMWA, isConnecting: isConnectingMWA, hasWalletsInstalled } = useMWA()
  const {
    sendCode,
    loginWithCode,
    state: emailState,
  } = useLoginWithEmail({
    onSendCodeSuccess: (email) => {
      console.log('Code sent to:', email)
      setShowCodeInput(true)
      setErrorMessage('')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onLoginSuccess: (user) => {
      console.log('Email login successful:', user)
      onWalletConnected('email')
      bottomSheetRef.current?.close()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    },
    onError: (error) => {
      console.error('Email auth error:', error)
      setErrorMessage('Invalid email or code. Please try again.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    },
  })

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      bottomSheetRef.current?.snapToIndex(index)
    },
    close: () => {
      bottomSheetRef.current?.close()
    },
  }))

  // Custom backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
        style={[props.style, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
      />
    ),
    [],
  )

  const handleToggle = () => {
    const newValue = !isEmailAuth
    setIsEmailAuth(newValue)
    Animated.spring(toggleAnim, {
      toValue: newValue ? 0 : 1,
      useNativeDriver: true,
      tension: 120,
      friction: 7,
    }).start()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    resetEmailFlow()
  }

  const handleMWAConnect = async () => {
    console.log('handleMWAConnect triggered')
    if (!hasWalletsInstalled) {
      setErrorMessage('No Solana wallets installed. Please install a wallet app.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    try {
      onWalletConnected('mwa')
      await connectMWA()
      bottomSheetRef.current?.close()
    } catch (error) {
      console.error('MWA connection failed:', error)
      setErrorMessage('Failed to connect wallet. Please try again.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleSendCode = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    console.log('Sending code to:', email)
    await sendCode({ email: email.trim() })
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setErrorMessage('Please enter a 6-digit code.')
      return
    }
    console.log('Verifying code:', code)
    await loginWithCode({ code: code.trim(), email: email.trim() })
  }

  const resetEmailFlow = () => {
    setEmail('')
    setCode('')
    setShowCodeInput(false)
    setErrorMessage('')
  }

  const handlePrimaryAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (isEmailAuth) {
      if (showCodeInput) {
        handleVerifyCode()
      } else {
        handleSendCode()
      }
    } else {
      // handleMWAConnect()
    }
  }

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Sheet closed
      resetEmailFlow()
      setIsEmailAuth(true)
      toggleAnim.setValue(0)
    }
  }, [])

  const isEmailLoading = emailState.status === 'sending-code' || emailState.status === 'submitting-code'
  const isPrimaryDisabled = isEmailAuth
    ? showCodeInput
      ? code.length !== 6 || isEmailLoading
      : !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || isEmailLoading
    : isConnectingMWA || !hasWalletsInstalled

  const getPrimaryButtonText = () => {
    if (isEmailAuth) {
      if (isEmailLoading) return showCodeInput ? 'ENTERING REALM...' : 'SUMMONING...'
      return showCodeInput ? 'ENTER THE REALM' : 'SUMMON PORTAL KEY'
    }
    if (isConnectingMWA) return 'AWAKENING...'
    return hasWalletsInstalled ? 'COMING SOON' : 'NO WALLETS DETECTED'
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.bottomSheetContainer}
    >
      <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}>
        {/* Header with toggle */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, GameFonts.title]}>Summon your mystical gateway</Text>
          </View>

          {/* Toggle Switch */}
          {/* Toggle Section with Side Labels */}
          <View style={styles.toggleSection}>
            <Text style={[styles.sideLabel, isEmailAuth && styles.activeSideLabel, GameFonts.body]}>PASSKEY</Text>

            <Pressable
              style={styles.toggleButton}
              onPress={handleToggle}
              accessible
              accessibilityLabel="Toggle authentication method"
            >
              <Animated.View
                style={[
                  styles.toggleSlider,
                  {
                    transform: [
                      {
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, 42], // Moves across the 80px width
                        }),
                      },
                    ],
                  },
                ]}
              />
            </Pressable>

            <Text style={[styles.sideLabel, !isEmailAuth && styles.activeSideLabel, GameFonts.body]}>SOLANA</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {errorMessage ? <Text style={[styles.errorText, GameFonts.body]}>{errorMessage}</Text> : null}

          {isEmailAuth ? (
            <View style={styles.authContainer}>
              {!showCodeInput ? (
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, GameFonts.body]}>Sacred Email</Text>
                  <TextInput
                    style={[styles.textInput, GameFonts.body, isFocused.email && styles.inputFocused]}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      setErrorMessage('')
                    }}
                    placeholder="Enter your mystical email"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    accessible
                    accessibilityLabel="Email input"
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, GameFonts.body]}>Sacred Code</Text>
                  <TextInput
                    style={[styles.codeInput, GameFonts.body, isFocused.code && styles.inputFocused]}
                    value={code}
                    onChangeText={(text) => {
                      setCode(text)
                      setErrorMessage('')
                    }}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    maxLength={6}
                    autoFocus
                    accessible
                    accessibilityLabel="Verification code input"
                  />
                  <Pressable
                    onPress={resetEmailFlow}
                    style={styles.backButton}
                    accessible
                    accessibilityLabel="Change email"
                  >
                    <Text style={[styles.backButtonText, GameFonts.body]}>← Change Email</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.walletContainer}>
              <Text style={[styles.walletDescription, GameFonts.body]}>
                {hasWalletsInstalled
                  ? 'Connect your Solana wallet to enter the undead realm'
                  : 'No Solana wallets detected. Please install a wallet app first.'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <Pressable
            onPress={handlePrimaryAction}
            disabled={isPrimaryDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              isPrimaryDisabled && styles.disabledButton,
              pressed && styles.buttonPressed,
            ]}
            accessible
            accessibilityLabel={getPrimaryButtonText()}
          >
            <ImageBackground
              source={require('../../assets/onboarding/button-bg-main.png')}
              style={styles.gameButton}
              resizeMode="contain"
            >
              {isEmailLoading || isConnectingMWA ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#121212" />
                  <Text style={[styles.buttonText, GameFonts.button]}>{getPrimaryButtonText()}</Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>{getPrimaryButtonText()}</Text>
              )}
            </ImageBackground>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  )
})

const styles = StyleSheet.create({
  bottomSheetContainer: {
    shadowColor: '#cd7f32',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDesign: {},
  bottomSheetBackground: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  handleIndicator: {
    backgroundColor: '#cd7f32',
    width: 50,
    height: 5,
    borderRadius: 3,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  skullIcon: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#cd7f32',
  },
  skullEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    color: '#cd7f32',
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleTrack: {
    width: 200,
    height: 48,
    backgroundColor: 'rgba(205, 127, 50, 0.15)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#cd7f32',
    position: 'relative',
    justifyContent: 'center',
  },
  toggleThumb: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#cd7f32',
    borderRadius: 20,
    top: 4,
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },

  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  toggleButton: {
    width: 80,
    height: 36,
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#cd7f32',
    position: 'relative',
    justifyContent: 'center',
  },
  toggleSlider: {
    position: 'absolute',
    width: 34,
    height: 30,
    backgroundColor: '#cd7f32',
    borderRadius: 15,
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  sideLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  activeSideLabel: {
    color: '#cd7f32',
    textShadowColor: 'rgba(205, 127, 50, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },

  toggleLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  contentSection: {
    flex: 1,
    paddingVertical: 1,
    justifyContent: 'flex-start',
  },
  authContainer: {
    gap: 2,
  },
  inputContainer: {
    gap: 5,
  },
  inputLabel: {
    color: '#cd7f32',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderWidth: 2,
    borderColor: '#cd7f32',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  codeInput: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderWidth: 2,
    borderColor: '#cd7f32',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: '#e8a968',
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  backButton: {
    alignSelf: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#cd7f32',
    fontSize: 14,
    fontWeight: '600',
  },
  walletContainer: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
  },
  walletIcon: {
    padding: 15,
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#cd7f32',
  },
  walletEmoji: {
    fontSize: 32,
  },
  walletDescription: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    paddingVertical: 20,
  },
  primaryButton: {
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.4,
    shadowOpacity: 0.1,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  gameButton: {
    paddingVertical: 12,
    paddingHorizontal: 54,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
})
