'use client'
import { BN } from '@coral-xyz/anchor'
import { usePrivy } from '@privy-io/expo'
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
import { checkDelegationWithMagicRouter } from '@/utils/battle'
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

// ========== TYPES ==========
type UndeadWarriorProgramAccount = ProgramAccount<AnchorUndeadWarrior>

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

interface NetworkInfo {
  name: string
  color: string
  bgColor: string
  borderColor: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface FetchResult<T> {
  success: boolean
  data?: T
  error?: string
}

// ========== CONSTANTS ==========
const DEFAULT_CACHE_TTL = 60000 // 1 minute
const SHORT_CACHE_TTL = 30000 // 30 seconds
const BATTLE_CACHE_TTL = 10000 // 10 seconds
const DELEGATION_CACHE_TTL = 120000 // 2 minutes
const RATE_LIMIT_INTERVAL = 2500 // 2.5 seconds
const CONNECTION_TIMEOUT = 60000 // 60 seconds

// ========== UTILITY CLASSES ==========
class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private lastRequestTime = 0
  private readonly minInterval: number

  constructor(minIntervalMs: number = RATE_LIMIT_INTERVAL) {
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

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    try {
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
    } finally {
      this.processing = false
    }
  }
}

class MemoryCache {
  private readonly cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTtl: number

  constructor(defaultTtlMs: number = DEFAULT_CACHE_TTL) {
    this.defaultTtl = defaultTtlMs
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtl
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

// ========== UTILITY FUNCTIONS ==========
const getRpcEndpoint = (): string => {
  const envRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL

  if (envRpc?.trim()) {
    try {
      new URL(envRpc)
      return envRpc
    } catch (error) {
      console.warn('Invalid RPC URL in environment variable, falling back to default:', error)
    }
  }

  return 'https://api.devnet.solana.com'
}

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

const safeToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (value?.toNumber) return value.toNumber()
  return Number(value) || 0
}

const createConnectionWithTimeout = (endpoint: string): Connection => {
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: CONNECTION_TIMEOUT,
    disableRetryOnRateLimit: false,
  })
}

const RPC_ENDPOINT = getRpcEndpoint()

