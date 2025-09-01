import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toast } from "@/components/ui/Toast";
import { MWAProvider } from "@/context/mwa";
import { dynamicClient } from "@/context/wallet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
// Theme provider
import ContextProvider from "@/context/Context";
import { StyleSheet, View } from "react-native";
import { ThemeProvider } from "./providers/ThemeProvider";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Cinzel-Regular": require("../assets/fonts/Cinzel-Regular.ttf"),
    "Cinzel-SemiBold": require("../assets/fonts/Cinzel-SemiBold.ttf"),
    "Cinzel-Bold": require("../assets/fonts/Cinzel-Bold.ttf"),
    "Cinzel-Black": require("../assets/fonts/Cinzel-Black.ttf"),
    "Orbitron-Regular": require("../assets/fonts/Orbitron-Regular.ttf"),
    "Orbitron-Medium": require("../assets/fonts/Orbitron-Medium.ttf"),
    "Orbitron-Bold": require("../assets/fonts/Orbitron-Bold.ttf"),
    "Orbitron-Black": require("../assets/fonts/Orbitron-Black.ttf"),
    "MedievalSharp-Regular": require("../assets/fonts/MedievalSharp-Regular.ttf"),
    "UnifrakturCook-Bold": require("../assets/fonts/UnifrakturCook-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Add error handling for missing Privy configuration

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={true}
        translucent={false}
        backgroundColor="transparent"
      />

      <View style={styles.webViewContainer}>
        <dynamicClient.reactNative.WebView />
      </View>

      {/* Main App Content */}
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
                    {/* Splash screen (entry point) */}
                    <Stack.Screen
                      name="index"
                      options={{
                        gestureEnabled: false,
                        animation: "none",
                        statusBarHidden: true,
                      }}
                    />
                    {/* Onboarding flow */}
                    <Stack.Screen
                      name="trailer"
                      options={{
                        gestureEnabled: false,
                        animation: "fade",
                        presentation: "fullScreenModal",
                        statusBarHidden: true,
                      }}
                    />
                    {/* wallet connect will be in intro */}
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
                    {/* Main app tabs */}
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        statusBarHidden: true,
                      }}
                    />
                    {/* 404 page */}
                    <Stack.Screen
                      name="+not-found"
                      options={{
                        statusBarHidden: true,
                      }}
                    />
                  </Stack>

                  {/* Global toast notifications */}
                  <Toast />
                </ErrorBoundary>
              </ThemeProvider>
            </SafeAreaProvider>
          </ContextProvider>
        </MWAProvider>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  webViewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Behind everything
    opacity: 0, // Make it invisible but functional
  },
  appContainer: {
    flex: 1,
    zIndex: 1, // Above the WebView
  },
});
