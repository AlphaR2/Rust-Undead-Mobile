// 'use client'
// import { RustUndead as UndeadTypes } from '@/types/idlTypes'
// import { Program } from '@coral-xyz/anchor'
// import { ComputeBudgetProgram, PublicKey } from '@solana/web3.js'
// import { useCallback, useState } from 'react'
// import { useGameData } from './useGameData'
// import {
//   executeWithDeduplication,
//   hashTxContent,
//   useMagicBlockProvider,
//   usePDAs,
//   useUndeadProgram,
//   useWalletInfo,
// } from './useUndeadProgram'

// export interface UndelegationState {
//   status: 'idle' | 'undelegating' | 'waiting_transfer' | 'success' | 'failed_retry_available'
//   error?: string
//   method?: 'playerA' | 'playerB' | 'room' | 'both_players'
//   progress?: number
// }

// export interface UndelegationStates {
//   [key: string]: UndelegationState
// }

// type UndeadProgram = Program<UndeadTypes>

// export const useUndelegation = () => {
//   const program = useUndeadProgram()
//   const magicBlockProvider = useMagicBlockProvider()
//   const [undelegationStates, setUndelegationStates] = useState<UndelegationStates>({})

//   const { publicKey } = useWalletInfo()

//   const { getWarriorPda } = usePDAs(publicKey)

//   const { decodeRoomId } = useGameData()

//   const storeRoomId = useCallback((roomId: string) => {
//     try {
//       const recentRoomIds = getRecentRoomIds()
//       const updatedRoomIds = [roomId, ...recentRoomIds.filter((id) => id !== roomId)].slice(0, 20)
//       localStorage.setItem('recentBattleRoomIds', JSON.stringify(updatedRoomIds))
//     } catch (error) {
//       console.warn('Failed to store room ID:', error)
//     }
//   }, [])

//   const getRecentRoomIds = useCallback((): string[] => {
//     try {
//       const stored = localStorage.getItem('recentBattleRoomIds')
//       return stored ? JSON.parse(stored) : []
//     } catch (error) {
//       console.warn('Failed to retrieve room IDs:', error)
//       return []
//     }
//   }, [])

//   /**
//    * Update undelegation state for a specific key
//    */
//   const updateUndelegationState = useCallback((key: string, state: Partial<UndelegationState>) => {
//     setUndelegationStates((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], ...state },
//     }))
//   }, [])

//   /**
//    * Get battle room info for undelegation purposes
//    */
//   const getBattleRoomInfo = useCallback(
//     async (roomId: string) => {
//       if (!program.program || !decodeRoomId) return null

//       try {
//         const { battleRoomPda } = decodeRoomId(roomId)
//         const battleRoom = await program.program.account.battleRoom.fetch(battleRoomPda)

//         return {
//           battleRoom,
//           battleRoomPda,
//           playerA: battleRoom.playerA,
//           playerB: battleRoom.playerB,
//           warriorA: battleRoom.warriorA,
//           warriorB: battleRoom.warriorB,
//         }
//       } catch (error) {
//         console.error('Failed to get battle room info:', error)
//         return null
//       }
//     },
//     [program, decodeRoomId],
//   )

//   /**
//    * Undelegate battle room and both warriors at once on ER
//    */
//   const undelegateBattleRoom = async ({
//     ephemeralProgram,
//     roomId,
//     signerPubkey,
//     magicBlockProvider,
//     sessionInfo,
//   }: {
//     ephemeralProgram: UndeadProgram
//     roomId: string
//     signerPubkey: PublicKey
//     magicBlockProvider: any
//     sessionInfo?: {
//       sessionToken: PublicKey
//       sessionSigner: { publicKey: PublicKey }
//     } | null
//   }): Promise<{ success: boolean; error?: string }> => {
//     if (!ephemeralProgram || !signerPubkey) {
//       console.error('❌ Missing ephemeralProgram or signerPubkey')
//       return { success: false, error: 'Program or signer public key required' }
//     }

//     if (!magicBlockProvider) {
//       console.error('❌ Missing magicBlockProvider')
//       return { success: false, error: 'Magic Block provider required' }
//     }

