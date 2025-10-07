import { createSimpleCache, getRpcEndpoint } from '@/utils/helper'
import { BN } from '@coral-xyz/anchor'
import { usePrivy } from '@privy-io/expo'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnchorGameConfig,
  AnchorUndeadWarrior,
  AnchorUserProfile,
  GameConfig,
  ProgramAccount,
  UserProfile,
  Warrior,
  convertUserPersona,
} from '../../types/undead'
import { useUndeadProgram, useWalletInfo } from '../useUndeadProgram'
import { usePDAs } from '../utils/useHelpers'

type UndeadWarriorProgramAccount = ProgramAccount<AnchorUndeadWarrior>

export const gameDataCache = createSimpleCache<any>()

export const useBasicGameData = () => {
  const { isReady, user } = usePrivy()
  const { publicKey, isConnected } = useWalletInfo()
  const { program } = useUndeadProgram()
  const { configPda, profilePda, achievementsPda, getWarriorPda } = usePDAs(publicKey)

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userWarriors, setUserWarriors] = useState<Warrior[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasInitiallyLoaded = useRef(false)
  const isCurrentlyLoading = useRef(false)
  const activeRequests = useRef(new Set<string>())

  const RPC_ENDPOINT = useMemo(() => getRpcEndpoint(), [])

  const connection = useMemo(() => {
    return new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    })
  }, [RPC_ENDPOINT])

  const withRequestDeduplication = useCallback(
    async <T>(key: string, operation: () => Promise<T>): Promise<T | null> => {
      if (activeRequests.current.has(key)) {
        return null
      }

      activeRequests.current.add(key)
      try {
        const result = await operation()
        return result
      } finally {
        activeRequests.current.delete(key)
      }
    },
    [],
  )

  const fetchBalance = useCallback(async () => {
    if (!connection || !publicKey || balanceLoading) return

    const result = await withRequestDeduplication('balance', async () => {
      setBalanceLoading(true)
      setBalanceError(null)

      try {
        const lamports = await connection.getBalance(publicKey)
        const solBalance = lamports / LAMPORTS_PER_SOL
        setBalance(solBalance)
        return solBalance
      } catch (error) {
        setBalanceError('Failed to load balance')
        setBalance(null)
        throw error
      } finally {
        setBalanceLoading(false)
      }
    })

    return result
  }, [connection, publicKey, balanceLoading, withRequestDeduplication])

  const fetchGameConfig = useCallback(async () => {
    if (!program || !configPda) return

    const cacheKey = 'game-config'
    const cached = gameDataCache.get(cacheKey)
    if (cached) {
      setGameConfig(cached)
      return cached
    }

    const result = await withRequestDeduplication(cacheKey, async () => {
      try {
        const config: AnchorGameConfig = await program.account.config.fetch(configPda)
        const gameConfig: GameConfig = {
          admin: config.admin,
          cooldownTime: config.cooldownTime,
          createdAt: config.createdAt,
          totalWarriors: config.totalWarriors,
          totalBattles: config.totalBattles,
          isPaused: config.isPaused,
        }

        gameDataCache.set(cacheKey, gameConfig, 120000)
        setGameConfig(gameConfig)
        return gameConfig
      } catch (error: any) {
        setGameConfig(null)
        return null
      }
    })

    return result
  }, [program, configPda, withRequestDeduplication])

  const fetchUserProfile = useCallback(async () => {
    if (!program || !profilePda || !publicKey) return

    const cacheKey = `user-profile-${publicKey.toString()}`
    const cached = gameDataCache.get(cacheKey)
    if (cached) {
      setUserProfile(cached)
      return cached
    }

    const result = await withRequestDeduplication(cacheKey, async () => {
      try {
        const profile: AnchorUserProfile = await program.account.userProfile.fetch(profilePda)
        const userProfile: UserProfile = {
          owner: profile.owner,
          username: profile.username,
          userPersona: convertUserPersona(profile.userPersona),
          warriorsCreated: profile.warriorsCreated,
          totalBattlesWon: profile.totalBattlesWon,
          totalBattlesLost: profile.totalBattlesLost,
          totalPoints: new BN(profile.totalPoints),
          totalBattlesFought: profile.totalBattlesFought,
          joinDate: new BN(profile.joinDate),
        }

        gameDataCache.set(cacheKey, userProfile, 60000)
        setUserProfile(userProfile)
        return userProfile
      } catch (error: any) {
        setUserProfile(null)
        return null
      }
    })

    return result
  }, [program, profilePda, publicKey, withRequestDeduplication])

  const fetchUserWarriors = useCallback(async () => {
    if (!program || !publicKey) {
      setUserWarriors([])
      return []
    }

    const cacheKey = `user-warriors-${publicKey.toString()}`
    const cached = gameDataCache.get(cacheKey)
    if (cached) {
      setUserWarriors(cached)
      return cached
    }

    const result = await withRequestDeduplication(cacheKey, async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        const allWarriorAccounts: UndeadWarriorProgramAccount[] = await program.account.undeadWarrior.all()

        const userWarriorAccounts = allWarriorAccounts.filter((account: UndeadWarriorProgramAccount) =>
          account.account.owner.equals(publicKey),
        )

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

        gameDataCache.set(cacheKey, warriors, 30000)
        setUserWarriors(warriors)
        return warriors
      } catch (error: any) {
        setError('Failed to fetch warriors')
        setUserWarriors([])
        throw error
      }
    })

    return result || []
  }, [program, publicKey, withRequestDeduplication])

  const loadAllData = useCallback(async () => {
    if (!program || !publicKey || !isConnected || isCurrentlyLoading.current) {
      return
    }

    isCurrentlyLoading.current = true
    setLoading(true)
    setError(null)

    try {
      await fetchBalance()
      await fetchGameConfig()
      await fetchUserProfile()
      await fetchUserWarriors()

      hasInitiallyLoaded.current = true
    } catch (error: any) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
      isCurrentlyLoading.current = false
    }
  }, [program, publicKey, isConnected, fetchBalance, fetchGameConfig, fetchUserProfile, fetchUserWarriors])

  const refreshData = useCallback(async () => {
    if (!program || !publicKey || !isConnected) return

    gameDataCache.invalidatePattern(publicKey.toString())
    hasInitiallyLoaded.current = false
    await loadAllData()
  }, [program, publicKey, isConnected, loadAllData])

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
      activeRequests.current.clear()
    }
  }, [isConnected])

  const previousPublicKey = useRef<string | null>(null)
  useEffect(() => {
    const currentKey = publicKey?.toString() || null
    if (previousPublicKey.current && previousPublicKey.current !== currentKey) {
      gameDataCache.invalidatePattern(previousPublicKey.current)
      hasInitiallyLoaded.current = false
      isCurrentlyLoading.current = false
      activeRequests.current.clear()
    }
    previousPublicKey.current = currentKey
  }, [publicKey])

  useEffect(() => {
    const shouldLoad =
      isReady && isConnected && program && publicKey && !hasInitiallyLoaded.current && !isCurrentlyLoading.current

    if (shouldLoad) {
      const timeoutId = setTimeout(() => {
        loadAllData()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isReady, isConnected, program, publicKey, loadAllData])

  const hasWarriors = userWarriors.length > 0
  const userAddress = publicKey?.toString() || null

  return {
    isReady,
    user,
    isConnected,
    userAddress,
    publicKey,
    connection,
    gameConfig,
    userProfile,
    userWarriors,
    hasWarriors,
    balance,
    balanceLoading,
    balanceError,
    loading,
    error,
    pdas: {
      configPda,
      profilePda,
      achievementsPda,
      getWarriorPda,
    },
    fetchBalance,
    refreshData,
    loadAllData,
  }
}
