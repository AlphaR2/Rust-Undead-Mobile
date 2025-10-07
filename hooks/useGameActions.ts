import { authority } from '@/config/program'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { UserPersona, Warrior, WarriorClass } from '@/types/undead'
import { getImageRarityName, getUserPersonaVariant, getWarriorClassVariant } from '@/utils/helper'
import { Program } from '@coral-xyz/anchor'
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram } from '@solana/web3.js'
import { buildAndExecuteTransaction } from './utils/useHelpers'

type UndeadProgram = Program<UndeadTypes>

const minimumBalance = 0.002 * LAMPORTS_PER_SOL

// ============ TYPE DEFINITIONS ============

export interface CreateWarriorParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  name: string
  dna: string
  warriorPda: PublicKey
  configPda: PublicKey
  profilePda: PublicKey
  userAchievementsPda: PublicKey
  warriorClass: WarriorClass
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  onProgress?: (stage: VRFStage, message: string) => void
}

export interface CreateUserProfileParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  username: string
  userPersona: UserPersona
  profilePda: PublicKey
  userRegistryPda: PublicKey
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

export interface UserProfileResult {
  success: boolean
  signature?: string
  error?: string
}

export interface VRFStage {
  stage: 'initializing' | 'submitting' | 'waiting_vrf' | 'polling' | 'completed' | 'error'
  progress: number
}

export interface WarriorCreationResult {
  success: boolean
  signature?: string
  error?: string
  warrior?: Warrior | null
}

// ============ CREATE WARRIOR ============

