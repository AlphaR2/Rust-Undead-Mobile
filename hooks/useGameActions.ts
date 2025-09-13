import { authority } from '@/config/program'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { BattleState, ImageRarity, UserPersona, Warrior, WarriorClass } from '@/types/undead'
import { Program } from '@coral-xyz/anchor'

// import { SessionWalletInterface } from '@magicblock-labs/gum-react-sdk'
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram } from '@solana/web3.js'
import bs58 from 'bs58'
import { executeWithDeduplication, hashTxContent, useWalletInfo } from './useUndeadProgram'

// ============ TYPE DEFINITIONS ============

type UndeadProgram = Program<UndeadTypes>

// ============ INTERFACE DEFINITIONS ============
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

export interface JoinBattleRoomParams {
  program: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  roomId: Uint8Array
  warriorName: string
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

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
  sessionToken?: string | null
  selectedConcepts: number[]
  selectedTopics: number[]
  selectedQuestions: number[]
  correctAnswers: boolean[]
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
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
  progress: number // 0-100
}

export interface WarriorCreationResult {
  success: boolean
  signature?: string
  error?: string
  warrior?: Warrior | null
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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

export interface StartBattleParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

export interface AnswerQuestionERParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  clientSeed?: number
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

export interface SettleBattleERParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

export interface JoinBattleParams {
  program: UndeadProgram
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  warriorPda: PublicKey
  battleRoomPda: PublicKey
  roomId: Uint8Array
  warriorName: string
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

export interface SubmitAnswerParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  questionIndex?: number
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

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
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
  // sessionWallet?: SessionWalletInterface
}

// ============ STATE MANAGEMENT ============

let isCreatingWarrior = false
let isCreatingUserProfile = false
let isCreatingBattleRoom = false
let isJoiningBattleRoom = false
let isSignalingReady = false
let isDelegatingBattle = false
let isUpdatingFinalState = false

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

    // Determine payer and session usage
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey

    // console.log("SESSION_INFO", sessionInfo);
    // console.log("PAYER_PUBLIC_KEY", payerPublicKey.toString());
    // console.log("HAS_ACTIVE_SESSION", hasActiveSession);