// ========== MAIN HOOK ==========
export const useGameData = () => {
  const { isReady, user } = usePrivy()
  const { publicKey, isConnected } = useWalletInfo()

  // Singleton instances - stable refs to prevent recreation
  const rateLimiter = useRef(new RateLimiter())
  const cache = useRef(new MemoryCache())
  const requestInProgress = useRef(new Set<string>())
  const hasInitiallyLoaded = useRef(false)
  const isCurrentlyLoading = useRef(false)
  const previousPublicKey = useRef<string | null>(null)

  // Dependencies
  const magicBlockProvider = useMagicBlockProvider()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)
  const program = useUndeadProgram()
  const { configPda, profilePda, achievementsPda, getWarriorPda } = usePDAs(publicKey)

  // State
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userWarriors, setUserWarriors] = useState<Warrior[]>([])
  const [singleWarriorDetails, setSingleWarriorDetails] = useState<Warrior | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized values
  const connection = useMemo(() => createConnectionWithTimeout(RPC_ENDPOINT), [])
  const networkInfo = useMemo(() => getNetworkInfo(RPC_ENDPOINT), [])

  const ephemeralProgramToUse = useMemo(() => {
    if (!magicBlockProvider) return null
    if (ephemeralProgram) return ephemeralProgram
    return createEphemeralProgram(PROGRAM_ID, magicBlockProvider.wallet)
  }, [ephemeralProgram, magicBlockProvider])

  // Clear cache when wallet changes
  useEffect(() => {
    if (publicKey) {
      cache.current.invalidate()
      requestInProgress.current.clear()
    }
  }, [publicKey?.toString()])

  // ========== FETCH FUNCTIONS ==========
  const fetchBalance = useCallback(async (): Promise<void> => {
    if (!connection || !publicKey || balanceLoading) return

    setBalanceLoading(true)
    setBalanceError(null)

    try {
      const lamports = await connection.getBalance(publicKey)
      const solBalance = lamports / LAMPORTS_PER_SOL
      setBalance(solBalance)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load balance'
      console.error('Error fetching balance:', error)
      setBalanceError(errorMessage)
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [connection, publicKey, balanceLoading])

  const fetchGameConfig = useCallback(async (): Promise<void> => {
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
    } catch (error) {
      setGameConfig(null)
    }
  }, [program.program, configPda])

  const fetchUserProfile = useCallback(async (): Promise<void> => {
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
    } catch (error) {
      setUserProfile(null)
    }
  }, [program.program, profilePda, publicKey])

  const getSingleWarriorDetails = useCallback(
    async (warriorPda: PublicKey): Promise<void> => {
      if (!program.program || !warriorPda) return

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
    },
    [program.program],
  )

  const fetchUserWarriors = useCallback(async (): Promise<void> => {
    if (!program.program || !publicKey) {
      setUserWarriors([])
      return
    }

    const cacheKey = `user-warriors-${publicKey.toString()}`

    // Check cache first
    const cached = cache.current.get<Warrior[]>(cacheKey)
    if (cached) {
      setUserWarriors(cached)
      return
    }

    // Check if request is in progress
    if (requestInProgress.current.has(cacheKey)) {
      return
    }

    try {
      requestInProgress.current.add(cacheKey)

      const warriors = await rateLimiter.current.add(async () => {
        if (!program.program) {
          return
        }
        const allWarriorAccounts: UndeadWarriorProgramAccount[] = await program.program.account.undeadWarrior.all()

        const userWarriorAccounts = allWarriorAccounts.filter((account: UndeadWarriorProgramAccount) =>
          account.account.owner.equals(publicKey),
        )

        return userWarriorAccounts.map(
          (account: UndeadWarriorProgramAccount): Warrior => ({
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
          }),
        )
      })

      cache.current.set(cacheKey, warriors, SHORT_CACHE_TTL)
      setUserWarriors(warriors!)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch warriors'
      console.error('Error fetching user warriors:', error)
      setError(errorMessage)
      setUserWarriors([])
    } finally {
      requestInProgress.current.delete(cacheKey)
    }
  }, [program.program, publicKey])

  const handleCheckBattleState = useCallback(
    async (battleRoomPda: string): Promise<boolean> => {
      if (!battleRoomPda || !program.program || !connection) {
        return false
      }

      try {
        const delegationProgramId = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh')

        const battleRoomData = await rateLimiter.current.add(async () => {
          const accountInfo = await connection.getAccountInfo(new PublicKey(battleRoomPda))

          if (!accountInfo || !accountInfo.owner.equals(delegationProgramId)) {
            return null
          }

          if (!program.program) {
            return null
          }

          return await program.program.account.battleRoom.fetch(new PublicKey(battleRoomPda))
        })

        if (!battleRoomData) {
          return false
        }

        const stateString =
          typeof battleRoomData.state === 'object' ? Object.keys(battleRoomData.state)[0] : battleRoomData.state

        const battleStarted =
          stateString === 'inProgress' || stateString === 'InProgress' || battleRoomData.currentQuestion > 0

        return !battleStarted
      } catch (error) {
        console.error('Error during manual state check:', error)
        return false
      }
    },
    [program.program, connection],
  )

  const useFetchWarriorInEr = useCallback(
    async (battleRoomPda: string, warriorPda: PublicKey): Promise<FetchResult<Warrior>> => {
      if (!ephemeralProgramToUse || !connection || !battleRoomPda || !warriorPda || !publicKey) {
        return {
          success: false,
          error: 'Ephemeral program.program, connection, battle room PDA, or public key not available',
        }
      }

      const cacheKey = `creator-warrior-${battleRoomPda}-${publicKey.toString()}`

      // Check cache first
      const cached = cache.current.get<FetchResult<Warrior>>(cacheKey)
      if (cached) {
        return cached
      }

      // Check if request is in progress
      if (requestInProgress.current.has(cacheKey)) {
        return { success: false, error: 'Request in progress' }
      }

      try {
        requestInProgress.current.add(cacheKey)

        const result = await rateLimiter.current.add(async () => {
          const battleRoomAccount = await ephemeralProgramToUse.account.battleRoom.fetch(new PublicKey(battleRoomPda))

          if (!battleRoomAccount) {
            throw new Error('Battle room not found on Ephemeral Rollup')
          }

          if (!warriorPda) {
            throw new Error('No warrior PDA found for Creator')
          }

          const isDelegated: boolean = await checkDelegationWithMagicRouter(warriorPda.toString())

          const warriorAccount = await ephemeralProgramToUse.account.undeadWarrior.fetch(warriorPda)

          if (!isDelegated) {
            throw new Error('Warrior account not delegated')
          }

          const warrior: Warrior = {
            name: warriorAccount.name,
            dna: warriorAccount.dna,
            owner: warriorAccount.owner,
            baseAttack: safeToNumber(warriorAccount.baseAttack),
            baseDefense: safeToNumber(warriorAccount.baseDefense),
            baseKnowledge: safeToNumber(warriorAccount.baseKnowledge),
            currentHp: safeToNumber(warriorAccount.currentHp),
            maxHp: safeToNumber(warriorAccount.maxHp),
            warriorClass: warriorAccount.warriorClass,
            battlesWon: safeToNumber(warriorAccount.battlesWon),
            battlesLost: safeToNumber(warriorAccount.battlesLost),
            level: safeToNumber(warriorAccount.level),
            lastBattleAt: safeToNumber(warriorAccount.lastBattleAt),
            cooldownExpiresAt: safeToNumber(warriorAccount.cooldownExpiresAt),
            createdAt: new BN(safeToNumber(warriorAccount.createdAt)),
            experiencePoints: new BN(safeToNumber(warriorAccount.experiencePoints)),
            address: new PublicKey(warriorPda),
            imageRarity: warriorAccount.imageRarity,
            imageIndex: warriorAccount.imageIndex,
            imageUri: warriorAccount.imageUri,
            isOnCooldown: safeToNumber(warriorAccount.cooldownExpiresAt) > Date.now() / 1000,
          }

          setSingleWarriorDetails(warrior)

          return { success: true, data: warrior }
        })

        cache.current.set(cacheKey, result, DELEGATION_CACHE_TTL)
        return result
      } catch (error) {
        const errorResult = {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch Creator's warrior",
        }
        cache.current.set(cacheKey, errorResult, SHORT_CACHE_TTL)
        return errorResult
      } finally {
        requestInProgress.current.delete(cacheKey)
      }
    },
    [ephemeralProgramToUse, connection, publicKey],
  )

  const fetchDelegatedWarriors = useCallback(
    async (playerPubkey: PublicKey): Promise<FetchResult<Warrior[]>> => {
      if (!program.program || !connection) {
        return {
          success: false,
          data: [],
          error: 'Program or connection not available',
        }
      }

      const cacheKey = `delegated-warriors-${playerPubkey.toString()}`

      // Check cache first
      const cached = cache.current.get<FetchResult<Warrior[]>>(cacheKey)
      if (cached) {
        return cached
      }

      // Check if request is in progress
      if (requestInProgress.current.has(cacheKey)) {
        return { success: false, data: [], error: 'Request in progress' }
      }

      try {
        requestInProgress.current.add(cacheKey)

        const result = await rateLimiter.current.add(async () => {
          if (!ephemeralProgramToUse) {
            throw new Error('Ephemeral program.program not available')
          }

          const delegationProgramId = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh')
          const delegatedAccounts = await ephemeralProgramToUse.account.undeadWarrior.all()

          if (!delegatedAccounts?.length) {
            return { success: true, data: [] }
          }

          const playerDelegatedWarriors: Warrior[] = []

          for (const { account: warrior, publicKey: accountPubkey } of delegatedAccounts) {
            try {
              const currentAccountInfo = await connection.getAccountInfo(accountPubkey)

              if (currentAccountInfo?.owner.equals(delegationProgramId) && warrior.owner.equals(playerPubkey)) {
                const delegatedWarrior: Warrior = {
                  name: warrior.name,
                  owner: warrior.owner,
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
            } catch (error) {
              console.warn(`Failed to process warrior account ${accountPubkey.toString()}:`, error)
            }
          }

          return { success: true, data: playerDelegatedWarriors }
        })

        cache.current.set(cacheKey, result, DELEGATION_CACHE_TTL)
        return result
      } catch (error) {
        const errorResult = {
          success: false,
          data: [],
          error: error instanceof Error ? error.message : 'Failed to fetch delegated warriors',
        }
        cache.current.set(cacheKey, errorResult, SHORT_CACHE_TTL)
        return errorResult
      } finally {
        requestInProgress.current.delete(cacheKey)
      }
    },
    [program.program, connection, ephemeralProgramToUse],
  )

  const checkBattleProgress = useCallback(
    async (battleRoomPda: string): Promise<FetchResult<any>> => {
      if (!program.program || !battleRoomPda) {
        return { success: false, error: 'Program or battle room PDA required' }
      }

      const cacheKey = `battle-progress-${battleRoomPda}`

      try {
        const result = await rateLimiter.current.add(async () => {
          if (!program.program) {
            return null
          }
          const battleRoomAccount = await program.program.account.battleRoom.fetch(new PublicKey(battleRoomPda))

          const convertedState = convertBattleState(battleRoomAccount.state)
          const battleStarted = convertedState === BattleState.InProgress

          return {
            success: true,
            data: {
              battleState: battleRoomAccount.state,
              battleStarted,
              currentQuestion: battleRoomAccount.currentQuestion,
              battleStartTime: battleRoomAccount.battleStartTime?.toNumber() || 0,
            },
          }
        })

        cache.current.set(cacheKey, result, 5000) // 5 second cache
        return result!
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to check battle progress',
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

      const cached = cache.current.get<{ state: BattleRoomState }>(cacheKey)
      if (cached) {
        return cached
      }

      try {
        const result = await rateLimiter.current.add(async () => {
          if (!program.program) {
            return null
          }
          const battleRoomAccount = await program.program.account.battleRoom.fetch(new PublicKey(battleRoomPda))

          const getWarriorDetails = async (warriorPda: PublicKey): Promise<{ name: string } | null> => {
            try {
              if (!program.program) {
                return null
              }
              const warrior = await program.program.account.undeadWarrior.fetch(warriorPda)
              return { name: warrior.name }
            } catch (error) {
              console.warn('Could not fetch warrior details:', error)
              return { name: 'Unknown Warrior' }
            }
          }

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
        })

        cache.current.set(cacheKey, result, BATTLE_CACHE_TTL)
        return result
      } catch (error) {
        console.error('Error fetching battle room state:', error)
        return null
      }
    },
    [program.program, publicKey],
  )

  const fetchBattleRoomStateInER = useCallback(
    async (battleRoomPda: string): Promise<{ state: BattleRoomState } | null> => {
      if (!ephemeralProgramToUse || !publicKey) {
        console.error('Ephemeral program.program or publicKey not available')
        return null
      }

      const cacheKey = `battle-room-er-${battleRoomPda}`

      const cached = cache.current.get<{ state: BattleRoomState }>(cacheKey)
      if (cached) {
        return cached
      }

      try {
        const result = await rateLimiter.current.add(async () => {
          const battleRoomAccount = await ephemeralProgramToUse.account.battleRoom.fetch(new PublicKey(battleRoomPda))

          const getWarriorDetails = async (warriorPda: PublicKey): Promise<{ name: string } | null> => {
            try {
              const warrior = await ephemeralProgramToUse.account.undeadWarrior.fetch(warriorPda)
              return { name: warrior.name }
            } catch (error) {
              console.warn('Could not fetch warrior details:', error)
              return { name: 'Unknown Warrior' }
            }
          }

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
        })

        cache.current.set(cacheKey, result, BATTLE_CACHE_TTL)
        return result
      } catch (error) {
        console.error('Error fetching battle room state in ER:', error)
        return null
      }
    },
    [ephemeralProgramToUse, publicKey],
  )

  // ========== UTILITY FUNCTIONS ==========
  const getOpponentInfo = useCallback(
    (battleRoomState: BattleRoomState | null): BattleRoomParticipant | null => {
      if (!battleRoomState || !publicKey) return null

      const currentUserKey = publicKey.toString()

      if (battleRoomState.creator?.publicKey === currentUserKey) {
        return battleRoomState.joiner
      }

      if (battleRoomState.joiner?.publicKey === currentUserKey) {
        return battleRoomState.creator
      }

      return null
    },
    [publicKey],
  )

  const decodeRoomId = useCallback(
    (displayId: string): { roomIdBytes: Uint8Array; battleRoomPda: PublicKey } => {
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
    },
    [program.program],
  )

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

  // ========== DATA LOADING ==========
  const loadAllData = useCallback(async (): Promise<void> => {
    if (!program.program || !publicKey || !isConnected || isCurrentlyLoading.current) {
      return
    }

    isCurrentlyLoading.current = true
    setLoading(true)
    setError(null)

    try {
      // Run all data fetching in parallel with proper error handling
      const results = await Promise.allSettled([
        fetchBalance(),
        fetchGameConfig(),
        fetchUserProfile(),
        fetchUserWarriors(),
      ])

      // Log any failures but don't block the entire load
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Data fetch ${index} failed:`, result.reason)
        }
      })

      hasInitiallyLoaded.current = true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Error loading data:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
      isCurrentlyLoading.current = false
    }
  }, [program.program, publicKey, isConnected, fetchGameConfig, fetchBalance, fetchUserProfile, fetchUserWarriors])

  const refreshData = useCallback(async (): Promise<void> => {
    if (!program.program || !publicKey || !isConnected) return

    cache.current.invalidate()
    hasInitiallyLoaded.current = false
    await loadAllData()
  }, [program.program, publicKey, isConnected, loadAllData])

  // ========== EFFECTS ==========
  const stableValues = useMemo(
    () => ({
      isReady,
      isConnected,
      publicKeyString: publicKey?.toString() || null,
      hasProgram: !!program.program,
    }),
    [isReady, isConnected, publicKey, program.program],
  )

  // Main initialization effect
  useEffect(() => {
    if (
      stableValues.isReady &&
      stableValues.isConnected &&
      stableValues.hasProgram &&
      stableValues.publicKeyString &&
      !hasInitiallyLoaded.current &&
      !isCurrentlyLoading.current
    ) {
      const timeoutId = setTimeout(() => {
        loadAllData()
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [stableValues, loadAllData])

  // Reset state when disconnected
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

  // Handle wallet changes
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

  // ========== RETURN VALUES ==========
  const hasWarriors = userWarriors.length > 0
  const userAddress = publicKey?.toString() || null

  return {
    // Core state
    isReady,
    isConnected,
    user,
    userAddress,
    publicKey,
    connection,
    networkInfo,

    // Game data
    gameConfig,
    userProfile,
    balance,
    balanceError,
    balanceLoading,
    userWarriors,
    singleWarriorDetails,
    hasWarriors,
    loading,
    error,

    // PDAs
    pdas: { configPda, profilePda, achievementsPda },

    // Core functions
    fetchBalance,
    refreshData,
    getSingleWarriorDetails,
    getWarriorPda,

    // Delegated warriors
    fetchDelegatedWarriors,
    handleCheckBattleState,
    checkBattleProgress,
    useFetchWarriorInEr,

    // Battle room functions
    fetchBattleRoomState,
    fetchBattleRoomStateInER,
    decodeRoomId,
    getOpponentInfo,
    isUserInBattleRoom,
    getUserRoleInBattleRoom,
  } as const
}