export const createWarriorWithVRF = async ({
  program,
  userPublicKey,
  name,
  dna,
  warriorPda,
  profilePda,
  configPda,
  userAchievementsPda,
  warriorClass,
  sessionInfo,
  onProgress,
}: CreateWarriorParams): Promise<WarriorCreationResult> => {
  if (!program || !userPublicKey) {
    return { success: false, error: 'Program or user public key required' }
  }

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Warrior name is required' }
  }

  if (name.trim().length > 32) {
    return {
      success: false,
      error: 'Warrior name must be 32 characters or less',
    }
  }

  if (!dna || dna.length !== 8) {
    return {
      success: false,
      error: 'Warrior DNA must be exactly 8 characters',
    }
  }

  let signature: string | undefined

  try {
    onProgress?.({ stage: 'initializing', progress: 10 }, '🔧 Preparing warrior forge...')

    try {
      await program.account.undeadWarrior.fetch(warriorPda)
      return {
        success: false,
        error: 'A warrior with this name already exists',
      }
    } catch (fetchError) {
      // Warrior doesn't exist, continue
    }

    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey

    const payerBalance = await program.provider.connection.getBalance(payerPublicKey)
    if (payerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'player'} wallet (${
          payerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    onProgress?.({ stage: 'submitting', progress: 20 }, '⚡ Submitting creation transaction...')

    const dnaBytes = Array.from(dna).map((char) => char.charCodeAt(0))
    if (dnaBytes.length !== 8) {
      return { success: false, error: 'Invalid DNA format' }
    }

    const classVariant = getWarriorClassVariant(warriorClass)
    const clientSeed = Math.floor(Math.random() * 256)

    const transaction = await program.methods
      .createWarrior(name.trim(), dnaBytes, classVariant, clientSeed)
      .accountsPartial({
        signer: payerPublicKey,
        player: userPublicKey,
        authority: authority,
        warrior: warriorPda,
        userProfile: profilePda,
        userAchievements: userAchievementsPda,
        config: configPda,
        sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    onProgress?.({ stage: 'waiting_vrf', progress: 40 }, '🎲 Transaction confirmed! Waiting for ancient magic (VRF)...')

    onProgress?.({ stage: 'polling', progress: 50 }, '🔮 The cosmic forge is awakening...')

    const vrfMessages = [
      '⚡ Lightning crackles through the ethereal realm...',
      '🌟 Star-forged essence flows into your warrior...',
      '🔥 Ancient runes are being inscribed...',
      '💎 Crystallizing combat prowess...',
      '🧠 Infusing tactical knowledge...',
      '⚔️ Sharpening battle instincts...',
      '🛡️ Hardening defensive capabilities...',
      '🎨 Manifesting visual form...',
    ]

    let retryCount = 0
    const maxRetries = 20
    let messageIndex = 0

    while (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 4000))

      const progress = 50 + (retryCount / maxRetries) * 40
      const currentMessage = vrfMessages[messageIndex % vrfMessages.length]
      onProgress?.({ stage: 'polling', progress }, currentMessage)
      messageIndex++

      try {
        const warriorAccount = await program.account.undeadWarrior.fetch(warriorPda)

        if (
          warriorAccount.baseAttack > 0 &&
          warriorAccount.baseDefense > 0 &&
          warriorAccount.baseKnowledge > 0 &&
          warriorAccount.imageUri &&
          warriorAccount.imageUri.length > 0
        ) {
          onProgress?.(
            { stage: 'completed', progress: 100 },
            '🎉 Warrior forged successfully! Stats and appearance manifested!',
          )

          return {
            success: true,
            signature,
            warrior: {
              name: warriorAccount.name,
              address: warriorAccount.address,
              owner: warriorAccount.owner,
              dna: warriorAccount.dna,
              createdAt: warriorAccount.createdAt,
              currentHp: warriorAccount.currentHp,
              baseAttack: warriorAccount.baseAttack,
              baseDefense: warriorAccount.baseDefense,
              baseKnowledge: warriorAccount.baseKnowledge,
              maxHp: warriorAccount.maxHp,
              battlesWon: warriorAccount.battlesWon,
              battlesLost: warriorAccount.battlesLost,
              experiencePoints: warriorAccount.experiencePoints,
              level: warriorAccount.level,
              lastBattleAt: warriorAccount.lastBattleAt,
              cooldownExpiresAt: warriorAccount.cooldownExpiresAt,
              imageIndex: warriorAccount.imageIndex,
              isOnCooldown: warriorAccount.cooldownExpiresAt.toNumber() > Date.now() / 1000,
              imageUri: warriorAccount.imageUri,
              imageRarity: getImageRarityName(warriorAccount.imageRarity),
              warriorClass,
            },
          }
        }

        retryCount++
      } catch (fetchError: any) {
        retryCount++
      }
    }

    onProgress?.({ stage: 'error', progress: 90 }, '⚠️ VRF timeout - warrior created but stats pending...')

    try {
      const warriorAccount = await program.account.undeadWarrior.fetch(warriorPda)
      if (warriorAccount.baseAttack > 0) {
        return {
          success: true,
          signature,
          warrior: {
            name: warriorAccount.name,
            address: warriorAccount.address,
            owner: warriorAccount.owner,
            dna: warriorAccount.dna,
            createdAt: warriorAccount.createdAt,
            currentHp: warriorAccount.currentHp,
            baseAttack: warriorAccount.baseAttack,
            baseDefense: warriorAccount.baseDefense,
            baseKnowledge: warriorAccount.baseKnowledge,
            maxHp: warriorAccount.maxHp,
            battlesWon: warriorAccount.battlesWon,
            battlesLost: warriorAccount.battlesLost,
            experiencePoints: warriorAccount.experiencePoints,
            level: warriorAccount.level,
            lastBattleAt: warriorAccount.lastBattleAt,
            cooldownExpiresAt: warriorAccount.cooldownExpiresAt,
            imageIndex: warriorAccount.imageIndex,
            isOnCooldown: warriorAccount.cooldownExpiresAt.toNumber() > Date.now() / 1000,
            imageUri: warriorAccount.imageUri,
            imageRarity: getImageRarityName(warriorAccount.imageRarity),
            warriorClass,
          },
        }
      } else {
        return {
          success: false,
          signature,
          error:
            'Warrior created but VRF stats are pending. This is a known issue on devnet - your warrior will update automatically when VRF completes.',
        }
      }
    } catch (finalFetchError) {
      return {
        success: false,
        error:
          'Warrior creation transaction succeeded but unable to verify stats. Please check your wallet for the transaction.',
      }
    }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      try {
        const logs = await error.getLogs(program.provider.connection)
        console.error('Transaction logs:', logs)
      } catch {}
    }
    console.error('Error creating warrior:', error)

    onProgress?.({ stage: 'error', progress: 0 }, `❌ Creation failed: ${error.message}`)

    let errorMessage = error.message || 'Unknown error occurred'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Warrior name already taken'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const warriorAccount = await program.account.undeadWarrior.fetch(warriorPda)
        if (warriorAccount) {
          return {
            success: true,
            signature,
            warrior: {
              name: warriorAccount.name,
              address: warriorAccount.address,
              owner: warriorAccount.owner,
              dna: warriorAccount.dna,
              createdAt: warriorAccount.createdAt,
              currentHp: warriorAccount.currentHp,
              baseAttack: warriorAccount.baseAttack,
              baseDefense: warriorAccount.baseDefense,
              baseKnowledge: warriorAccount.baseKnowledge,
              maxHp: warriorAccount.maxHp,
              battlesWon: warriorAccount.battlesWon,
              battlesLost: warriorAccount.battlesLost,
              experiencePoints: warriorAccount.experiencePoints,
              level: warriorAccount.level,
              lastBattleAt: warriorAccount.lastBattleAt,
              cooldownExpiresAt: warriorAccount.cooldownExpiresAt,
              imageIndex: warriorAccount.imageIndex,
              isOnCooldown: warriorAccount.cooldownExpiresAt.toNumber() > Date.now() / 1000,
              imageUri: warriorAccount.imageUri,
              imageRarity: getImageRarityName(warriorAccount.imageRarity),
              warriorClass,
            },
          }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  }
}

// ============ USER PROFILE ACTIONS ============

export const createUserProfile = async ({
  program,
  userPublicKey,
  username,
  userPersona,
  profilePda,
  userRegistryPda,
  sessionInfo,
}: CreateUserProfileParams): Promise<UserProfileResult> => {
  if (!program || !userPublicKey) {
    return { success: false, error: 'Program or user public key required' }
  }

  if (!username || username.trim().length === 0) {
    return { success: false, error: 'Username is required' }
  }

  if (username.trim().length > 32) {
    return { success: false, error: 'Username must be 32 characters or less' }
  }

  let signature: string | undefined

  try {
    try {
      const userProfile = await program.account.userProfile.fetch(profilePda)
      if (userProfile.username && userProfile.username.length > 0) {
        return { success: false, error: 'User profile already exists' }
      }
    } catch {
      // Profile doesn't exist, continue
    }

    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey

    const payerBalance = await program.provider.connection.getBalance(payerPublicKey)
    if (payerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'player'} wallet (${
          payerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    const personaVariant = getUserPersonaVariant(userPersona)

    const transaction = await program.methods
      .userdata(username, personaVariant)
      .accountsPartial({
        signer: payerPublicKey,
        player: userPublicKey,
        userRegistry: userRegistryPda,
        userProfile: profilePda,
        sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      try {
        const logs = await error.getLogs(program.provider.connection)
        console.error('Transaction logs:', logs)
      } catch {}
    }
    console.error('Error creating user profile:', error)

    let errorMessage = error.message || 'Failed to create user profile'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'User profile already exists'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const userProfile = await program.account.userProfile.fetch(profilePda)
        if (userProfile.username && userProfile.username.length > 0) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  }
}

// ============ BATTLE ROOM ACTIONS ============
// ============ MAGIC BLOCK ER INTEGRATION ============

// ============ BATTLE ON ER ============
