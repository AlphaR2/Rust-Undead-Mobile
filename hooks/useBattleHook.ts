"use client";
import { useCallback, useRef } from "react";
import { PublicKey } from "@solana/web3.js";


// Types
interface BattleState {
  currentQuestionIndex: number;
  myScore: number;
  opponentScore: number;
  myCurrentHP: number;
  myMaxHP: number;
  opponentCurrentHP: number;
  opponentMaxHP: number;
  battlePhase: "learning" | "pressure" | "deadly";
  turnTimeLeft: number;
  gameOver: boolean;
  winner: string | any;
  myAnswerSubmitted: boolean;
  opponentAnswerSubmitted: boolean;
  bothAnswersSubmitted: boolean;
  canSubmitAnswer: boolean;
  waitingForNextQuestion: boolean;
}

interface WarriorInfo {
  name: string;
  address: string;
  player: string;
  imageUri?: string;
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  baseKnowledge?: number;
  currentHp?: number;
  maxHp?: number;
  warriorClass?: any;
  battlesWon?: number;
  battlesLost?: number;
}

interface BattleStateSyncParams {
  ephemeralProgram: any;
  battleRoomPda: string;
  publicKey: PublicKey | null;
  battleQuestions: any[];
  myWarrior: WarriorInfo | null;
  opponentWarrior: WarriorInfo | null;
  fetchBattleRoomStateInER: (pda: string) => Promise<any>;
  getUserRoleInBattleRoom: (account: any) => "creator" | "joiner";
  useFetchWarriorInEr: (pda: string, warriorPda: PublicKey) => Promise<any>;
  startTimer: () => void;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState>>;
  setCurrentBattleRoomState: React.Dispatch<React.SetStateAction<any>>;
  setBattleWinner: React.Dispatch<React.SetStateAction<string>>;
  setFinalBattleScores: React.Dispatch<React.SetStateAction<any>>;
  setShowBattleEndModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedAnswer: React.Dispatch<React.SetStateAction<boolean | null>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
}

// Constants
const BATTLE_TIMER_DURATION = 120;

// Utility Functions
const safeToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || 0;
};

const getBattlePhase = (
  questionIndex: number
): "learning" | "pressure" | "deadly" => {
  if (questionIndex <= 2) return "learning";
  if (questionIndex <= 6) return "pressure";
  return "deadly";
};

