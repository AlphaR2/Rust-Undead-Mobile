import { authority } from '@/config/program'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { ImageRarity, UserPersona, Warrior, WarriorClass } from '@/types/undead'
import { Program } from '@coral-xyz/anchor'
import { LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram } from '@solana/web3.js'
import { sendERTransaction } from './useUndeadProgram'

type UndeadProgram = Program<UndeadTypes>

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
  onProgress?: (stage: VRFStage, message: string) => void
}

export interface VRFStage {
  stage: 'initializing' | 'submitting' | 'waiting_vrf' | 'polling' | 'completed' | 'error'
  progress: number // 0-100
}

export interface WarriorCreationResult {
  success: boolean
  signature?: string
  error?: string
  warrior?: Warrior | null
}

let isCreatingWarrior = false

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
  onProgress,
}: CreateWarriorParams): Promise<WarriorCreationResult> => {
  if (!program) {
    return { success: false, error: 'Program not initialized' }
  }

  if (!userPublicKey) {
    return { success: false, error: 'User public key required' }
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

  if (isCreatingWarrior) {
    return { success: false, error: 'Warrior creation already in progress' }
  }

  isCreatingWarrior = true
  let signature: string | undefined

  try {
    onProgress?.({ stage: 'initializing', progress: 10 }, '🔧 Preparing warrior forge...')

    // Check if warrior already exists
    try {
      await program.account.undeadWarrior.fetch(warriorPda)
      return {
        success: false,
        error: 'A warrior with this name already exists',
      }
    } catch (fetchError) {
      // console.log("Warrior PDA check: No existing account found");
    }

    // Check player balance
    const playerBalance = await program.provider.connection.getBalance(userPublicKey)
    const minimumBalance = 0.002 * LAMPORTS_PER_SOL // Estimate for fees + rent
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in player wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    onProgress?.({ stage: 'submitting', progress: 20 }, '⚡ Submitting creation transaction...')

    // Convert DNA string to byte array
    const dnaBytes = Array.from(dna).map((char) => char.charCodeAt(0))
    if (dnaBytes.length !== 8) {
      return { success: false, error: 'Invalid DNA format' }
    }

    // Convert warrior class to program format
    const classVariant = getWarriorClassVariant(warriorClass)
    const clientSeed = Math.floor(Math.random() * 256)

    // Create transaction
    const transaction = await program.methods
      .createWarrior(name.trim(), dnaBytes, classVariant, clientSeed)
      .accountsPartial({
        player: userPublicKey,
        authority,
        warrior: warriorPda,
        userProfile: profilePda,
        userAchievements: userAchievementsPda,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = userPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction

    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

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
      await new Promise((resolve) => setTimeout(resolve, 3000))

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

    // VRF timeout handling
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
          success: true,
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
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error creating warrior:', error)

    onProgress?.({ stage: 'error', progress: 0 }, `❌ Creation failed: ${error.message}`)

    let errorMessage = error.message || 'Unknown error occurred'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Warrior name already taken'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isCreatingWarrior = false
  }
}

// ============ USER PROFILE ACTIONS ============

export interface CreateUserProfileParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  username: string
  userPersona: UserPersona
  profilePda: PublicKey
  userRegistryPda: PublicKey
}

export interface UserProfileResult {
  success: boolean
  signature?: string
  error?: string
}

let isCreatingUserProfile = false

export const createUserProfile = async ({
  program,
  userPublicKey,
  username,
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

  if (isCreatingUserProfile) {
    return {
      success: false,
      error: 'User profile creation already in progress',
    }
  }

  isCreatingUserProfile = true

  try {
    // Check if profile already exists
    try {
      const userProfile = await program.account.userProfile.fetch(profilePda)
      if (userProfile.username && userProfile.username.length > 0) {
        return { success: false, error: 'User profile already exists' }
      }
    } catch {
      // console.log("User profile PDA check: No existing account found");
    }

    // Check player balance
    const playerBalance = await program.provider.connection.getBalance(userPublicKey)
    const minimumBalance = 0.002 * LAMPORTS_PER_SOL // Estimate for fees + rent
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in player wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    // Convert persona to program format
    const personaVariant = getUserPersonaVariant(userPersona)

    // Create transaction
    const transaction = await program.methods
      .userdata(username, personaVariant)
      .accountsPartial({
        player: userPublicKey,
        userProfile: profilePda,
        userRegistry: userRegistryPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = userPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error creating user profile:', error)

    let errorMessage = error.message || 'Failed to create user profile'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'User profile already exists'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isCreatingUserProfile = false
  }
}

// ============ BATTLE ROOM ACTIONS ============

export interface BattleRoomResult {
  success: boolean
  signature?: string
  error?: string
  commitmentSignature?: string // For ER transactions
}

export interface CreateBattleRoomParams {
  program: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  roomId: Uint8Array // [u8; 32]
  warriorName: string
  selectedConcepts: number[]
  selectedTopics: number[]
  selectedQuestions: number[]
  correctAnswers: boolean[]
}

let isCreatingBattleRoom = false

export const createBattleRoom = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  roomId,
  warriorName,
  selectedConcepts,
  selectedTopics,
  selectedQuestions,
  correctAnswers,
}: CreateBattleRoomParams): Promise<BattleRoomResult> => {
  if (!program || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (roomId.length !== 32) {
    return { success: false, error: 'Room ID must be exactly 32 bytes' }
  }

  if (isCreatingBattleRoom) {
    return {
      success: false,
      error: 'Battle room creation already in progress',
    }
  }

  isCreatingBattleRoom = true

  try {
    // console.log(
    //   "🏛️ Preparing to create battle room with ID:",
    //   Array.from(roomId)
    // );

    // Check if battleRoomPda already exists
    try {
      const accountInfo = await program.provider.connection.getAccountInfo(battleRoomPda)
      if (accountInfo) {
        return {
          success: false,
          error: 'Battle room already exists at this PDA',
        }
      }
    } catch (fetchError) {
      // console.log("Battle room PDA check: No existing account found");
    }

    // Check player balance
    const playerBalance = await program.provider.connection.getBalance(playerPublicKey)
    const minimumBalance = 0.002 * LAMPORTS_PER_SOL // Estimate for fees + rent
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in player wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    // Create transaction
    const transaction = await program.methods
      .createBattleRoom(
        Array.from(roomId),
        warriorName,
        selectedConcepts,
        selectedTopics,
        selectedQuestions,
        correctAnswers,
      )
      .accountsPartial({
        playerA: playerPublicKey,
        warriorA: warriorPda,
        battleRoom: battleRoomPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = playerPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    // console.log(`✅ Battle Room created: ${signature}`);

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('❌ Battle room creation failed:', error)

    let errorMessage = error.message || 'Failed to create battle room'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle room already exists'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isCreatingBattleRoom = false
  }
}

export interface JoinBattleRoomParams {
  program: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  roomId: Uint8Array
  warriorName: string
}

let isJoiningBattleRoom = false

export const joinBattleRoom = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  roomId,
  warriorName,
}: JoinBattleRoomParams): Promise<BattleRoomResult> => {
  if (!program || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (isJoiningBattleRoom) {
    return { success: false, error: 'Joining battle room already in progress' }
  }

  isJoiningBattleRoom = true

  try {
    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Check player balance
    const playerBalance = await program.provider.connection.getBalance(playerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL // Lower estimate since no account creation
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in player wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)

    // Create transaction
    const transaction = await program.methods
      .joinBattleRoom(roomIdArray, warriorName)
      .accountsPartial({
        playerB: playerPublicKey,
        warriorB: warriorPda,
        battleRoom: battleRoomPda,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = playerPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    // console.log("✅ Player B joined battle room: ", signature);
    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error joining battle room:', error)

    let errorMessage = error.message || 'Failed to join battle room'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle room already has two players'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isJoiningBattleRoom = false
  }
}

export interface SignalReadyParams {
  program: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  warriorName: string
}

let isSignalingReady = false

export const signalReady = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  warriorName,
}: SignalReadyParams): Promise<BattleRoomResult> => {
  if (!program || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (isSignalingReady) {
    return { success: false, error: 'Signaling ready already in progress' }
  }

  isSignalingReady = true

  try {
    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Check player balance
    const playerBalance = await program.provider.connection.getBalance(playerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL // Lower estimate since no account creation
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in player wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)

    // Create transaction
    const transaction = await program.methods
      .signalReady(roomIdArray, warriorName)
      .accountsPartial({
        player: playerPublicKey,
        warrior: warriorPda,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = playerPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    // console.log("✅ Player signaled ready: ", signature);
    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error signaling ready:', error)

    let errorMessage = error.message || 'Failed to signal ready'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Player already signaled ready'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isSignalingReady = false
  }
}

// ============ MAGIC BLOCK ER INTEGRATION ============

export interface DelegateBattleParams {
  program: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  playerAPublicKey: PublicKey
  warriorAName: string
  playerBPublicKey: PublicKey
  warriorBName: string
}

let isDelegatingBattle = false

export const delegateBattle = async ({
  program,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  playerAPublicKey,
  warriorAName,
  playerBPublicKey,
  warriorBName,
}: DelegateBattleParams): Promise<BattleRoomResult> => {
  if (!program || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (isDelegatingBattle) {
    return { success: false, error: 'Battle delegation already in progress' }
  }

  isDelegatingBattle = true

  try {
    // console.log("🚀 Preparing to delegate battle to Ephemeral Rollup...");

    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Check signer balance
    const signerBalance = await program.provider.connection.getBalance(signerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL // Lower estimate since no account creation
    if (signerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in signer wallet (${
          signerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)

    // Create transaction
    const transaction = await program.methods
      .delegateBattle(roomIdArray, playerAPublicKey, warriorAName, playerBPublicKey, warriorBName)
      .accountsPartial({
        signer: signerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = signerPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    // console.log("✅ Battle Room delegation tx:", signature);

    // Wait for delegation to complete
    await new Promise((resolve) => setTimeout(resolve, 5000))

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error delegating battle:', error)

    let errorMessage = error.message || 'Failed to delegate battle'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle already delegated'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isDelegatingBattle = false
  }
}

//  Battle on ER - now accepts provider as parameter
export interface StartBattleParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any // Added provider parameter
}

export const startBattleOnER = async ({
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  magicBlockProvider,
}: StartBattleParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  try {
    // console.log("⚔️ Starting battle on Ephemeral Rollup...");

    const roomIdArray = Array.from(roomId)

    const commitmentSignature = await sendERTransaction(
      ephemeralProgram,
      ephemeralProgram.methods.startBattle(roomIdArray).accountsPartial({
        signer: signerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
      }),
      signerPublicKey,
      magicBlockProvider,
      'Start Battle',
    )

    // console.log("Battle started successfully on Ephemeral Rollup");

    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    console.error('Error starting battle on ER:', error)
    return {
      success: false,
      error: error.message || 'Failed to start battle on ER',
    }
  }
}

// Answer Question on ER - now accepts provider as parameter
export interface AnswerQuestionERParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  clientSeed?: number
  magicBlockProvider: any // Added provider parameter
}

export const answerQuestionOnER = async ({
  ephemeralProgram,
  playerPublicKey,
  battleRoomPda,
  attackerWarriorPda,
  defenderWarriorPda,
  roomId,
  answer,
  clientSeed,
  magicBlockProvider, // Use parameter instead of top-level variable
}: AnswerQuestionERParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  try {
    const roomIdArray = Array.from(roomId)
    const seed = clientSeed ?? Math.floor(Math.random() * 256)

    // console.log(`🎯 Player answering question: ${answer ? "TRUE" : "FALSE"}`);

    const commitmentSignature = await sendERTransaction(
      ephemeralProgram,
      ephemeralProgram.methods.answerQuestion(roomIdArray, answer, seed).accountsPartial({
        player: playerPublicKey,
        battleRoom: battleRoomPda,
        attackerWarrior: attackerWarriorPda,
        defenderWarrior: defenderWarriorPda,
      }),
      playerPublicKey,
      magicBlockProvider, // Use the passed provider
      `Answer Question: ${answer ? 'TRUE' : 'FALSE'}`,
    )

    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    console.error('Error answering question on ER:', error)
    return {
      success: false,
      error: error.message || 'Failed to answer question on ER',
    }
  }
}

//Settle Battle on ER - now accepts provider as parameter
export interface SettleBattleERParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any // Added provider parameter
}

export const settleBattleRoomOnER = async ({
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  magicBlockProvider, // Use parameter instead of top-level variable
}: SettleBattleERParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  try {
    // console.log("💎 Settling battle with XP rewards on Ephemeral Rollup...");

    const roomIdArray = Array.from(roomId)

    const commitmentSignature = await sendERTransaction(
      ephemeralProgram,
      ephemeralProgram.methods.settleBattleRoom(roomIdArray).accountsPartial({
        signer: signerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
      }),
      signerPublicKey,
      magicBlockProvider, // Use the passed provider
      'Settle Battle with XP',
    )

    // console.log("✅ Battle settled with XP rewards");
    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    console.error('Error settling battle with XP:', error)
    return {
      success: false,
      error: error.message || 'Failed to settle battle',
    }
  }
}

// ============ FINAL STATE UPDATE (BASE LAYER) ============

export interface UpdateFinalStateParams {
  program: UndeadProgram
  signerPublicKey: PublicKey
  authorityPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  profileAPda: PublicKey
  profileBPda: PublicKey
  achievementsAPda: PublicKey
  achievementsBPda: PublicKey
  configPda: PublicKey
  leaderboardPda: PublicKey
  roomId: Uint8Array
}

let isUpdatingFinalState = false

export const updateFinalState = async ({
  program,
  signerPublicKey,
  authorityPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  profileAPda,
  profileBPda,
  achievementsAPda,
  achievementsBPda,
  configPda,
  leaderboardPda,
  roomId,
}: UpdateFinalStateParams): Promise<BattleRoomResult> => {
  if (!program || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (isUpdatingFinalState) {
    return { success: false, error: 'Final state update already in progress' }
  }

  isUpdatingFinalState = true

  try {
    // console.log("📊 Preparing to update final state...");

    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Check signer balance
    const signerBalance = await program.provider.connection.getBalance(signerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL // Lower estimate since no account creation
    if (signerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in signer wallet (${
          signerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)

    // Create transaction
    const transaction = await program.methods
      .updateFinalState(roomIdArray)
      .accountsPartial({
        signer: signerPublicKey,
        authority: authorityPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
        profileA: profileAPda,
        profileB: profileBPda,
        achievementsA: achievementsAPda,
        achievementsB: achievementsBPda,
        config: configPda,
        leaderboard: leaderboardPda,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = signerPublicKey

    // Simulate transaction
    const simulation = await program.provider.connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      console.error('Transaction simulation failed:', simulation.value.err)
      console.error('Simulation logs:', simulation.value.logs)
      return {
        success: false,
        error: `Simulation failed: ${simulation.value.err}`,
      }
    }

    // Send and confirm transaction
    let signature: string | undefined
    if (program.provider.sendAndConfirm) {
      signature = await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      })
    } else if (program.provider.wallet) {
      // Fallback: Manually sign and send
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
    }

    // console.log("✅ Final state updated successfully: ", signature);/
    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error updating final state:', error)

    let errorMessage = error.message || 'Failed to update final state'
    if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Final state already updated'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      errorMessage = 'Transaction already processed - please try again'
    }

    return { success: false, error: errorMessage }
  } finally {
    isUpdatingFinalState = false
  }
}

// ============ INDIVIDUAL BATTLE ACTIONS (FOR WEBSOCKET INTEGRATION) ============

export interface JoinBattleParams {
  program: UndeadProgram
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  roomId: Uint8Array
  warriorName: string
}

export const joinBattle = async ({
  program,
  ephemeralProgram,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  roomId,
  warriorName,
}: JoinBattleParams): Promise<BattleRoomResult> => {
  try {
    // First join on base layer
    const joinResult = await joinBattleRoom({
      program,
      playerPublicKey,
      warriorPda,
      battleRoomPda,
      roomId,
      warriorName,
    })

    if (!joinResult.success) {
      return joinResult
    }

    // console.log("✅ Successfully joined battle room");
    return joinResult
  } catch (error: any) {
    console.error('Error joining battle:', error)
    return {
      success: false,
      error: error.message || 'Failed to join battle',
    }
  }
}

export const signalBattleReady = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  warriorName,
}: SignalReadyParams): Promise<BattleRoomResult> => {
  try {
    const readyResult = await signalReady({
      program,
      playerPublicKey,
      warriorPda,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      warriorName,
    })

    if (!readyResult.success) {
      return readyResult
    }

    // console.log("✅ Successfully signaled ready");
    return readyResult
  } catch (error: any) {
    console.error('Error signaling ready:', error)
    return {
      success: false,
      error: error.message || 'Failed to signal ready',
    }
  }
}

//Start battle action - now accepts provider as parameter
export interface StartBattleActionParams {
  program: UndeadProgram
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  playerAPublicKey: PublicKey
  warriorAName: string
  playerBPublicKey: PublicKey
  warriorBName: string
  magicBlockProvider: any
}

export const startBattleAction = async ({
  program,
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  playerAPublicKey,
  warriorAName,
  playerBPublicKey,
  warriorBName,
  magicBlockProvider, // Use parameter
}: StartBattleActionParams): Promise<BattleRoomResult> => {
  try {
    // Step 1: Delegate battle to ER
    // console.log("🚀 Delegating battle to Ephemeral Rollup...");
    const delegateResult = await delegateBattle({
      program,
      signerPublicKey,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      playerAPublicKey,
      warriorAName,
      playerBPublicKey,
      warriorBName,
    })

    if (!delegateResult.success) {
      return delegateResult
    }

    // Wait for delegation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Step 2: Start battle on ER
    // console.log("⚔️ Starting battle on Ephemeral Rollup...");
    const startResult = await startBattleOnER({
      ephemeralProgram,
      signerPublicKey,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      magicBlockProvider, // Pass provider
    })

    if (!startResult.success) {
      return startResult
    }

    // console.log("✅ Battle started successfully!");
    return startResult
  } catch (error: any) {
    console.error('Error starting battle:', error)
    return {
      success: false,
      error: error.message || 'Failed to start battle',
    }
  }
}

//Submit answer - now accepts provider as parameter
export interface SubmitAnswerParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  questionIndex?: number
  magicBlockProvider: any // Added provider parameter
}

export const submitAnswer = async ({
  ephemeralProgram,
  playerPublicKey,
  battleRoomPda,
  attackerWarriorPda,
  defenderWarriorPda,
  roomId,
  answer,
  questionIndex,
  magicBlockProvider, // Use parameter
}: SubmitAnswerParams): Promise<BattleRoomResult> => {
  try {
    // console.log(
    //   `🎯 Submitting answer for question ${questionIndex ?? "current"}: ${
    //     answer ? "TRUE" : "FALSE"
    //   }`
    // );

    const answerResult = await answerQuestionOnER({
      ephemeralProgram,
      playerPublicKey,
      battleRoomPda,
      attackerWarriorPda,
      defenderWarriorPda,
      roomId,
      answer,
      magicBlockProvider, // Pass provider
    })

    if (!answerResult.success) {
      return answerResult
    }

    // console.log("✅ Answer submitted successfully");
    return answerResult
  } catch (error: any) {
    console.error('Error submitting answer:', error)
    return {
      success: false,
      error: error.message || 'Failed to submit answer',
    }
  }
}

//End battle - now accepts provider as parameter
export interface EndBattleParams {
  program: UndeadProgram
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  profileAPda: PublicKey
  profileBPda: PublicKey
  achievementsAPda: PublicKey
  achievementsBPda: PublicKey
  configPda: PublicKey
  leaderboardPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any // Added provider parameter
}

export const endBattle = async ({
  program,
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  profileAPda,
  profileBPda,
  achievementsAPda,
  achievementsBPda,
  configPda,
  leaderboardPda,
  roomId,
  magicBlockProvider, // Use parameter
}: EndBattleParams): Promise<BattleRoomResult> => {
  try {
    // Step 1: Settle battle on ER
    // console.log("💎 Settling battle on Ephemeral Rollup...");
    const settleResult = await settleBattleRoomOnER({
      ephemeralProgram,
      signerPublicKey,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      magicBlockProvider, // Pass provider
    })

    // if (!settleResult.success) {
    //   // console.log("⚠️ Settlement failed, continuing to final state update...");
    // }

    // Wait for settlement
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Step 2: Update final state on base layer
    // console.log("📊 Updating final state on base layer...");
    const finalResult = await updateFinalState({
      program,
      signerPublicKey,
      authorityPublicKey: authority,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      profileAPda,
      profileBPda,
      achievementsAPda,
      achievementsBPda,
      configPda,
      leaderboardPda,
      roomId,
    })

    if (!finalResult.success) {
      // console.log("⚠️ Final state update failed");
      return finalResult
    }

    // console.log("✅ Battle ended and final state updated successfully!");
    return finalResult
  } catch (error: any) {
    console.error('Error ending battle:', error)
    return {
      success: false,
      error: error.message || 'Failed to end battle',
    }
  }
}

// ============ UTILITY FUNCTIONS ============

// Helper function to convert WarriorClass to program format
const getWarriorClassVariant = (warriorClass: WarriorClass) => {
  switch (warriorClass) {
    case WarriorClass.Validator:
      return { validator: {} }
    case WarriorClass.Oracle:
      return { oracle: {} }
    case WarriorClass.Guardian:
      return { guardian: {} }
    case WarriorClass.Daemon:
      return { daemon: {} }
    default:
      return { validator: {} } // fallback
  }
}

// Helper function to convert user persona to program format
const getUserPersonaVariant = (persona: UserPersona) => {
  switch (persona) {
    case UserPersona.BoneSmith:
      return { boneSmith: {} }
    case UserPersona.Cerberus:
      return { cerberus: {} }
    case UserPersona.TreasureHunter:
      return { treasureHunter: {} }
    case UserPersona.ObsidianProphet:
      return { obsidianProphet: {} }
    case UserPersona.GraveBaron:
      return { graveBaron: {} }
    case UserPersona.Demeter:
      return { demeter: {} }
    case UserPersona.Collector:
      return { collector: {} }
    case UserPersona.CovenCaller:
      return { covenCaller: {} }
    case UserPersona.SeerOfAsh:
      return { seerOfAsh: {} }
    default:
      return { boneSmith: {} } // fallback
  }
}

// Helper function to get human-readable image rarity name
const getImageRarityName = (imageRarity: ImageRarity | any): any => {
  if (typeof imageRarity === 'object') {
    const key = Object.keys(imageRarity)[0]
    return key.charAt(0).toUpperCase() + key.slice(1)
  }
  return imageRarity || 'Common'
}

// Keep the simple DNA generator
export const generateRandomDNA = (): string => {
  const chars = '0123456789ABCDEF'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate random room ID (32 bytes)
export const generateRoomId = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32))
}

// Convert room ID to hex string for display
export const roomIdToHex = (roomId: Uint8Array): string => {
  return Array.from(roomId)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// Convert hex string back to room ID
export const hexToRoomId = (hex: string): Uint8Array => {
  if (hex.length !== 64) {
    throw new Error('Hex string must be exactly 64 characters (32 bytes)')
  }

  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }

  return new Uint8Array(bytes)
}

// Warrior class information for UI
export const WARRIOR_CLASS_INFO = {
  [WarriorClass.Validator]: {
    title: 'Validator',
    icon: '⚖️',
    description: 'The undead Warrior of network consensus',
    traits: 'Well-rounded combat capabilities',
    statDistribution: 'Balanced ATK/DEF/KNOW',
    specialAbility: 'Consensus Strike - Balanced damage output',
    lore: 'Masters of network validation and Byzantine fault tolerance',
  },
  [WarriorClass.Oracle]: {
    title: 'Oracle',
    icon: '🔮',
    description: 'Mystical warrior with a Mega brain, lineage of Satoshi',
    traits: 'High knowledge, moderate combat skills',
    statDistribution: 'High KNOW, Moderate ATK/DEF',
    specialAbility: 'Data Feed - Enhanced knowledge-based attacks and defense',
    lore: 'These warriors knew about the birth of blockchain and cryptography',
  },
  [WarriorClass.Guardian]: {
    title: 'Guardian',
    icon: '🛡️',
    description: 'Stalwart defenders of the blockchain realm',
    traits: 'Exceptional defense, moderate attack',
    statDistribution: 'High DEF, Moderate ATK/KNOW',
    specialAbility: 'Shield Wall - Superior defensive capabilities',
    lore: 'Protectors who secure the network from all threats and hacks',
  },
  [WarriorClass.Daemon]: {
    title: 'Daemon',
    icon: '⚡',
    description: 'Aggressive background processes of destruction',
    traits: 'High attack, low defense - glass cannon',
    statDistribution: 'High ATK, Low DEF, Moderate KNOW',
    specialAbility: 'Process Kill - Devastating but risky attacks',
    lore: 'Relentless background warriors optimized for raw damage',
  },
}

export { PERSONA_INFO as USER_PERSONA_INFO } from '@/types/undead'

// Utility function to check transaction status
export const checkTransactionStatus = async (
  connection: any,
  signature: string,
): Promise<{ confirmed: boolean; error?: string }> => {
  try {
    const result = await connection.confirmTransaction(signature, 'confirmed')
    return {
      confirmed: !result.value.err,
      error: result.value.err?.toString(),
    }
  } catch (error: any) {
    return { confirmed: false, error: error.message }
  }
}

// Battle state checker
export const getBattleRoomState = async (
  program: UndeadProgram,
  battleRoomPda: PublicKey,
): Promise<{ state: any; battleRoom?: any; error?: string }> => {
  try {
    const battleRoom = await program.account.battleRoom.fetch(battleRoomPda)
    return { state: battleRoom.state, battleRoom }
  } catch (error: any) {
    return { state: null, error: error.message }
  }
}

// Warrior stats checker
export const getWarriorStats = async (
  program: UndeadProgram,
  warriorPda: PublicKey,
): Promise<{ warrior: any; error?: string }> => {
  try {
    const warrior = await program.account.undeadWarrior.fetch(warriorPda)
    return { warrior }
  } catch (error: any) {
    return { warrior: null, error: error.message }
  }
}

// User profile checker
export const getUserProfile = async (
  program: UndeadProgram,
  profilePda: PublicKey,
): Promise<{ profile: any; error?: string }> => {
  try {
    const profile = await program.account.userProfile.fetch(profilePda)
    return { profile }
  } catch (error: any) {
    return { profile: null, error: error.message }
  }
}
