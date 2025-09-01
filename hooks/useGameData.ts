'use client'
import { BN } from '@coral-xyz/anchor'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createEphemeralProgram,
  useEphemeralProgram,
  useMagicBlockProvider,
  usePDAs,
  useUndeadProgram,
  useWalletInfo,
} from './useUndeadProgram'

import { PROGRAM_ID } from '@/config/program'
import {
  AnchorBattleRoom,
  AnchorGameConfig,
  AnchorUndeadWarrior,
  AnchorUserProfile,
  BattleState,
  convertBattleState,
  convertUserPersona,
  GameConfig,
  ProgramAccount,
  UserProfile,
  Warrior,
} from '../types/undead'

// Program account types
type UndeadWarriorProgramAccount = ProgramAccount<AnchorUndeadWarrior>

//Battle room state types
interface BattleRoomParticipant {
  publicKey: string
  warriorPda: string
  warriorName?: string
  isCreator: boolean
}

export interface BattleRoomState {
  roomId: string
  creator: BattleRoomParticipant | null
  joiner: BattleRoomParticipant | null
  state: AnchorBattleRoom
  battleStatus: BattleState
  isReady: boolean
}

// Network info type
type NetworkInfo = {
  name: string
  color: string
  bgColor: string
  borderColor: string
}

// Cache interface
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Rate limiter class
class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private lastRequestTime = 0
  private minInterval: number

  constructor(minIntervalMs: number = 2000) {
    this.minInterval = minIntervalMs
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime

      if (timeSinceLastRequest < this.minInterval) {
        await new Promise((resolve) => setTimeout(resolve, this.minInterval - timeSinceLastRequest))
      }

      const fn = this.queue.shift()
      if (fn) {
        this.lastRequestTime = Date.now()
        await fn()
      }
    }

    this.processing = false
  }
}

// Memory cache class
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTtl: number

  constructor(defaultTtlMs: number = 30000) {
    this.defaultTtl = defaultTtlMs
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTtl
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }
    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  clear(): void {
    this.cache.clear()
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

const getRpcEndpoint = (): string => {
  const envRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL

  if (envRpc && envRpc.trim()) {
    try {
      new URL(envRpc)
      return envRpc
    } catch (error) {
      console.warn('Invalid RPC URL in environment variable, falling back to default:', error)
    }
  }

  return 'https://api.devnet.solana.com'
}

// Network detection function
const getNetworkInfo = (rpcUrl: string): NetworkInfo => {
  const url = rpcUrl.toLowerCase()

  if (url.includes('mainnet') || url.includes('api.mainnet-beta.solana.com')) {
    return {
      name: 'Mainnet',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
    }
  }

  if (url.includes('devnet') || url.includes('api.devnet.solana.com')) {
    return {
      name: 'Devnet',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30',
    }
  }

  if (url.includes('testnet') || url.includes('api.testnet.solana.com')) {
    return {
      name: 'Testnet',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30',
    }
  }

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return {
      name: 'Localhost',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
    }
  }

  return {
    name: 'Custom',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
  }
}

const RPC_ENDPOINT = getRpcEndpoint()