//     if (!decodeRoomId) {
//       console.error('❌ Missing decodeRoomId')
//       return { success: false, error: 'Room ID decoder required' }
//     }

//     if (!getBattleRoomInfo) {
//       console.error('❌ Missing getBattleRoomInfo')
//       return { success: false, error: 'Battle room info function required' }
//     }

//     const stateKey = `${roomId}_battle_room`

//     updateUndelegationState(stateKey, {
//       status: 'undelegating',
//       progress: 10,
//       method: 'room',
//     })

//     try {
//       const hasActiveSession = !!sessionInfo
//       const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPubkey

//       const { roomIdBytes, battleRoomPda } = decodeRoomId(roomId)

//       updateUndelegationState(stateKey, { progress: 50 })

//       // Get battle room info to fetch warrior PDAs
//       // console.log("🔍 Fetching battle room info...");
//       const roomInfo = await getBattleRoomInfo(roomId)
//       if (!roomInfo) {
//         throw new Error('Could not fetch battle room information')
//       }
//       const { warriorA, warriorB } = roomInfo

//       if (!warriorA || !warriorB) {
//         throw new Error('Missing warrior information in battle room')
//       }

//       updateUndelegationState(stateKey, { progress: 40 })

//       // Create transaction
//       // console.log("📝 Creating undelegateBattleRoom transaction...");
//       const transaction = await ephemeralProgram.methods
//         .undelegateBattleRoom(Array.from(roomIdBytes))
//         .accountsPartial({
//           signer: payerPublicKey,
//           battleRoom: battleRoomPda,
//           warriorA: warriorA,
//           warriorB: warriorB,
//           sessionToken: null,
//         })
//         .transaction()

//       // console.log("📝 Transaction created successfully");

//       // Fetch fresh blockhash
//       // console.log("🔗 Fetching fresh blockhash...");
//       const { blockhash, lastValidBlockHeight } =
//         await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//       transaction.recentBlockhash = blockhash
//       transaction.feePayer = payerPublicKey

//       transaction.add(
//         ComputeBudgetProgram.setComputeUnitLimit({
//           units: 400000,
//         }),
//       )

//       // console.log("🔗 Blockhash set:", {
//       //   blockhash,
//       //   lastValidBlockHeight,
//       //   feePayer: payerPublicKey.toString(),
//       // });

//       const txHash = await hashTxContent(transaction)
//       const operationKey = `undelegateBattleRoom_${payerPublicKey.toString()}_${txHash}`

//       // console.log(
//       //   "🔄 Starting transaction execution with deduplication key:",
//       //   operationKey
//       // );

//       updateUndelegationState(stateKey, { progress: 60 })

//       const commitmentSignature: string | undefined = await executeWithDeduplication(
//         async () => {
//           // Re-fetch blockhash to ensure freshness
//           // console.log("🔄 Re-fetching blockhash...");
//           const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
//             await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//           transaction.recentBlockhash = newBlockhash

//           // console.log("✍️ Signing transaction...");
//           const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
//           // console.log("✅ Transaction signed successfully");

//           const serializedTx = signedTx.serialize()
//           // console.log(
//           //   "✅ Transaction serialized, size:",
//           //   serializedTx.length
//           // );

//           // console.log("📡 Sending raw transaction...");
//           const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
//             skipPreflight: true,
//             preflightCommitment: 'confirmed',
//           })
//           // console.log("✅ Raw transaction sent, signature:", sig);

//           // console.log("⏳ Confirming transaction...");
//           await ephemeralProgram.provider.connection.confirmTransaction(
//             {
//               signature: sig,
//               blockhash: newBlockhash,
//               lastValidBlockHeight: newHeight,
//             },
//             'processed',
//           )
//           // console.log("✅ Transaction confirmed");

//           return sig
//         },
//         operationKey,
//         60000,
//         true,
//       )

//       updateUndelegationState(stateKey, {
//         progress: 80,
//         status: 'waiting_transfer',
//       })

//       updateUndelegationState(stateKey, { status: 'success', progress: 100 })

