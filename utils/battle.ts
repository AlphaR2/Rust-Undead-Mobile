import { PublicKey } from "@solana/web3.js";

// Types matching the hook and component
export interface BattleQuestion {
  questionId: number;
  text: string;
  topicId?: number;
  difficulty?: string;
  correct?: boolean;
  explanation?: string;
}

export interface BattlePhaseConfig {
  name: "learning" | "pressure" | "deadly";
  damageRange: [number, number];
  description: string;
  color: string;
  icon: string;
}

export interface TimerWarning {
  threshold: number;
  message: string;
  color: string;
  icon: string;
  urgency: "low" | "medium" | "high" | "critical";
}

// Battle phase configurations
export const BATTLE_PHASES: Record<string, BattlePhaseConfig> = {
  learning: {
    name: "learning",
    damageRange: [4, 8],
    description: "Getting warmed up - lower damage range",
    color: "text-green-400",
    icon: "🎓",
  },
  pressure: {
    name: "pressure",
    damageRange: [6, 12],
    description: "Tension rising - moderate damage",
    color: "text-yellow-400",
    icon: "⚡",
  },
  deadly: {
    name: "deadly",
    damageRange: [10, 18],
    description: "Final showdown - maximum damage!",
    color: "text-red-400",
    icon: "💀",
  },
};

// Timer warning configurations
export const TIMER_WARNINGS: TimerWarning[] = [
  {
    threshold: 60,
    message: "⏰ 1 minute remaining!",
    color: "#f59e0b",
    icon: "⚠️",
    urgency: "low",
  },
  {
    threshold: 30,
    message: "⏰ 30 seconds left!",
    color: "#f97316",
    icon: "🚨",
    urgency: "medium",
  },
  {
    threshold: 10,
    message: "⏰ 10 seconds remaining!",
    color: "#dc2626",
    icon: "⚡",
    urgency: "high",
  },
  {
    threshold: 0,
    message: "⏰ Time's up! Auto-submitting...",
    color: "#dc2626",
    icon: "🚨",
    urgency: "critical",
  },
];

/**
 * Calculates timer progress percentage
 */
export function getTimerProgress(
  timeLeft: number,
  totalTime: number = 120
): number {
  return ((totalTime - timeLeft) / totalTime) * 100;
}

/**
 * Formats time remaining as MM:SS
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Validates if a battle question is properly formatted
 */
export function validateBattleQuestion(
  question: any
): question is BattleQuestion {
  return (
    question &&
    typeof question.questionId === "number" &&
    typeof question.text === "string" &&
    question.text.length > 0
  );
}

/**
 * Calculates HP percentage for styling
 */
export function getHPPercentage(current: number, max: number): number {
  return Math.max(0, Math.min(100, (current / max) * 100));
}

/**
 * Gets HP bar color based on percentage
 */
export function getHPBarColor(percentage: number): string {
  if (percentage > 60) return "bg-green-500";
  if (percentage > 30) return "bg-yellow-500";
  return "bg-red-500";
}

/**
 * Decodes room ID from display format back to bytes
 */
export function decodeRoomId(
  displayId: string,
  programId: PublicKey
): { roomIdBytes: Uint8Array; battleRoomPda: PublicKey } {
  try {
    // Restore base64 format
    let base64 = displayId.replace(/[-_]/g, (c) => (c === "-" ? "+" : "/"));

    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    // Decode base64 to bytes
    const binaryString = atob(base64);
    const bytes = [];
    for (let i = 0; i < binaryString.length; i++) {
      bytes.push(binaryString.charCodeAt(i));
    }

    if (bytes.length !== 32) {
      throw new Error("Invalid room code length");
    }

    const roomIdBytes = new Uint8Array(bytes);

    const pdaroomid = Array.from(roomIdBytes);
    const [battleRoomPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("battleroom"), Buffer.from(pdaroomid)],
      programId
    );

    return { roomIdBytes, battleRoomPda };
  } catch (error) {
    throw new Error("Invalid room code format");
  }
}