    // Check payer balance
    const payerBalance = await program.provider.connection.getBalance(payerPublicKey)
    const minimumBalance = 0.002 * LAMPORTS_PER_SOL
    if (payerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'player'} wallet (${
          payerBalance / LAMPORTS_PER_SOL
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

    // console.log("🔍 createWarrior accounts:", {
    //   signer: payerPublicKey.toString(),
    //   player: userPublicKey.toString(),
    //   authority: authority.toString(),
    //   warrior: warriorPda.toString(),
    //   userProfile: profilePda.toString(),
    //   userAchievements: userAchievementsPda.toString(),
    //   config: configPda.toString(),
    //   sessionToken: hasActiveSession
    //     ? sessionInfo.sessionToken.toString()
    //     : "null",
    // });

    // Create transaction with session-aware accounts
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

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `createWarrior_${payerPublicKey.toString()}_${txHash}`

    signature = await executeWithDeduplication(
      async () => {
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        let sig: string | undefined
        if (program.provider.sendAndConfirm) {
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

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
      const logs = await error.getLogs(program.provider.connection)
      console.error('SendTransactionError details:', error.message, logs)
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
  } finally {
    isCreatingWarrior = false
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
      // Profile doesn't exist, continue
    }

    // Determine the signing strategy based on session info
    const hasActiveSession = !!sessionInfo
    const signerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : userPublicKey

    // Check signer balance
    const signerBalance = await program.provider.connection.getBalance(signerPublicKey)
    const minimumBalance = 0.002 * LAMPORTS_PER_SOL
    if (signerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'player'} wallet (${
          signerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.002 SOL for transaction.`,
      }
    }

    // Convert persona to program format
    const personaVariant = getUserPersonaVariant(userPersona)

    console.log("🔍 Creating user profile transaction...")
    console.log("signer:", signerPublicKey.toString())
    console.log("player:", userPublicKey.toString())
    console.log("userProfile:", profilePda.toString())
    console.log("userRegistry:", userRegistryPda.toString())
    console.log("sessionToken:", hasActiveSession ? sessionInfo.sessionToken.toString() : "null")

    const signature = await program.methods
      .userdata(username, personaVariant)
      .accountsPartial({
        signer: signerPublicKey,
        player: userPublicKey,
        userRegistry: userRegistryPda,
        userProfile: profilePda,
        sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('✅ User profile created successfully:', signature)
    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error creating user profile:', error)

    let errorMessage = error.message || 'Failed to create user profile'
    
    // Standardized error handling
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
      // Handle idempotency - check if profile was actually created
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
  } finally {
    isCreatingUserProfile = false
  }
}
// ============ BATTLE ROOM ACTIONS ============
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
  sessionInfo,
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

    const hasActiveSession = !!sessionInfo

    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : playerPublicKey

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

    // console.log("sessioninfo:", sessionInfo);

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
        signer: payerPublicKey,
        playerA: playerPublicKey,
        warriorA: warriorPda,
        battleRoom: battleRoomPda,
        sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `createBattleRoom_${playerPublicKey.toString()}_${txHash}`

    let signature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        // Check signature status before sending
        if (transaction.signature) {
          const sig = bs58.encode(transaction.signature)
          const status = await program.provider.connection.getSignatureStatus(sig)
          if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
            // console.log("Transaction already processed:", sig);
            return sig
          }
        }

        let sig: string | undefined
        if (program.provider.sendAndConfirm) {
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

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
      try {
        const accountInfo = await program.provider.connection.getAccountInfo(battleRoomPda)
        if (accountInfo) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  } finally {
    isCreatingBattleRoom = false
  }
}

export const joinBattleRoom = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  roomId,
  warriorName,
  sessionInfo,
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

    const hasActiveSession = !!sessionInfo

    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : playerPublicKey
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
        signer: payerPublicKey,
        playerB: playerPublicKey,
        warriorB: warriorPda,
        battleRoom: battleRoomPda,
        sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
      })
      .transaction()

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `joinBattleRoom_${playerPublicKey.toString()}_${txHash}`

    let signature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        // Check signature status before sending
        if (transaction.signature) {
          const sig = bs58.encode(transaction.signature)
          const status = await program.provider.connection.getSignatureStatus(sig)
          if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
            // console.log("Transaction already processed:", sig);
            return sig
          }
        }

        let sig: string | undefined
        if (program.provider.sendAndConfirm) {
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

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
      try {
        const battleRoom = await program.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.playerB && battleRoom.playerB.equals(playerPublicKey)) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}
export const signalReady = async ({
  program,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  warriorName,
  sessionInfo,
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

    // Determine payer and session usage
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo!.sessionSigner.publicKey : playerPublicKey

    // console.log("SESSION_INFO:", sessionInfo);
    // console.log("PAYER_PUBLIC_KEY:", payerPublicKey.toString());
    // console.log("HAS_ACTIVE_SESSION:", hasActiveSession);

    // Check payer balance
    const playerBalance = await program.provider.connection.getBalance(payerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL
    if (playerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'player'} wallet (${
          playerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)
    // console.log("SignalReady Transaction Accounts:", {
    //   signer: payerPublicKey.toString(),
    //   player: playerPublicKey.toString(),
    //   warrior: warriorPda.toString(),
    //   battleRoom: battleRoomPda.toString(),
    //   warriorA: warriorAPda.toString(),
    //   warriorB: warriorBPda.toString(),
    //   sessionToken: hasActiveSession
    //     ? sessionInfo!.sessionToken.toString()
    //     : "null",
    // });

    // Create transaction
    const transaction = await program.methods
      .signalReady(roomIdArray, warriorName)
      .accountsPartial({
        signer: payerPublicKey,
        player: playerPublicKey,
        warrior: warriorPda,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
        sessionToken: hasActiveSession ? sessionInfo!.sessionToken : null,
      })
      .transaction()

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `signalReady_${payerPublicKey.toString()}_${txHash}`

    let signature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        // Check signature status before sending
        if (transaction.signature) {
          const sig = bs58.encode(transaction.signature)
          const status = await program.provider.connection.getSignatureStatus(sig)
          if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
            // console.log("Transaction already processed:", sig);
            return sig
          }
        }

        let sig: string | undefined
        if (program.provider.sendAndConfirm) {
          // console.log(
          //   `Attempting ${
          //     hasActiveSession ? "session-based" : "direct wallet"
          //   } signing with:`,
          //   payerPublicKey.toString()
          // );
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

    return { success: true, signature }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(program.provider.connection))
    }
    console.error('Error signaling ready:', error)

    let errorMessage = error.message || 'Failed to signal ready'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Invalid session signer. Please reconnect wallet or create a new session.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Player already signaled ready'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const battleRoom = await program.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.playerAReady || battleRoom.playerBReady) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

// trying  magic router
// export const delegateBattle = async ({
//   program,
//   signerPublicKey,
//   battleRoomPda,
//   warriorAPda,
//   warriorBPda,
//   roomId,
//   playerAPublicKey,
//   warriorAName,
//   playerBPublicKey,
//   warriorBName,
//   sessionInfo,
//   sessionWallet,
// }: DelegateBattleParams): Promise<BattleRoomResult> => {
//   if (!program || !signerPublicKey) {
//     return { success: false, error: "Program or signer public key required" };
//   }

//   if (isDelegatingBattle) {
//     return { success: false, error: "Battle delegation already in progress" };
//   }

//   isDelegatingBattle = true;

//   // Use Magic Router connection
//   const connection = new Connection(
//     "https://devnet-router.magicblock.app",
//     "confirmed"
//   );

//   try {
//     // Verify battle room exists
//     try {
//       await program.account.battleRoom.fetch(battleRoomPda);
//     } catch (fetchError) {
//       return { success: false, error: "Battle room does not exist" };
//     }

//     // Determine signing approach based on session availability
//     // const hasActiveSession = !!sessionInfo?.sessionSigner?.publicKey;
//     // const payerPublicKey = hasActiveSession
//     //   ? sessionInfo.sessionSigner.publicKey
//     //   : signerPublicKey;

//     const hasActiveSession = !!sessionWallet?.publicKey;
//     const payerPublicKey = hasActiveSession
//       ? sessionWallet.publicKey
//       : signerPublicKey;

//     console.log("SESSION_INFO", sessionInfo);
//     console.log("PAYER_PUBLIC_KEY", payerPublicKey?.toString());
//     console.log("HAS_ACTIVE_SESSION", hasActiveSession);

//     const roomIdArray = Array.from(roomId);

//     console.log("🔍 delegateBattle accounts:", {
//       signer: payerPublicKey?.toString(),
//       battleRoom: battleRoomPda.toString(),
//       warriorA: warriorAPda.toString(),
//       warriorB: warriorBPda.toString(),
//     });
//     if (!payerPublicKey) {
//       return { success: false, error: "payer does not exist" };
//     }
//     console.log("stuff passed:", {
//       signer: payerPublicKey,
//       battleRoom: battleRoomPda,
//       warriorA: warriorAPda,
//       warriorB: warriorBPda,
//       sessionToken: null, //for some reason, not passing the check sneaked in a new session key and now it is going to return invalid session token if we pass a session token here. instead we need to fix it on program level
//     });

//     // Build transaction
//     const transaction = await program.methods
//       .delegateBattle(
//         roomIdArray,
//         playerAPublicKey,
//         warriorAName,
//         playerBPublicKey,
//         warriorBName
//       )
//       .accountsPartial({
//         signer: payerPublicKey,
//         battleRoom: battleRoomPda,
//         warriorA: warriorAPda,
//         warriorB: warriorBPda,
//         sessionToken: hasActiveSession ? sessionWallet.sessionToken : null,
//       })
//       .transaction();

//     let signature: string;

//     if (hasActiveSession && sessionWallet) {
//       // Use session wallet's signing with Magic Router preparation
//       console.log("Using session-based signing with Magic Router");

//       const preparedTransaction = await prepareMagicTransaction(
//         connection,
//         transaction
//       );

//       // Use session wallet's signAndSendTransaction method
//       if (sessionWallet.signAndSendTransaction) {
//         const signatures = await sessionWallet.signAndSendTransaction(
//           preparedTransaction,
//           connection
//         );
//         console.log("trxxx0", signatures);
//         signature = signatures[0];
//         console.log("trxxx1", signature);
//       } else if (sessionWallet.sendTransaction) {
//         signature = await sessionWallet.sendTransaction(
//           preparedTransaction,
//           connection
//         );
//         console.log("trxxx0", signature);
//       } else {
//         throw new Error("Session wallet does not support transaction sending");
//       }
//     } else {
//       // Use Magic Router's prepareMagicTransaction for browser wallets
//       console.log("Using browser wallet signing with Magic Router");

//       const preparedTransaction = await prepareMagicTransaction(
//         connection,
//         transaction
//       );
//       if (program.provider.wallet) {
//         const signedTx = await program.provider.wallet.signTransaction(
//           preparedTransaction
//         );
//         const serializedTx = signedTx.serialize();

//         signature = await connection.sendRawTransaction(serializedTx, {
//           skipPreflight: true,
//           preflightCommitment: "confirmed",
//         });

//         console.log("trxxx0", signature);

//         // Confirm transaction
//         const { blockhash, lastValidBlockHeight } =
//           await connection.getLatestBlockhash("confirmed");
//         await connection.confirmTransaction(
//           {
//             signature,
//             blockhash,
//             lastValidBlockHeight,
//           },
//           "confirmed"
//         );

//         console.log("trxxx0", signature);
//       } else {
//         throw new Error("No wallet provider available");
//       }
//     }

//     // Wait for delegation to complete
//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     return { success: true, signature };
//   } catch (error: any) {
//     console.error("Error delegating battle:", error);

//     let errorMessage = error.message || "Failed to delegate battle";
//     if (error.message.includes("unknown signer")) {
//       errorMessage =
//         "Session authentication failed. Please try again or connect your wallet directly.";
//     } else if (error.message.includes("insufficient funds")) {
//       errorMessage = "Insufficient SOL balance for transaction or rent";
//     } else if (error.message.includes("blockhash not found")) {
//       errorMessage = "Network congestion - please try again";
//     } else if (error.message.includes("already in use")) {
//       errorMessage = "Battle already delegated";
//     } else if (error.message.includes("User rejected")) {
//       errorMessage = "Transaction cancelled by user";
//     } else if (error.message.includes("already processed")) {
//       try {
//         const battleRoom = await program.account.battleRoom.fetch(
//           battleRoomPda
//         );
//         if (battleRoom.state === BattleState.InProgress) {
//           return { success: true };
//         }
//       } catch (fetchError) {
//         errorMessage = "Transaction already processed - please check wallet";
//       }
//     }

//     return { success: false, error: errorMessage };
//   } finally {
//     isDelegatingBattle = false;
//   }
// };

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
  sessionInfo,
}: DelegateBattleParams): Promise<BattleRoomResult> => {
  if (!program || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (isDelegatingBattle) {
    return { success: false, error: 'Battle delegation already in progress' }
  }

  isDelegatingBattle = true

  try {
    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Determine payer and session usage
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPublicKey

    // console.log("SESSION_INFO", sessionInfo);
    // console.log("PAYER_PUBLIC_KEY", payerPublicKey.toString());
    // console.log("HAS_ACTIVE_SESSION", hasActiveSession);
    // console.log("SIGNER_PUBLIC_KEY", signerPublicKey.toString());

    // Check payer balance
    const payerBalance = await program.provider.connection.getBalance(payerPublicKey)
    const minimumBalance = 0.001 * LAMPORTS_PER_SOL
    if (payerBalance < minimumBalance) {
      return {
        success: false,
        error: `Insufficient funds in ${hasActiveSession ? 'session signer' : 'signer'} wallet (${
          payerBalance / LAMPORTS_PER_SOL
        } SOL). Need ~0.001 SOL for transaction.`,
      }
    }

    const roomIdArray = Array.from(roomId)

    // console.log("🔍 delegateBattle accounts:", {
    //   signer: payerPublicKey.toString(),
    //   battleRoom: battleRoomPda.toString(),
    //   warriorA: warriorAPda.toString(),
    //   warriorB: warriorBPda.toString(),
    //   sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
    // });

    // Create transaction with session-aware accounts
    const transaction = await program.methods
      .delegateBattle(roomIdArray, playerAPublicKey, warriorAName, playerBPublicKey, warriorBName)
      .accountsPartial({
        signer: payerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
        sessionToken: null,
      })
      .transaction()

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 600000, // Set to 600,000 CUs
      }),
    )

    const txHash = await hashTxContent(transaction)
    const operationKey = `delegateBattle_${payerPublicKey.toString()}_${txHash}`

    let signature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        let sig: string | undefined

        // Let the wallet adapter handle signing (session or regular)
        if (program.provider.sendAndConfirm) {
          // console.log(
          //   `Attempting ${
          //     hasActiveSession ? "session-based" : "direct wallet"
          //   } signing with:`,
          //   payerPublicKey.toString()
          // );
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

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
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle already delegated'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const battleRoom = await program.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.state === BattleState.InProgress) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  } finally {
    isDelegatingBattle = false
  }
}

//  Battle on ER

export interface StartBattleParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

let isStartingBattle = false

// export const startBattleOnER = async ({
//   ephemeralProgram,
//   signerPublicKey,
//   battleRoomPda,
//   warriorAPda,
//   warriorBPda,
//   roomId,
//   magicBlockProvider,
//   sessionInfo,
//   sessionWallet,
// }: StartBattleParams): Promise<BattleRoomResult> => {
//   if (!ephemeralProgram || !signerPublicKey) {
//     console.error("❌ Missing ephemeralProgram or signerPublicKey");
//     return { success: false, error: "Program or signer public key required" };
//   }

//   if (isStartingBattle) {
//     return { success: false, error: "Battle start already in progress" };
//   }

//   isStartingBattle = true;

//   // Use Magic Router connection for ER transactions
//   const connection = new Connection(
//     "https://devnet-router.magicblock.app",
//     "confirmed"
//   );

//   try {
//     const hasActiveSession = !!sessionInfo?.sessionSigner?.publicKey;
//     const payerPublicKey = hasActiveSession
//       ? sessionInfo.sessionSigner?.publicKey
//       : signerPublicKey;

//     const roomIdArray = Array.from(roomId);

//     console.log("🔍 Transaction accounts:", {
//       signer: payerPublicKey?.toString(),
//       battleRoom: battleRoomPda.toString(),
//       warriorA: warriorAPda.toString(),
//       warriorB: warriorBPda.toString(),
//       sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
//     });

//     // Create transaction
//     console.log("📝 Creating startBattle transaction...");
//     const transaction = await ephemeralProgram.methods
//       .startBattle(roomIdArray)
//       .accountsPartial({
//         signer: payerPublicKey!,
//         battleRoom: battleRoomPda,
//         warriorA: warriorAPda,
//         warriorB: warriorBPda,
//         sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
//       })
//       .transaction();

//     console.log("📝 Transaction created successfully");

//     let signature: string;

//     if (hasActiveSession && sessionWallet) {
//       // Use session wallet's signing with Magic Router preparation
//       console.log("✍️ Using session-based signing with Magic Router");

//       const preparedTransaction = await prepareMagicTransaction(
//         connection,
//         transaction
//       );

//       // Use session wallet's signAndSendTransaction method
//       if (sessionWallet.signAndSendTransaction) {
//         const signatures = await sessionWallet.signAndSendTransaction(
//           preparedTransaction,
//           connection
//         );
//         console.log("trxxx0", signatures);
//         signature = signatures[0];
//         console.log("trxxx1", signature);
//       } else if (sessionWallet.sendTransaction) {
//         signature = await sessionWallet.sendTransaction(
//           preparedTransaction,
//           connection
//         );
//         console.log("trxxx2", signature);
//       } else {
//         throw new Error("Session wallet does not support transaction sending");
//       }
//     } else {
//       // Use Magic Router's prepareMagicTransaction for browser wallets
//       console.log("✍️ Using browser wallet signing with Magic Router");

//       const preparedTransaction = await prepareMagicTransaction(
//         connection,
//         transaction
//       );

//       if (magicBlockProvider?.wallet?.signTransaction) {
//         const signedTx = await magicBlockProvider.wallet.signTransaction(
//           preparedTransaction
//         );
//         const serializedTx = signedTx.serialize();

//         signature = await connection.sendRawTransaction(serializedTx, {
//           skipPreflight: true,
//           preflightCommitment: "confirmed",
//         });

//         // Confirm transaction
//         const { blockhash, lastValidBlockHeight } =
//           await connection.getLatestBlockhash("confirmed");
//         await connection.confirmTransaction(
//           {
//             signature,
//             blockhash,
//             lastValidBlockHeight,
//           },
//           "confirmed"
//         );
//         console.log("trxxx-last", signature);
//       } else {
//         throw new Error("No wallet provider available");
//       }
//     }

//     console.log("✅ Transaction execution completed, signature:", signature);

//     // Wait for transaction to settle
//     console.log("⏳ Waiting 5 seconds for transaction to settle...");
//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     console.log("🎉 startBattleOnER completed successfully");
//     return {
//       success: true,
//       signature,
//       commitmentSignature: signature,
//     };
//   } catch (error: any) {
//     console.error("❌ startBattleOnER failed with error:");
//     console.error("Error type:", error.constructor.name);
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);

//     let errorMessage = error.message || "Failed to start battle on ER";
//     if (error.message.includes("unknown signer")) {
//       errorMessage =
//         "Session authentication failed. Please try again or connect your wallet directly.";
//     } else if (error.message.includes("insufficient funds")) {
//       errorMessage = "Insufficient SOL balance for transaction or rent";
//     } else if (error.message.includes("blockhash not found")) {
//       errorMessage = "Network congestion - please try again";
//     } else if (error.message.includes("already in use")) {
//       errorMessage = "Battle already started";
//     } else if (error.message.includes("User rejected")) {
//       errorMessage = "Transaction cancelled by user";
//     } else if (error.message.includes("already processed")) {
//       try {
//         const battleRoom = await ephemeralProgram.account.battleRoom.fetch(
//           battleRoomPda
//         );
//         if (battleRoom.state === BattleState.InProgress) {
//           console.log(
//             "✅ Battle was already started (recovered from 'already processed' error)"
//           );
//           return { success: true };
//         }
//       } catch (fetchError) {
//         console.error(
//           "❌ Failed to fetch battle room after 'already processed' error:",
//           fetchError
//         );
//         errorMessage = "Transaction already processed - please check wallet";
//       }
//     }

//     return { success: false, error: errorMessage };
//   } finally {
//     console.log("🔄 Setting isStartingBattle to false");
//     isStartingBattle = false;
//   }
// };

export const startBattleOnER = async ({
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  magicBlockProvider,
  sessionInfo,
}: StartBattleParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !signerPublicKey) {
    console.error('❌ Missing ephemeralProgram or signerPublicKey')
    return { success: false, error: 'Program or signer public key required' }
  }

  if (!magicBlockProvider) {
    console.error('❌ Missing magicBlockProvider')
    return { success: false, error: 'Magic Block provider required' }
  }

  isStartingBattle = true

  try {
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPublicKey

    const roomIdArray = Array.from(roomId)

    console.log('🔍 Transaction accounts:', {
      signer: payerPublicKey.toString(),
      battleRoom: battleRoomPda.toString(),
      warriorA: warriorAPda.toString(),
      warriorB: warriorBPda.toString(),
      sessionToken: null,
    })

    // Create transaction
    // console.log("📝 Creating startBattle transaction...");

    const transaction = await ephemeralProgram.methods
      .startBattle(roomIdArray)
      .accountsPartial({
        signer: payerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
        sessionToken: null,
      })
      .transaction()

    console.log('📝 Transaction created successfully')

    // Fetch fresh blockhash
    // console.log("🔗 Fetching fresh blockhash...");
    const { blockhash, lastValidBlockHeight } =
      await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')

    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    // console.log("🔗 Blockhash set:", {
    //   blockhash,
    //   lastValidBlockHeight,
    //   feePayer: payerPublicKey.toString(),
    // });

    const txHash = await hashTxContent(transaction)
    const operationKey = `startBattle_${payerPublicKey.toString()}_${txHash}`

    // console.log(
    //   "🔄 Starting transaction execution with deduplication key:",
    //   operationKey
    // );

    let commitmentSignature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        // Sign the transaction using magicBlockProvider
        // console.log("✍️ Signing transaction with magicBlockProvider...");
        const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
        // console.log("✅ Transaction signed successfully");

        const serializedTx = signedTx.serialize()
        // console.log("✅ Transaction serialized, size:", serializedTx.length);

        // console.log("📡 Sending raw transaction to Magic Block...");
        const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
          skipPreflight: true,
          preflightCommitment: 'confirmed',
        })
        // console.log("✅ Raw transaction sent, signature:", sig);