//       // console.log(
//       //   `🎉 undelegateBattleRoom completed for ${roomId.slice(0, 8)}...`
//       // );
//       return { success: true }
//     } catch (error: any) {
//       console.error('❌ undelegateBattleRoom failed with error:')
//       console.error('Error type:', error.constructor.name)
//       console.error('Error message:', error.message)
//       console.error('Error stack:', error.stack)

//       updateUndelegationState(stateKey, {
//         status: 'failed_retry_available',
//         error: error.message || 'Battle room undelegation failed',
//         progress: 0,
//       })

//       return {
//         success: false,
//         error: error.message || 'Battle room undelegation failed',
//       }
//     }
//   }

//   /**
//    * Undelegate a warrior on ER - single undelegate
//    */
//   const undelegateWarrior = async ({
//     ephemeralProgram,
//     roomId,
//     warriorName,
//     playerPubkey,
//     isPlayerA,
//     magicBlockProvider,
//     sessionInfo,
//   }: {
//     ephemeralProgram: UndeadProgram
//     roomId: string
//     warriorName: string
//     playerPubkey: PublicKey
//     isPlayerA: boolean
//     magicBlockProvider: any
//     sessionInfo?: {
//       sessionToken: PublicKey
//       sessionSigner: { publicKey: PublicKey }
//     } | null
//   }): Promise<{ success: boolean; error?: string }> => {
//     if (!ephemeralProgram || !playerPubkey) {
//       console.error('❌ Missing ephemeralProgram or playerPubkey')
//       return { success: false, error: 'Program or player public key required' }
//     }

//     if (!magicBlockProvider) {
//       console.error('❌ Missing magicBlockProvider')
//       return { success: false, error: 'Magic Block provider required' }
//     }

//     if (!getWarriorPda) {
//       console.error('❌ Missing getWarriorPda')
//       return { success: false, error: 'Warrior PDA function required' }
//     }

//     if (!decodeRoomId) {
//       console.error('❌ Missing decodeRoomId')
//       return { success: false, error: 'Room ID decoder required' }
//     }

//     const warriorPda = getWarriorPda(warriorName)
//     const stateKey = warriorPda.toString()

//     updateUndelegationState(stateKey, {
//       status: 'undelegating',
//       progress: 10,
//       method: isPlayerA ? 'playerA' : 'playerB',
//     })

//     try {
//       const hasActiveSession = !!sessionInfo
//       // console.log("active session", hasActiveSession, sessionInfo);
//       const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : playerPubkey

//       const { roomIdBytes } = decodeRoomId(roomId)

//       updateUndelegationState(stateKey, { progress: 30 })

//       // Create transaction
//       // console.log("📝 Creating undelegate transaction...");
//       const transaction = isPlayerA
//         ? await ephemeralProgram.methods
//             .undelegatePlayera(Array.from(roomIdBytes), warriorPda)
//             .accountsPartial({
//               signer: payerPublicKey,
//               warriorA: warriorPda,
//               sessionToken: null,
//             })
//             .transaction()
//         : await ephemeralProgram.methods
//             .undelegatePlayerb(Array.from(roomIdBytes), warriorPda)
//             .accountsPartial({
//               signer: payerPublicKey,
//               warriorB: warriorPda,
//               sessionToken: null,
//             })
//             .transaction()

//       // console.log("📝 Transaction created successfully");

//       // Fetch fresh blockhash
//       // console.log("🔗 Fetching fresh blockhash...");
//       const { blockhash, lastValidBlockHeight } =
//         await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//       transaction.recentBlockhash = blockhash
//       transaction.feePayer = payerPublicKey

//       // console.log("🔗 Blockhash set:", {
//       //   blockhash,
//       //   lastValidBlockHeight,
//       //   feePayer: payerPublicKey.toString(),
//       // });

//       const txHash = await hashTxContent(transaction)
//       const operationKey = `undelegate${isPlayerA ? 'PlayerA' : 'PlayerB'}_${payerPublicKey.toString()}_${txHash}`

