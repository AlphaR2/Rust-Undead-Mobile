import { GameFonts } from "@/constants/GameFonts";
import { useMWA } from "@/context/mwa";
import { useDynamic } from "@/context/wallet";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WalletSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: "dynamic" | "mwa") => void;
}

export const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({
  visible,
  onClose,
  onWalletConnected,
}) => {
  console.log("Loaded WalletSelectionModal version: 2025-08-06-v5");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const {
    connect: connectMWA,
    isConnecting: isConnectingMWA,
    hasWalletsInstalled,
  } = useMWA();
  const dynamicClient = useDynamic();
  const [isConnectingDynamic, setIsConnectingDynamic] = useState(false);

  const handleMWAConnect = async () => {
    console.log("handleMWAConnect triggered");
    if (!hasWalletsInstalled) {
      console.log("No Solana wallets installed");
      onClose();
      return;
    }
    try {
      onWalletConnected("mwa");
      await connectMWA();
    } catch (error) {
      console.error("MWA connection failed:", error);
      // Error is handled by Intro's useEffect
    }
  };

  // Event handlers - same pattern as Intro
  const handleAuthSuccess = useCallback(
    (user: any) => {
      console.log("Dynamic authentication successful in modal:", user);
      setIsConnectingDynamic(false);
      onWalletConnected("dynamic");
      onClose();
    },
    [onWalletConnected, onClose]
  );

  const handleAuthFailed = useCallback((error: any) => {
    console.log("Dynamic authentication failed in modal:", error);
    setIsConnectingDynamic(false);
  }, []);

  const handleAuthFlowCancelled = useCallback(() => {
    console.log("Dynamic authentication flow cancelled in modal");
    setIsConnectingDynamic(false);
  }, []);

  const handleAuthFlowClosed = useCallback(() => {
    console.log("Dynamic authentication flow closed in modal");
    setIsConnectingDynamic(false);
  }, []);

  const handleDynamicConnect = useCallback(async () => {
    console.log("handleDynamicConnect triggered");
    if (!dynamicClient?.ui?.auth) {
      console.error("Dynamic client UI auth not available");
      return;
    }
    try {
      await dynamicClient.auth.social.connect({ provider: "google" });
    } catch (error) {
      console.error("Dynamic connection failed:", error);
      setIsConnectingDynamic(false);
    }
  }, [dynamicClient]);

  const handleDynamicLogout = useCallback(async () => {
    console.log("handleDynamicLogout triggered");
    if (!dynamicClient?.auth) {
      console.error("Dynamic client auth not available for logout");
      return;
    }
    try {
      await dynamicClient.auth.logout();
      console.log("Dynamic logout successful");
    } catch (error) {
      console.error("Dynamic logout failed:", error);
    }
  }, [dynamicClient]);

  const handleCancel = () => {
    console.log("Cancel button pressed");
    onClose();
  };

  useEffect(() => {
    if (visible) {
      console.log("WalletSelectionModal opened");

      // Add event listeners - same as Intro
      dynamicClient.auth.on("authSuccess", handleAuthSuccess);
      dynamicClient.auth.on("authFailed", handleAuthFailed);
      dynamicClient.ui.on("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.on("authFlowClosed", handleAuthFlowClosed);

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
      // Clean up event listeners when modal closes
      dynamicClient.auth.off("authSuccess", handleAuthSuccess);
      dynamicClient.auth.off("authFailed", handleAuthFailed);
      dynamicClient.ui.off("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.off("authFlowClosed", handleAuthFlowClosed);

      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }

    // Cleanup on unmount
    return () => {
      dynamicClient.auth.off("authSuccess", handleAuthSuccess);
      dynamicClient.auth.off("authFailed", handleAuthFailed);
      dynamicClient.ui.off("authFlowCancelled", handleAuthFlowCancelled);
      dynamicClient.ui.off("authFlowClosed", handleAuthFlowClosed);
    };
  }, [
    visible,
    dynamicClient,
    handleAuthSuccess,
    handleAuthFailed,
    handleAuthFlowCancelled,
    handleAuthFlowClosed,
  ]);

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

          {/* Temporary logout button */}
          {/* <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleDynamicLogout}
          >
            <Text style={[styles.logoutButtonText, GameFonts.button]}>
              Logout
            </Text>
          </TouchableOpacity> */}

          <View style={styles.header}>
            <Text style={[styles.title, GameFonts.title]}>
              Choose Your Wallet
            </Text>
            <Text style={[styles.subtitle, GameFonts.body]}>
              Select a wallet to enter the undead realm
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.walletButton,
                isConnectingDynamic && styles.disabledButton,
              ]}
              onPress={handleDynamicConnect}
              disabled={isConnectingDynamic || isConnectingMWA}
            >
              {isConnectingDynamic ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="#121212" />
                  <Text style={[styles.buttonText, GameFonts.button]}>
                    Opening...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>
                  Embedded Wallet
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.walletButton,
                !hasWalletsInstalled && styles.disabledButton,
              ]}
              onPress={handleMWAConnect}
              disabled={
                isConnectingMWA || isConnectingDynamic || !hasWalletsInstalled
              }
            >
              {isConnectingMWA ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="#121212" />
                  <Text style={[styles.buttonText, GameFonts.button]}>
                    Connecting...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, GameFonts.button]}>
                  {hasWalletsInstalled ? "Solana MWA" : "No Solana Wallets"}
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cd7f32",
    width: "100%",
    maxWidth: 400,
    paddingVertical: 20,
    position: "relative", // For positioning cancel button
  },
  cancelButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#cd7f32",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cancelButtonText: {
    color: "#cd7f32",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#cd7f32",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  logoutButtonText: {
    color: "#cd7f32",
    fontSize: 10,
    fontWeight: "500",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#cd7f32",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  walletButton: {
    backgroundColor: "#cd7f32",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#121212",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
