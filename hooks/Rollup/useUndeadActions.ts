import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { withDeduplication } from '@/utils/helper'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, SendTransactionError } from '@solana/web3.js'
import { sendERTransaction } from '../useUndeadProgram'

type UndeadProgram = Program<UndeadTypes>

export interface StartChapterParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  gamerProfilePda: PublicKey
  undeadWorldPda: PublicKey
  chapterNumber: number
  worldId: Uint8Array
  magicBlockProvider: any
}

export interface UpdatePositionParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  gamerProfilePda: PublicKey
  position: number
  magicBlockProvider: any
}

export interface SubmitQuizParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  gamerProfilePda: PublicKey
  undeadWorldPda: PublicKey
  score: number
  worldId: Uint8Array
  magicBlockProvider: any
}

export interface UndeadActionResult {
  success: boolean
  signature?: string
  commitmentSignature?: string
  error?: string
}

export const startChapter = async ({
  ephemeralProgram,
  playerPublicKey,
  gamerProfilePda,
  undeadWorldPda,
  chapterNumber,
  worldId,
  magicBlockProvider,
}: StartChapterParams): Promise<UndeadActionResult> => {
  if (!ephemeralProgram || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  if (worldId.length !== 32) {
    return { success: false, error: 'Invalid world ID length' }
  }

  const operationKey = `startChapter_${playerPublicKey.toString()}_${chapterNumber}`

  return withDeduplication(operationKey, async () => {
    let commitmentSignature: string | undefined

    try {
      try {
        const profile = await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
        console.log('✅ Gamer Profile Found:', gamerProfilePda.toString())
      } catch (fetchError) {
        console.error('❌ Gamer profile not found at:', gamerProfilePda.toString())
        return { success: false, error: 'Gamer profile does not exist on rollup' }
      }

      try {
        const world = await ephemeralProgram.account.undeadWorld.fetch(undeadWorldPda)
        console.log('✅ Undead World Found:', undeadWorldPda.toString())
      } catch (fetchError) {
        console.error('❌ Undead world not found at:', undeadWorldPda.toString())
        return { success: false, error: 'Undead world does not exist on rollup' }
      }

      const worldIdArray = Array.from(worldId)

      console.log('📋 Start Chapter Accounts:', {
        signer: playerPublicKey.toString(),
        player: playerPublicKey.toString(),
        gamerProfile: gamerProfilePda.toString(),
        undeadWorld: undeadWorldPda.toString(),
        chapterNumber,
      })

      const methodBuilder = ephemeralProgram.methods.startChapter(chapterNumber, worldIdArray).accountsPartial({
        signer: playerPublicKey,
        player: playerPublicKey,
        gamerProfile: gamerProfilePda,
        undeadWorld: undeadWorldPda,
      })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        playerPublicKey,
        magicBlockProvider,
        'Start Chapter',
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))

      return {
        success: true,
        signature: commitmentSignature,
        commitmentSignature,
      }
    } catch (error: any) {
      console.error('❌ Start Chapter Error:', error)

      if (error instanceof SendTransactionError) {
        try {
          const logs = await error.getLogs(ephemeralProgram.provider.connection)
          console.error('Transaction Logs:', logs)
        } catch {}
      }

      let errorMessage = error.message || 'Failed to start chapter'
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance for transaction or rent'
      } else if (error.message?.includes('blockhash not found')) {
        errorMessage = 'Network congestion - please try again'
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (error.message?.includes('0x7d6') || error.message?.includes('ConstraintSeeds')) {
        errorMessage = 'Account PDA mismatch - please verify world initialization'
      } else if (error.message?.includes('already processed')) {
        try {
          await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
          return { success: true, signature: commitmentSignature }
        } catch (fetchError) {
          errorMessage = 'Transaction already processed - please check status'
        }
      }

      return { success: false, error: errorMessage }
    }
  })
}