//       // console.log(
//       //   "🔄 Starting transaction execution with deduplication key:",
//       //   operationKey
//       // );

//       const commitmentSignature: string | undefined = await executeWithDeduplication(
//         async () => {
//           const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
//             await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//           transaction.recentBlockhash = newBlockhash

//           // console.log("✍️ Signing transaction...");
//           const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
//           // console.log("✅ Transaction signed successfully");

//           const serializedTx = signedTx.serialize()
//           // console.log(
//           //   "✅ Transaction serialized, size:",
//           //   serializedTx.length
//           // );

//           // console.log("📡 Sending raw transaction...");
//           const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
//             skipPreflight: true,
//             preflightCommitment: 'confirmed',
//           })
//           // console.log("✅ Raw transaction sent, signature:", sig);

//           // console.log("⏳ Confirming transaction...");
//           await ephemeralProgram.provider.connection.confirmTransaction(
//             {
//               signature: sig,
//               blockhash: newBlockhash,
//               lastValidBlockHeight: newHeight,
//             },
//             'processed',
//           )
//           // console.log("✅ Transaction confirmed");

//           return sig
//         },
//         operationKey,
//         60000,
//         true,
//       )

//       updateUndelegationState(stateKey, {
//         progress: 60,
//         status: 'waiting_transfer',
//       })

//       updateUndelegationState(stateKey, { status: 'success', progress: 100 })

//       // console.log("🎉 undelegateWarrior completed successfully");
//       return { success: true }
//     } catch (error: any) {
//       console.error('❌ undelegateWarrior failed with error:')
//       console.error('Error type:', error.constructor.name)
//       console.error('Error message:', error.message)
//       console.error('Error stack:', error.stack)

//       updateUndelegationState(stateKey, {
//         status: 'failed_retry_available',
//         error: error.message || 'Undelegation failed',
//         progress: 0,
//       })

//       return { success: false, error: error.message || 'Undelegation failed' }
//     }
//   }

//   /**
//    * Undelegate both players on ER
//    */
//   const undelegateBothPlayers = async ({
//     ephemeralProgram,
//     roomId,
//     creatorPubkey,
//     magicBlockProvider,
//     sessionInfo,
//   }: {
//     ephemeralProgram: UndeadProgram
//     roomId: string
//     creatorPubkey: PublicKey
//     magicBlockProvider: any
//     sessionInfo?: {
//       sessionToken: PublicKey
//       sessionSigner: { publicKey: PublicKey }
//     } | null
//   }): Promise<{ success: boolean; error?: string; details?: any }> => {
//     if (!ephemeralProgram || !creatorPubkey) {
//       console.error('❌ Missing ephemeralProgram or creatorPubkey')
//       return {
//         success: false,
//         error: 'Program or creator public key required',
//       }
//     }

//     if (!magicBlockProvider) {
//       console.error('❌ Missing magicBlockProvider')
//       return { success: false, error: 'Magic Block provider required' }
//     }

//     if (!decodeRoomId) {
//       console.error('❌ Missing decodeRoomId')
//       return { success: false, error: 'Room ID decoder required' }
//     }

//     if (!getBattleRoomInfo) {
//       console.error('❌ Missing getBattleRoomInfo')
//       return { success: false, error: 'Battle room info function required' }
//     }

//     const stateKey = `${roomId}_both_players`

//     updateUndelegationState(stateKey, {
//       status: 'undelegating',
//       progress: 10,
//       method: 'both_players',
//     })

//     try {
//       const hasActiveSession = !!sessionInfo
//       const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : creatorPubkey

//       const { roomIdBytes } = decodeRoomId(roomId)

//       updateUndelegationState(stateKey, { progress: 25 })

//       // Get battle room info
//       // console.log("🔍 Fetching battle room info...");
//       const roomInfo = await getBattleRoomInfo(roomId)
//       if (!roomInfo) {
//         throw new Error('Could not fetch battle room information')
//       }
//       const { warriorA, warriorB } = roomInfo

//       let playerAResult = null
//       let playerBResult = null