export const useBattleStateSync = ({
  ephemeralProgram,
  battleRoomPda,
  publicKey,
  battleQuestions,
  myWarrior,
  opponentWarrior,
  fetchBattleRoomStateInER,
  getUserRoleInBattleRoom,
  useFetchWarriorInEr,
  startTimer,
  setBattleState,
  setCurrentBattleRoomState,
  setBattleWinner,
  setFinalBattleScores,
  setShowBattleEndModal,
  setSelectedAnswer,
  setIsSubmitting,
  setShowFeedback,
}: BattleStateSyncParams) => {
  // Track ongoing sync operations
  const syncInProgress = useRef(false);

  // Main battle state synchronization function
  const fetchLatestBattleRoomState = useCallback(async () => {
    if (!ephemeralProgram || !battleRoomPda || !publicKey) {
      console.warn("Missing required data for fetching battle room state");
      return null;
    }

    if (syncInProgress.current) {
      // console.log("🔄 Sync already in progress, skipping...");
      return null;
    }

    try {
      syncInProgress.current = true;

      // Fetch battleroom state
      const battleRoomState = await fetchBattleRoomStateInER(battleRoomPda);
      if (!battleRoomState) {
        throw new Error("Battle room not found on Ephemeral Rollup");
      }

      const battleRoomAccount = battleRoomState.state;

      // Determine user role
      const userRole = getUserRoleInBattleRoom(battleRoomAccount);
      const isUserCreator = userRole === "creator";

      setCurrentBattleRoomState(battleRoomState);

      const currentQuestionFromState = safeToNumber(
        battleRoomAccount.state.currentQuestion
      );

      // Calculate scores
      const myCurrentScore = isUserCreator
        ? safeToNumber(battleRoomAccount.state.playerACorrect)
        : safeToNumber(battleRoomAccount.state.playerBCorrect);

      const opponentCurrentScore = isUserCreator
        ? safeToNumber(battleRoomAccount.state.playerBCorrect)
        : safeToNumber(battleRoomAccount.state.playerACorrect);

      // Fetch warrior information
      const creatorWarriorInfo = battleRoomAccount.state.warriorA
        ? await ephemeralProgram.account.undeadWarrior.fetch(
            battleRoomAccount.state.warriorA
          )
        : null;

      const joinerWarriorAccount = battleRoomAccount.state.warriorB
        ? await ephemeralProgram.account.undeadWarrior.fetch(
            battleRoomAccount.state.warriorB
          )
        : null;

      // Update battle state with the latest data
      setBattleState((prev) => {
        const newPhase = getBattlePhase(currentQuestionFromState);

        // Check if battle is complete
        const stateString =
          typeof battleRoomAccount.battleStatus === "object"
            ? Object.keys(battleRoomAccount.battleStatus)[0]
            : battleRoomAccount.state?.state;

        const isBattleComplete =
          battleRoomAccount.state.winner !== null ||
          stateString === "Completed" ||
          stateString === "completed";

        // console.log("Battle State Update:", {
        //   currentQuestion: currentQuestionFromState,
        //   myHP: isUserCreator
        //     ? safeToNumber(creatorWarriorInfo?.currentHp)
        //     : safeToNumber(joinerWarriorAccount?.currentHp),
        //   opponentHP: isUserCreator
        //     ? safeToNumber(joinerWarriorAccount?.currentHp)
        //     : safeToNumber(creatorWarriorInfo?.currentHp),
        //   winner: battleRoomAccount.state.winner?.toString(),
        //   stateString,
        //   isBattleComplete,
        // });

        // Check if question has advanced
        const questionAdvanced =
          currentQuestionFromState > prev.currentQuestionIndex;

        // Handle battle completion
        if (isBattleComplete && !prev.gameOver) {
          return handleBattleCompletion({
            prev,
            battleRoomAccount,
            publicKey,
            myWarrior,
            opponentWarrior,
            isUserCreator,
            creatorWarriorInfo,
            joinerWarriorAccount,
            myCurrentScore,
            opponentCurrentScore,
            currentQuestionFromState,
            newPhase,
            setBattleWinner,
            setFinalBattleScores,
            setShowBattleEndModal,
          });
        }

        // Handle question advancement
        if (questionAdvanced) {
          return handleQuestionAdvancement({
            prev,
            currentQuestionFromState,
            myCurrentScore,
            opponentCurrentScore,
            newPhase,
            isUserCreator,
            creatorWarriorInfo,
            joinerWarriorAccount,
            setSelectedAnswer,
            setIsSubmitting,
            setShowFeedback,
            startTimer,
          });
        }

        // Regular state update
        return handleRegularStateUpdate({
          prev,
          currentQuestionFromState,
          myCurrentScore,
          opponentCurrentScore,
          newPhase,
          isUserCreator,
          creatorWarriorInfo,
          joinerWarriorAccount,
        });
      });

      return battleRoomState;
    } catch (error: any) {
      console.error("❌ Error fetching latest battle room state:", error);
      return null;
    } finally {
      syncInProgress.current = false;
    }
  }, [
    ephemeralProgram,
    battleRoomPda,
    publicKey,
    fetchBattleRoomStateInER,
    getUserRoleInBattleRoom,
    useFetchWarriorInEr,
    battleQuestions.length,
    myWarrior,
    opponentWarrior,
    startTimer,
    setBattleState,
    setCurrentBattleRoomState,
    setBattleWinner,
    setFinalBattleScores,
    setShowBattleEndModal,
    setSelectedAnswer,
    setIsSubmitting,
    setShowFeedback,
  ]);

  // Check if battle has completed
  const checkBattleCompletion = useCallback(async () => {
    if (!ephemeralProgram || !battleRoomPda) return false;

    try {
      const battleRoomState = await fetchBattleRoomStateInER(battleRoomPda);
      if (!battleRoomState) return false;

      const state = battleRoomState.state;
      const winner = state?.state?.winner;
      const stateString =
        typeof state?.battleStatus === "object"
          ? Object.keys(state.battleStatus)[0]
          : state?.state?.state;

      return !!(
        winner ||
        stateString === "Completed" ||
        stateString === "completed"
      );
    } catch (error) {
      console.error("Error checking battle completion:", error);
      return false;
    }
  }, [ephemeralProgram, battleRoomPda, fetchBattleRoomStateInER]);

  // Sync answer states from blockchain
  const syncAnswerStates = useCallback(
    async (currentQuestionIndex: number) => {
      if (!ephemeralProgram || !battleRoomPda || !publicKey) return null;

      try {
        const battleRoomState = await fetchBattleRoomStateInER(battleRoomPda);
        if (!battleRoomState) return null;

        const battleRoomAccount = battleRoomState.state;
        const userRole = getUserRoleInBattleRoom(battleRoomAccount);
        const isUserCreator = userRole === "creator";

        const currentQuestionFromState = safeToNumber(
          battleRoomAccount.state.currentQuestion
        );

        // Only sync if on the same question
        if (currentQuestionIndex === currentQuestionFromState) {
          const playerAAnswered =
            battleRoomAccount.state.playerAAnswered || false;
          const playerBAnswered =
            battleRoomAccount.state.playerBAnswered || false;

          const myAnswered = isUserCreator ? playerAAnswered : playerBAnswered;
          const opponentAnswered = isUserCreator
            ? playerBAnswered
            : playerAAnswered;
          const bothAnswered = myAnswered && opponentAnswered;

          return {
            myAnswerSubmitted: myAnswered,
            opponentAnswerSubmitted: opponentAnswered,
            bothAnswersSubmitted: bothAnswered,
          };
        }

        return null;
      } catch (error) {
        console.error("Error syncing answer states:", error);
        return null;
      }
    },
    [
      ephemeralProgram,
      battleRoomPda,
      publicKey,
      fetchBattleRoomStateInER,
      getUserRoleInBattleRoom,
    ]
  );

  return {
    fetchLatestBattleRoomState,
    checkBattleCompletion,
    syncAnswerStates,
    syncInProgress: syncInProgress.current,
  };
};