        // console.log("⏳ Confirming transaction...");
        await ephemeralProgram.provider.connection.confirmTransaction(
          {
            signature: sig,
            blockhash: newBlockhash,
            lastValidBlockHeight: newHeight,
          },
          'confirmed',
        )
        console.log('✅ Transaction confirmed')

        return sig
      },
      operationKey,
      60000,
      true,
    )

    // console.log(
    //   "✅ Transaction execution completed, signature:",
    //   commitmentSignature
    // );

    // Wait for transaction to settle
    // console.log("⏳ Waiting 5 seconds for transaction to settle...");
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // console.log("🎉 startBattleOnER completed successfully");
    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    console.error('❌ startBattleOnER failed with error:')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    if (error instanceof SendTransactionError) {
      console.error('📋 SendTransactionError details:', error.message)
      try {
        const logs = await error.getLogs(ephemeralProgram.provider.connection)
        console.error('📋 Transaction logs:', logs)
      } catch (logError) {
        console.error('❌ Failed to get transaction logs:', logError)
      }
    }

    let errorMessage = error.message || 'Failed to start battle on ER'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle already started'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const battleRoom = await ephemeralProgram.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.state === BattleState.InProgress) {
          // console.log(
          //   "✅ Battle was already started (recovered from 'already processed' error)"
          // );
          return { success: true }
        }
      } catch (fetchError) {
        console.error("❌ Failed to fetch battle room after 'already processed' error:", fetchError)
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  } finally {
    // console.log("🔄 Setting isStartingBattle to false");
    isStartingBattle = false
  }
}

