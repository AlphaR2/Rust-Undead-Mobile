import { authority } from '@/config/program'

import {
  BuildGamingProfileParams,
  CreateUserProfileParams,
  CreateWarriorParams,
  GameProfileToRollupParams,
  UserProfileResult,
  WarriorCreationResult,
  WorldToRollupParams,
} from '@/types/actions'
import {
  checkBalanceWithUserGuidance,
  getImageRarityName,
  getUserPersonaVariant,
  getWarriorClassVariant,
} from '@/utils/helper'
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram } from '@solana/web3.js'
import { buildAndExecuteTransaction } from './utils/useHelpers'
import { minimumBalance } from '@/constants/params'



export const createWarriorWithVRF = async ({
  program,
  userPublicKey,
  name,
  dna,
  koraPayer,
  koraHealth,
  walletType,
  warriorPda,
  profilePda,
  configPda,
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
    onProgress?.({ stage: 'initializing', progress: 10 }, 'Preparing warrior forge...')

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
    let payerPublicKey: PublicKey
    if (walletType === 'privy') {
      if (koraHealth) {
        payerPublicKey = koraPayer
      } else {
        // Kora is down, user's Privy wallet will pay
        payerPublicKey = userPublicKey
      }
    } else {
      //external wallet
      payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey
    }

    if (walletType != 'privy' || koraHealth === false) {
      try {
        const balanceCheck = await checkBalanceWithUserGuidance(program, payerPublicKey, minimumBalance, sessionInfo)

        if (!balanceCheck.success) {
          return {
            success: false,
            error: balanceCheck.error!,
          }
        }
      } catch (error: any) {
        throw new Error('Failed to verify Privy wallet balance: ' + error.message)
      }
    }

    onProgress?.({ stage: 'submitting', progress: 20 }, 'Submitting creation transaction...')

    const dnaBytes = Array.from(dna).map((char) => char.charCodeAt(0))
    if (dnaBytes.length !== 8) {
      return { success: false, error: 'Invalid DNA format' }
    }

    const classVariant = getWarriorClassVariant(warriorClass)
    const clientSeed = Math.floor(Math.random() * 256)

    const transaction = await program.methods
      .createWarrior(name.trim(), dnaBytes, classVariant, clientSeed, false)
      .accountsPartial({
        signer: payerPublicKey,
        player: userPublicKey,
        authority: authority,
        warrior: warriorPda,
        userProfile: profilePda,
        gameConfig: configPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    onProgress?.({ stage: 'waiting_vrf', progress: 40 }, 'Transaction confirmed, waiting for VRF...')

    onProgress?.({ stage: 'polling', progress: 50 }, 'Processing VRF request...')

    const vrfMessages = [
      'Lightning crackles through the ethereal realm...',
      'Star-forged essence flows into your warrior...',
      'Ancient runes are being inscribed...',
      'Crystallizing combat prowess...',
      'Infusing tactical knowledge...',
      'Sharpening battle instincts...',
      'Hardening defensive capabilities...',
      'Manifesting visual form...',
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
          onProgress?.({ stage: 'completed', progress: 100 }, 'Warrior forged successfully')

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

    onProgress?.({ stage: 'error', progress: 90 }, 'VRF timeout - warrior created but stats pending...')

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
      try {
        await error.getLogs(program.provider.connection)
      } catch {}
    }

    onProgress?.({ stage: 'error', progress: 0 }, `Creation failed: ${error.message}`)

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

export const createUserProfile = async ({
  program,
  userPublicKey,
  username,
  koraPayer,
  koraBlockhash,
  walletType,
  koraHealth,
  userPersona,
  profilePda,
  userRegistryPda,
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

    let payerPublicKey: PublicKey
    if (walletType === 'privy') {
      if (koraHealth) {
        payerPublicKey = koraPayer
      } else {
        payerPublicKey = userPublicKey
      }
    } else {
      payerPublicKey = userPublicKey
    }

    if (walletType !== 'privy' || koraHealth === false) {
      try {
        const balanceCheck = await checkBalanceWithUserGuidance(program, payerPublicKey, minimumBalance)

        if (!balanceCheck.success) {
          return {
            success: false,
            error: balanceCheck.error!,
          }
        }
      } catch (error: any) {
        throw new Error('Failed to verify wallet balance: ' + error.message)
      }
    }



    const personaVariant = getUserPersonaVariant(userPersona)

    const transaction = await program.methods
      .buildUserProfile(username, personaVariant)
      .accountsPartial({
        signer: payerPublicKey,
        player: userPublicKey,
        userRegistry: userRegistryPda,
        userProfile: profilePda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey, koraBlockhash)

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      try {
        await error.getLogs(program.provider.connection)
      } catch {}
    }

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
export const buildGamingProfile = async ({
  program,
  userPublicKey,
  koraPayer,
  walletType,
  koraHealth,
  characterClass,
  gamerProfilePda,
  sessionInfo,
}: BuildGamingProfileParams): Promise<UserProfileResult> => {
  if (!program || !userPublicKey) {
    return { success: false, error: 'Program or user public key required' }
  }

  let signature: string | undefined

  try {
    try {
      await program.account.gamerProfile.fetch(gamerProfilePda)
      return { success: false, error: 'Gaming profile already exists' }
    } catch {
      // Profile doesn't exist, continue
    }

    const hasActiveSession = !!sessionInfo
    let payerPublicKey: PublicKey
    if (walletType === 'privy') {
      if (koraHealth) {
        payerPublicKey = koraPayer
      } else {
        // Kora is down, user's Privy wallet will pay
        payerPublicKey = userPublicKey
      }
    } else {
      //external wallet
      payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey
    }

    if (walletType != 'privy' || koraHealth === false) {
      try {
        const balanceCheck = await checkBalanceWithUserGuidance(program, payerPublicKey, minimumBalance, sessionInfo)

        if (!balanceCheck.success) {
          return {
            success: false,
            error: balanceCheck.error!,
          }
        }
      } catch (error: any) {
        throw new Error('Failed to verify Privy wallet balance: ' + error.message)
      }
    }

    const classVariant = getWarriorClassVariant(characterClass)

    const transaction = await program.methods
      .buildGamingProfile(classVariant)
      .accountsPartial({
        signer: payerPublicKey,
        player: userPublicKey,
        gamerProfile: gamerProfilePda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      try {
        await error.getLogs(program.provider.connection)
      } catch {}
    }

    let errorMessage = error.message || 'Failed to create gaming profile'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Gaming profile already exists'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        await program.account.gamerProfile.fetch(gamerProfilePda)
        return { success: true, signature }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  }
}

export const gameProfileToRollup = async ({
  program,
  userPublicKey,
  koraPayer,
  walletType,
  koraHealth,
  gamerProfilePda,
  sessionInfo,
}: GameProfileToRollupParams): Promise<UserProfileResult> => {
  if (!program || !userPublicKey) {
    return { success: false, error: 'Program or user public key required' }
  }

  let signature: string | undefined

  try {
    const hasActiveSession = !!sessionInfo
    let payerPublicKey: PublicKey
    if (walletType === 'privy') {
      if (koraHealth) {
        payerPublicKey = koraPayer
      } else {
        // Kora is down, user's Privy wallet will pay
        payerPublicKey = userPublicKey
      }
    } else {
      //external wallet
      payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey
    }

    if (walletType != 'privy' || koraHealth === false) {
      try {
        const balanceCheck = await checkBalanceWithUserGuidance(program, payerPublicKey, minimumBalance, sessionInfo)

        if (!balanceCheck.success) {
          return {
            success: false,
            error: balanceCheck.error!,
          }
        }
      } catch (error: any) {
        throw new Error('Failed to verify Privy wallet balance: ' + error.message)
      }
    }
    const transaction = await program.methods
      .gameProfileToRollup(userPublicKey)
      .accountsPartial({
        signer: payerPublicKey,
        userGameProfile: gamerProfilePda,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      try {
        await error.getLogs(program.provider.connection)
      } catch {}
    }

    let errorMessage = error.message || 'Failed to delegate game profile'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    }

    return { success: false, error: errorMessage }
  }
}

export const worldToRollup = async ({
  program,
  userPublicKey,
  koraPayer,
  walletType,
  koraHealth,
  worldId,
  undeadWorldPda,
  sessionInfo,
}: WorldToRollupParams): Promise<UserProfileResult> => {
  if (!program || !userPublicKey) {
    return { success: false, error: 'Program or user public key required' }
  }

  if (worldId.length !== 32) {
    return { success: false, error: 'Invalid world ID length' }
  }

  let signature: string | undefined

  try {
    const hasActiveSession = !!sessionInfo
    let payerPublicKey: PublicKey
    if (walletType === 'privy') {
      if (koraHealth) {
        payerPublicKey = koraPayer
      } else {
        // Kora is down, user's Privy wallet will pay
        payerPublicKey = userPublicKey
      }
    } else {
      //external wallet
      payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey
    }

    if (walletType != 'privy' || koraHealth === false) {
      try {
        const balanceCheck = await checkBalanceWithUserGuidance(program, payerPublicKey, minimumBalance, sessionInfo)

        if (!balanceCheck.success) {
          return {
            success: false,
            error: balanceCheck.error!,
          }
        }
      } catch (error: any) {
        throw new Error('Failed to verify Privy wallet balance: ' + error.message)
      }
    }

    const worldIdArray = Array.from(worldId)

    const transaction = await program.methods
      .worldToRollup(worldIdArray)
      .accountsPartial({
        signer: payerPublicKey,
        undeadWorld: undeadWorldPda,
      })
      .transaction()

    signature = await buildAndExecuteTransaction(program, transaction, payerPublicKey)

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      try {
        await error.getLogs(program.provider.connection)
      } catch {}
    }

    let errorMessage = error.message || 'Failed to delegate world'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    }

    return { success: false, error: errorMessage }
  }
}
