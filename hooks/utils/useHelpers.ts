import { authority, PROGRAM_ID } from '@/config/program'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useMemo } from 'react'
import { useWalletInfo } from '../../hooks/useUndeadProgram'
import { withDeduplication } from '../../utils/helper'

type UndeadProgram = Program<UndeadTypes>

// ============ PDA GENERATION ============

export const usePDAs = (userPublicKey?: PublicKey | null) => {
  return useMemo(() => {
    if (!userPublicKey) {
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      }
    }

    try {
      const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config'), authority.toBuffer()], PROGRAM_ID)

      const [leaderboardPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('leaderboard'), authority.toBuffer()],
        PROGRAM_ID,
      )

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), userPublicKey.toBuffer()],
        PROGRAM_ID,
      )

      const [achievementsPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_achievements'), userPublicKey.toBuffer()],
        PROGRAM_ID,
      )

      const getWarriorPda = (name: string) => {
        if (!name || name.trim().length === 0) {
          throw new Error('Warrior name cannot be empty')
        }

        const [warriorPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('undead_warrior'), userPublicKey.toBuffer(), Buffer.from(name.trim())],
          PROGRAM_ID,
        )
        return warriorPda
      }

      const getUsernameRegistryPda = (username: string) => {
        if (!username || username.trim().length === 0) {
          throw new Error('Username cannot be empty')
        }

        const [userNameRegistryPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_registry'), Buffer.from(username)],
          PROGRAM_ID,
        )
        return userNameRegistryPda
      }

      return {
        configPda,
        leaderboardPda,
        profilePda,
        achievementsPda,
        getWarriorPda,
        getUsernameRegistryPda,
      }
    } catch (error) {
      console.error('Error generating PDAs:', error)
      return {
        configPda: null,
        leaderboardPda: null,
        profilePda: null,
        achievementsPda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
      }
    }
  }, [userPublicKey?.toString()])
}

// ============ CURRENT WALLET INFO ============

export const useCurrentWallet = () => {
  const walletInfo = useWalletInfo()

  return useMemo(() => {
    if (!walletInfo.isConnected || !walletInfo.publicKey) {
      return {
        address: null,
        shortAddress: null,
        type: null,
        name: null,
        isConnected: false,
        isEmbedded: false,
        isMWA: false,
      }
    }

    const shortAddress = `${walletInfo.address!.slice(0, 4)}...${walletInfo.address!.slice(-4)}`
    const isEmbedded = walletInfo.walletType === 'privy'
    const isMWA = walletInfo.walletType === 'mwa'

    return {
      address: walletInfo.address,
      shortAddress,
      type: walletInfo.walletType,
      name: walletInfo.name,
      isConnected: true,
      isEmbedded,
      isMWA,
    }
  }, [walletInfo])
}

// ============ TRANSACTION EXECUTION ============

export const buildAndExecuteTransaction = async (
  program: UndeadProgram,
  transaction: Transaction,
  payerPublicKey: PublicKey,
): Promise<string> => {
  const operationKey = `tx_${payerPublicKey.toString()}_${Date.now()}`

  return withDeduplication(operationKey, async () => {
    const { blockhash, lastValidBlockHeight } = await program.provider.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhash
    transaction.feePayer = payerPublicKey

    if (program.provider.sendAndConfirm) {
      return await program.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: true,
      })
    } else if (program.provider.wallet) {
      const signedTx = await program.provider.wallet.signTransaction(transaction)
      const serializedTx = signedTx.serialize()
      const signature = await program.provider.connection.sendRawTransaction(serializedTx, {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      })
      await program.provider.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      )

      return signature
    } else {
      throw new Error('No signing method available')
    }
  })
}