//       // Undelegate Player A
//       if (warriorA) {
//         // console.log("📝 Creating undelegatePlayerA transaction...");
//         const transactionA = await ephemeralProgram.methods
//           .undelegatePlayera(Array.from(roomIdBytes), warriorA)
//           .accountsPartial({
//             signer: payerPublicKey,
//             warriorA,
//             sessionToken: null,
//           })
//           .transaction()

//         // console.log("🔗 Fetching fresh blockhash for Player A...");
//         const { blockhash: blockhashA, lastValidBlockHeight: lastValidBlockHeightA } =
//           await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//         transactionA.recentBlockhash = blockhashA
//         transactionA.feePayer = payerPublicKey

//         const txHashA = await hashTxContent(transactionA)
//         const operationKeyA = `undelegatePlayerA_${payerPublicKey.toString()}_${txHashA}`

//         playerAResult = await executeWithDeduplication(
//           async () => {
//             const { blockhash: newBlockhashA, lastValidBlockHeight: newHeightA } =
//               await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//             transactionA.recentBlockhash = newBlockhashA

//             // console.log("✍️ Signing Player A transaction...");
//             const signedTx = await magicBlockProvider.wallet.signTransaction(transactionA)
//             const serializedTx = signedTx.serialize()
//             const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
//               skipPreflight: true,
//               preflightCommitment: 'confirmed',
//             })
//             await ephemeralProgram.provider.connection.confirmTransaction(
//               {
//                 signature: sig,
//                 blockhash: newBlockhashA,
//                 lastValidBlockHeight: newHeightA,
//               },
//               'processed',
//             )
//             return { success: true, signature: sig }
//           },
//           operationKeyA,
//           60000,
//           true,
//         )
//       }

//       updateUndelegationState(stateKey, { progress: 50 })

//       // Undelegate Player B
//       if (warriorB) {
//         // console.log("📝 Creating undelegatePlayerB transaction...");
//         const transactionB = await ephemeralProgram.methods
//           .undelegatePlayerb(Array.from(roomIdBytes), warriorB)
//           .accountsPartial({
//             signer: payerPublicKey,
//             warriorB,
//             sessionToken: null,
//           })
//           .transaction()

//         // console.log("🔗 Fetching fresh blockhash for Player B...");
//         const { blockhash: blockhashB, lastValidBlockHeight: lastValidBlockHeightB } =
//           await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//         transactionB.recentBlockhash = blockhashB
//         transactionB.feePayer = payerPublicKey

//         const txHashB = await hashTxContent(transactionB)
//         const operationKeyB = `undelegatePlayerB_${payerPublicKey.toString()}_${txHashB}`

//         playerBResult = await executeWithDeduplication(
//           async () => {
//             const { blockhash: newBlockhashB, lastValidBlockHeight: newHeightB } =
//               await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//             transactionB.recentBlockhash = newBlockhashB

//             // console.log("✍️ Signing Player B transaction...");
//             const signedTx = await magicBlockProvider.wallet.signTransaction(transactionB)
//             const serializedTx = signedTx.serialize()
//             const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
//               skipPreflight: true,
//               preflightCommitment: 'confirmed',
//             })
//             await ephemeralProgram.provider.connection.confirmTransaction(
//               {
//                 signature: sig,
//                 blockhash: newBlockhashB,
//                 lastValidBlockHeight: newHeightB,
//               },
//               'processed',
//             )
//             return { success: true, signature: sig }
//           },
//           operationKeyB,
//           60000,
//           true,
//         )
//       }

//       updateUndelegationState(stateKey, {
//         progress: 75,
//         status: 'waiting_transfer',
//       })

//       const overallSuccess = (playerAResult?.success ?? true) && (playerBResult?.success ?? true)

//       updateUndelegationState(stateKey, {
//         status: overallSuccess ? 'success' : 'failed_retry_available',
//         progress: 100,
//         error: overallSuccess ? undefined : 'Some undelegations failed',
//       })

