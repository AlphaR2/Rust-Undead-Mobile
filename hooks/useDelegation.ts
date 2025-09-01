'use client'
import { RustUndead as UndeadTypes } from '@/types/idlTypes'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useState } from 'react'
import { useGameData } from './useGameData'
import { sendERTransaction, useMagicBlockProvider, usePDAs, useUndeadProgram, useWalletInfo } from './useUndeadProgram'

export interface UndelegationState {
  status: 'idle' | 'undelegating' | 'waiting_transfer' | 'success' | 'failed_retry_available'
  error?: string
  method?: 'playerA' | 'playerB' | 'room' | 'both_players'
  progress?: number
}

export interface UndelegationStates {
  [key: string]: UndelegationState
}

type UndeadProgram = Program<UndeadTypes>

export const useUndelegation = () => {
  const program = useUndeadProgram()
  const magicBlockProvider = useMagicBlockProvider()
  const [undelegationStates, setUndelegationStates] = useState<UndelegationStates>({})

  const { publicKey } = useWalletInfo()

  const { getWarriorPda } = usePDAs(publicKey)
  const { decodeRoomId } = useGameData()

  /**
   * Store room ID in localStorage during battle delegation
   */
  const storeRoomId = useCallback((roomId: string) => {
    try {
      const recentRoomIds = getRecentRoomIds()
      const updatedRoomIds = [roomId, ...recentRoomIds.filter((id) => id !== roomId)].slice(0, 20)
      localStorage.setItem('recentBattleRoomIds', JSON.stringify(updatedRoomIds))
    } catch (error) {
      console.warn('Failed to store room ID:', error)
    }
  }, [])

  /**
   * Get recent room IDs from localStorage
   */
  const getRecentRoomIds = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem('recentBattleRoomIds')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to retrieve room IDs:', error)
      return []
    }
  }, [])

  /**
   * Update undelegation state for a specific key
   */
  const updateUndelegationState = useCallback((key: string, state: Partial<UndelegationState>) => {
    setUndelegationStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...state },
    }))
  }, [])

  /**
   * Get battle room info for undelegation purposes
   */
  const getBattleRoomInfo = useCallback(
    async (roomId: string) => {
      if (!program || !decodeRoomId) return null

      try {
        const { battleRoomPda } = decodeRoomId(roomId)
        const battleRoom = await program.program?.account.battleRoom.fetch(battleRoomPda)

        if (!battleRoom) {
          return
        }

        return {
          battleRoom,
          battleRoomPda,
          playerA: battleRoom.playerA,
          playerB: battleRoom.playerB,
          warriorA: battleRoom.warriorA,
          warriorB: battleRoom.warriorB,
        }
      } catch (error) {
        console.error('Failed to get battle room info:', error)
        return null
      }
    },
    [program, decodeRoomId],
  )

  /**
   * Undelegate a specific warrior using room ID and warrior PDA
   * No role checking needed - direct warrior undelegation
   */

  /**
   * Enhanced debugging version of undelegateWarrior function
   */
  const undelegateWarrior = useCallback(
    async (
      roomId: string,
      ephemeralProgram: UndeadProgram,
      warriorName: string,
      playerPubkey: PublicKey,
      isPlayerA: boolean,
    ): Promise<{ success: boolean; error?: string }> => {
      // Enhanced debugging - check each dependency individually
      // console.log("🔍 Checking dependencies for undelegateWarrior:");
      // console.log("- ephemeralProgram:", !!ephemeralProgram);
      // console.log("- magicBlockProvider:", !!magicBlockProvider);
      // console.log("- getWarriorPda:", !!getWarriorPda);
      // console.log("- decodeRoomId:", !!decodeRoomId);
      // console.log("- roomId:", roomId);
      // console.log("- warriorName:", warriorName);
      // console.log("- playerPubkey:", playerPubkey?.toString());
      // console.log("- isPlayerA:", isPlayerA);

      // Check each dependency specifically
      if (!ephemeralProgram) {
        console.error('❌ ephemeralProgram is missing')
        return {
          success: false,
          error: 'Ephemeral program not available. Please try again.',
        }
      }

      if (!magicBlockProvider) {
        console.error('❌ magicBlockProvider is missing')
        return {
          success: false,
          error: 'Magic Block provider not ready. Please try again.',
        }
      }

      if (!getWarriorPda) {
        console.error('❌ getWarriorPda function is missing')
        return {
          success: false,
          error: 'Warrior PDA function not available. Please refresh and try again.',
        }
      }

      if (!decodeRoomId) {
        console.error('❌ decodeRoomId function is missing')
        return {
          success: false,
          error: 'Room ID decoder not available. Please refresh and try again.',
        }
      }

      try {
        // console.log(
        //   "✅ All dependencies available, proceeding with undelegation..."
        // );

        const warriorPda = getWarriorPda(warriorName)
        // console.log("📍 Warrior PDA:", warriorPda.toString());

        const stateKey = warriorPda.toString()

        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 10,
          method: isPlayerA ? 'playerA' : 'playerB',
        })

        const { roomIdBytes } = decodeRoomId(roomId)
        // console.log("📍 Room ID bytes:", roomIdBytes);

        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 30,
        })

        let commitmentSignature: string

        // Call appropriate undelegation function based on player type
        if (isPlayerA) {
          // console.log("🔄 Calling undelegatePlayera...");
          commitmentSignature = await sendERTransaction(
            ephemeralProgram,
            ephemeralProgram.methods.undelegatePlayera(Array.from(roomIdBytes), warriorPda).accountsPartial({
              signer: playerPubkey,
              warriorA: warriorPda,
            }),
            playerPubkey,
            magicBlockProvider,
            `Undelegate Warrior A (${warriorName})`,
          )
        } else {
          // console.log("🔄 Calling undelegatePlayerb...");
          commitmentSignature = await sendERTransaction(
            ephemeralProgram,
            ephemeralProgram.methods.undelegatePlayerb(Array.from(roomIdBytes), warriorPda).accountsPartial({
              signer: playerPubkey,
              warriorB: warriorPda,
            }),
            playerPubkey,
            magicBlockProvider,
            `Undelegate Warrior B (${warriorName})`,
          )
        }

        // console.log("📝 Transaction signature:", commitmentSignature);

        updateUndelegationState(stateKey, {
          status: 'waiting_transfer',
          progress: 60,
        })

        // Wait for ownership transfer (Magic Block needs time)
        // console.log("⏳ Waiting 30s for ownership transfer...");
        await new Promise((resolve) => setTimeout(resolve, 30000)) // 30 seconds

        updateUndelegationState(stateKey, {
          status: 'success',
          progress: 100,
        })

        // console.log(
        //   `✅ Successfully undelegated warrior ${warriorName} (${
        //     isPlayerA ? "Player A" : "Player B"
        //   })`
        // );
        return { success: true }
      } catch (error: any) {
        console.error('❌ Warrior undelegation failed:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        })

        const warriorPda = getWarriorPda ? getWarriorPda(warriorName) : null
        const stateKey = warriorPda ? warriorPda.toString() : `${roomId}_${warriorName}`

        updateUndelegationState(stateKey, {
          status: 'failed_retry_available',
          error: error.message || 'Undelegation failed',
          progress: 0,
        })

        return {
          success: false,
          error: error.message || 'Undelegation failed',
        }
      }
    },
    [magicBlockProvider, getWarriorPda, decodeRoomId, updateUndelegationState],
  )

  /**
   * Undelegate both players (Player A and Player B) - for room creator
   * This is the dual call that undelegates both warriors in sequence
   */
  const undelegateBothPlayers = useCallback(
    async (
      ephemeralProgram: UndeadProgram,
      roomId: string,
      creatorPubkey: PublicKey,
    ): Promise<{ success: boolean; error?: string; details?: any }> => {
      if (!ephemeralProgram || !magicBlockProvider || !decodeRoomId) {
        return {
          success: false,
          error: 'Required dependencies not available',
        }
      }

      const stateKey = `${roomId}_both_players`

      try {
        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 10,
          method: 'both_players',
        })

        // Get battle room info to get warrior PDAs
        const roomInfo = await getBattleRoomInfo(roomId)
        if (!roomInfo) {
          throw new Error('Could not fetch battle room information')
        }

        const { roomIdBytes } = decodeRoomId(roomId)
        const { warriorA, warriorB } = roomInfo

        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 25,
        })

        let playerAResult = null
        let playerBResult = null

        // Undelegate Player A
        if (warriorA) {
          try {
            // console.log("🔄 Undelegating Player A warrior...");
            const commitmentSignatureA = await sendERTransaction(
              ephemeralProgram,
              ephemeralProgram.methods.undelegatePlayera(Array.from(roomIdBytes), warriorA).accountsPartial({
                signer: creatorPubkey,
                warriorA: warriorA,
              }),
              creatorPubkey,
              magicBlockProvider,
              `Undelegate Player A Warrior`,
            )
            playerAResult = { success: true, signature: commitmentSignatureA }
            // console.log("✅ Player A warrior undelegated successfully");
          } catch (errorA: any) {
            playerAResult = { success: false, error: errorA.message }
            console.error('❌ Player A undelegation failed:', errorA)
          }
        }

        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 50,
        })

        // Undelegate Player B
        if (warriorB) {
          try {
            // console.log("🔄 Undelegating Player B warrior...");
            const commitmentSignatureB = await sendERTransaction(
              ephemeralProgram,
              ephemeralProgram.methods.undelegatePlayerb(Array.from(roomIdBytes), warriorB).accountsPartial({
                signer: creatorPubkey,
                warriorB: warriorB,
              }),
              creatorPubkey,
              magicBlockProvider,
              `Undelegate Player B Warrior`,
            )
            playerBResult = { success: true, signature: commitmentSignatureB }
            // console.log("✅ Player B warrior undelegated successfully");
          } catch (errorB: any) {
            playerBResult = { success: false, error: errorB.message }
            console.error('❌ Player B undelegation failed:', errorB)
          }
        }

        updateUndelegationState(stateKey, {
          status: 'waiting_transfer',
          progress: 75,
        })

        // Wait for ownership transfer
        await new Promise((resolve) => setTimeout(resolve, 30000)) // 30 seconds

        const overallSuccess = playerAResult?.success !== false && playerBResult?.success !== false

        updateUndelegationState(stateKey, {
          status: overallSuccess ? 'success' : 'failed_retry_available',
          progress: 100,
          error: overallSuccess ? undefined : 'Some undelegations failed',
        })

        const details = {
          playerA: playerAResult,
          playerB: playerBResult,
          roomInfo,
        }

        // if (overallSuccess) {
        //   // console.log(
        //   //   `✅ Successfully undelegated both players for room ${roomId.slice(
        //   //     0,
        //   //     8
        //   //   )}...`
        //   // );
        // }

        return {
          success: overallSuccess,
          error: overallSuccess ? undefined : 'Some undelegations failed - check details',
          details,
        }
      } catch (error: any) {
        console.error('Both players undelegation failed:', error)

        updateUndelegationState(stateKey, {
          status: 'failed_retry_available',
          error: error.message || 'Both players undelegation failed',
          progress: 0,
        })

        return {
          success: false,
          error: error.message || 'Both players undelegation failed',
        }
      }
    },
    [magicBlockProvider, decodeRoomId, getBattleRoomInfo, updateUndelegationState],
  )

  /**
   * Undelegate battle room
   */
  const undelegateRoom = useCallback(
    async (
      ephemeralProgram: UndeadProgram,
      roomId: string,
      signerPubkey: PublicKey,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!ephemeralProgram || !magicBlockProvider || !decodeRoomId) {
        return {
          success: false,
          error: 'Required dependencies not available',
        }
      }

      const stateKey = roomId

      try {
        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 10,
          method: 'room',
        })

        const { roomIdBytes, battleRoomPda } = decodeRoomId(roomId)

        updateUndelegationState(stateKey, {
          status: 'undelegating',
          progress: 30,
        })

        const commitmentSignature = await sendERTransaction(
          ephemeralProgram,
          ephemeralProgram.methods.undelegateRoom(Array.from(roomIdBytes)).accountsPartial({
            signer: signerPubkey,
            battleRoom: battleRoomPda,
          }),
          signerPubkey,
          magicBlockProvider,
          `Undelegate Battle Room`,
        )

        updateUndelegationState(stateKey, {
          status: 'waiting_transfer',
          progress: 60,
        })

        // Wait for ownership transfer
        await new Promise((resolve) => setTimeout(resolve, 30000)) // 30 seconds

        updateUndelegationState(stateKey, {
          status: 'success',
          progress: 100,
        })

        console.log(`✅ Successfully undelegated battle room ${roomId.slice(0, 8)}...`)
        return { success: true }
      } catch (error: any) {
        console.error('Room undelegation failed:', error)

        updateUndelegationState(stateKey, {
          status: 'failed_retry_available',
          error: error.message || 'Room undelegation failed',
          progress: 0,
        })

        return {
          success: false,
          error: error.message || 'Room undelegation failed',
        }
      }
    },
    [magicBlockProvider, decodeRoomId, updateUndelegationState],
  )

  /**
   * Retry failed undelegation
   */
  const retryUndelegation = useCallback(
    async (
      ephemeralProgram: UndeadProgram,
      key: string,
      type: 'warrior' | 'room' | 'both_players',
      roomId: string,
      playerPubkey: PublicKey,
      warriorName?: string,
      isPlayerA?: boolean,
    ) => {
      if (type === 'warrior' && warriorName && isPlayerA !== undefined) {
        return await undelegateWarrior(roomId, ephemeralProgram, warriorName, playerPubkey, isPlayerA)
      } else if (type === 'room') {
        return await undelegateRoom(ephemeralProgram, roomId, playerPubkey)
      } else if (type === 'both_players') {
        return await undelegateBothPlayers(ephemeralProgram, roomId, playerPubkey)
      }
      return { success: false, error: 'Invalid retry parameters' }
    },
    [undelegateWarrior, undelegateRoom, undelegateBothPlayers],
  )

  /**
   * Clear undelegation state for a specific key
   */
  const clearUndelegationState = useCallback((key: string) => {
    setUndelegationStates((prev) => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }, [])

  /**
   * Get potentially delegated warriors by checking recent room IDs
   */
  const getPotentiallyDelegatedRoomIds = useCallback(() => {
    return getRecentRoomIds()
  }, [getRecentRoomIds])

  return {
    // Core undelegation functions
    undelegateWarrior,
    undelegateRoom,
    undelegateBothPlayers,
    retryUndelegation,

    // State management
    undelegationStates,
    clearUndelegationState,

    // Room ID management
    storeRoomId,
    getRecentRoomIds,
    getPotentiallyDelegatedRoomIds,

    // Utility functions
    getBattleRoomInfo,
  }
}