export const updatePosition = async ({
  ephemeralProgram,
  playerPublicKey,
  gamerProfilePda,
  position,
  magicBlockProvider,
}: UpdatePositionParams): Promise<UndeadActionResult> => {
  if (!ephemeralProgram || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  const operationKey = `updatePosition_${playerPublicKey.toString()}_${position}`

  return withDeduplication(operationKey, async () => {
    let commitmentSignature: string | undefined

    try {
      try {
        await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
      } catch (fetchError) {
        return { success: false, error: 'Gamer profile does not exist' }
      }

      const methodBuilder = ephemeralProgram.methods.updatePosition(position).accountsPartial({
        signer: playerPublicKey,
        player: playerPublicKey,
        gamerProfile: gamerProfilePda,
      })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        playerPublicKey,
        magicBlockProvider,
        'Update Position',
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))

      return {
        success: true,
        signature: commitmentSignature,
        commitmentSignature,
      }
    } catch (error: any) {
      if (error instanceof SendTransactionError) {
        try {
          await error.getLogs(ephemeralProgram.provider.connection)
        } catch {}
      }

      let errorMessage = error.message || 'Failed to update position'
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance for transaction or rent'
      } else if (error.message?.includes('blockhash not found')) {
        errorMessage = 'Network congestion - please try again'
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (error.message?.includes('already processed')) {
        try {
          await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
          return { success: true, signature: commitmentSignature }
        } catch (fetchError) {
          errorMessage = 'Transaction already processed - please check status'
        }
      }

      return { success: false, error: errorMessage }
    }
  })
}

export const submitQuiz = async ({
  ephemeralProgram,
  playerPublicKey,
  gamerProfilePda,
  undeadWorldPda,
  score,
  worldId,
  magicBlockProvider,
}: SubmitQuizParams): Promise<UndeadActionResult> => {
  if (!ephemeralProgram || !playerPublicKey) {
    return { success: false, error: 'Program or player public key required' }
  }

  if (!magicBlockProvider) {
    return { success: false, error: 'Magic Block provider required' }
  }

  if (worldId.length !== 32) {
    return { success: false, error: 'Invalid world ID length' }
  }

  if (score < 0 || score > 255) {
    return { success: false, error: 'Invalid score value' }
  }

  const operationKey = `submitQuiz_${playerPublicKey.toString()}_${score}`

  return withDeduplication(operationKey, async () => {
    let commitmentSignature: string | undefined

    try {
      try {
        await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
      } catch (fetchError) {
        return { success: false, error: 'Gamer profile does not exist' }
      }

      try {
        await ephemeralProgram.account.undeadWorld.fetch(undeadWorldPda)
      } catch (fetchError) {
        return { success: false, error: 'Undead world does not exist' }
      }

      const worldIdArray = Array.from(worldId)

      const methodBuilder = ephemeralProgram.methods.submitQuiz(score, worldIdArray).accountsPartial({
        signer: playerPublicKey,
        player: playerPublicKey,
        gamerProfile: gamerProfilePda,
        undeadWorld: undeadWorldPda,
      })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        playerPublicKey,
        magicBlockProvider,
        'Submit Quiz',
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))

      return {
        success: true,
        signature: commitmentSignature,
        commitmentSignature,
      }
    } catch (error: any) {
      if (error instanceof SendTransactionError) {
        try {
          await error.getLogs(ephemeralProgram.provider.connection)
        } catch {}
      }

      let errorMessage = error.message || 'Failed to submit quiz'
      if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance for transaction or rent'
      } else if (error.message?.includes('blockhash not found')) {
        errorMessage = 'Network congestion - please try again'
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user'
      } else if (error.message?.includes('already processed')) {
        try {
          await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
          return { success: true, signature: commitmentSignature }
        } catch (fetchError) {
          errorMessage = 'Transaction already processed - please check status'
        }
      }

      return { success: false, error: errorMessage }
    }
  })
}