//       // console.log("🎉 undelegateBothPlayers completed");
//       return {
//         success: overallSuccess,
//         error: overallSuccess ? undefined : 'Some undelegations failed',
//         details: { playerA: playerAResult, playerB: playerBResult, roomInfo },
//       }
//     } catch (error: any) {
//       console.error('❌ undelegateBothPlayers failed with error:')
//       console.error('Error type:', error.constructor.name)
//       console.error('Error message:', error.message)
//       console.error('Error stack:', error.stack)

//       updateUndelegationState(stateKey, {
//         status: 'failed_retry_available',
//         error: error.message || 'Both players undelegation failed',
//         progress: 0,
//       })

//       return {
//         success: false,
//         error: error.message || 'Both players undelegation failed',
//       }
//     }
//   }

//   /**
//    * Undelegate a battle room on ER
//    */
//   const undelegateRoom = async ({
//     ephemeralProgram,
//     roomId,
//     signerPubkey,
//     magicBlockProvider,
//     sessionInfo,
//   }: {
//     ephemeralProgram: UndeadProgram
//     roomId: string
//     signerPubkey: PublicKey
//     magicBlockProvider: any
//     sessionInfo?: {
//       sessionToken: PublicKey
//       sessionSigner: { publicKey: PublicKey }
//     } | null
//   }): Promise<{ success: boolean; error?: string }> => {
//     if (!ephemeralProgram || !signerPubkey) {
//       console.error('❌ Missing ephemeralProgram or signerPubkey')
//       return { success: false, error: 'Program or signer public key required' }
//     }

//     if (!magicBlockProvider) {
//       console.error('❌ Missing magicBlockProvider')
//       return { success: false, error: 'Magic Block provider required' }
//     }

//     if (!decodeRoomId) {
//       console.error('❌ Missing decodeRoomId')
//       return { success: false, error: 'Room ID decoder required' }
//     }

//     const stateKey = roomId

//     updateUndelegationState(stateKey, {
//       status: 'undelegating',
//       progress: 10,
//       method: 'room',
//     })

//     try {
//       const hasActiveSession = !!sessionInfo
//       const payerPublicKey = hasActiveSession ? sessionInfo.sessionSigner.publicKey : signerPubkey

//       const { roomIdBytes, battleRoomPda } = decodeRoomId(roomId)

//       updateUndelegationState(stateKey, { progress: 30 })

//       // Create transaction
//       // console.log("📝 Creating undelegateRoom transaction...");
//       const transaction = await ephemeralProgram.methods
//         .undelegateRoom(Array.from(roomIdBytes))
//         .accountsPartial({
//           signer: payerPublicKey,
//           battleRoom: battleRoomPda,
//           sessionToken: null,
//         })
//         .transaction()

//       // console.log("📝 Transaction created successfully");

//       // Fetch fresh blockhash
//       // console.log("🔗 Fetching fresh blockhash...");
//       const { blockhash, lastValidBlockHeight } =
//         await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//       transaction.recentBlockhash = blockhash
//       transaction.feePayer = payerPublicKey

//       // console.log("🔗 Blockhash set:", {
//       //   blockhash,
//       //   lastValidBlockHeight,
//       //   feePayer: payerPublicKey.toString(),
//       // });

//       const txHash = await hashTxContent(transaction)
//       const operationKey = `undelegateRoom_${payerPublicKey.toString()}_${txHash}`

//       // console.log(
//       //   "🔄 Starting transaction execution with deduplication key:",
//       //   operationKey
//       // );

//       const commitmentSignature: string | undefined = await executeWithDeduplication(
//         async () => {
//           // Re-fetch blockhash to ensure freshness
//           // console.log("🔄 Re-fetching blockhash...");
//           const { blockhash: newBlockhash, lastValidBlockHeight: newHeight } =
//             await ephemeralProgram.provider.connection.getLatestBlockhash('confirmed')
//           transaction.recentBlockhash = newBlockhash

//           // console.log("✍️ Signing transaction...");
//           const signedTx = await magicBlockProvider.wallet.signTransaction(transaction)
//           // console.log("✅ Transaction signed successfully");

//           const serializedTx = signedTx.serialize()
//           // console.log(
//           //   "✅ Transaction serialized, size:",
//           //   serializedTx.length
//           // );

