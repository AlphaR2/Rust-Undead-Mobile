import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Toast } from '@/components/ui/Toast'
import ContextProvider from '@/context/Context'
import { PrivyProvider } from '@privy-io/expo'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
import { ThemeProvider } from './providers/ThemeProvider'
import { MWAProvider } from "@/context/mwa";

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
    if (fontsLoaded) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const appId = process.env.EXPO_PUBLIC_PRIVY_ID;
  const clientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT;

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
      <View style={styles.container}>
        <StatusBar hidden={true} translucent={false} backgroundColor="transparent" />
        <GestureHandlerRootView style={styles.appContainer}>
          <MWAProvider>
          <ContextProvider>
            <SafeAreaProvider>
              <ThemeProvider>
                <ErrorBoundary>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      statusBarHidden: true,
                      statusBarTranslucent: false,
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
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="guide"
                      options={{
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="warrior-creation"
                      options={{
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        statusBarHidden: true,
                      }}
                    />
                    <Stack.Screen
                      name="+not-found"
                      options={{
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
      </View>
    </PrivyProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  appContainer: {
    flex: 1,
    zIndex: 1,
  },
})
