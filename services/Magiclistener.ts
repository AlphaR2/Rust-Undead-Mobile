import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import * as anchor from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { PROGRAM_IDL } from '../config/program'
import {
  AnswerRevealEvent,
  AnswerSubmitEvent,
  BattleStart,
  DamageEvent,
  EliminationEvent,
  EventHistoryItem,
  EventListenerStatus,
  GameEventHandlers,
  NextEvent,
  ScoresEvent,
  WarriorStatusEvent,
  WinnerEvent,
} from '../types/events'

interface MagicBlockEventListenerConfig {
  network: 'mainnet' | 'devnet' | 'testnet'
  programId: string
  autoConnect: boolean
  maxReconnectAttempts: number
  reconnectDelay: number
  commitment: 'processed' | 'confirmed' | 'finalized'
  endpoint?: string
}

interface DebugLog {
  timestamp: number
  signature: string
  logs: string[]
  processed: boolean
}

export class MagicBlockEventListener {
  private ws: WebSocket | null = null
  private status: EventListenerStatus = {
    isConnected: false,
    error: null,
    subscriptionId: null,
    reconnectAttempts: 0,
    lastEventTime: null,
  }

  private config: MagicBlockEventListenerConfig
  private program: anchor.Program<UndeadTypes> | null = null
  private eventHandlers: GameEventHandlers = {}
  private eventHistory: EventHistoryItem[] = []

  // Enhanced connection management
  private reconnectTimeout: NodeJS.Timeout | any = null
  private healthCheckInterval: NodeJS.Timeout | any = null
  private battlePollingInterval: NodeJS.Timeout | any = null
  private isDestroyed: boolean = false
  private connectionAttempts: number = 0
  private lastHealthCheck: number = 0

  // Debug and monitoring
  private debugLogs: DebugLog[] = []
  private accountSubscriptionId: number | null = null
  private battleRoomToMonitor: string | null = null

  constructor(config: Partial<MagicBlockEventListenerConfig> & { programId: string }) {
    this.config = {
      network: 'devnet',
      autoConnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      commitment: 'confirmed',
      endpoint: undefined,
      ...config,
    }

    // console.log("🔮 Creating new MagicBlock EventListener instance");
  }

  // Getters for status and history
  getStatus(): EventListenerStatus {
    return { ...this.status }
  }

  getEventHistory(): EventHistoryItem[] {
    return [...this.eventHistory]
  }

  clearEventHistory(): void {
    this.eventHistory = []
  }