export const useGameData = () => {
  // Replace Privy with Dynamic wallet system
  const {
    publicKey,
    isConnected,
    isAuthenticated,
    address: userAddress,
    name: walletName,
    isLoading: walletLoading,
    connection: walletConnection,
  } = useWalletInfo()

  // Initialize rate limiter and cache - only once per hook instance
  const rateLimiter = useRef(new RateLimiter(2500)) // 2.5 second intervals
  const cache = useRef(new MemoryCache(60000)) // 1 minute default cache
  const requestInProgress = useRef(new Set<string>()) // Track ongoing requests

  const magicBlockProvider = useMagicBlockProvider()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)

  // Memoize ephemeral program to prevent recreation
  const ephemeralProgramToUse = useMemo(() => {
    if (!magicBlockProvider) {
      return null
    }

    if (ephemeralProgram) {
      return ephemeralProgram
    }

    // console.log("🔧 Creating ephemeral program manually...");
    return createEphemeralProgram(PROGRAM_ID, magicBlockProvider.wallet)
  }, [ephemeralProgram, magicBlockProvider])

  // Use wallet connection if available, otherwise fallback to default
  const connection = useMemo(() => {
    if (walletConnection) {
      return walletConnection
    }

    return new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    })
  }, [walletConnection])

  // Memoize network info
  const networkInfo = useMemo(() => {
    if (walletConnection) {
      return getNetworkInfo(walletConnection.rpcEndpoint)
    }
    return getNetworkInfo(RPC_ENDPOINT)
  }, [walletConnection])

  const program = useUndeadProgram()
  const { configPda, profilePda, achievementsPda, getWarriorPda } = usePDAs(publicKey)

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userWarriors, setUserWarriors] = useState<Warrior[]>([])
  const [singleWarriorDetails, setSingleWarriorDetails] = useState<Warrior | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasInitiallyLoaded = useRef(false)
  const isCurrentlyLoading = useRef(false)

  // Clear cache when wallet changes
  useEffect(() => {
    if (publicKey) {
      cache.current.invalidate()
      requestInProgress.current.clear()
    }
  }, [publicKey?.toString()])

  const fetchBalance = useCallback(async () => {
    if (!connection || !publicKey || balanceLoading) return

    setBalanceLoading(true)
    setBalanceError(null)

    try {
      const lamports = await connection.getBalance(publicKey)
      const solBalance = lamports / LAMPORTS_PER_SOL
      setBalance(solBalance)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalanceError('Failed to load balance')
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [connection, publicKey, balanceLoading])

  const fetchGameConfig = useCallback(async () => {
    if (!program.program || !configPda) return

    try {
      const config: AnchorGameConfig = await program.program.account.config.fetch(configPda)
      setGameConfig({
        admin: config.admin,
        cooldownTime: config.cooldownTime,
        createdAt: config.createdAt,
        totalWarriors: config.totalWarriors,
        totalBattles: config.totalBattles,
        isPaused: config.isPaused,
      })
    } catch (error: any) {
      // console.log("Game config not found (program not initialized)");
      setGameConfig(null)
    }
  }, [program.program, configPda])

  const fetchUserProfile = useCallback(async () => {
    if (!program.program || !profilePda || !publicKey) return

    try {
      const profile: AnchorUserProfile = await program.program.account.userProfile.fetch(profilePda)
      setUserProfile({
        owner: profile.owner,
        username: profile.username,
        userPersona: convertUserPersona(profile.userPersona),
        warriorsCreated: profile.warriorsCreated,
        totalBattlesWon: profile.totalBattlesWon,
        totalBattlesLost: profile.totalBattlesLost,
        totalPoints: new BN(profile.totalPoints),
        totalBattlesFought: profile.totalBattlesFought,
        joinDate: new BN(profile.joinDate),
      })
    } catch (error: any) {
      // console.log("User profile not found (not created yet)");
      setUserProfile(null)
    }
  }, [program.program, profilePda, publicKey])

  // get all warrior details
  const getSingleWarriorDetails = async (warriorPda: PublicKey) => {
    if (!program.program || !warriorPda) {
      return
    }
    try {
      const warrior = await program.program.account.undeadWarrior.fetch(warriorPda)
      setSingleWarriorDetails({
        name: warrior.name,
        dna: warrior.dna,
        owner: warrior.owner,
        baseAttack: warrior.baseAttack,
        baseDefense: warrior.baseDefense,
        baseKnowledge: warrior.baseKnowledge,
        currentHp: warrior.currentHp,
        maxHp: warrior.maxHp,
        warriorClass: warrior.warriorClass,
        battlesWon: warrior.battlesWon,
        battlesLost: warrior.battlesLost,
        level: warrior.level,
        lastBattleAt: warrior.lastBattleAt,
        cooldownExpiresAt: warrior.cooldownExpiresAt,
        createdAt: new BN(warrior.createdAt),
        experiencePoints: new BN(warrior.experiencePoints.toNumber()),
        address: warriorPda,
        imageRarity: warrior.imageRarity,
        imageIndex: warrior.imageIndex,
        imageUri: warrior.imageUri,
        isOnCooldown: warrior.cooldownExpiresAt.toNumber() > Date.now() / 1000,
      })
    } catch (error) {
      console.warn('Could not fetch warrior details:', error)
    }
  }

  const fetchUserWarriors = useCallback(async () => {
    if (!program.program || !publicKey) {
      setUserWarriors([])
      return
    }

    const cacheKey = `user-warriors-${publicKey.toString()}`

    // Check cache first
    const cached = cache.current.get<Warrior[]>(cacheKey)
    if (cached) {
      // console.log("📋 Using cached user warriors");
      setUserWarriors(cached)
      return
    }

    // Check if request is  in progress
    if (requestInProgress.current.has(cacheKey)) {
      // console.log("⏳ User warriors request already in progress");
      return
    }

    try {
      requestInProgress.current.add(cacheKey)

      const warriors = await rateLimiter.current.add(async () => {
        // console.log("🔍 Fetching user warriors from blockchain...");

        // Get all program accounts that are warriors
        const allWarriorAccounts: UndeadWarriorProgramAccount[] | undefined =
          await program.program?.account.undeadWarrior.all()

        if (!allWarriorAccounts) {
          return
        }
        // Filter by owner
        const userWarriorAccounts = allWarriorAccounts.filter((account: UndeadWarriorProgramAccount) =>
          account.account.owner.equals(publicKey),
        )

        // Transform raw Anchor types to clean frontend types
        const warriors: Warrior[] = userWarriorAccounts.map((account: UndeadWarriorProgramAccount) => ({
          name: account.account.name,
          dna: account.account.dna,
          owner: account.account.owner,
          baseAttack: account.account.baseAttack,
          baseDefense: account.account.baseDefense,
          baseKnowledge: account.account.baseKnowledge,
          currentHp: account.account.currentHp,
          maxHp: account.account.maxHp,
          warriorClass: account.account.warriorClass,
          battlesWon: account.account.battlesWon,
          battlesLost: account.account.battlesLost,
          level: account.account.level,
          lastBattleAt: account.account.lastBattleAt,
          cooldownExpiresAt: account.account.cooldownExpiresAt,
          createdAt: account.account.createdAt.toNumber(),
          experiencePoints: account.account.experiencePoints.toNumber(),
          address: account.publicKey,
          imageRarity: account.account.imageRarity,
          imageIndex: account.account.imageIndex,
          imageUri: account.account.imageUri,
          isOnCooldown: account.account.cooldownExpiresAt.toNumber() > Date.now() / 1000,
        }))

        return warriors
      })

      // Cache the result
      cache.current.set(cacheKey, warriors, 30000) // 30 second cache for user warriors

      if (!warriors) {
        return
      }
      setUserWarriors(warriors)
    } catch (error: any) {
      console.error('Error fetching user warriors:', error)
      setError('Failed to fetch warriors')
      setUserWarriors([])
    } finally {
      requestInProgress.current.delete(cacheKey)
    }
  }, [program.program, publicKey])

  /**
   * Fetch delegated warriors owned by Magic Block delegation program
   * These are warriors currently delegated to Ephemeral Rollup
   */
  const fetchDelegatedWarriors = useCallback(
    async (
      playerPubkey: PublicKey,
    ): Promise<{
      success: boolean
      warriors: Warrior[]
      error?: string
    }> => {
      if (!program.program || !connection) {
        return {
          success: false,
          warriors: [],
          error: 'Program or connection not available',
        }
      }

      const cacheKey = `delegated-warriors-${playerPubkey.toString()}`

      // Check cache first
      const cached = cache.current.get<{
        success: boolean
        warriors: Warrior[]
        error?: string
      }>(cacheKey)
      if (cached) {
        return cached
      }

      // Check if request is already in progress
      if (requestInProgress.current.has(cacheKey)) {
        // console.log("⏳ Delegated warriors request already in progress");
        return { success: false, warriors: [], error: 'Request in progress' }
      }

      try {
        requestInProgress.current.add(cacheKey)

        const result = await rateLimiter.current.add(async () => {
          // Get warriors owned by the DELEGATION PROGRAM, not the player
          const delegationProgramId = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh')

          // Get ALL warrior accounts

          const delegatedAccounts = await ephemeralProgramToUse?.account.undeadWarrior.all()

          if (!delegatedAccounts || delegatedAccounts.length === 0) {
            console.warn('No delegated warrior accounts found')
            return {
              success: true,
              warriors: [],
            }
          }

          // console.log(`📊 Found ${delegatedAccounts} total warrior accounts`);

          const playerDelegatedWarriors: Warrior[] = []

          // Process accounts to find delegated warriors
          for (const { account: warrior, publicKey: accountPubkey } of delegatedAccounts) {
            try {
              // Check if this account is currently owned by delegation program
              const currentAccountInfo = await connection.getAccountInfo(accountPubkey)

              if (currentAccountInfo && currentAccountInfo.owner.equals(delegationProgramId)) {
                // Check if the ORIGINAL owner (stored in data) is the player
                if (warrior.owner.equals(playerPubkey)) {
                  const delegatedWarrior: Warrior = {
                    name: warrior.name,
                    owner: warrior.owner, // This is the original owner (player)
                    baseAttack: warrior.baseAttack,
                    baseDefense: warrior.baseDefense,
                    baseKnowledge: warrior.baseKnowledge,
                    dna: warrior.dna,
                    createdAt: warrior.createdAt.toNumber(),
                    lastBattleAt: warrior.lastBattleAt,
                    cooldownExpiresAt: warrior.cooldownExpiresAt,
                    address: accountPubkey,
                    currentHp: warrior.currentHp,
                    maxHp: warrior.maxHp,
                    warriorClass: warrior.warriorClass,
                    battlesWon: warrior.battlesWon,
                    battlesLost: warrior.battlesLost,
                    level: warrior.level,
                    experiencePoints: warrior.experiencePoints.toNumber(),
                    imageUri: warrior.imageUri,
                    imageRarity: warrior.imageRarity,
                    imageIndex: warrior.imageIndex,
                    isOnCooldown: warrior.cooldownExpiresAt.toNumber() > Date.now() / 1000,
                  }

                  playerDelegatedWarriors.push(delegatedWarrior)
                }
              }
            } catch (error) {
              console.warn(`Failed to process warrior account ${accountPubkey.toString()}:`, error)
            }
          }

          return {
            success: true,
            warriors: playerDelegatedWarriors,
          }
        })

        // Cache the result for 2 minutes
        cache.current.set(cacheKey, result, 120000)

        return result
      } catch (error: any) {
        console.error('❌ Error fetching delegated warriors:', error)

        const errorResult = {
          success: false,
          warriors: [],
          error: error.message || 'Failed to fetch delegated warriors',
        }

        // Cache error result for shorter time (30 seconds)
        cache.current.set(cacheKey, errorResult, 30000)

        return errorResult
      } finally {
        requestInProgress.current.delete(cacheKey)
      }
    },
    [program.program, connection, ephemeralProgramToUse],
  )

  /// fetch battle room state

  // Add this to your useGameData hook
  const checkBattleProgress = useCallback(
    async (
      battleRoomPda: string,
    ): Promise<{
      success: boolean
      battleState?: BattleState | any
      battleStarted?: boolean
      error?: string
    }> => {
      if (!program.program || !battleRoomPda) {
        return { success: false, error: 'Program or battle room PDA required' }
      }

      const cacheKey = `battle-progress-${battleRoomPda}`

      try {
        const result = await rateLimiter.current.add(async () => {
          try {
            const battleRoomAccount = await program.program?.account.battleRoom.fetch(new PublicKey(battleRoomPda))

            // Check if battle is in progress
            if (!battleRoomAccount) {
              return {
                success: false,
                error: 'Battle room account not found',
              }
            }

            const convertedState = convertBattleState(battleRoomAccount.state)
            const battleStarted = convertedState === BattleState.InProgress

            return {
              success: true,
              battleState: battleRoomAccount.state,
              battleStarted,
              currentQuestion: battleRoomAccount.currentQuestion,
              battleStartTime: battleRoomAccount.battleStartTime?.toNumber() || 0,
            }
          } catch (fetchError: any) {
            console.error('Error fetching battle room account:', fetchError)
            return {
              success: false,
              error: `Failed to fetch battle room: ${fetchError.message || 'Unknown error'}`,
            }
          }
        })

        // Handle the case where result might be undefined
        if (!result) {
          return {
            success: false,
            error: 'Failed to process battle room data',
          }
        }

        // Cache for short time (5 seconds)
        cache.current.set(cacheKey, result, 5000)

        return result
      } catch (error: any) {
        console.error('❌ Error checking battle progress:', error)
        return {
          success: false,
          error: error.message || 'Failed to check battle progress',
        }
      }
    },
    [program.program],
  )

  const fetchBattleRoomState = useCallback(
    async (battleRoomPda: string): Promise<{ state: BattleRoomState } | null> => {
      if (!program.program || !publicKey) {
        console.error('Program or publicKey not available')
        return null
      }

      const cacheKey = `battle-room-${battleRoomPda}`

      // Check cache first
      const cached = cache.current.get<{ state: BattleRoomState }>(cacheKey)
      if (cached) {
        // console.log("📋 Using cached battle room state");
        return cached
      }

      try {
        if (!ephemeralProgramToUse) {
          return null // Ensure ephemeral program is available
        }

        const result = await rateLimiter.current.add(async () => {
          try {
            const battleRoomAccount = await ephemeralProgramToUse.account.battleRoom.fetch(new PublicKey(battleRoomPda))

            // Check if battleRoomAccount exists
            if (!battleRoomAccount) {
              throw new Error('Battle room account not found in ER')
            }

            // Helper function to get warrior details
            const getWarriorDetails = async (warriorPda: PublicKey): Promise<{ name: string } | null> => {
              try {
                const warrior = await ephemeralProgramToUse.account.undeadWarrior.fetch(warriorPda)
                return { name: warrior?.name || 'Unknown Warrior' }
              } catch (error) {
                console.warn('Could not fetch warrior details:', error)
                return { name: 'Unknown Warrior' }
              }
            }

            // Get creator info (Player A)
            let creator: BattleRoomParticipant | null = null
            if (battleRoomAccount.playerA && battleRoomAccount.warriorA) {
              const warriorDetails = await getWarriorDetails(battleRoomAccount.warriorA)
              creator = {
                publicKey: battleRoomAccount.playerA.toString(),
                warriorPda: battleRoomAccount.warriorA.toString(),
                warriorName: warriorDetails?.name || 'Unknown Warrior',
                isCreator: true,
              }
            }

            // Get joiner info (Player B)
            let joiner: BattleRoomParticipant | null = null
            if (battleRoomAccount.playerB && battleRoomAccount.warriorB) {
              const warriorDetails = await getWarriorDetails(battleRoomAccount.warriorB)
              joiner = {
                publicKey: battleRoomAccount.playerB.toString(),
                warriorPda: battleRoomAccount.warriorB.toString(),
                warriorName: warriorDetails?.name || 'Unknown Warrior',
                isCreator: false,
              }
            }

            const battleRoomState: BattleRoomState = {
              roomId: battleRoomAccount.roomId.toString(),
              creator,
              joiner,
              state: battleRoomAccount,
              battleStatus: battleRoomAccount.state,
              isReady: battleRoomAccount.playerAReady && battleRoomAccount.playerBReady,
            }

            return { state: battleRoomState }
          } catch (fetchError: any) {
            console.error('Error fetching battle room state in ER:', fetchError)
            throw fetchError
          }
        })

        // Handle the case where result might be undefined
        if (!result) {
          console.error('Failed to process battle room state in ER')
          return null
        }

        // Cache for 10 seconds (battle room state changes frequently)
        cache.current.set(cacheKey, result, 10000)

        return result
      } catch (error: any) {
        console.error('❌ Error fetching battle room state in ER:', error)
        return null
      }
    },
    [program.program, publicKey, ephemeralProgramToUse],
  )

  //fetch battle room state in ER
  const fetchBattleRoomStateInER = useCallback(
    async (battleRoomPda: string): Promise<{ state: BattleRoomState } | null> => {
      if (!program.program || !publicKey) {
        console.error('Program or publicKey not available')
        return null
      }

      const cacheKey = `battle-room-er-${battleRoomPda}`

      // Check cache first
      const cached = cache.current.get<{ state: BattleRoomState }>(cacheKey)
      if (cached) {
        // console.log("📋 Using cached battle room state");
        return cached
      }

      try {
        // console.log("🔍 Fetching battle room state for:", battleRoomPda);

        const result = await rateLimiter.current.add(async () => {
          try {
            const battleRoomAccount = await program.program?.account.battleRoom.fetch(new PublicKey(battleRoomPda))

            // Check if battleRoomAccount exists
            if (!battleRoomAccount) {
              throw new Error('Battle room account not found')
            }

            // Helper function to get warrior details
            const getWarriorDetails = async (warriorPda: PublicKey): Promise<{ name: string } | null> => {
              try {
                const warrior = await program.program?.account.undeadWarrior.fetch(warriorPda)
                return { name: warrior?.name || 'Unknown Warrior' }
              } catch (error) {
                console.warn('Could not fetch warrior details:', error)
                return { name: 'Unknown Warrior' }
              }
            }

            // Get creator info (Player A)
            let creator: BattleRoomParticipant | null = null
            if (battleRoomAccount.playerA && battleRoomAccount.warriorA) {
              const warriorDetails = await getWarriorDetails(battleRoomAccount.warriorA)
              creator = {
                publicKey: battleRoomAccount.playerA.toString(),
                warriorPda: battleRoomAccount.warriorA.toString(),
                warriorName: warriorDetails?.name || 'Unknown Warrior',
                isCreator: true,
              }
            }

            // Get joiner info (Player B)
            let joiner: BattleRoomParticipant | null = null
            if (battleRoomAccount.playerB && battleRoomAccount.warriorB) {
              const warriorDetails = await getWarriorDetails(battleRoomAccount.warriorB)
              joiner = {
                publicKey: battleRoomAccount.playerB.toString(),
                warriorPda: battleRoomAccount.warriorB.toString(),
                warriorName: warriorDetails?.name || 'Unknown Warrior',
                isCreator: false,
              }
            }

            const battleRoomState: BattleRoomState = {
              roomId: battleRoomAccount.roomId.toString(),
              creator,
              joiner,
              state: battleRoomAccount,
              battleStatus: battleRoomAccount.state,
              isReady: battleRoomAccount.playerAReady && battleRoomAccount.playerBReady,
            }

            return { state: battleRoomState }
          } catch (fetchError: any) {
            console.error('Error fetching battle room state:', fetchError)
            throw fetchError
          }
        })

        // Handle the case where result might be undefined
        if (!result) {
          console.error('Failed to process battle room state')
          return null
        }

        // Cache for 10 seconds (battle room state changes frequently)
        cache.current.set(cacheKey, result, 10000)

        return result
      } catch (error: any) {
        console.error('❌ Error fetching battle room state:', error)
        return null
      }
    },
    [program.program, publicKey],
  )

  //Get opponent info for current user
  const getOpponentInfo = useCallback(
    (battleRoomState: BattleRoomState | null): BattleRoomParticipant | null => {
      if (!battleRoomState || !publicKey) return null

      const currentUserKey = publicKey.toString()

      // If current user is the creator, return joiner as opponent
      if (battleRoomState.creator?.publicKey === currentUserKey) {
        return battleRoomState.joiner
      }

      // If current user is the joiner, return creator as opponent
      if (battleRoomState.joiner?.publicKey === currentUserKey) {
        return battleRoomState.creator
      }

      // User is not in this battle room
      return null
    },
    [publicKey],
  )

  const decodeRoomId = (displayId: string): { roomIdBytes: Uint8Array; battleRoomPda: PublicKey } => {
    try {
      // Restore base64 format
      let base64 = displayId.replace(/[-_]/g, (c) => (c === '-' ? '+' : '/'))

      // Add padding if needed
      while (base64.length % 4) {
        base64 += '='
      }

      // Decode base64 to bytes
      const binaryString = atob(base64)
      const bytes = []
      for (let i = 0; i < binaryString.length; i++) {
        bytes.push(binaryString.charCodeAt(i))
      }

      if (bytes.length !== 32) {
        throw new Error('Invalid room code length')
      }

      const roomIdBytes = new Uint8Array(bytes)

      if (!program.program?.programId) {
        throw new Error('Program not initialized')
      }

      const pdaroomid = Array.from(roomIdBytes)
      const [battleRoomPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('battleroom'), Buffer.from(pdaroomid)],
        program.program.programId,
      )

      return { roomIdBytes, battleRoomPda }
    } catch (error) {
      throw new Error('Invalid room code format')
    }
  }

  //Check if current user is in the battle room
  const isUserInBattleRoom = useCallback(
    (battleRoomState: BattleRoomState | null): boolean => {
      if (!battleRoomState || !publicKey) return false

      const currentUserKey = publicKey.toString()
      return (
        battleRoomState.creator?.publicKey === currentUserKey || battleRoomState.joiner?.publicKey === currentUserKey
      )
    },
    [publicKey],
  )

  //Get current user's role in battle room
  const getUserRoleInBattleRoom = useCallback(
    (battleRoomState: BattleRoomState | null): 'creator' | 'joiner' | null => {
      if (!battleRoomState || !publicKey) return null

      const currentUserKey = publicKey.toString()

      if (battleRoomState.creator?.publicKey === currentUserKey) {
        return 'creator'
      }

      if (battleRoomState.joiner?.publicKey === currentUserKey) {
        return 'joiner'
      }

      return null
    },
    [publicKey],
  )

  // Memoize the load function to prevent dependency changes
  const loadAllData = useCallback(async () => {
    if (!program.isReady || !publicKey || !isConnected || isCurrentlyLoading.current) {
      return
    }

    isCurrentlyLoading.current = true
    setLoading(true)
    setError(null)

    try {
      await fetchBalance()
      await new Promise((resolve) => setTimeout(resolve, 100))

      await fetchGameConfig()
      await new Promise((resolve) => setTimeout(resolve, 100))

      await fetchUserProfile()
      await new Promise((resolve) => setTimeout(resolve, 100))

      await fetchUserWarriors()

      hasInitiallyLoaded.current = true
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
      isCurrentlyLoading.current = false
    }
  }, [program.isReady, publicKey, isConnected, fetchGameConfig, fetchBalance, fetchUserProfile, fetchUserWarriors])

  const refreshData = useCallback(async () => {
    if (!program.isReady || !publicKey || !isConnected) return

    // Clear cache for this user
    cache.current.invalidate()
    hasInitiallyLoaded.current = false
    await loadAllData()
  }, [program.isReady, publicKey, isConnected, loadAllData])

  // Memoize the stable values to prevent unnecessary re-renders
  const stableValues = useMemo(
    () => ({
      isConnected,
      isAuthenticated,
      publicKeyString: publicKey?.toString() || null,
      hasProgram: program.isReady,
      walletLoading,
    }),
    [isConnected, isAuthenticated, publicKey, program.isReady, walletLoading],
  )

  // Main effect with stable dependencies
  useEffect(() => {
    if (
      stableValues.isConnected &&
      stableValues.isAuthenticated &&
      stableValues.hasProgram &&
      stableValues.publicKeyString &&
      !stableValues.walletLoading &&
      !hasInitiallyLoaded.current &&
      !isCurrentlyLoading.current
    ) {
      // Small delay to ensure everything is ready
      const timeoutId = setTimeout(() => {
        loadAllData()
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [stableValues, loadAllData])

  useEffect(() => {
    if (!isConnected) {
      setGameConfig(null)
      setUserProfile(null)
      setUserWarriors([])
      setBalance(null)
      setError(null)
      setBalanceError(null)
      hasInitiallyLoaded.current = false
      isCurrentlyLoading.current = false
    }
  }, [isConnected])

  // Handle public key changes - separate effect
  const previousPublicKey = useRef<string | null>(null)
  useEffect(() => {
    const currentKey = publicKey?.toString() || null
    if (previousPublicKey.current !== currentKey) {
      hasInitiallyLoaded.current = false
      isCurrentlyLoading.current = false
      previousPublicKey.current = currentKey

      // Clear old data when switching wallets
      if (currentKey !== previousPublicKey.current) {
        setGameConfig(null)
        setUserProfile(null)
        setUserWarriors([])
        setBalance(null)
        setError(null)
        setBalanceError(null)
      }
    }
  }, [publicKey])

  const hasWarriors = userWarriors.length > 0

  // Create a user object compatible with existing code
  const user = useMemo(() => {
    if (!isConnected || !publicKey) return null

    return {
      id: publicKey.toString(),
      wallet: {
        address: userAddress,
        walletClientType: walletName,
      },
      // Add other properties as needed for compatibility
    }
  }, [isConnected, publicKey, userAddress, walletName])

  return {
    // Dynamic wallet equivalents
    ready: !walletLoading && program.isReady,
    authenticated: isAuthenticated,
    isConnected,
    user,
    userAddress,
    publicKey,
    connection,
    networkInfo,
    gameConfig,
    userProfile,
    balance,
    balanceError,
    balanceLoading,
    userWarriors,
    singleWarriorDetails,
    hasWarriors,
    loading,
    fetchBalance,
    error,
    refreshData,
    pdas: { configPda, profilePda, achievementsPda },

    getSingleWarriorDetails,
    // delegated warriors
    fetchDelegatedWarriors,
    checkBattleProgress,
    // Battle room functions
    fetchBattleRoomState,
    fetchBattleRoomStateInER,
    decodeRoomId,
    getOpponentInfo,
    isUserInBattleRoom,
    getUserRoleInBattleRoom,
    getWarriorPda,
  }
}
