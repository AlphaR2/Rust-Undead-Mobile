import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

// Unique ID generator
let toastIdCounter = 0;
const generateUniqueId = (): string => {
  toastIdCounter += 1;
  return `toast_${Date.now()}_${toastIdCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

// Global toast state management
class ToastManager {
  private static instance: ToastManager;
  private listeners: ((messages: ToastMessage[]) => void)[] = [];
  private messages: ToastMessage[] = [];

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(toast: Omit<ToastMessage, "id">) {
    const id = generateUniqueId();
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast,
    };

    this.messages = [...this.messages, newToast];
    this.notifyListeners();

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, newToast.duration);
    }
  }

  hide(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.messages = [];
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.messages));
  }
}

// Global toast functions
export const toast = {
  success: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "success", title, message }),
  error: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "error", title, message }),
  warning: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "warning", title, message }),
  info: (title: string, message?: string) =>
    ToastManager.getInstance().show({ type: "info", title, message }),
};

// Individual toast component
function ToastItem({
  toast: toastData,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-50));
  const [scale] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const getToastConfig = () => {
    switch (toastData.type) {
      case "success":
        return {
          icon: "⚔️",
          gradientColors: ["#10B981", "#059669"],
          glowColor: "#10B981",
          borderColor: "#10B981",
          titlePrefix: "VICTORY!",
        };
      case "error":
        return {
          icon: "💀",
          gradientColors: ["#EF4444", "#DC2626"],
          glowColor: "#EF4444",
          borderColor: "#EF4444",
          titlePrefix: "DEFEAT!",
        };
      case "warning":
        return {
          icon: "⚡",
          gradientColors: ["#F59E0B", "#D97706"],
          glowColor: "#F59E0B",
          borderColor: "#F59E0B",
          titlePrefix: "CAUTION!",
        };
      default:
        return {
          icon: "🛡️",
          gradientColors: ["#3B82F6", "#2563EB"],
          glowColor: "#3B82F6",
          borderColor: "#3B82F6",
          titlePrefix: "INFO",
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          shadowColor: config.glowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastWrapper}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        {/* Outer Border with Glow Effect */}
        <View
          style={[
            styles.outerBorder,
            {
              borderColor: config.borderColor,
              shadowColor: config.glowColor,
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: 6,
            },
          ]}
        >
          {/* Inner Container with Gradient */}
          <LinearGradient
            colors={["#1F2937", "#111827"]}
            style={styles.innerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Accent Bar */}
            <LinearGradient
              colors={config.gradientColors as any}
              style={styles.accentBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            <View style={styles.toastContent}>
              {/* Icon Section */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${config.borderColor}20` },
                ]}
              >
                <Text style={styles.toastIcon}>{config.icon}</Text>
              </View>

              {/* Text Content */}
              <View style={styles.toastText}>
                <View style={styles.titleRow}>
                  <Text
                    style={[styles.titlePrefix, { color: config.borderColor }]}
                  >
                    {config.titlePrefix}
                  </Text>
                  <Text style={styles.toastTitle}>{toastData.title}</Text>
                </View>
                {toastData.message && (
                  <Text style={styles.toastMessage}>{toastData.message}</Text>
                )}
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDismiss}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Main toast container component
export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setMessages);
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    ToastManager.getInstance().hide(id);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 20 }]}>
      {messages.map((message) => (
        <ToastItem
          key={message.id}
          toast={message}
          onDismiss={() => handleDismiss(message.id)}
        />
      ))}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  toastItem: {
    marginBottom: 12,
    width: width * 0.85, // 85% of screen width
    maxWidth: 400,
  },
  toastWrapper: {
    width: "100%",
  },
  outerBorder: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 2,
    backgroundColor: "transparent",
  },
  innerContainer: {
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  accentBar: {
    height: 4,
    width: "100%",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    paddingTop: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  toastIcon: {
    fontSize: 18,
  },
  toastText: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  titlePrefix: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginRight: 6,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9FAFB",
    flex: 1,
  },
  toastMessage: {
    fontSize: 13,
    color: "#D1D5DB",
    lineHeight: 18,
    marginTop: 2,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "bold",
    lineHeight: 18,
  },
});