/**
 * Generates a unique client seed for VRF
 */
export function generateClientSeed(): number {
  return Math.floor(Math.random() * 256);
}

/**
 * Determines if auto-submit should trigger
 */
export function shouldAutoSubmit(
  timeLeft: number,
  canSubmitAnswer: boolean,
  myAnswerSubmitted: boolean
): boolean {
  return timeLeft === 0 && canSubmitAnswer && !myAnswerSubmitted;
}

/**
 * Gets the appropriate warning for current time
 */
export function getCurrentTimeWarning(timeLeft: number): TimerWarning | null {
  return (
    TIMER_WARNINGS.find((warning) => timeLeft === warning.threshold) || null
  );
}

/**
 * Checks if both players have submitted answers
 */
export function checkBothAnswersSubmitted(
  myAnswerSubmitted: boolean,
  opponentAnswerSubmitted: boolean
): boolean {
  return myAnswerSubmitted && opponentAnswerSubmitted;
}

/**
 * Determines winner based on battle state
 */
export function determineWinner(
  myScore: number,
  opponentScore: number,
  myHP: number,
  opponentHP: number,
  myWarriorName?: string,
  opponentWarriorName?: string
): string {
  // HP-based victory (primary)
  if (myHP > opponentHP) {
    return myWarriorName || "You";
  }
  if (opponentHP > myHP) {
    return opponentWarriorName || "Opponent";
  }

  // Score-based tiebreaker (secondary)
  if (myScore > opponentScore) {
    return myWarriorName || "You";
  }
  if (opponentScore > myScore) {
    return opponentWarriorName || "Opponent";
  }

  // Perfect tie - default to "Draw"
  return "Draw";
}

/**
 * Validates battle room state for readiness
 */
export function validateBattleReadiness(
  publicKey: PublicKey | null,
  ephemeralProgram: any,
  magicBlockProvider: any,
  battleRoomPda: string,
  myWarrior: any,
  opponentWarrior: any,
  questionsReady: boolean
): { ready: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!publicKey) missing.push("wallet connection");
  if (!ephemeralProgram) missing.push("ephemeral program");
  if (!magicBlockProvider) missing.push("magic block provider");
  if (!battleRoomPda) missing.push("battle room PDA");
  if (!myWarrior) missing.push("my warrior");
  if (!opponentWarrior) missing.push("opponent warrior");
  if (!questionsReady) missing.push("battle questions");

  return {
    ready: missing.length === 0,
    missing,
  };
}

/**
 * Creates a battle state snapshot for debugging
 */
export function createBattleStateSnapshot(battleState: any, additional?: any) {
  return {
    timestamp: Date.now(),
    currentQuestion: battleState.currentQuestionIndex + 1,
    phase: battleState.battlePhase,
    scores: {
      my: battleState.myScore,
      opponent: battleState.opponentScore,
    },
    hp: {
      my: `${battleState.myCurrentHP}/${battleState.myMaxHP}`,
      opponent: `${battleState.opponentCurrentHP}/${battleState.opponentMaxHP}`,
    },
    answers: {
      mySubmitted: battleState.myAnswerSubmitted,
      opponentSubmitted: battleState.opponentAnswerSubmitted,
      bothSubmitted: battleState.bothAnswersSubmitted,
    },
    timer: battleState.turnTimeLeft,
    canSubmit: battleState.canSubmitAnswer,
    gameOver: battleState.gameOver,
    winner: battleState.winner,
    ...additional,
  };
}

/**
 * Handles error with appropriate user feedback
 */
export function handleBattleError(error: any, context: string): string {
  console.error(`❌ Battle error in ${context}:`, error);

  if (error.message?.includes("rate limit")) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (error.message?.includes("network")) {
    return "Network connection issue. Please check your internet.";
  }

  if (error.message?.includes("wallet")) {
    return "Wallet connection issue. Please reconnect your wallet.";
  }

  if (error.message?.includes("battle room")) {
    return "Battle room not found. The room may have expired.";
  }

  if (error.message?.includes("warrior")) {
    return "Warrior data not found. Please select a valid warrior.";
  }

  return error.message || `An error occurred in ${context}`;
}

