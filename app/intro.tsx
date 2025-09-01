
import { WalletSelectionModal } from "@/components/modal/Walletselectionmodal";
import { toast } from "@/components/ui/Toast";
import { GameFonts } from "@/constants/GameFonts";
import { useMWA } from "@/context/mwa";
import { useDynamic } from "@/context/wallet";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKGROUND_IMAGE =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeigrhentsbwqvi7rf5hfnxeduteggpiln6zq67rzubub6o5hyf46u4";

const Intro: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textPulse] = useState(new Animated.Value(1));
  const [buttonScale] = useState(new Animated.Value(1));
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false); // Prevent multiple navigations

  // Use Dynamic client directly (like in the working modal)
  const dynamicClient = useDynamic();
  const {
    isConnected: isMWAConnected,
    wallet: mwaWallet,
    error: mwaError,
  } = useMWA();

  // Check if any wallet is already connected
  const isAnyWalletConnected =
    dynamicClient.auth.authenticatedUser?.email || isMWAConnected;

  // Memoize event handlers for Dynamic wallet
  const handleAuthInit = useCallback(() => {
    console.log("Dynamic authentication started");
    toast.info(
      "Connecting to Realm",
      "Establishing your connection to the undead realm..."
    );
  }, []);

  const handleAuthSuccess = useCallback(
    (user: any) => {
      console.log("Dynamic authentication successful:", user);
      setIsConnecting(false);
      setShowWalletModal(false);
      toast.success(
        "Welcome to Rust Undead!",
        "Your journey into the undead realm begins now!"
      );

      // Prevent multiple navigations
      if (!hasNavigated) {
        setHasNavigated(true);
        console.log(
          "Navigating to /guide after Dynamic auth success immediately"
        );
        router.replace("/guide");
      }
    },
    [hasNavigated]
  );

  const handleAuthFailed = useCallback((error: any) => {
    console.log("Dynamic authentication failed:", error);
    setIsConnecting(false);
    toast.error(
      "Authentication Failed",
      "The realm gates remain closed. Try again."
    );
  }, []);

  const handleAuthFlowCancelled = useCallback(() => {
    console.log("Dynamic authentication flow cancelled");
    setIsConnecting(false);
    toast.warning(
      "Authentication Cancelled",
      "You cancelled the connection. Please try again."
    );
  }, []);

  const handleAuthFlowClosed = useCallback(() => {
    console.log("Dynamic authentication flow closed");
    setIsConnecting(false);
  }, []);

  const handleAuthFlowOpened = useCallback(() => {
    console.log("Dynamic authentication flow opened");
    setIsConnecting(true);
    toast.info(
      "Realm Portal Opening",
      "Choose your preferred method to enter the undead realm."
    );
  }, []);

  // Single effect to handle initial authentication check and setup
  useEffect(() => {
    StatusBar.setHidden(true);

    // Check if already authenticated on component mount - navigate immediately
    if (isAnyWalletConnected && !hasNavigated) {
      setHasNavigated(true);
      console.log(
        "User already authenticated, navigating to guide immediately"
      );
      router.replace("/guide");
      return;
    }

    // Only add event listeners if user is not already authenticated
    if (!isAnyWalletConnected) {
      console.log("Setting up Dynamic event listeners");
      dynamicClient.auth.on("authInit", handleAuthInit);
      dynamicClient.auth.on("authSuccess", handleAuthSuccess);
      dynamicClient.auth.on("authFailed", handleAuthFailed);
      dynamicClient.ui.on("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.on("authFlowClosed", handleAuthFlowClosed);
      dynamicClient.ui.on("authFlowOpened", handleAuthFlowOpened);

      // Start animations only for new users
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
      // Clean up event listeners
      dynamicClient.auth.off("authInit", handleAuthInit);
      dynamicClient.auth.off("authSuccess", handleAuthSuccess);
      dynamicClient.auth.off("authFailed", handleAuthFailed);
      dynamicClient.ui.off("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.off("authFlowClosed", handleAuthFlowClosed);
      dynamicClient.ui.off("authFlowOpened", handleAuthFlowOpened);
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle MWA connection success (separate effect)
  useEffect(() => {
    if (isMWAConnected && mwaWallet && !hasNavigated) {
      setHasNavigated(true);
      setIsConnecting(false);
      setShowWalletModal(false);
      console.log("MWA wallet connected, navigating to guide immediately");
      router.replace("/guide");
    }
  }, [isMWAConnected, mwaWallet, hasNavigated]);

  // Handle MWA connection errors
  useEffect(() => {
    if (mwaError) {
      setIsConnecting(false);
      toast.error("Wallet Connection Failed", mwaError);
    }
  }, [mwaError]);

  const onContinue = () => {
    if (!hasNavigated) {
      setShowWalletModal(true);
    }
  };

  const handleWalletConnected = useCallback((walletType: "dynamic" | "mwa") => {
    if (walletType === "mwa") {
      setIsConnecting(true);
      toast.info(
        "Connecting to Wallet",
        "Please approve the connection in your wallet app..."
      );
    }
    // For Dynamic, connection state is handled by event listeners
  }, []);

  const handleCloseWalletModal = useCallback(() => {
    setShowWalletModal(false);
    setIsConnecting(false);
  }, []);

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
      ])
    ).start();
  };

  // Don't render anything if user is already authenticated - just navigate
  if (isAnyWalletConnected || hasNavigated) {
    return null; // Don't render anything, just navigate
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
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
              <Image
                source={require("../assets/images/log33.png")}
                style={styles.logo}
                resizeMode="contain"
              />
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
              style={[
                styles.continueButton,
                (isConnecting || hasNavigated) && styles.disabledButton,
              ]}
              onPress={onContinue}
              onPressIn={onButtonPressIn}
              onPressOut={onButtonPressOut}
              activeOpacity={0.85}
              disabled={isConnecting || hasNavigated}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#cd7f32" />
                  <Text
                    style={[
                      styles.buttonText,
                      GameFonts.button,
                      styles.loadingText,
                    ]}
                  >
                    CONNECTING...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>
                  BEGIN YOUR JOURNEY
                </Text>
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
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: SCREEN_WIDTH * 4,
    height: 140,
    marginBottom: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 55,
    fontWeight: "400",
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pulsingText: {
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: "600",
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 5,
  },
  buttonContainer: {
    paddingBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  continueButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#cd7f32",
    shadowColor: "#cd7f32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 220,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cd7f32",
    letterSpacing: 1,
    textAlign: "center",
    textTransform: "uppercase",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default Intro;
