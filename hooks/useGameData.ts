'use client'
import { BN } from '@coral-xyz/anchor'
import { usePrivy } from '@privy-io/expo'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

global.Buffer = Buffer

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
  convertUserPersona,
  GameConfig,
  ProgramAccount,
  UserProfile,
  Warrior,
} from '../types/undead'

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

const DEFAULT_CACHE_TTL = 60000
const SHORT_CACHE_TTL = 30000
const RATE_LIMIT_INTERVAL = 2500
const CONNECTION_TIMEOUT = 60000

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

const getRpcEndpoint = (): string => {
  const envRpc = process.env.EXPO_PUBLIC_SOLANA_RPC_URL

  if (envRpc?.trim()) {
    try {
      new URL(envRpc)
      return envRpc
    } catch (error) {}
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

export const useGameData = () => {
  const { isReady, user } = usePrivy()
  const { publicKey, isConnected, walletType } = useWalletInfo()
  const { program, isReady: programReady, error: programError } = useUndeadProgram()
  const { configPda, profilePda, achievementsPda, getWarriorPda } = usePDAs(publicKey)

  const rateLimiter = useRef(new RateLimiter())
  const cache = useRef(new MemoryCache())
  const requestInProgress = useRef(new Set<string>())
  const hasInitiallyLoaded = useRef(false)
  const isCurrentlyLoading = useRef(false)

  const magicBlockProvider = useMagicBlockProvider()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userWarriors, setUserWarriors] = useState<Warrior[]>([])
  const [singleWarriorDetails, setSingleWarriorDetails] = useState<Warrior | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = useMemo(() => createConnectionWithTimeout(getRpcEndpoint()), [])
  const networkInfo = useMemo(() => getNetworkInfo(getRpcEndpoint()), [])

  const ephemeralProgramToUse = useMemo(() => {
    if (!magicBlockProvider) return null
    if (ephemeralProgram) return ephemeralProgram
    return createEphemeralProgram(PROGRAM_ID, magicBlockProvider.wallet)
  }, [ephemeralProgram, magicBlockProvider])

  useEffect(() => {
    if (publicKey) {
      cache.current.invalidate()
      requestInProgress.current.clear()
    }
  }, [publicKey?.toString()])

  const fetchBalance = useCallback(async (): Promise<void> => {
    if (!connection || !publicKey || balanceLoading) {
      return
    }

    setBalanceLoading(true)
    setBalanceError(null)

    try {
      const lamports = await connection.getBalance(publicKey)
      const solBalance = lamports / LAMPORTS_PER_SOL
      setBalance(solBalance)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load balance'
      setBalanceError(errorMessage)
      setBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [connection, publicKey, balanceLoading])

  const fetchGameConfig = useCallback(async (): Promise<void> => {
    if (!program || !configPda) {
      return
    }

    try {
      const config: AnchorGameConfig = await program.account.config.fetch(configPda)
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
  }, [program, configPda])

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    if (!program || !profilePda || !publicKey) {
      return
    }

    try {
      const profile: AnchorUserProfile = await program.account.userProfile.fetch(profilePda)
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
  }, [program, profilePda, publicKey])

  const fetchUserWarriors = useCallback(async (): Promise<void> => {
    if (!program || !publicKey) {
      setUserWarriors([])
      return
    }

    const cacheKey = `user-warriors-${publicKey.toString()}`

    const cached = cache.current.get<Warrior[]>(cacheKey)
    if (cached) {
      setUserWarriors(cached)
      return
    }

    if (requestInProgress.current.has(cacheKey)) {
      return
    }

    try {
      requestInProgress.current.add(cacheKey)
      const warriors = await rateLimiter.current.add(async () => {
        const allWarriorAccounts: ProgramAccount<AnchorUndeadWarrior>[] = await program.account.undeadWarrior.all()

        const userWarriorAccounts = allWarriorAccounts.filter((account) => account.account.owner.equals(publicKey))

        return userWarriorAccounts.map(
          (account): Warrior => ({
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
            createdAt: safeToNumber(account.account.createdAt),
            experiencePoints: safeToNumber(account.account.experiencePoints),
            address: account.publicKey,
            imageRarity: account.account.imageRarity,
            imageIndex: account.account.imageIndex,
            imageUri: account.account.imageUri,
            isOnCooldown: safeToNumber(account.account.cooldownExpiresAt) > Date.now() / 1000,
          }),
        )
      })

      cache.current.set(cacheKey, warriors, SHORT_CACHE_TTL)
      setUserWarriors(warriors)
    } catch (error) {
      setError('Failed to fetch warriors')
      setUserWarriors([])
    } finally {
      requestInProgress.current.delete(cacheKey)
    }
  }, [program, publicKey])

  const getSingleWarriorDetails = useCallback(
    async (warriorPda: PublicKey): Promise<void> => {
      if (!program || !warriorPda) {
        return
      }

      try {
        const warrior = await program.account.undeadWarrior.fetch(warriorPda)
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
          experiencePoints: new BN(safeToNumber(warrior.experiencePoints)),
          address: warriorPda,
          imageRarity: warrior.imageRarity,
          imageIndex: warrior.imageIndex,
          imageUri: warrior.imageUri,
          isOnCooldown: safeToNumber(warrior.cooldownExpiresAt) > Date.now() / 1000,
        })
      } catch (error) {}
    },
    [program],
  )

  const fetchDelegatedWarriors = useCallback(
    async (playerPubkey: PublicKey): Promise<FetchResult<Warrior[]>> => {
      if (!program || !connection) {
        return { success: false, error: 'Program or connection not available' }
      }

      const cacheKey = `delegated-warriors-${playerPubkey.toString()}`

      const cached = cache.current.get<FetchResult<Warrior[]>>(cacheKey)
      if (cached) {
        return cached
      }

      if (requestInProgress.current.has(cacheKey)) {
        return { success: false, error: 'Request in progress' }
      }

      try {
        requestInProgress.current.add(cacheKey)
        const result = await rateLimiter.current.add(async () => {
          if (!ephemeralProgramToUse) {
            throw new Error('Ephemeral program not available')
          }

          const delegationProgramId = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh')
          const delegatedAccounts = await ephemeralProgramToUse.account.undeadWarrior.all()

          if (!delegatedAccounts?.length) {
            return { success: true, warriors: [] }
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
                  createdAt: safeToNumber(warrior.createdAt),
                  lastBattleAt: warrior.lastBattleAt,
                  cooldownExpiresAt: warrior.cooldownExpiresAt,
                  address: accountPubkey,
                  currentHp: warrior.currentHp,
                  maxHp: warrior.maxHp,
                  warriorClass: warrior.warriorClass,
                  battlesWon: warrior.battlesWon,
                  battlesLost: warrior.battlesLost,
                  level: warrior.level,
                  experiencePoints: safeToNumber(warrior.experiencePoints),
                  imageUri: warrior.imageUri,
                  imageRarity: warrior.imageRarity,
                  imageIndex: warrior.imageIndex,
                  isOnCooldown: safeToNumber(warrior.cooldownExpiresAt) > Date.now() / 1000,
                }
                playerDelegatedWarriors.push(delegatedWarrior)
              }
            } catch (error) {}
          }

          return { success: true, warriors: playerDelegatedWarriors }
        })

        cache.current.set(cacheKey, result, 120000)
        return result
      } catch (error) {
        const errorResult = {
          success: false,
          warriors: [],
          error: error instanceof Error ? error.message : 'Failed to fetch delegated warriors',
        }
        cache.current.set(cacheKey, errorResult, SHORT_CACHE_TTL)
        return errorResult
      } finally {
        requestInProgress.current.delete(cacheKey)
      }
    },
    [program, connection, ephemeralProgramToUse],
  )

  const decodeRoomId = useCallback(
    (displayId: string): { roomIdBytes: Uint8Array; battleRoomPda: PublicKey } => {
      try {
        let base64 = displayId.replace(/[-_]/g, (c) => (c === '-' ? '+' : '/'))
        while (base64.length % 4) {
          base64 += '='
        }

        const binaryString = atob(base64)
        const bytes = []
        for (let i = 0; i < binaryString.length; i++) {
          bytes.push(binaryString.charCodeAt(i))
        }

        if (bytes.length !== 32) {
          throw new Error('Invalid room code length')
        }

        const roomIdBytes = new Uint8Array(bytes)
        if (!program?.programId) {
          throw new Error('Program not initialized')
        }

        const pdaroomid = Array.from(roomIdBytes)
        const [battleRoomPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('battleroom'), Buffer.from(pdaroomid)],
          program.programId,
        )

        return { roomIdBytes, battleRoomPda }
      } catch (error) {
        throw new Error('Invalid room code format')
      }
    },
    [program],
  )

  const fetchBattleRoomState = useCallback(
    async (battleRoomPda: string): Promise<{ state: BattleRoomState } | null> => {
      if (!program || !publicKey) {
        return null
      }

      const cacheKey = `battle-room-${battleRoomPda}`
      const cached = cache.current.get<{ state: BattleRoomState }>(cacheKey)
      if (cached) {
        return cached
      }

      try {
        const result = await rateLimiter.current.add(async () => {
          const battleRoomAccount = await program.account.battleRoom.fetch(new PublicKey(battleRoomPda))

          const getWarriorDetails = async (warriorPda: PublicKey): Promise<{ name: string } | null> => {
            try {
              const warrior = await program.account.undeadWarrior.fetch(warriorPda)
              return { name: warrior.name }
            } catch (error) {
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

        cache.current.set(cacheKey, result, 10000)
        return result
      } catch (error: any) {
        return null
      }
    },
    [program, publicKey],
  )

  const loadAllData = useCallback(async (): Promise<void> => {
    if (!program || !publicKey || !isConnected || isCurrentlyLoading.current) {
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
      setError('Failed to load data')
    } finally {
      setLoading(false)
      isCurrentlyLoading.current = false
    }
  }, [program, publicKey, isConnected, fetchBalance, fetchGameConfig, fetchUserProfile, fetchUserWarriors])

  const refreshData = useCallback(async (): Promise<void> => {
    if (!program || !publicKey || !isConnected) {
      return
    }

    cache.current.invalidate()
    hasInitiallyLoaded.current = false
    await loadAllData()
  }, [program, publicKey, isConnected, loadAllData])

  const stableValues = useMemo(
    () => ({
      isReady,
      isConnected,
      publicKeyString: publicKey?.toString() || null,
      hasProgram: !!program,
    }),
    [isReady, isConnected, publicKey, program],
  )

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

  const previousPublicKey = useRef<string | null>(null)
  useEffect(() => {
    const currentKey = publicKey?.toString() || null
    if (previousPublicKey.current !== currentKey) {
      hasInitiallyLoaded.current = false
      isCurrentlyLoading.current = false
      previousPublicKey.current = currentKey

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
  const userAddress = publicKey?.toString() || null

  return {
    isReady,
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
    error,
    pdas: { configPda, profilePda, achievementsPda },
    decodeRoomId,
    fetchBalance,
    refreshData,
    getSingleWarriorDetails,
    fetchDelegatedWarriors,
    getWarriorPda,
  }
}