// Helper functions for state updates
const handleBattleCompletion = ({
  prev,
  battleRoomAccount,
  publicKey,
  myWarrior,
  opponentWarrior,
  isUserCreator,
  creatorWarriorInfo,
  joinerWarriorAccount,
  myCurrentScore,
  opponentCurrentScore,
  currentQuestionFromState,
  newPhase,
  setBattleWinner,
  setFinalBattleScores,
  setShowBattleEndModal,
}: any) => {
  const winner =
    battleRoomAccount.state.winner?.toString() === publicKey.toString()
      ? myWarrior?.name || "You"
      : battleRoomAccount.state.winner?.toString() !== publicKey.toString()
      ? opponentWarrior?.name || "Opponent"
      : "Draw";

  const finalScores = {
    myScore: myCurrentScore,
    opponentScore: opponentCurrentScore,
    myHP: isUserCreator
      ? safeToNumber(creatorWarriorInfo?.currentHp) || prev.myCurrentHP
      : safeToNumber(joinerWarriorAccount?.currentHp) || prev.myCurrentHP,
    opponentHP: isUserCreator
      ? safeToNumber(joinerWarriorAccount?.currentHp) || prev.opponentCurrentHP
      : safeToNumber(creatorWarriorInfo?.currentHp) || prev.opponentCurrentHP,
  };

  setBattleWinner(winner);
  setFinalBattleScores(finalScores);
  setShowBattleEndModal(true);

  return {
    ...prev,
    currentQuestionIndex: currentQuestionFromState,
    myScore: myCurrentScore,
    opponentScore: opponentCurrentScore,
    battlePhase: newPhase,
    gameOver: true,
    winner,
    myCurrentHP: finalScores.myHP,
    myMaxHP: isUserCreator
      ? safeToNumber(creatorWarriorInfo?.maxHp) || prev.myMaxHP
      : safeToNumber(joinerWarriorAccount?.maxHp) || prev.myMaxHP,
    opponentCurrentHP: finalScores.opponentHP,
    opponentMaxHP: isUserCreator
      ? safeToNumber(joinerWarriorAccount?.maxHp) || prev.opponentMaxHP
      : safeToNumber(creatorWarriorInfo?.maxHp) || prev.opponentMaxHP,
  };
};

