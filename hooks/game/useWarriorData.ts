import { PROGRAM_ID } from '@/config/program'
import { createWarriorCache, safeToNumber } from '@/utils/helper'
import { BN } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import { useCallback, useRef, useState } from 'react'
import { Warrior } from '../../types/undead'
import {
  createEphemeralProgram,
  useEphemeralProgram,
  useMagicBlockProvider,
  useUndeadProgram,
} from '../useUndeadProgram'

const warriorCache = createWarriorCache()

export const useWarriorOperations = (connection: Connection) => {
  const { program } = useUndeadProgram()
  const magicBlockProvider = useMagicBlockProvider()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)

  const activeRequests = useRef(new Set<string>())
  const [error, setError] = useState<string | null>(null)

  const ephemeralProgramToUse =
    ephemeralProgram || (magicBlockProvider ? createEphemeralProgram(PROGRAM_ID, magicBlockProvider.wallet) : null)

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

  const getSingleWarriorDetails = useCallback(
    async (warriorPda: PublicKey): Promise<Warrior | null> => {
      if (!program || !warriorPda) return null

      const cacheKey = `warrior-${warriorPda.toString()}`
      const cached = warriorCache.get(cacheKey)
      if (cached) return cached

      const result = await withRequestDeduplication(cacheKey, async () => {
        try {
          const warrior = await program.account.undeadWarrior.fetch(warriorPda)
          const warriorDetails: Warrior = {
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
          }

          warriorCache.set(cacheKey, warriorDetails, 30000)
          return warriorDetails
        } catch (error) {
          setError('Failed to fetch warrior details')
          return null
        }
      })

      return result
    },
    [program, withRequestDeduplication],
  )

  const fetchDelegatedWarriors = useCallback(
    async (playerPubkey: PublicKey): Promise<Warrior[]> => {
      if (!program || !connection || !ephemeralProgramToUse) {
        return []
      }

      const cacheKey = `delegated-warriors-${playerPubkey.toString()}`
      const cached = warriorCache.get(cacheKey)
      if (cached) return cached

      const result = await withRequestDeduplication(cacheKey, async () => {
        try {
          const delegationProgramId = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh')
          const delegatedAccounts = await ephemeralProgramToUse.account.undeadWarrior.all()

          if (!delegatedAccounts?.length) {
            return []
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
            } catch {}
          }

          warriorCache.set(cacheKey, playerDelegatedWarriors, 120000)
          return playerDelegatedWarriors
        } catch (error) {
          setError('Failed to fetch delegated warriors')
          return []
        }
      })

      return result || []
    },
    [program, connection, ephemeralProgramToUse, withRequestDeduplication],
  )

  const clearCache = useCallback(() => {
    warriorCache.clear()
  }, [])

  return {
    getSingleWarriorDetails,
    fetchDelegatedWarriors,
    clearCache,
    error,
  }
}
