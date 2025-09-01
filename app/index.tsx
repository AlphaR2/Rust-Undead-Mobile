import { useDynamic } from "@/context/wallet";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";
import "react-native-crypto-js";
import "react-native-get-random-values";

export default function SplashScreen() {
  const dynamicClient = useDynamic();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthAndNavigate = async () => {
      try {
        const isAuthenticated = dynamicClient.auth.authenticatedUser?.email;

        if (isAuthenticated) {
          setTimeout(() => {
            router.replace("/guide");
          }, 2000);
        } else {
          // Navigate to trailer after 10 seconds for new users
          setTimeout(() => {
            router.replace("/trailer");
          }, 10000);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setTimeout(() => {
          router.replace("/trailer");
        }, 10000);
      }
    };

    checkAuthAndNavigate();
  }, [dynamicClient]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Splash Image */}
      <Image
        source={require("../assets/images/spl.png")}
        style={styles.splashImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
});
