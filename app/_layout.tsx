import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Toast } from '@/components/ui/Toast'
import ContextProvider from '@/context/Context'
import { MWAProvider } from '@/context/mwa'
import { PrivyProvider } from '@privy-io/expo'
import { useFonts } from 'expo-font'
import * as NavigationBar from 'expo-navigation-bar'
import { Stack } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
// import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
import { ThemeProvider } from './providers/ThemeProvider'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Cinzel-Regular': require('../assets/fonts/Cinzel-Regular.ttf'),
    'Cinzel-SemiBold': require('../assets/fonts/Cinzel-SemiBold.ttf'),
    'Cinzel-Bold': require('../assets/fonts/Cinzel-Bold.ttf'),
    'Cinzel-Black': require('../assets/fonts/Cinzel-Black.ttf'),
    'Orbitron-Regular': require('../assets/fonts/Orbitron-Regular.ttf'),
    'Orbitron-Medium': require('../assets/fonts/Orbitron-Medium.ttf'),
    'Orbitron-Bold': require('../assets/fonts/Orbitron-Bold.ttf'),
    'Orbitron-Black': require('../assets/fonts/Orbitron-Black.ttf'),
    'MedievalSharp-Regular': require('../assets/fonts/MedievalSharp-Regular.ttf'),
    'UnifrakturCook-Bold': require('../assets/fonts/UnifrakturCook-Bold.ttf'),
  })

  useEffect(() => {
    const setupFullscreen = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)

        // Hide status bar on both platforms
        if (Platform.OS === 'ios') {
          RNStatusBar.setHidden(true, 'none')
        } else if (Platform.OS === 'android') {
          RNStatusBar.setHidden(true, 'none')
          // Hide navigation bar for true fullscreen on Android
          await NavigationBar.setVisibilityAsync('hidden')
        }
      } catch (error) {
        console.error('Could not setup fullscreen mode:', error)
      }
    }

    setupFullscreen()

    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const appId = process.env.EXPO_PUBLIC_PRIVY_ID
  const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT

  if (!appId || !clientId) {
    console.error(
      'Privy configuration missing: Ensure EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID are set in .env or EAS Secrets.',
    )
    return null
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        embedded: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <StatusBar hidden={true} translucent={true} />
      <GestureHandlerRootView style={styles.fullscreen}>
        <MWAProvider>
          <ContextProvider>
            <SafeAreaProvider>
              <ThemeProvider>
                <ErrorBoundary>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      statusBarHidden: true,
                      statusBarTranslucent: true,
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{
                        gestureEnabled: false,
                        animation: 'none',
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="trailer"
                      options={{
                        gestureEnabled: false,
                        animation: 'fade',
                        presentation: 'fullScreenModal',
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="intro"
                      options={{
                        animation: 'slide_from_right',
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="guide"
                      options={{
                        animation: 'slide_from_right',
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="dashboard"
                      options={{
                        animation: 'fade',
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="+not-found"
                      options={{
                        animation: 'fade',
                        statusBarHidden: true,
                      }}
                    />
                  </Stack>
                  <Toast />
                </ErrorBoundary>
              </ThemeProvider>
            </SafeAreaProvider>
          </ContextProvider>
        </MWAProvider>
      </GestureHandlerRootView>
    </PrivyProvider>
  )
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
})
