import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { UserPersona, Warrior, WarriorClass } from './undead'

type UndeadProgram = Program<UndeadTypes>
export type walletType = 'mwa' | 'privy' | null

export interface CreateWarriorParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  name: string
  dna: string
  warriorPda: PublicKey
  koraPayer: PublicKey
  koraBlockhash?: string
  walletType: walletType
  koraHealth: boolean
  configPda: PublicKey
  profilePda: PublicKey
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
  koraBlockhash?: string
  profilePda: PublicKey
  koraPayer: PublicKey
  koraHealth: boolean
  walletType: walletType
  userRegistryPda: PublicKey
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

export interface BuildGamingProfileParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  characterClass: WarriorClass
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
  gamerProfilePda: PublicKey
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

export interface GameProfileToRollupParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  gamerProfilePda: PublicKey
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
  sessionInfo?: {
    sessionToken: PublicKey
    sessionSigner: {
      publicKey: PublicKey
    }
  } | null
}

export interface WorldToRollupParams {
  program: UndeadProgram
  userPublicKey: PublicKey
  worldId: Uint8Array
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
  undeadWorldPda: PublicKey
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

export interface BalanceCheckResult {
  success: boolean
  error?: string
  payerPublicKey: PublicKey
  balance: number
  minimumRequired: number
  shortfall?: number
  isSessionWallet?: boolean
  actionableMessage?: string
}

export interface StartChapterParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  gamerProfilePda: PublicKey
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
  undeadWorldPda: PublicKey
  chapterNumber: number
  worldId: Uint8Array
  magicBlockProvider: any
}

export interface UpdatePositionParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
  gamerProfilePda: PublicKey
  position: number
  magicBlockProvider: any
}

export interface SubmitQuizParams {
  ephemeralProgram: UndeadProgram
  playerPublicKey: PublicKey
  gamerProfilePda: PublicKey
  koraPayer: PublicKey
  koraBlockhash?: string
  koraHealth: boolean
  walletType: walletType
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