import { authority, PROGRAM_ID } from '@/config/program'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { Program } from '@coral-xyz/anchor'
import { PublicKey, Transaction } from '@solana/web3.js'
import { useMemo } from 'react'
import { useWalletInfo } from '../../hooks/useUndeadProgram'

type UndeadProgram = Program<UndeadTypes>

// ============ PDA GENERATION ============

export const usePDAs = (userPublicKey?: PublicKey | null) => {
  return useMemo(() => {
    if (!userPublicKey) {
      return {
        configPda: null,
        profilePda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
        gamerProfilePda: null,
      }
    }

    try {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('game_config'), authority.toBuffer()],
        PROGRAM_ID,
      )

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), userPublicKey.toBuffer()],
        PROGRAM_ID,
      )

      const [gamerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_game_profile'), userPublicKey.toBuffer()],
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
        profilePda,
        getWarriorPda,
        getUsernameRegistryPda,
        gamerProfilePda,
      }
    } catch (error) {
      return {
        configPda: null,
        profilePda: null,
        getWarriorPda: null,
        getUsernameRegistryPda: null,
        gamerProfilePda: null,
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
  koraBlockhash?: string,
): Promise<string> => {

  let blockhash: string
  let lastValidBlockHeight: number

  try {
    if (koraBlockhash && typeof koraBlockhash === 'string' && koraBlockhash.length > 0) {
      blockhash = koraBlockhash
      const blockHashInfo = await program.provider.connection.getLatestBlockhash('confirmed')
      lastValidBlockHeight = blockHashInfo.lastValidBlockHeight
    } else {
      const blockHashInfo = await program.provider.connection.getLatestBlockhash('confirmed')
      blockhash = blockHashInfo.blockhash
      lastValidBlockHeight = blockHashInfo.lastValidBlockHeight
    }
  } catch (error: any) {
    throw new Error(`Failed to get blockhash: ${error.message}`)
  }

  transaction.recentBlockhash = blockhash
  transaction.feePayer = payerPublicKey

  if (program.provider.sendAndConfirm) {
    return await program.provider.sendAndConfirm(transaction, [], {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
      skipPreflight: true,
    })
  }

  if (program.provider.wallet) {
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
  }

  throw new Error('No signing method available')
}

/* ============ WORLD ID ENCODING/DECODING + PDA Generation ============ */
export const encodeWorldId = (
  chapterName: string,
  programId: PublicKey,
): { worldIdBytes: Uint8Array; undeadWorldPda: PublicKey } => {
  try {
    if (!programId) {
      throw new Error('Program not initialized')
    }

    const encoder = new TextEncoder()
    const nameBytes = encoder.encode(chapterName)

    const worldIdBytes = new Uint8Array(32)

    const copyLength = Math.min(nameBytes.length, 32)
    worldIdBytes.set(nameBytes.slice(0, copyLength), 0)

    const [undeadWorldPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('undead_world'), Buffer.from(worldIdBytes)],
      programId,
    )

    return { worldIdBytes, undeadWorldPda }
  } catch (error) {
    throw new Error(`Failed to encode world ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const decodeWorldId = (worldIdBytes: Uint8Array): string => {
  try {
    if (worldIdBytes.length !== 32) {
      throw new Error('Invalid world ID length')
    }

    const decoder = new TextDecoder()
    const nullIndex = worldIdBytes.indexOf(0)
    const nameBytes = nullIndex === -1 ? worldIdBytes : worldIdBytes.slice(0, nullIndex)

    return decoder.decode(nameBytes)
  } catch (error) {
    throw new Error(`Failed to decode world ID: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
