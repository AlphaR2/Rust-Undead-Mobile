import { Connection } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PROGRAM_IDL } from "../config/program";
import { RustUndead as UndeadTypes } from "@/types/idlTypes";
import {
  GameEventHandlers,
  EventListenerConfig,
  EventListenerStatus,
  EventHistoryItem,
  BattleRoomCancelled,
  WarriorReleased,
  DelegationEvent,
  JoinEvent,
  ReadyEvent,
  BattleStart,
  WarriorStatusEvent,
  WinnerEvent,
  AnswerSubmitEvent,
  AnswerRevealEvent,
  ScoresEvent,
  DamageEvent,
  EliminationEvent,
  NextEvent,
  WarriorCreatedEvent,
} from "../types/events";

export class SolanaEventListener {
  private ws: WebSocket | null = null;
  private status: EventListenerStatus = {
    isConnected: false,
    error: null,
    subscriptionId: null,
    reconnectAttempts: 0,
    lastEventTime: null,
  };

  private config: EventListenerConfig;
  private program: anchor.Program<UndeadTypes> | null = null;
  private eventHandlers: GameEventHandlers = {};
  private eventHistory: EventHistoryItem[] = [];

  // Enhanced connection management
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isDestroyed: boolean = false;
  private connectionAttempts: number = 0;
  private lastHealthCheck: number = 0;

  constructor(config: Partial<EventListenerConfig> & { heliusApiKey: string }) {
    this.config = {
      network: "devnet",
      programId: "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9",
      autoConnect: true,
      maxReconnectAttempts: 5, // Increased back to 5
      reconnectDelay: 2000,
      commitment: "confirmed",
      ...config,
    };

    // console.log("🆕 Creating new EventListener instance");
  }

  // Getters for status and history
  getStatus(): EventListenerStatus {
    return { ...this.status };
  }

  getEventHistory(): EventHistoryItem[] {
    return [...this.eventHistory];
  }

  clearEventHistory(): void {
    this.eventHistory = [];
  }