/**
 * Calculates expected damage range for current phase
 */
// export function getExpectedDamageRange(
//   questionIndex: number
// ): [number, number] {
//   const phase = getBattlePhase(questionIndex);
//   return phase;
// }

/**
 * Formats battle statistics for display
 */
export function formatBattleStats(stats: {
  level?: number;
  baseAttack?: number;
  baseDefense?: number;
  baseKnowledge?: number;
  battlesWon?: number;
  battlesLost?: number;
}) {
  return {
    level: safeToNumber(stats.level) || 1,
    attack: safeToNumber(stats.baseAttack),
    defense: safeToNumber(stats.baseDefense),
    knowledge: safeToNumber(stats.baseKnowledge),
    winRate:
      stats.battlesWon && stats.battlesLost
        ? (
            (safeToNumber(stats.battlesWon) /
              (safeToNumber(stats.battlesWon) +
                safeToNumber(stats.battlesLost))) *
            100
          ).toFixed(1)
        : "0.0",
  };
}

/**
 * Checks if warrior is ready for battle (not on cooldown)
 */
export function isWarriorReady(warrior: any): boolean {
  if (!warrior) return false;

  // Check if warrior has required properties
  if (!warrior.name || !warrior.address) return false;

  // Check HP (warrior should have some HP to battle)
  const currentHp = safeToNumber(warrior.currentHp);
  const maxHp = safeToNumber(warrior.maxHp);

  if (currentHp <= 0 || maxHp <= 0) return false;

  // Add any cooldown checks here if needed
  // For now, assume warrior is ready if it has valid data
  return true;
}

/**
 * Generates a random seed for VRF that's reproducible for testing
 */
export function generateDeterministicSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 256;
}

/**
 * Validates WebSocket connection status
 */
export function validateWebSocketConnection(listener: any): boolean {
  return (
    listener &&
    typeof listener.addEventListener === "function" &&
    typeof listener.disconnect === "function"
  );
}

/**
 * Creates a retry configuration for failed operations
 */
export function createRetryConfig(
  maxRetries: number = 3,
  baseDelay: number = 1000
) {
  return {
    maxRetries,
    baseDelay,
    getDelay: (attempt: number) =>
      Math.min(baseDelay * Math.pow(2, attempt), 10000),
    shouldRetry: (error: any) => {
      // Don't retry on client errors or permanent failures
      if (
        error.message?.includes("Invalid") ||
        error.message?.includes("Unauthorized") ||
        error.message?.includes("Not Found")
      ) {
        return false;
      }
      return true;
    },
  };
}

/**
 * Debounce function for rapid state updates
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Throttle function for high-frequency events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Creates a cleanup manager for managing multiple timeouts/intervals
 */
export function createCleanupManager() {
  const timeouts = new Set<NodeJS.Timeout>();
  const intervals = new Set<NodeJS.Timeout>();

  return {
    setTimeout: (callback: () => void, delay: number) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        callback();
      }, delay);
      timeouts.add(id);
      return id;
    },

    setInterval: (callback: () => void, delay: number) => {
      const id = setInterval(callback, delay);
      intervals.add(id);
      return id;
    },

    clearTimeout: (id: NodeJS.Timeout) => {
      clearTimeout(id);
      timeouts.delete(id);
    },

    clearInterval: (id: NodeJS.Timeout) => {
      clearInterval(id);
      intervals.delete(id);
    },

    cleanup: () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      timeouts.clear();
      intervals.clear();
    },
  };
}

/**
 * Battle event types for type-safe event handling
 */
export type BattleEventType =
  | "answerSubmitEvent"
  | "scoresEvent"
  | "answerRevealEvent"
  | "damageEvent"
  | "winnerEvent"
  | "battleStartEvent"
  | "battleEndEvent";

