import { minimumBalance } from '@/constants/params'
import { StartChapterParams, SubmitQuizParams, UndeadActionResult, UpdatePositionParams } from '@/types/actions'
import { checkBalanceWithUserGuidance, withDeduplication } from '@/utils/helper'
import { PublicKey, SendTransactionError } from '@solana/web3.js'
import { sendERTransaction } from '../useUndeadProgram'

export const startChapter = async ({
  ephemeralProgram,
  playerPublicKey,
  gamerProfilePda,
  koraPayer,
  koraBlockhash,
  walletType,
  koraHealth,
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
        await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
      } catch (fetchError) {
        return { success: false, error: 'Gamer profile does not exist on rollup' }
      }

      try {
        await ephemeralProgram.account.undeadWorld.fetch(undeadWorldPda)
      } catch (fetchError) {
        return { success: false, error: 'Undead world does not exist on rollup' }
      }

      const worldIdArray = Array.from(worldId)

      let payerPublicKey: PublicKey
      if (walletType === 'privy') {
        payerPublicKey = playerPublicKey
        // if (koraHealth) {
        //   payerPublicKey = koraPayer
        // } else {
        //   payerPublicKey = playerPublicKey
        // }
      } else {
        payerPublicKey = playerPublicKey
      }

      if (walletType !== 'privy' || koraHealth === false) {
        try {
          const balanceCheck = await checkBalanceWithUserGuidance(ephemeralProgram, payerPublicKey, minimumBalance)

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

      const methodBuilder = ephemeralProgram.methods
        .startChapter(chapterNumber, worldIdArray, playerPublicKey)
        .accountsPartial({
          signer: payerPublicKey,
          gamerProfile: gamerProfilePda,
          undeadWorld: undeadWorldPda,
        })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        payerPublicKey,
        magicBlockProvider,
        koraBlockhash,
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
  koraPayer,
  koraBlockhash,
  walletType,
  koraHealth,
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

      let payerPublicKey: PublicKey
      if (walletType === 'privy') {
        if (koraHealth) {
          payerPublicKey = koraPayer
        } else {
          payerPublicKey = playerPublicKey
        }
      } else {
        payerPublicKey = playerPublicKey
      }

      if (walletType !== 'privy' || koraHealth === false) {
        try {
          const balanceCheck = await checkBalanceWithUserGuidance(ephemeralProgram, payerPublicKey, minimumBalance)

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

      const methodBuilder = ephemeralProgram.methods.updatePosition(position).accountsPartial({
        signer: payerPublicKey,
        player: playerPublicKey,
        gamerProfile: gamerProfilePda,
      })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        payerPublicKey,
        magicBlockProvider,

        koraBlockhash,
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
  koraPayer,
  koraBlockhash,
  walletType,
  koraHealth,
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
      let payerPublicKey: PublicKey
      if (walletType === 'privy') {
        if (koraHealth) {
          payerPublicKey = koraPayer
        } else {
          payerPublicKey = playerPublicKey
        }
      } else {
        payerPublicKey = playerPublicKey
      }

      if (walletType !== 'privy' || koraHealth === false) {
        try {
          const balanceCheck = await checkBalanceWithUserGuidance(ephemeralProgram, payerPublicKey, minimumBalance)

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

      const methodBuilder = ephemeralProgram.methods.submitQuiz(score, worldIdArray).accountsPartial({
        signer: payerPublicKey,
        player: playerPublicKey,
        gamerProfile: gamerProfilePda,
        undeadWorld: undeadWorldPda,
      })

      commitmentSignature = await sendERTransaction(
        ephemeralProgram,
        methodBuilder,
        payerPublicKey,
        magicBlockProvider,
        koraBlockhash,
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