  // Initialize the MagicBlock event listener
  async initialize(): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('MagicBlockEventListener has been destroyed')
    }

    try {
      // console.log("🔧 Initializing MagicBlock event listener...");

      // Setup Anchor program for event parsing using MagicBlock connection
      const httpEndpoint = this.getHttpEndpoint()
      const connection = new Connection(httpEndpoint, this.config.commitment)

      const provider = new anchor.AnchorProvider(connection, {} as any, anchor.AnchorProvider.defaultOptions())

      // Use static IDL
      const idl = PROGRAM_IDL as UndeadTypes
      if (!idl) {
        throw new Error('Static IDL not found')
      }

      // console.log("✅ Using static IDL for MagicBlock event listener");
      this.program = new anchor.Program(idl, provider)

      if (this.config.autoConnect && !this.isDestroyed) {
        await this.connect()
      }
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'MagicBlock initialization failed')
      throw error
    }
  }

  // Enhanced connect method for MagicBlock
  async connect(): Promise<void> {
    if (this.isDestroyed) {
      // console.log("⚠️ MagicBlockEventListener destroyed, skipping connection");
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      // console.log("🔧 MagicBlock WebSocket already connected");
      return
    }

    // Clean up any existing connection
    this.cleanup()
    this.connectionAttempts++

    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('MagicBlockEventListener destroyed'))
        return
      }

      try {
        const wsEndpoint = this.getWebSocketEndpoint()
        // console.log(
        //   `🔧 Connecting to MagicBlock: ${wsEndpoint} (attempt ${this.connectionAttempts})`
        // );

        this.ws = new WebSocket(wsEndpoint)

        // MagicBlock-recommended timeout (15-30 seconds)
        const connectTimeout = setTimeout(() => {
          // console.log(
          //   "❌ MagicBlock WebSocket connection timeout after 20 seconds"
          // );
          if (this.ws) {
            this.ws.close()
          }
          reject(new Error('MagicBlock connection timeout'))
        }, 20000)

        this.ws.onopen = () => {
          if (this.isDestroyed) {
            this.ws?.close()
            clearTimeout(connectTimeout)
            reject(new Error('MagicBlockEventListener destroyed'))
            return
          }

          clearTimeout(connectTimeout)
          // console.log("🚀 MagicBlock WebSocket connected successfully");

          this.status.isConnected = true
          this.status.error = null
          this.status.reconnectAttempts = 0
          this.status.lastEventTime = Date.now()
          this.lastHealthCheck = Date.now()
          this.connectionAttempts = 0 // Reset on successful connection

          // Start health monitoring
          this.startHealthMonitoring()

          // Subscribe after ensuring connection is stable
          setTimeout(() => {
            if (!this.isDestroyed && this.ws?.readyState === WebSocket.OPEN) {
              this.subscribeToProgramLogs()
              // Also subscribe to account changes for battle rooms
              this.subscribeToAccountChanges()
            }
          }, 1000) // 1 second delay for stability

          resolve()
        }

        this.ws.onmessage = (event) => {
          if (!this.isDestroyed) {
            this.handleMessage(event)
          }
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectTimeout)
          // console.log(
          //   `❌ MagicBlock WebSocket closed: Code=${event.code}, Reason="${
          //     event.reason || "No reason provided"
          //   }"`
          // );

          this.status.isConnected = false
          this.status.subscriptionId = null
          this.accountSubscriptionId = null
          this.stopHealthMonitoring()

          // Only reconnect for unexpected closures (not manual disconnects)
          if (!this.isDestroyed && event.code !== 1000 && event.code !== 1001) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout)
          console.error('❌ MagicBlock WebSocket error:', error)
          this.setError('MagicBlock WebSocket connection error')
          // Don't reject here - let onclose handle reconnection
        }
      } catch (error) {
        console.error('❌ Error creating MagicBlock WebSocket:', error)
        reject(error)
      }
    })
  }

  // Health monitoring with ping/pong and activity checks
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Send health check
        try {
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'getHealth',
              id: `health_mb_${Date.now()}`,
            }),
          )
          this.lastHealthCheck = Date.now()
        } catch (error) {
          console.warn('❌ Failed to send MagicBlock health check:', error)
          this.ws.close()
          return
        }

        // Check for stale connection
        const timeSinceLastActivity = Date.now() - (this.status.lastEventTime || 0)
        const timeSinceLastHealth = Date.now() - this.lastHealthCheck

        if (timeSinceLastActivity > 90000) {
          // 90 seconds
          console.warn('⚠️ MagicBlock: No activity for 90s, connection may be stale')
          this.ws.close(1006, 'Stale connection - no activity')
        } else if (timeSinceLastHealth > 120000) {
          // 2 minutes
          console.warn('⚠️ MagicBlock: No health check response for 2 minutes')
          this.ws.close(1006, 'Stale connection - no health response')
        }
      }
    }, 30000) // Check every 30 seconds
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // Enhanced message handling with comprehensive logging
  private handleMessage(event: MessageEvent): void {
    if (this.isDestroyed) return

    try {
      const data = JSON.parse(event.data)

      // Update last activity time for any message
      this.status.lastEventTime = Date.now()

      // Log ALL messages for debugging
      // console.log("🔍 [ER] Received message:", {
      //   method: data.method,
      //   id: data.id,
      //   hasResult: !!data.result,
      //   hasError: !!data.error,
      //   hasParams: !!data.params,
      //   timestamp: Date.now(),
      // });

      // Handle health check responses
      if (data.id && typeof data.id === 'string' && data.id.startsWith('health_mb_')) {
        // console.log("💓 MagicBlock health check response received");
        this.lastHealthCheck = Date.now()
        return
      }

      // Handle log subscription confirmation
      if (data.result && typeof data.result === 'number' && data.id === 1) {
        this.status.subscriptionId = data.result
        // console.log(
        //   "✅ MagicBlock logsSubscribe confirmed, Subscription ID:",
        //   data.result
        // );
        return
      }

      // Handle account subscription confirmation
      if (data.result && typeof data.result === 'number' && data.id === 2) {
        this.accountSubscriptionId = data.result
        // console.log(
        //   "✅ MagicBlock accountSubscribe confirmed, Subscription ID:",
        //   data.result
        // );
        return
      }

      // Handle subscription errors
      if (data.error) {
        console.error('❌ MagicBlock subscription error:', data.error)
        this.handleSubscriptionError(data.error)
        return
      }

      // Handle log notifications (CRITICAL FOR BATTLE START EVENTS!)
      if (data.method === 'logsNotification') {
        const signature = data.params?.result?.signature
        const logs = data.params?.result?.value?.logs || []

        // console.log("📋 [ER] Log notification received:", {
        //   signature,
        //   logCount: logs.length,
        //   firstLog: logs[0],
        // });

        // Store raw logs for debugging
        this.debugLogs.push({
          timestamp: Date.now(),
          signature,
          logs,
          processed: false,
        })

        // Keep only last 20 debug logs
        if (this.debugLogs.length > 20) {
          this.debugLogs = this.debugLogs.slice(-20)
        }

        this.parseEventLogs(data.params.result)
      }

      // Handle account notifications (backup detection)
      if (data.method === 'accountNotification') {
        // console.log("👤 [ER] Account notification received:", {
        //   signature: data.params?.result?.context?.slot,
        //   pubkey: data.params?.result?.value?.pubkey,
        // });
        this.handleAccountChange(data.params.result)
      }
    } catch (error) {
      console.error('❌ Error parsing MagicBlock WebSocket message:', error)
      // console.log("🔍 Raw message data:", event.data);
    }
  }

  // Enhanced subscription with multiple filters
  private subscribeToProgramLogs(): void {
    if (this.isDestroyed) {
      // console.log(
      //   "⚠️ MagicBlockEventListener destroyed, skipping subscription"
      // );
      return
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // console.log("⚠️ MagicBlock WebSocket not ready for subscription");
      return
    }

    if (this.status.subscriptionId) {
      // console.log(
      //   "⚠️ MagicBlock already subscribed with ID:",
      //   this.status.subscriptionId
      // );
      return
    }

    const subscribeMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'logsSubscribe',
      params: [
        { mentions: [this.config.programId] },
        {
          commitment: this.config.commitment,
          encoding: 'base64',
        },
      ],
    }

    try {
      this.ws.send(JSON.stringify(subscribeMessage))
      // console.log(
      //   "📡 MagicBlock logsSubscribe message sent for program:",
      //   this.config.programId
      // );
    } catch (error) {
      console.error('❌ Failed to send MagicBlock subscription:', error)
      this.setError('Failed to send MagicBlock subscription')
    }
  }

  // Subscribe to account changes as backup
  private subscribeToAccountChanges(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.accountSubscriptionId) {
      return
    }

    // Subscribe to all accounts for this program
    const accountSubscribeMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'accountSubscribe',
      params: [
        this.config.programId,
        {
          commitment: this.config.commitment,
          encoding: 'base64+zstd',
        },
      ],
    }

    try {
      this.ws.send(JSON.stringify(accountSubscribeMessage))
      // console.log("📡 MagicBlock accountSubscribe sent for program accounts");
    } catch (error) {
      console.error('❌ Failed to send account subscription:', error)
    }
  }

  // Handle account changes as backup event detection
  private handleAccountChange(accountData: any): void {
    if (!accountData?.value?.data || !this.program) return

    try {
      // Try to decode as BattleRoom account
      const decoded = this.program.account.battleRoom.coder.accounts.decode(
        'battleRoom',
        Buffer.from(accountData.value.data[0], 'base64'),
      )

      // console.log("👤 [ER] Decoded battle room state:", decoded.state);

      // Check if battle state indicates it started
      if (decoded.state === 'InProgress' || decoded.state === 'Active') {
        // console.log("🎯 [ER] Detected battle start via account change!");
        this.processEvent(
          'battleStart',
          {
            fromAccountChange: true,
            battleState: decoded.state,
            timestamp: Date.now(),
          },
          'account_change',
        )
      }
    } catch (error: any) {
      // Not a battle room account or different format
      // console.log("🔍 [ER] Account change not a battle room:", error.message);
    }
  }

  // Enhanced log parsing with multiple detection methods
  private parseEventLogs(logData: any): void {
    if (this.isDestroyed) return

    const logs = logData.value.logs
    const signature = logData.value.signature

    if (!this.program) {
      console.warn('⚠️ MagicBlock program not initialized, skipping log parsing')
      return
    }

    // console.log("🔍 [ER] Parsing logs from signature:", signature);
    // console.log("📋 [ER] Raw logs:", logs);

    let eventFound = false

    // Method 1: Standard Anchor event parsing
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i]

      if (log.startsWith('Program data: ')) {
        try {
          const eventData = log.slice('Program data: '.length)
          // console.log("🔍 [ER] Attempting to decode event data:", eventData);

          const decodedEvent = this.program.coder.events.decode(eventData)

          if (decodedEvent) {
            // console.log(
            //   `🎉 [ER] Successfully decoded event: ${decodedEvent.name}`,
            //   decodedEvent.data
            // );
            this.processEvent(decodedEvent.name, decodedEvent.data, signature)
            eventFound = true
          }
        } catch (error: any) {
          // console.log(
          //   "🔍 [ER] Failed to decode as event (normal for non-event logs):",
          //   error.message
          // );
          continue
        }
      }
      // Method 2: Look for specific battle-related log patterns
      else if (log.includes('battleStart') || log.includes('start_battle') || log.includes('Battle started')) {
        // console.log("🎯 [ER] Found battleStart indicator in raw log:", log);
        this.processEvent(
          'battleStart',
          {
            fromRawLog: true,
            logContent: log,
            signature,
          },
          signature,
        )
        eventFound = true
      }
      // Method 3: Check for program invoke/success patterns
      else if (log.startsWith(`Program ${this.config.programId} invoke`)) {
        // console.log("🔍 [ER] Program invoke log:", log);
        // Look ahead for instruction-specific logs
        if (log.includes('start_battle')) {
          // console.log("🎯 [ER] Found start_battle instruction!");
          this.processEvent(
            'battleStart',
            {
              fromInvokeLog: true,
              instruction: 'start_battle',
              signature,
            },
            signature,
          )
          eventFound = true
        }
      } else if (log.startsWith(`Program ${this.config.programId} success`)) {
        // console.log("✅ [ER] Program success log:", log);
        // Check if previous logs indicated battle start
        const previousLogs = logs.slice(0, i)
        const hasBattleStart = previousLogs.some(
          (prevLog: string) =>
            prevLog.includes('start_battle') || prevLog.includes('battleStart') || prevLog.includes('Battle started'),
        )

        if (hasBattleStart) {
          // console.log("🎯 [ER] Battle start confirmed by success log!");
          this.processEvent(
            'battleStart',
            {
              fromSuccessLog: true,
              confirmedBySuccess: true,
              signature,
            },
            signature,
          )
          eventFound = true
        }
      }
    }

    // Mark this log as processed
    const debugLog = this.debugLogs.find((log) => log.signature === signature)
    if (debugLog) {
      debugLog.processed = true
    }

    // If no events found but logs seem battle-related, create synthetic event
    if (!eventFound) {
      const isLikelyBattleStart = logs.some(
        (log: string) =>
          log.includes('start_battle') ||
          log.includes('battleStart') ||
          log.includes('Battle started') ||
          log.includes('ER Battle') ||
          (log.includes('Program') && log.includes('success') && logs.some((l: string) => l.includes('battle'))),
      )

      if (isLikelyBattleStart) {
        // console.log(
        //   "🎯 [ER] Detected battleStart from log patterns, creating synthetic event"
        // );
        this.processEvent(
          'battleStart',
          {
            synthetic: true,
            signature,
            detectedFromPatterns: true,
            timestamp: Date.now(),
          },
          signature,
        )
      }
    }
  }

  // Process and emit events
  private processEvent(eventName: string, eventData: any, signature: string): void {
    if (this.isDestroyed) return

    // console.log(`🎉 [ER] Event received: ${eventName}`, eventData);

    this.status.lastEventTime = Date.now()

    // Add to history with ER prefix
    this.eventHistory.unshift({
      name: `[ER] ${eventName}`,
      data: eventData,
      signature,
      timestamp: Date.now(),
    })

    // Keep only last 50 events
    if (this.eventHistory.length > 50) {
      this.eventHistory = this.eventHistory.slice(0, 50)
    }

    // Call appropriate handler
    this.callEventHandler(eventName, eventData, signature)
  }

  // Call the appropriate event handler - focused on rollup events
  private callEventHandler(eventName: string, eventData: any, signature: string): void {
    if (this.isDestroyed) return

    try {
      switch (eventName) {
        case 'battleStart':
          this.eventHandlers.battleStart?.(eventData as BattleStart, signature)
          break
        case 'warriorStatusEvent':
          this.eventHandlers.warriorStatusEvent?.(eventData as WarriorStatusEvent, signature)
          break
        case 'winnerEvent':
          this.eventHandlers.winnerEvent?.(eventData as WinnerEvent, signature)
          break
        case 'answerSubmitEvent':
          this.eventHandlers.answerSubmitEvent?.(eventData as AnswerSubmitEvent, signature)
          break
        case 'answerRevealEvent':
          this.eventHandlers.answerRevealEvent?.(eventData as AnswerRevealEvent, signature)
          break
        case 'scoresEvent':
          this.eventHandlers.scoresEvent?.(eventData as ScoresEvent, signature)
          break
        case 'damageEvent':
          this.eventHandlers.damageEvent?.(eventData as DamageEvent, signature)
          break
        case 'eliminationEvent':
          this.eventHandlers.eliminationEvent?.(eventData as EliminationEvent, signature)
          break
        case 'next':
          this.eventHandlers.nextEvent?.(eventData as NextEvent, signature)
          break
        default:
          console.warn(`⚠️ [ER] Unhandled event: ${eventName}`)
      }
    } catch (error) {
      console.error(`❌ [ER] Error in event handler for ${eventName}:`, error)
    }
  }

  // Add polling as ultimate fallback
  startBattleStatePolling(battleRoomPda: string): void {
    if (this.battlePollingInterval) {
      clearInterval(this.battlePollingInterval)
    }

    this.battleRoomToMonitor = battleRoomPda
    // console.log(
    //   "🔄 Starting battle state polling as backup for events on:",
    //   battleRoomPda
    // );

    this.battlePollingInterval = setInterval(async () => {
      try {
        const httpEndpoint = this.getHttpEndpoint()
        const connection = new Connection(httpEndpoint, this.config.commitment)

        const battleRoomData = await connection.getAccountInfo(new PublicKey(battleRoomPda))

        if (battleRoomData && this.program) {
          const decoded = this.program.account.battleRoom.coder.accounts.decode('battleRoom', battleRoomData.data)

          // console.log("🔄 [ER] Polling battle room state:", decoded.state);

          // Check if battle state indicates it started
          if (decoded.state === 'InProgress' || decoded.state === 'Active') {
            // console.log("🎯 [ER] Detected battle start via polling!");
            this.processEvent(
              'battleStart',
              {
                polled: true,
                battleState: decoded.state,
                timestamp: Date.now(),
              },
              'polled',
            )

            // Stop polling once we detect the start
            if (this.battlePollingInterval) {
              clearInterval(this.battlePollingInterval)
              this.battlePollingInterval = null
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in battle state polling:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 60 seconds to prevent infinite polling
    setTimeout(() => {
      if (this.battlePollingInterval) {
        clearInterval(this.battlePollingInterval)
        this.battlePollingInterval = null
        // console.log("⏰ Battle state polling timeout reached");
      }
    }, 60000)
  }

  // Manual check for battle events
  async checkForBattleEvents(battleRoomPda: string): Promise<void> {
    try {
      // console.log("🔍 [ER] Manually checking for battle events...");

      const httpEndpoint = this.getHttpEndpoint()
      const connection = new Connection(httpEndpoint)

      // Get recent transactions for the battle room
      const signatures = await connection.getSignaturesForAddress(new PublicKey(battleRoomPda), { limit: 10 })

      // console.log(
      //   "📝 [ER] Recent signatures for battle room:",
      //   signatures.map((s) => s.signature)
      // );

      for (const sigInfo of signatures) {
        try {
          const tx = await connection.getTransaction(sigInfo.signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0,
          })

          if (tx?.meta?.logMessages) {
            // console.log(
            //   `🔍 [ER] Logs for ${sigInfo.signature}:`,
            //   tx.meta.logMessages
            // );

            const hasBattleStart = tx.meta.logMessages.some(
              (log) => log.includes('battleStart') || log.includes('start_battle') || log.includes('Battle started'),
            )

            if (hasBattleStart) {
              // console.log("🎯 [ER] Found battle start in transaction logs!");
              this.processEvent(
                'battleStart',
                {
                  foundInLogs: true,
                  signature: sigInfo.signature,
                },
                sigInfo.signature,
              )
              break
            }
          }
        } catch (error) {
          // console.log(
          //   `❌ Error fetching transaction ${sigInfo.signature}:`,
          //   error
          // );
        }
      }
    } catch (error) {
      console.error('❌ Error checking for battle events:', error)
    }
  }

  // Event registration methods
  setEventHandlers(handlers: GameEventHandlers): void {
    this.eventHandlers = { ...handlers }
  }

  addEventListener<K extends keyof GameEventHandlers>(eventName: K, handler: NonNullable<GameEventHandlers[K]>): void {
    this.eventHandlers[eventName] = handler
  }

  removeEventListener(eventName: keyof GameEventHandlers): void {
    delete this.eventHandlers[eventName]
  }

  // Enhanced error handling
  private handleSubscriptionError(error: any): void {
    if (error.code === 429) {
      console.warn('🚦 Rate limited by MagicBlock')
      this.handleRateLimit()
    } else if (error.code === -32602) {
      console.error('❌ MagicBlock invalid subscription parameters:', error.message)
      this.setError(`Invalid MagicBlock subscription: ${error.message}`)
    } else if (error.code === -32603) {
      console.error('❌ MagicBlock internal server error:', error.message)
      this.handleServerError()
    } else {
      this.setError(`MagicBlock subscription error: ${error.message}`)
    }
  }

  private handleRateLimit(): void {
    console.warn('🚦 Rate limited by MagicBlock, implementing backoff...')

    const baseDelay = 5000
    const jitter = Math.random() * 10000
    const delay = baseDelay + jitter

    setTimeout(() => {
      if (!this.isDestroyed && this.ws?.readyState === WebSocket.OPEN) {
        // console.log(
        //   "🔄 Retrying MagicBlock subscription after rate limit backoff"
        // );
        this.subscribeToProgramLogs()
      }
    }, delay)
  }

  private handleServerError(): void {
    console.error('🔥 MagicBlock server error detected, may need to reconnect')
    if (this.ws) {
      this.ws.close(1006, 'MagicBlock server error - forcing reconnection')
    }
  }

  // Enhanced reconnection with exponential backoff
  private attemptReconnect(): void {
    if (this.isDestroyed) {
      // console.log(
      //   "⚠️ MagicBlockEventListener destroyed, skipping reconnection"
      // );
      return
    }

    if (this.status.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setError(`MagicBlock max reconnection attempts (${this.config.maxReconnectAttempts}) reached`)
      // console.log("❌ MagicBlock max reconnection attempts reached");
      return
    }

    this.status.reconnectAttempts++

    const baseDelay = 2000
    const maxDelay = 30000
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, this.status.reconnectAttempts - 1), maxDelay)

    const jitterRange = exponentialDelay * 0.4 // 40% range
    const jitter = (Math.random() - 0.5) * jitterRange
    const delay = Math.max(exponentialDelay + jitter, 1000) // Minimum 1 second

    // console.log(
    //   `🔄 MagicBlock reconnecting in ${Math.round(delay)}ms (attempt ${
    //     this.status.reconnectAttempts
    //   }/${this.config.maxReconnectAttempts})`
    // );

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect().catch((error) => {
          console.error('❌ MagicBlock reconnection failed:', error)
          if (!this.isDestroyed) {
            this.attemptReconnect()
          }
        })
      }
    }, delay)
  }

  // Utility methods for MagicBlock endpoints
  private getHttpEndpoint(): string {
    if (this.config.endpoint) {
      // Convert WSS to HTTPS for HTTP calls
      return this.config.endpoint.replace('wss://', 'https://').replace('ws://', 'http://')
    }

    // Use same environment variables as your existing MagicBlock setup
    const httpEndpoint = process.env.NEXT_PUBLIC_ER_PROVIDER_ENDPOINT || 'https://devnet.magicblock.app/'

    // console.log("🔮 MagicBlock HTTP endpoint:", httpEndpoint);
    return httpEndpoint
  }

  private getWebSocketEndpoint(): string {
    if (this.config.endpoint) {
      return this.config.endpoint
    }

    const wsEndpoint = process.env.NEXT_PUBLIC_ER_WS_ENDPOINT || 'wss://devnet.magicblock.app/'

    // console.log("🔮 MagicBlock WebSocket endpoint:", wsEndpoint);
    return wsEndpoint
  }

  private setError(error: string): void {
    this.status.error = error
    console.error('❌ MagicBlock event listener error:', error)
  }

  // Enhanced cleanup method
  private cleanup(): void {
    this.stopHealthMonitoring()

    if (this.battlePollingInterval) {
      clearInterval(this.battlePollingInterval)
      this.battlePollingInterval = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      // Remove event listeners to prevent callbacks after cleanup
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Manual disconnect')
      }
      this.ws = null
    }

    this.status.isConnected = false
    this.status.subscriptionId = null
    this.accountSubscriptionId = null
    this.battleRoomToMonitor = null
  }

  // Proper cleanup method
  disconnect(): void {
    // console.log("🔌 Disconnecting MagicBlock event listener...");
    this.isDestroyed = true
    this.cleanup()
    this.eventHandlers = {}
    this.debugLogs = []
    // console.log("✅ MagicBlock event listener disconnected");
  }

  // Check if listener is still active
  isActive(): boolean {
    return !this.isDestroyed && this.status.isConnected
  }

  // Method to manually trigger reconnection (useful for debugging)
  forceReconnect(): void {
    // console.log("🔄 Force reconnecting MagicBlock...");
    if (this.ws) {
      this.ws.close(1000, 'Manual reconnection')
    }
  }

  // Enhanced diagnostics with debug info
  getDiagnostics(): any {
    return {
      type: 'MagicBlock',
      isDestroyed: this.isDestroyed,
      isConnected: this.status.isConnected,
      subscriptionId: this.status.subscriptionId,
      accountSubscriptionId: this.accountSubscriptionId,
      reconnectAttempts: this.status.reconnectAttempts,
      lastEventTime: this.status.lastEventTime,
      lastHealthCheck: this.lastHealthCheck,
      connectionAttempts: this.connectionAttempts,
      wsReadyState: this.ws?.readyState,
      eventHistoryCount: this.eventHistory.length,
      debugLogsCount: this.debugLogs.length,
      battleRoomToMonitor: this.battleRoomToMonitor,
      recentLogs: this.debugLogs.slice(-5), // Last 5 logs
      recentEvents: this.eventHistory.slice(0, 3), // Last 3 events
      endpoints: {
        http: this.getHttpEndpoint(),
        ws: this.getWebSocketEndpoint(),
      },
      programId: this.config.programId,
      config: {
        network: this.config.network,
        commitment: this.config.commitment,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
      },
    }
  }

  // Helper method to get debug information
  getDebugInfo(): any {
    return {
      debugLogs: this.debugLogs,
      eventHistory: this.eventHistory,
      status: this.status,
      config: this.config,
      isPolling: !!this.battlePollingInterval,
      battleRoomBeingMonitored: this.battleRoomToMonitor,
    }
  }

  // Method to clear debug logs
  clearDebugLogs(): void {
    this.debugLogs = []
    // console.log("🧹 MagicBlock debug logs cleared");
  }
}

export default MagicBlockEventListener