/**
 * Type-safe event data interfaces
 */
export interface BattleEventData {
  answerSubmitEvent: {
    player: string;
    answer: boolean;
    questionIndex: number;
  };
  scoresEvent: {
    playerA: number;
    playerB: number;
  };
  answerRevealEvent: {
    player: string;
    isCorrect: boolean;
    questionIndex: number;
  };
  damageEvent: {
    damage: number;
    hp: number;
    warriorName: string;
    attacker: string;
  };
  winnerEvent: {
    winner: string;
    finalScores: {
      playerA: number;
      playerB: number;
    };
    finalHP: {
      playerA: number;
      playerB: number;
    };
  };
  battleStartEvent: {
    battleRoomPda: string;
    playerA: string;
    playerB: string;
  };
  battleEndEvent: {
    winner: string;
    reason: "completion" | "elimination" | "timeout";
  };
}

export const BATTLE_TIMER_DURATION = 120;

export const PHASE_CONFIGS = {
  learning: { color: "text-green-400", icon: "🎓", damageRange: [4, 8] },
  pressure: { color: "text-yellow-400", icon: "⚡", damageRange: [6, 12] },
  deadly: { color: "text-red-400", icon: "💀", damageRange: [10, 18] },
} as const;

export const safeToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value.toNumber) {
    return value.toNumber();
  }
  return Number(value) || 0;
};

export const getBattlePhase = (
  questionIndex: number
): keyof typeof PHASE_CONFIGS => {
  if (questionIndex <= 2) return "learning";
  if (questionIndex <= 6) return "pressure";
  return "deadly";
};

export const getTimerColor = (timeLeft: number): string => {
  if (timeLeft <= 10) return "text-red-400";
  if (timeLeft <= 30) return "text-orange-400";
  if (timeLeft <= 60) return "text-yellow-400";
  return "text-[#cd7f32]";
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

/**
 * Local storage keys for battle data persistence
 */
export const STORAGE_KEYS = {
  SELECTED_WARRIOR: "selectedWarrior",
  BATTLE_PREFERENCES: "battlePreferences",
  BATTLE_HISTORY: "battleHistory",
  LAST_ROOM_CODE: "lastRoomCode",
} as const;

/**
 * Safely gets data from session storage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely sets data to session storage
 */
export function setToStorage<T>(key: string, value: T): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const checkDelegationWithMagicRouter = async (
  accountAddress: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://devnet-router.magicblock.app/getDelegationStatus",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getDelegationStatus",
          params: [accountAddress],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // console.log("Magic Router API response:", data);

    if (data.error) {
      console.error("Magic Router API error:", data.error);
      return false;
    }

    return data.result?.isDelegated || false;
  } catch (error) {
    console.error("Error checking delegation status with Magic Router:", error);
    return false;
  }
};

export default {
  // Phase utilities
  getBattlePhase,
  // getExpectedDamageRange,
  BATTLE_PHASES,

  // Timer utilities
  getTimerColor,
  getTimerProgress,
  formatTimeRemaining,
  getCurrentTimeWarning,
  shouldAutoSubmit,
  TIMER_WARNINGS,

  // Battle logic
  determineWinner,
  checkBothAnswersSubmitted,
  validateBattleQuestion,
  validateBattleReadiness,

  // Data utilities
  safeToNumber,
  getHPPercentage,
  getHPBarColor,
  formatBattleStats,
  isWarriorReady,

  // Debugging
  createBattleStateSnapshot,
  handleBattleError,

  // Async utilities
  debounce,
  throttle,
  createRetryConfig,
  createCleanupManager,

  // Storage utilities
  getFromStorage,
  setToStorage,
  STORAGE_KEYS,

  // Crypto utilities
  decodeRoomId,
  generateClientSeed,
  generateDeterministicSeed,
  checkDelegationWithMagicRouter,

  // WebSocket utilities
  validateWebSocketConnection,
};
