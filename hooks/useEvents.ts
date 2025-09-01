import SolanaEventListener from "@/services/EventListener";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EventHistoryItem,
  EventListenerConfig,
  EventListenerStatus,
  GameEventHandlers,
} from "../types/events";

interface UseSolanaEventsOptions extends Partial<EventListenerConfig> {
  heliusApiKey: string;
}

interface UseSolanaEventsReturn {
  // Connection status
  status: EventListenerStatus;

  // Event history
  eventHistory: EventHistoryItem[];
  clearEventHistory: () => void;

  // Connection control
  connect: () => Promise<void>;
  disconnect: () => void;

  // Event handler management
  setEventHandlers: (handlers: GameEventHandlers) => void;
  addEventListener: <K extends keyof GameEventHandlers>(
    eventName: K,
    handler: NonNullable<GameEventHandlers[K]>
  ) => void;
  removeEventListener: (eventName: keyof GameEventHandlers) => void;
}

export function useSolanaEvents(
  initialHandlers: GameEventHandlers = {},
  options: UseSolanaEventsOptions
): UseSolanaEventsReturn {
  const eventListener = useRef<SolanaEventListener | null>(null);
  const [status, setStatus] = useState<EventListenerStatus>({
    isConnected: false,
    error: null,
    subscriptionId: null,
    reconnectAttempts: 0,
    lastEventTime: null,
  });
  const [eventHistory, setEventHistory] = useState<EventHistoryItem[]>([]);

  // Initialize event listener
  useEffect(() => {
    const initializeListener = async () => {
      try {
        eventListener.current = new SolanaEventListener(options);
        eventListener.current.setEventHandlers(initialHandlers);

        // Set up status polling
        const statusInterval = setInterval(() => {
          if (eventListener.current) {
            setStatus(eventListener.current.getStatus());
            setEventHistory(eventListener.current.getEventHistory());
          }
        }, 1000);

        await eventListener.current.initialize();

        return () => {
          clearInterval(statusInterval);
        };
      } catch (error) {
        console.error("Failed to initialize event listener:", error);
        setStatus((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Initialization failed",
        }));
      }
    };

    const cleanup = initializeListener();

    // Cleanup on unmount
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
      if (eventListener.current) {
        eventListener.current.disconnect();
        eventListener.current = null;
      }
    };
  }, [options.heliusApiKey, options.network, options.programId]);

  // Connection methods
  const connect = useCallback(async () => {
    if (eventListener.current) {
      try {
        await eventListener.current.connect();
      } catch (error) {
        console.error("Connection failed:", error);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventListener.current) {
      eventListener.current.disconnect();
    }
  }, []);

  // Event history management
  const clearEventHistory = useCallback(() => {
    if (eventListener.current) {
      eventListener.current.clearEventHistory();
      setEventHistory([]);
    }
  }, []);

  // Event handler management
  const setEventHandlers = useCallback((handlers: GameEventHandlers) => {
    if (eventListener.current) {
      eventListener.current.setEventHandlers(handlers);
    }
  }, []);

  const addEventListener = useCallback(
    <K extends keyof GameEventHandlers>(
      eventName: K,
      handler: NonNullable<GameEventHandlers[K]>
    ) => {
      if (eventListener.current) {
        eventListener.current.addEventListener(eventName, handler);
      }
    },
    []
  );

  const removeEventListener = useCallback(
    (eventName: keyof GameEventHandlers) => {
      if (eventListener.current) {
        eventListener.current.removeEventListener(eventName);
      }
    },
    []
  );

  return {
    status,
    eventHistory,
    clearEventHistory,
    connect,
    disconnect,
    setEventHandlers,
    addEventListener,
    removeEventListener,
  };
}

export default useSolanaEvents;