  // Initialize the event listener
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error("EventListener has been destroyed");
    }

    try {
      // console.log("🔧 Initializing event listener...");

      // Validate API key first
      if (
        !this.config.heliusApiKey ||
        this.config.heliusApiKey === "your-api-key"
      ) {
        throw new Error("Invalid Helius API key");
      }

      // Setup Anchor program for event parsing
      const httpEndpoint = this.getHttpEndpoint();
      const connection = new Connection(httpEndpoint, this.config.commitment);

      const provider = new anchor.AnchorProvider(
        connection,
        {} as any,
        anchor.AnchorProvider.defaultOptions()
      );

      // Use static IDL
      const idl = PROGRAM_IDL as UndeadTypes;
      if (!idl) {
        throw new Error("Static IDL not found");
      }

      // console.log("✅ Using static IDL for event listener");
      this.program = new anchor.Program(idl, provider);

      if (this.config.autoConnect && !this.isDestroyed) {
        await this.connect();
      }
    } catch (error) {
      this.setError(
        error instanceof Error ? error.message : "Initialization failed"
      );
      throw error;
    }
  }

  // Enhanced connect method with Helius best practices
  async connect(): Promise<void> {
    if (this.isDestroyed) {
      // console.log("⚠️ EventListener destroyed, skipping connection");
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      // console.log("🔧 WebSocket already connected");
      return;
    }

    // Clean up any existing connection
    this.cleanup();
    this.connectionAttempts++;

    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error("EventListener destroyed"));
        return;
      }

      try {
        const wsEndpoint = this.getWebSocketEndpoint();
        // console.log(
        //   `🔧 Connecting to: ${wsEndpoint} (attempt ${this.connectionAttempts})`
        // );

        this.ws = new WebSocket(wsEndpoint);

        // Helius-recommended timeout (15-30 seconds)
        const connectTimeout = setTimeout(() => {
          // console.log("❌ WebSocket connection timeout after 20 seconds");
          if (this.ws) {
            this.ws.close();
          }
          reject(new Error("Connection timeout"));
        }, 20000);

        this.ws.onopen = () => {
          if (this.isDestroyed) {
            this.ws?.close();
            clearTimeout(connectTimeout);
            reject(new Error("EventListener destroyed"));
            return;
          }

          clearTimeout(connectTimeout);
          // console.log("🚀 WebSocket connected successfully");

          this.status.isConnected = true;
          this.status.error = null;
          this.status.reconnectAttempts = 0;
          this.status.lastEventTime = Date.now();
          this.lastHealthCheck = Date.now();
          this.connectionAttempts = 0; // Reset on successful connection

          // Start health monitoring
          this.startHealthMonitoring();

          // Subscribe after ensuring connection is stable
          setTimeout(() => {
            if (!this.isDestroyed && this.ws?.readyState === WebSocket.OPEN) {
              this.subscribeToProgramLogs();
            }
          }, 1000); // 1 second delay for stability

          resolve();
        };

        this.ws.onmessage = (event) => {
          if (!this.isDestroyed) {
            this.handleMessage(event);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout);
          // console.log(
          //   `❌ WebSocket closed: Code=${event.code}, Reason="${
          //     event.reason || "No reason provided"
          //   }"`
          // );

          this.status.isConnected = false;
          this.status.subscriptionId = null;
          this.stopHealthMonitoring();

          // Only reconnect for unexpected closures (not manual disconnects)
          if (!this.isDestroyed && event.code !== 1000 && event.code !== 1001) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          console.error("❌ WebSocket error:", error);
          this.setError("WebSocket connection error");
          // Don't reject here - let onclose handle reconnection
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket:", error);
        reject(error);
      }
    });
  }

  // Health monitoring with ping/pong and activity checks
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Send health check
        try {
          this.ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              method: "getHealth",
              id: `health_${Date.now()}`,
            })
          );
          this.lastHealthCheck = Date.now();
        } catch (error) {
          console.warn("❌ Failed to send health check:", error);
          this.ws.close();
          return;
        }

        // Check for stale connection
        const timeSinceLastActivity =
          Date.now() - (this.status.lastEventTime || 0);
        const timeSinceLastHealth = Date.now() - this.lastHealthCheck;

        if (timeSinceLastActivity > 90000) {
          // 90 seconds
          console.warn("⚠️ No activity for 90s, connection may be stale");
          this.ws.close(1006, "Stale connection - no activity");
        } else if (timeSinceLastHealth > 120000) {
          // 2 minutes
          console.warn("⚠️ No health check response for 2 minutes");
          this.ws.close(1006, "Stale connection - no health response");
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Enhanced message handling with proper error handling
  private handleMessage(event: MessageEvent): void {
    if (this.isDestroyed) return;

    try {
      const data = JSON.parse(event.data);

      // Update last activity time for any message
      this.status.lastEventTime = Date.now();

      // Handle health check responses
      if (
        data.id &&
        typeof data.id === "string" &&
        data.id.startsWith("health_")
      ) {
        // console.log("💓 Health check response received");
        this.lastHealthCheck = Date.now();
        return;
      }

      // Handle subscription confirmation
      if (data.result && typeof data.result === "number" && data.id === 1) {
        this.status.subscriptionId = data.result;
        // console.log(
        //   "✅ logsSubscribe confirmed, Subscription ID:",
        //   data.result
        // );
        return;
      }

      // Handle subscription errors
      if (data.error) {
        console.error("❌ Subscription error:", data.error);

        if (data.error.code === 429) {
          console.warn("🚦 Rate limited by Helius");
          this.handleRateLimit();
        } else if (data.error.code === -32602) {
          console.error(
            "❌ Invalid subscription parameters:",
            data.error.message
          );
          this.setError(`Invalid subscription: ${data.error.message}`);
        } else if (data.error.code === -32603) {
          console.error("❌ Internal server error:", data.error.message);
          this.handleServerError();
        } else {
          this.setError(`Subscription error: ${data.error.message}`);
        }
        return;
      }

      // Handle log notifications (YOUR PROGRAM EVENTS!)
      if (data.method === "logsNotification") {
        // console.log(
        //   "📋 Log notification received:",
        //   data.params.result.signature
        // );
        this.parseEventLogs(data.params.result);
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
    }
  }

  // Subscribe to program logs with enhanced error handling
  private subscribeToProgramLogs(): void {
    if (this.isDestroyed) {
      // console.log("⚠️ EventListener destroyed, skipping subscription");
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // console.log("⚠️ WebSocket not ready for subscription");
      return;
    }

    if (this.status.subscriptionId) {
      // console.log("⚠️ Already subscribed with ID:", this.status.subscriptionId);
      return;
    }

    const subscribeMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "logsSubscribe",
      params: [
        { mentions: [this.config.programId] },
        {
          commitment: this.config.commitment,
          encoding: "base64", // Explicit encoding
        },
      ],
    };

    try {
      this.ws.send(JSON.stringify(subscribeMessage));
      // console.log(
      //   "📡 logsSubscribe message sent for program:",
      //   this.config.programId
      // );
    } catch (error) {
      console.error("❌ Failed to send subscription:", error);
      this.setError("Failed to send subscription");
    }
  }

  // Parse Anchor events from logs
  private parseEventLogs(logData: any): void {
    if (this.isDestroyed) return;

    const logs = logData.value.logs;
    const signature = logData.value.signature;

    if (!this.program) {
      console.warn("⚠️ Program not initialized, skipping log parsing");
      return;
    }

    // Look for program data logs that contain events
    for (const log of logs) {
      if (log.startsWith("Program data: ")) {
        try {
          const eventData = log.slice("Program data: ".length);
          const decodedEvent = this.program.coder.events.decode(eventData);

          if (decodedEvent) {
            // console.log(
            //   `🎉 Decoded event: ${decodedEvent.name}`,
            //   decodedEvent.data
            // );
            this.processEvent(decodedEvent.name, decodedEvent.data, signature);
          }
        } catch (error) {
          // Not all program data logs are events, this is normal
          continue;
        }
      }
    }
  }

  // Process and emit events
  private processEvent(
    eventName: string,
    eventData: any,
    signature: string
  ): void {
    if (this.isDestroyed) return;

    // console.log(`🎉 Event received: ${eventName}`, eventData);

    this.status.lastEventTime = Date.now();

    // Add to history
    this.eventHistory.unshift({
      name: eventName,
      data: eventData,
      signature,
      timestamp: Date.now(),
    });

    // Keep only last 50 events
    if (this.eventHistory.length > 50) {
      this.eventHistory = this.eventHistory.slice(0, 50);
    }

    // Call appropriate handler
    this.callEventHandler(eventName, eventData, signature);
  }

  // Call the appropriate event handler
  private callEventHandler(
    eventName: string,
    eventData: any,
    signature: string
  ): void {
    if (this.isDestroyed) return;

    try {
      switch (eventName) {
        case "battleRoomCancelled":
          this.eventHandlers.battleRoomCancelled?.(
            eventData as BattleRoomCancelled,
            signature
          );
          break;
        case "warriorReleased":
          this.eventHandlers.warriorReleased?.(
            eventData as WarriorReleased,
            signature
          );
          break;
        case "delegationEvent":
          this.eventHandlers.delegationEvent?.(
            eventData as DelegationEvent,
            signature
          );
          break;
        case "joinEvent":
          this.eventHandlers.JoinEvent?.(eventData as JoinEvent, signature);
          break;
        case "readyEvent":
          this.eventHandlers.readyEvent?.(eventData as ReadyEvent, signature);
          break;
        case "battleStart":
          this.eventHandlers.battleStart?.(eventData as BattleStart, signature);
          break;
        case "warriorStatusEvent":
          this.eventHandlers.warriorStatusEvent?.(
            eventData as WarriorStatusEvent,
            signature
          );
          break;
        case "winnerEvent":
          this.eventHandlers.winnerEvent?.(eventData as WinnerEvent, signature);
          break;
        case "answerSubmitEvent":
          this.eventHandlers.answerSubmitEvent?.(
            eventData as AnswerSubmitEvent,
            signature
          );
          break;
        case "answerRevealEvent":
          this.eventHandlers.answerRevealEvent?.(
            eventData as AnswerRevealEvent,
            signature
          );
          break;
        case "scoresEvent":
          this.eventHandlers.scoresEvent?.(eventData as ScoresEvent, signature);
          break;
        case "damageEvent":
          this.eventHandlers.damageEvent?.(eventData as DamageEvent, signature);
          break;
        case "eliminationEvent":
          this.eventHandlers.eliminationEvent?.(
            eventData as EliminationEvent,
            signature
          );
          break;
        case "next":
          this.eventHandlers.nextEvent?.(eventData as NextEvent, signature);
          break;
        case "warriorCreatedEvent":
          this.eventHandlers.warriorCreatedEvent?.(
            eventData as WarriorCreatedEvent,
            signature
          );
          break;
        default:
          console.warn(`⚠️ Unhandled event: ${eventName}`);
      }
    } catch (error) {
      console.error(`❌ Error in event handler for ${eventName}:`, error);
    }
  }

  // Event registration methods
  setEventHandlers(handlers: GameEventHandlers): void {
    this.eventHandlers = { ...handlers };
  }

  addEventListener<K extends keyof GameEventHandlers>(
    eventName: K,
    handler: NonNullable<GameEventHandlers[K]>
  ): void {
    this.eventHandlers[eventName] = handler;
  }

  removeEventListener(eventName: keyof GameEventHandlers): void {
    delete this.eventHandlers[eventName];
  }

  // Enhanced error handling
  private handleRateLimit(): void {
    console.warn("🚦 Rate limited by Helius, implementing backoff...");

    // Longer backoff for rate limits (5-15 seconds with jitter)
    const baseDelay = 5000;
    const jitter = Math.random() * 10000; // 0-10 seconds
    const delay = baseDelay + jitter;

    setTimeout(() => {
      if (!this.isDestroyed && this.ws?.readyState === WebSocket.OPEN) {
        // console.log("🔄 Retrying subscription after rate limit backoff");
        this.subscribeToProgramLogs();
      }
    }, delay);
  }

  private handleServerError(): void {
    console.error("🔥 Server error detected, may need to reconnect");
    // For server errors, close connection to trigger reconnection
    if (this.ws) {
      this.ws.close(1006, "Server error - forcing reconnection");
    }
  }

  // Enhanced reconnection with Helius best practices
  private attemptReconnect(): void {
    if (this.isDestroyed) {
      // console.log("⚠️ EventListener destroyed, skipping reconnection");
      return;
    }

    if (this.status.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setError(
        `Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`
      );
      // console.log("❌ Max reconnection attempts reached");
      return;
    }

    this.status.reconnectAttempts++;

    // Helius-recommended exponential backoff with jitter
    const baseDelay = 2000; // Start with 2 seconds
    const maxDelay = 30000; // Cap at 30 seconds
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, this.status.reconnectAttempts - 1),
      maxDelay
    );

    // Add jitter (±20% of delay) to prevent thundering herd
    const jitterRange = exponentialDelay * 0.4; // 40% range
    const jitter = (Math.random() - 0.5) * jitterRange;
    const delay = Math.max(exponentialDelay + jitter, 1000); // Minimum 1 second

    // console.log(
    //   `🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${
    //     this.status.reconnectAttempts
    //   }/${this.config.maxReconnectAttempts})`
    // );

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect().catch((error) => {
          console.error("❌ Reconnection failed:", error);
          if (!this.isDestroyed) {
            this.attemptReconnect();
          }
        });
      }
    }, delay);
  }

  // Utility methods
  private getHttpEndpoint(): string {
    const baseUrl =
      this.config.network === "mainnet"
        ? "https://mainnet.helius-rpc.com"
        : "https://devnet.helius-rpc.com";
    return `${baseUrl}/?api-key=${this.config.heliusApiKey}`;
  }

  private getWebSocketEndpoint(): string {
    const baseUrl =
      this.config.network === "mainnet"
        ? "wss://mainnet.helius-rpc.com"
        : "wss://devnet.helius-rpc.com";
    return `${baseUrl}/?api-key=${this.config.heliusApiKey}`;
  }

  private setError(error: string): void {
    this.status.error = error;
    console.error("❌ Event listener error:", error);
  }

  // Enhanced cleanup method
  private cleanup(): void {
    this.stopHealthMonitoring();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      // Remove event listeners to prevent callbacks after cleanup
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, "Manual disconnect");
      }
      this.ws = null;
    }

    this.status.isConnected = false;
    this.status.subscriptionId = null;
  }

  // Proper cleanup method
  disconnect(): void {
    // console.log("🔌 Disconnecting event listener...");
    this.isDestroyed = true;
    this.cleanup();
    this.eventHandlers = {};
    // console.log("✅ Event listener disconnected");
  }

  // Check if listener is still active
  isActive(): boolean {
    return !this.isDestroyed && this.status.isConnected;
  }

  //method to manually trigger reconnection (useful for debugging)
  forceReconnect(): void {
    // console.log("🔄 Force reconnecting...");
    if (this.ws) {
      this.ws.close(1000, "Manual reconnection");
    }
  }

  // Get connection diagnostics
  getDiagnostics(): any {
    return {
      isDestroyed: this.isDestroyed,
      isConnected: this.status.isConnected,
      subscriptionId: this.status.subscriptionId,
      reconnectAttempts: this.status.reconnectAttempts,
      lastEventTime: this.status.lastEventTime,
      lastHealthCheck: this.lastHealthCheck,
      connectionAttempts: this.connectionAttempts,
      wsReadyState: this.ws?.readyState,
      eventHistoryCount: this.eventHistory.length,
    };
  }
}

export default SolanaEventListener;