// Answer Question on ER - no changes needed

export interface AnswerQuestionERParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  clientSeed?: number
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

// Settle Battle on ER - no changes needed
export interface SettleBattleERParams {
  ephemeralProgram: UndeadProgram
  signerPublicKey: PublicKey
  battleRoomPda: PublicKey
  warriorAPda: PublicKey
  warriorBPda: PublicKey
  roomId: Uint8Array
  magicBlockProvider: any
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

let isAnsweringQuestion = false
let isSettlingBattle = false

// Answer Question on ER
export const answerQuestionOnER = async ({
  ephemeralProgram,
  playerPublicKey,
  battleRoomPda,
  attackerWarriorPda,
  defenderWarriorPda,
  roomId,
  answer,
  clientSeed,
  magicBlockProvider,
  sessionInfo,
}: AnswerQuestionERParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  if (isAnsweringQuestion) {
    return { success: false, error: 'Answer question already in progress' }
  }

  isAnsweringQuestion = true

  try {
    // Check if battleRoomPda exists
    try {
      await ephemeralProgram.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Determine payer and session usage
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : playerPublicKey

    // console.log("SESSION_INFO", sessionInfo);
    // console.log("PAYER_PUBLIC_KEY", payerPublicKey.toString());
    // console.log("HAS_ACTIVE_SESSION", hasActiveSession);
    // console.log("PLAYER_PUBLIC_KEY", playerPublicKey.toString());

    const roomIdArray = Array.from(roomId)
    const seed = clientSeed ?? Math.floor(Math.random() * 256)

    // console.log("🔍 answerQuestionOnER accounts:", {
    //   signer: payerPublicKey.toString(),
    //   player: playerPublicKey.toString(),
    //   battleRoom: battleRoomPda.toString(),
    //   attackerWarrior: attackerWarriorPda.toString(),
    //   defenderWarrior: defenderWarriorPda.toString(),
    //   sessionToken: null,
    // });

    // Create transaction with session-aware accounts
    const transaction = await ephemeralProgram.methods
      .answerQuestion(roomIdArray, answer, seed)
      .accountsPartial({
        signer: payerPublicKey,
        player: playerPublicKey,
        battleRoom: battleRoomPda,
        attackerWarrior: attackerWarriorPda,
        defenderWarrior: defenderWarriorPda,
        sessionToken: null,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } =
      await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `answerQuestion_${payerPublicKey.toString()}_${txHash}`

    let commitmentSignature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        let sig: string | undefined

        // Handle signing with Magic Block provider
        if (magicBlockProvider.sendAndConfirm) {
          // console.log(
          //   `Attempting ${
          //     hasActiveSession ? "session-based" : "direct wallet"
          //   } signing with:`,
          //   payerPublicKey.toString()
          // );
          sig = await magicBlockProvider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (magicBlockProvider.wallet) {
          const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await ephemeralProgram.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

    // Wait for transaction to settle
    await new Promise((resolve) => setTimeout(resolve, 5000))

    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(ephemeralProgram.provider.connection))
    }
    console.error('Error answering question on ER:', error)

    let errorMessage = error.message || 'Failed to answer question on ER'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Question already answered'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const battleRoom = await ephemeralProgram.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.state === BattleState.InProgress) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  } finally {
    isAnsweringQuestion = false
  }
}

// Settle Battle on ER
export const settleBattleRoomOnER = async ({
  ephemeralProgram,
  signerPublicKey,
  battleRoomPda,
  warriorAPda,
  warriorBPda,
  roomId,
  magicBlockProvider,
  sessionInfo,
}: SettleBattleERParams): Promise<BattleRoomResult> => {
  if (!ephemeralProgram || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  if (isSettlingBattle) {
    return { success: false, error: 'Battle settlement already in progress' }
  }

  isSettlingBattle = true

  try {
    // Check if battleRoomPda exists
    try {
      await ephemeralProgram.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    // Determine payer and session usage
    const hasActiveSession = !!sessionInfo
    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPublicKey

    // console.log("SESSION_INFO", sessionInfo);
    // console.log("PAYER_PUBLIC_KEY", payerPublicKey.toString());
    // console.log("HAS_ACTIVE_SESSION", hasActiveSession);
    // console.log("SIGNER_PUBLIC_KEY", signerPublicKey.toString());

    const roomIdArray = Array.from(roomId)

    // console.log("🔍 settleBattleRoomOnER accounts:", {
    //   signer: payerPublicKey.toString(),
    //   battleRoom: battleRoomPda.toString(),
    //   warriorA: warriorAPda.toString(),
    //   warriorB: warriorBPda.toString(),
    //   sessionToken: hasActiveSession ? sessionInfo.sessionToken : null,
    // });

    // Create transaction with session-aware accounts
    const transaction = await ephemeralProgram.methods
      .settleBattleRoom(roomIdArray)
      .accountsPartial({
        signer: payerPublicKey,
        battleRoom: battleRoomPda,
        warriorA: warriorAPda,
        warriorB: warriorBPda,
        sessionToken: null,
      })
      .transaction()

    // Fetch fresh blockhash
    const { blockhash, lastValidBlockHeight } =
      await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `settleBattle_${payerPublicKey.toString()}_${txHash}`

    let commitmentSignature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        let sig: string | undefined

        // Handle signing with Magic Block provider
        if (magicBlockProvider.sendAndConfirm) {
          // console.log(
          //   `Attempting ${
          //     hasActiveSession ? "session-based" : "direct wallet"
          //   } signing with:`,
          //   payerPublicKey.toString()
          // );
          sig = await magicBlockProvider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (magicBlockProvider.wallet) {
          const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await ephemeralProgram.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

    // Wait for transaction to settle
    await new Promise((resolve) => setTimeout(resolve, 5000))

    return {
      success: true,
      signature: commitmentSignature,
      commitmentSignature,
    }
  } catch (error: any) {
    if (error instanceof SendTransactionError) {
      console.error('SendTransactionError details:', error.message)
      console.error('Transaction logs:', await error.getLogs(ephemeralProgram.provider.connection))
    }
    console.error('Error settling battle on ER:', error)

    let errorMessage = error.message || 'Failed to settle battle on ER'
    if (error.message.includes('unknown signer')) {
      errorMessage = 'Session authentication failed. Please try again or connect your wallet directly.'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient SOL balance for transaction or rent'
    } else if (error.message.includes('blockhash not found')) {
      errorMessage = 'Network congestion - please try again'
    } else if (error.message.includes('already in use')) {
      errorMessage = 'Battle already settled'
    } else if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction cancelled by user'
    } else if (error.message.includes('already processed')) {
      try {
        const battleRoom = await ephemeralProgram.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.state === BattleState.Completed) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
    }

    return { success: false, error: errorMessage }
  } finally {
    isSettlingBattle = false
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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

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
  sessionInfo,
}: UpdateFinalStateParams): Promise<BattleRoomResult> => {
  if (!program || !signerPublicKey) {
    return { success: false, error: 'Program or signer public key required' }
  }

  if (isUpdatingFinalState) {
    return { success: false, error: 'Final state update already in progress' }
  }

  isUpdatingFinalState = true

  try {
    // Check if battleRoomPda exists
    try {
      await program.account.battleRoom.fetch(battleRoomPda)
    } catch (fetchError) {
      return { success: false, error: 'Battle room does not exist' }
    }

    const hasActiveSession = !!sessionInfo

    const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPublicKey

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
        signer: payerPublicKey,
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
        sessionToken: null,
      })
      .transaction()

    // Fetch fresh blockhash before hashing
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    const txHash = await hashTxContent(transaction)
    const operationKey = `updateFinalState_${signerPublicKey.toString()}_${txHash}`

    let signature: string | undefined = await executeWithDeduplication(
      async () => {
        // Re-fetch blockhash to ensure freshness
        const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
          await program.provider.connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = newBlockhash

        // Check signature status before sending
        if (transaction.signature) {
          const sig = bs58.encode(transaction.signature)
          const status = await program.provider.connection.getSignatureStatus(sig)
          if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
            // console.log("Transaction already processed:", sig);
            return sig
          }
        }

        let sig: string | undefined
        if (program.provider.sendAndConfirm) {
          sig = await program.provider.sendAndConfirm(transaction, [], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: true,
          })
        } else if (program.provider.wallet) {
          const signedTx = await program.provider.wallet.signTransaction(transaction)
          const serializedTx = signedTx.serialize()
          sig = await program.provider.connection.sendRawTransaction(serializedTx, {
            skipPreflight: true,
            preflightCommitment: 'confirmed',
          })
          await program.provider.connection.confirmTransaction(
            {
              signature: sig,
              blockhash: newBlockhash,
              lastValidBlockHeight: newHeight,
            },
            'confirmed',
          )
        }
        return sig
      },
      operationKey,
      60000,
      true,
    )

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
      try {
        const battleRoom = await program.account.battleRoom.fetch(battleRoomPda)
        if (battleRoom.state.finalized) {
          return { success: true }
        }
      } catch (fetchError) {
        errorMessage = 'Transaction already processed - please check wallet'
      }
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
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

export const joinBattle = async ({
  program,
  ephemeralProgram,
  playerPublicKey,
  warriorPda,
  battleRoomPda,
  roomId,
  warriorName,
  sessionInfo,
}: JoinBattleParams): Promise<BattleRoomResult> => {
  try {
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
  sessionInfo,
}: SignalReadyParams): Promise<BattleRoomResult> => {
  try {
    // console.log("signalBattleReady: Passing sessionInfo:", sessionInfo);
    const readyResult = await signalReady({
      program,
      playerPublicKey,
      warriorPda,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      warriorName,
      sessionInfo,
    })

    if (!readyResult.success) {
      return readyResult
    }

    return readyResult
  } catch (error: any) {
    console.error('Error signaling ready in signalBattleReady:', error)
    return {
      success: false,
      error: error.message || 'Failed to signal ready',
    }
  }
}

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
  magicBlockProvider,
}: StartBattleActionParams): Promise<BattleRoomResult> => {
  try {
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

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const startResult = await startBattleOnER({
      ephemeralProgram,
      signerPublicKey,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      magicBlockProvider,
    })

    if (!startResult.success) {
      return startResult
    }

    return startResult
  } catch (error: any) {
    console.error('Error starting battle:', error)
    return {
      success: false,
      error: error.message || 'Failed to start battle',
    }
  }
}

export interface SubmitAnswerParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  battleRoomPda: PublicKey
  attackerWarriorPda: PublicKey
  defenderWarriorPda: PublicKey
  roomId: Uint8Array
  answer: boolean
  questionIndex?: number
  magicBlockProvider: any
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
  magicBlockProvider,
}: SubmitAnswerParams): Promise<BattleRoomResult> => {
  try {
    const answerResult = await answerQuestionOnER({
      ephemeralProgram,
      playerPublicKey,
      battleRoomPda,
      attackerWarriorPda,
      defenderWarriorPda,
      roomId,
      answer,
      magicBlockProvider,
    })

    if (!answerResult.success) {
      return answerResult
    }

    return answerResult
  } catch (error: any) {
    console.error('Error submitting answer:', error)
    return {
      success: false,
      error: error.message || 'Failed to submit answer',
    }
  }
}

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
  magicBlockProvider: any
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
  magicBlockProvider,
}: EndBattleParams): Promise<BattleRoomResult> => {
  try {
    const settleResult = await settleBattleRoomOnER({
      ephemeralProgram,
      signerPublicKey,
      battleRoomPda,
      warriorAPda,
      warriorBPda,
      roomId,
      magicBlockProvider,
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

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
      return finalResult
    }

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
      return { validator: {} }
  }
}

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
      return { boneSmith: {} }
  }
}

const getImageRarityName = (imageRarity: ImageRarity | any): any => {
  if (typeof imageRarity === 'object') {
    const key = Object.keys(imageRarity)[0]
    return key.charAt(0).toUpperCase() + key.slice(1)
  }
  return imageRarity || 'Common'
}

export const generateRandomDNA = (): string => {
  const chars = '0123456789ABCDEF'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateRoomId = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32))
}

export const roomIdToHex = (roomId: Uint8Array): string => {
  return Array.from(roomId)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

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

export { PERSONA_INFO as USER_PERSONA_INFO } from '@/types/undead'

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