const handleQuestionAdvancement = ({
  prev,
  currentQuestionFromState,
  myCurrentScore,
  opponentCurrentScore,
  newPhase,
  isUserCreator,
  creatorWarriorInfo,
  joinerWarriorAccount,
  setSelectedAnswer,
  setIsSubmitting,
  setShowFeedback,
  startTimer,
}: any) => {
  // console.log(
  //   `🔄 Question advanced from ${prev.currentQuestionIndex} to ${currentQuestionFromState}`
  // );

  setSelectedAnswer(null);
  setIsSubmitting(false);
  setShowFeedback(false);
  setTimeout(() => startTimer(), 100);

  return {
    ...prev,
    currentQuestionIndex: currentQuestionFromState,
    myScore: myCurrentScore,
    opponentScore: opponentCurrentScore,
    battlePhase: newPhase,
    myAnswerSubmitted: false,
    opponentAnswerSubmitted: false,
    bothAnswersSubmitted: false,
    canSubmitAnswer: true,
    waitingForNextQuestion: false,
    turnTimeLeft: BATTLE_TIMER_DURATION,
    myCurrentHP: updateHPIfNeeded(
      prev.myCurrentHP,
      isUserCreator,
      creatorWarriorInfo,
      joinerWarriorAccount,
      true
    ),
    myMaxHP: updateMaxHPIfNeeded(
      prev.myMaxHP,
      isUserCreator,
      creatorWarriorInfo,
      joinerWarriorAccount,
      true
    ),
    opponentCurrentHP: updateHPIfNeeded(
      prev.opponentCurrentHP,
      isUserCreator,
      joinerWarriorAccount,
      creatorWarriorInfo,
      false
    ),
    opponentMaxHP: updateMaxHPIfNeeded(
      prev.opponentMaxHP,
      isUserCreator,
      joinerWarriorAccount,
      creatorWarriorInfo,
      false
    ),
  };
};

const handleRegularStateUpdate = ({
  prev,
  currentQuestionFromState,
  myCurrentScore,
  opponentCurrentScore,
  newPhase,
  isUserCreator,
  creatorWarriorInfo,
  joinerWarriorAccount,
}: any) => {
  return {
    ...prev,
    currentQuestionIndex: currentQuestionFromState,
    myScore: myCurrentScore,
    opponentScore: opponentCurrentScore,
    battlePhase: newPhase,
    myCurrentHP: updateHPIfNeeded(
      prev.myCurrentHP,
      isUserCreator,
      creatorWarriorInfo,
      joinerWarriorAccount,
      true
    ),
    myMaxHP: updateMaxHPIfNeeded(
      prev.myMaxHP,
      isUserCreator,
      creatorWarriorInfo,
      joinerWarriorAccount,
      true
    ),
    opponentCurrentHP: updateHPIfNeeded(
      prev.opponentCurrentHP,
      isUserCreator,
      joinerWarriorAccount,
      creatorWarriorInfo,
      false
    ),
    opponentMaxHP: updateMaxHPIfNeeded(
      prev.opponentMaxHP,
      isUserCreator,
      joinerWarriorAccount,
      creatorWarriorInfo,
      false
    ),
  };
};

// Helper functions for HP updates
const updateHPIfNeeded = (
  prevHP: number,
  isUserCreator: boolean,
  creatorInfo: any,
  joinerInfo: any,
  isMyHP: boolean
) => {
  if (prevHP === 100) {
    if (isMyHP) {
      return isUserCreator && creatorInfo?.currentHp
        ? safeToNumber(creatorInfo.currentHp)
        : !isUserCreator && joinerInfo?.currentHp
        ? safeToNumber(joinerInfo.currentHp)
        : prevHP;
    } else {
      return isUserCreator && joinerInfo?.currentHp
        ? safeToNumber(joinerInfo.currentHp)
        : !isUserCreator && creatorInfo?.currentHp
        ? safeToNumber(creatorInfo.currentHp)
        : prevHP;
    }
  }
  return prevHP;
};

const updateMaxHPIfNeeded = (
  prevMaxHP: number,
  isUserCreator: boolean,
  creatorInfo: any,
  joinerInfo: any,
  isMyHP: boolean
) => {
  if (prevMaxHP === 100) {
    if (isMyHP) {
      return isUserCreator && creatorInfo?.maxHp
        ? safeToNumber(creatorInfo.maxHp)
        : !isUserCreator && joinerInfo?.maxHp
        ? safeToNumber(joinerInfo.maxHp)
        : prevMaxHP;
    } else {
      return isUserCreator && joinerInfo?.maxHp
        ? safeToNumber(joinerInfo.maxHp)
        : !isUserCreator && creatorInfo?.maxHp
        ? safeToNumber(creatorInfo.maxHp)
        : prevMaxHP;
    }
  }
  return prevMaxHP;
};