//           // console.log("📡 Sending raw transaction...");
//           const sig = await ephemeralProgram.provider.connection.sendRawTransaction(serializedTx, {
//             skipPreflight: true,
//             preflightCommitment: 'confirmed',
//           })
//           // console.log("✅ Raw transaction sent, signature:", sig);

//           // console.log("⏳ Confirming transaction...");
//           await ephemeralProgram.provider.connection.confirmTransaction(
//             {
//               signature: sig,
//               blockhash: newBlockhash,
//               lastValidBlockHeight: newHeight,
//             },
//             'processed',
//           )
//           // console.log("✅ Transaction confirmed");

//           return sig
//         },
//         operationKey,
//         60000,
//         true,
//       )

//       updateUndelegationState(stateKey, {
//         progress: 60,
//         status: 'waiting_transfer',
//       })

//       updateUndelegationState(stateKey, { status: 'success', progress: 100 })

//       // console.log(`🎉 undelegateRoom completed for ${roomId.slice(0, 8)}...`);
//       return { success: true }
//     } catch (error: any) {
//       console.error('❌ undelegateRoom failed with error:')
//       console.error('Error type:', error.constructor.name)
//       console.error('Error message:', error.message)
//       console.error('Error stack:', error.stack)

//       updateUndelegationState(stateKey, {
//         status: 'failed_retry_available',
//         error: error.message || 'Room undelegation failed',
//         progress: 0,
//       })

//       return {
//         success: false,
//         error: error.message || 'Room undelegation failed',
//       }
//     }
//   }

//   /**
//    * Retry failed undelegation on ER
//    */
//   const retryUndelegation = async ({
//     ephemeralProgram,
//     key,
//     type,
//     roomId,
//     playerPubkey,
//     warriorName,
//     isPlayerA,
//     sessionInfo,
//   }: {
//     ephemeralProgram: UndeadProgram
//     key: string
//     type: 'warrior' | 'room' | 'both_players'
//     roomId: string
//     playerPubkey: PublicKey
//     warriorName?: string
//     isPlayerA?: boolean
//     sessionInfo?: {
//       sessionToken: PublicKey
//       sessionSigner: { publicKey: PublicKey }
//     } | null
//   }) => {
//     if (type === 'warrior' && warriorName && isPlayerA !== undefined) {
//       return await undelegateWarrior({
//         ephemeralProgram,
//         roomId,
//         warriorName,
//         playerPubkey,
//         isPlayerA,
//         magicBlockProvider,
//         sessionInfo,
//       })
//     } else if (type === 'room') {
//       return await undelegateRoom({
//         ephemeralProgram,
//         roomId,
//         signerPubkey: playerPubkey,
//         magicBlockProvider,
//         sessionInfo,
//       })
//     } else if (type === 'both_players') {
//       return await undelegateBothPlayers({
//         ephemeralProgram,
//         roomId,
//         creatorPubkey: playerPubkey,
//         magicBlockProvider,
//         sessionInfo,
//       })
//     }
//     return { success: false, error: 'Invalid retry parameters' }
//   }

//   /**
//    * Clear undelegation state for a specific key
//    */
//   const clearUndelegationState = useCallback((key: string) => {
//     setUndelegationStates((prev) => {
//       const newState = { ...prev }
//       delete newState[key]
//       return newState
//     })
//   }, [])

//   /**
//    * Get potentially delegated warriors by checking recent room IDs
//    */
//   const getPotentiallyDelegatedRoomIds = useCallback(() => {
//     return getRecentRoomIds()
//   }, [getRecentRoomIds])

//   return {
//     // Core undelegation functions
//     undelegateWarrior,
//     undelegateBattleRoom,
//     undelegateRoom,
//     undelegateBothPlayers,
//     retryUndelegation,

//     // State management
//     undelegationStates,
//     clearUndelegationState,

//     // Room ID management
//     storeRoomId,
//     getRecentRoomIds,
//     getPotentiallyDelegatedRoomIds,

//     // Utility functions
//     getBattleRoomInfo,
//   }
// }
