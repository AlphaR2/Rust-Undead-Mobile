import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

// Unique ID generator
let toastIdCounter = 0
const generateUniqueId = (): string => {
  toastIdCounter += 1
  return `toast_${Date.now()}_${toastIdCounter}_${Math.random().toString(36).substr(2, 9)}`
}

// Global toast state management
class ToastManager {
  private static instance: ToastManager
  private listeners: ((messages: ToastMessage[]) => void)[] = []
  private messages: ToastMessage[] = []

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  show(toast: Omit<ToastMessage, 'id'>) {
    const id = generateUniqueId()
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast,
    }

    this.messages = [...this.messages, newToast]
    this.notifyListeners()

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.hide(id)
      }, newToast.duration)
    }
  }

  hide(id: string) {
    this.messages = this.messages.filter((m) => m.id !== id)
    this.notifyListeners()
  }

  clear() {
    this.messages = []
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.messages))
  }
}

// Global toast functions
export const toast = {
  success: (title: string, message?: string) => ToastManager.getInstance().show({ type: 'success', title, message }),
  error: (title: string, message?: string) => ToastManager.getInstance().show({ type: 'error', title, message }),
  warning: (title: string, message?: string) => ToastManager.getInstance().show({ type: 'warning', title, message }),
  info: (title: string, message?: string) => ToastManager.getInstance().show({ type: 'info', title, message }),
}

// Individual toast component
function ToastItem({ toast: toastData, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const [opacity] = useState(new Animated.Value(0))
  const [translateY] = useState(new Animated.Value(-30))

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [opacity, translateY])

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss)
  }

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity style={styles.toastContainer} onPress={handleDismiss} activeOpacity={0.95}>
        <View style={styles.toastBorder}>
          <View style={styles.toastContent}>
            <View style={styles.textContent}>
              <Text style={styles.toastTitle}>{toastData.title}</Text>
              {toastData.message && <Text style={styles.toastMessage}>{toastData.message}</Text>}
            </View>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Main toast container component
export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().subscribe(setMessages)
    return unsubscribe
  }, [])

  const handleDismiss = (id: string) => {
    ToastManager.getInstance().hide(id)
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <View style={[styles.container, { top: insets.top + 16 }]}>
      {messages.map((message) => (
        <ToastItem key={message.id} toast={message} onDismiss={() => handleDismiss(message.id)} />
      ))}
    </View>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
    paddingHorizontal: width * 0.05, // 5% padding each side = 90% width
  },
  toastItem: {
    marginBottom: 8,
    width: '100%',
  },
  toastContainer: {
    width: '100%',
  },
  toastBorder: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cd7f32',
    overflow: 'hidden',
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#cd7f32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  toastMessage: {
    fontSize: 13,
    color: '#999',
    lineHeight: 16,
    marginTop: 2,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(205, 127, 50, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(205, 127, 50, 0.4)',
  },
  dismissText: {
    fontSize: 16,
    color: '#cd7f32',
    fontWeight: 'bold',
    lineHeight: 16,
  },
})
