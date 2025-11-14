import { createSimpleCache, getRpcEndpoint } from '@/utils/helper'
import { usePrivy } from '@privy-io/expo'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnchorGameConfig,
  AnchorGamerProfile,
  AnchorUndeadWarrior,
  AnchorUndeadWorld,
  AnchorUserProfile,
  GameConfig,
  GamerProfile,
  ProgramAccount,
  UndeadWorld,
  UserProfile,
  Warrior,
  convertUserPersona,
} from '../../types/undead'
import { useUndeadProgram, useWalletInfo } from '../useUndeadProgram'
import { usePDAs } from '../utils/useHelpers'

type UndeadWarriorProgramAccount = ProgramAccount<AnchorUndeadWarrior>
type UndeadWorldProgramAccount = ProgramAccount<AnchorUndeadWorld>

export const gameDataCache = createSimpleCache<any>()

export const useBasicGameData = () => {
  const { isReady, user } = usePrivy()
  const { publicKey, isConnected } = useWalletInfo()
  const { program } = useUndeadProgram()
  const { configPda, profilePda, gamerProfilePda, getWarriorPda } = usePDAs(publicKey)

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userGamerProfile, setUserGamerProfile] = useState<GamerProfile | null>(null)
  const [userWarriors, setUserWarriors] = useState<Warrior[]>([])
  const [undeadWorlds, setUndeadWorlds] = useState<UndeadWorld[]>([])
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
        const config: AnchorGameConfig = await program.account.gameConfig.fetch(configPda)
        const gameConfig: GameConfig = {
          authority: config.authority,
          releasedChapters: config.releasedChapters,
          totalWarriors: config.totalWarriors,
          bossBattlesEnabled: config.bossBattlesEnabled,
          paused: config.paused,
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
          warriors: profile.warriors,
          achievementLevel: profile.achievementLevel,
          joinDate: profile.joinDate.toNumber(),
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

  const fetchUserGamerProfile = useCallback(async () => {
    if (!program || !gamerProfilePda || !publicKey) return

    const cacheKey = `gamer-profile-${publicKey.toString()}`
    const cached = gameDataCache.get(cacheKey)
    if (cached) {
      setUserGamerProfile(cached)
      return cached
    }

    const result = await withRequestDeduplication(cacheKey, async () => {
      try {
        const gamerProfile: AnchorGamerProfile = await program.account.gamerProfile.fetch(gamerProfilePda)
        const userGamerProfile: GamerProfile = {
          owner: gamerProfile.owner,
          characterClass: gamerProfile.characterClass,
          currentChapter: gamerProfile.currentChapter,
          chaptersCompleted: gamerProfile.chaptersCompleted,
          currentPosition: gamerProfile.currentPosition,
          totalBattlesWon: gamerProfile.totalBattlesWon.toNumber(),
          totalBattlesLost: gamerProfile.totalBattlesLost.toNumber(),
          totalBattlesFought: gamerProfile.totalBattlesFought.toNumber(),
          quizzesTaken: gamerProfile.quizzesTaken,
          totalQuizScore: gamerProfile.totalQuizScore,
          undeadScore: gamerProfile.undeadScore,
          createdAt: gamerProfile.createdAt.toNumber(),
        }

        gameDataCache.set(cacheKey, userGamerProfile, 60000)
        setUserGamerProfile(userGamerProfile)
        return userGamerProfile
      } catch (error: any) {
        setUserGamerProfile(null)
        return null
      }
    })

    return result
  }, [program, gamerProfilePda, publicKey, withRequestDeduplication])

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
          address: account.account.address,
          owner: account.account.owner,
          dna: account.account.dna,
          createdAt: account.account.createdAt.toNumber(),
          baseAttack: account.account.baseAttack,
          baseDefense: account.account.baseDefense,
          baseKnowledge: account.account.baseKnowledge,
          currentHp: account.account.currentHp,
          maxHp: account.account.maxHp,
          warriorClass: account.account.warriorClass,
          battlesWon: account.account.battlesWon,
          battlesLost: account.account.battlesLost,
          experiencePoints: account.account.experiencePoints.toNumber(),
          level: account.account.level,
          lastBattleAt: account.account.lastBattleAt.toNumber(),
          cooldownExpiresAt: account.account.cooldownExpiresAt.toNumber(),
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

  const getUndeadWorldById = useCallback(
    async (worldIdBytes: Uint8Array) => {
      if (!program) return null

      const worldIdArray = Array.from(worldIdBytes)
      const worldIdKey = worldIdArray.join(',')
      const cacheKey = `undead-world-${worldIdKey}`
      const cached = gameDataCache.get(cacheKey)
      if (cached) {
        return cached
      }

      try {
        const [undeadWorldPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('undead_world'), Buffer.from(worldIdBytes)],
          program.programId,
        )

        const worldAccount: AnchorUndeadWorld = await program.account.undeadWorld.fetch(undeadWorldPda)

        const world: UndeadWorld = {
          worldId: worldAccount.worldId,
          activePlayers: worldAccount.activePlayers,
          totalPlayers: worldAccount.totalPlayers,
          totalCompletions: worldAccount.totalCompletions,
          highestUndeadScoreAverage: worldAccount.highestUndeadScoreAverage,
          topCommander: worldAccount.topCommander,
          createdAt: worldAccount.createdAt.toNumber(),
        }

        gameDataCache.set(cacheKey, world, 60000)
        return world
      } catch (error: any) {
        return null
      }
    },
    [program],
  )

  const fetchUndeadWorlds = useCallback(async () => {
    if (!program) {
      setUndeadWorlds([])
      return []
    }

    const cacheKey = 'undead-worlds'
    const cached = gameDataCache.get(cacheKey)
    if (cached) {
      setUndeadWorlds(cached)
      return cached
    }

    const result = await withRequestDeduplication(cacheKey, async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        const allWorldAccounts: UndeadWorldProgramAccount[] = await program.account.undeadWorld.all()

        const worlds: UndeadWorld[] = allWorldAccounts.map((account: UndeadWorldProgramAccount) => ({
          worldId: account.account.worldId,
          activePlayers: account.account.activePlayers,
          totalPlayers: account.account.totalPlayers,
          totalCompletions: account.account.totalCompletions,
          highestUndeadScoreAverage: account.account.highestUndeadScoreAverage,
          topCommander: account.account.topCommander,
          createdAt: account.account.createdAt.toNumber(),
        }))

        gameDataCache.set(cacheKey, worlds, 60000)
        setUndeadWorlds(worlds)
        return worlds
      } catch (error: any) {
        setError('Failed to fetch undead worlds')
        setUndeadWorlds([])
        throw error
      }
    })

    return result || []
  }, [program, withRequestDeduplication])

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
      await fetchUserGamerProfile()
      await fetchUserWarriors()
      await fetchUndeadWorlds()

      hasInitiallyLoaded.current = true
    } catch (error: any) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
      isCurrentlyLoading.current = false
    }
  }, [
    program,
    publicKey,
    isConnected,
    fetchBalance,
    fetchGameConfig,
    fetchUserProfile,
    fetchUserGamerProfile,
    fetchUserWarriors,
    fetchUndeadWorlds,
  ])

  const refreshData = useCallback(async () => {
    if (!program || !publicKey || !isConnected) return

    gameDataCache.invalidatePattern(publicKey.toString())
    hasInitiallyLoaded.current = false
    await loadAllData()
  }, [program, publicKey, isConnected])

  useEffect(() => {
    if (!isConnected) {
      setGameConfig(null)
      setUserProfile(null)
      setUserGamerProfile(null)
      setUserWarriors([])
      setUndeadWorlds([])
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
  }, [isReady, isConnected, program, publicKey])

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
    userGamerProfile,
    userWarriors,
    undeadWorlds,
    hasWarriors,
    balance,
    balanceLoading,
    balanceError,
    loading,
    error,
    pdas: {
      configPda,
      profilePda,
      gamerProfilePda,
      getWarriorPda,
    },
    fetchBalance,
    refreshData,
    loadAllData,
    getUndeadWorldById,
  }
}
