import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Achievement Level
export enum AchievementLevel {
  None = "none",
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Platinum = "platinum",
  Diamond = "diamond",
}

// Warrior Class
export enum WarriorClass {
  Validator = "validator",
  Oracle = "oracle",
  Guardian = "guardian",
  Daemon = "daemon",
}

// Image Rarity
export enum ImageRarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
}

// Warrior class information for UI
export const WARRIOR_CLASS_INFO = {
  [WarriorClass.Validator]: {
    title: "Validator",
    icon: "⚖️",
    description: "The undead Warrior of network consensus",
    traits: "Well-rounded combat capabilities",
    statDistribution: "Balanced ATK/DEF/KNOW",
    specialAbility: "Consensus Strike - Balanced damage output",
    lore: "Masters of network validation and Byzantine fault tolerance",
    image: "/warrior/validator-original.png",
  },
  [WarriorClass.Oracle]: {
    title: "Oracle",
    icon: "🔮",
    description: "Mystical warrior with a Mega brain, lineage of Satoshi",
    traits: "High knowledge, moderate combat skills",
    statDistribution: "High KNOW, Moderate ATK/DEF",
    specialAbility: "Data Feed - Enhanced knowledge-based attacks and defense",
    lore: "These warriors knew about the birth of blockchain and cryptography",
    image: "/warrior/oracle-original.png",
  },
  [WarriorClass.Guardian]: {
    title: "Guardian",
    icon: "🛡️",
    description: "Stalwart defenders of the blockchain realm",
    traits: "Exceptional defense, moderate attack",
    statDistribution: "High DEF, Moderate ATK/KNOW",
    specialAbility: "Shield Wall - Superior defensive capabilities",
    lore: "Protectors who secure the network from all threats and hacks",
    image: "/warrior/guardian-original.png",
  },
  [WarriorClass.Daemon]: {
    title: "Daemon",
    icon: "⚡",
    description: "Aggressive background processes of destruction",
    traits: "High attack, low defense - glass cannon",
    statDistribution: "High ATK, Low DEF, Moderate KNOW",
    specialAbility: "Process Kill - Devastating but risky attacks",
    lore: "Relentless background warriors optimized for raw damage",
    image: "/warrior/daemon-original.png",
  },
};

// Battle State
export enum BattleState {
  Created = "created",
  Joined = "joined",
  QuestionsSelected = "questionsSelected",
  ReadyForDelegation = "readyForDelegation",
  InProgress = "inProgress",
  Completed = "completed",
  Cancelled = "cancelled",
}

// user persona
export enum UserPersona {
  TreasureHunter = "TreasureHunter",
  BoneSmith = "BoneSmith",
  ObsidianProphet = "ObsidianProphet",
  GraveBaron = "GraveBaron",
  Demeter = "Demeter",
  Collector = "Collector",
  CovenCaller = "CovenCaller",
  SeerOfAsh = "SeerOfAsh",
  Cerberus = "Cerberus",
}

export interface AnchorUndeadWarrior {
  name: string;
  owner: PublicKey;
  dna: number[];
  createdAt: BN;
  baseAttack: number;
  baseDefense: number;
  baseKnowledge: number;
  currentHp: number;
  maxHp: number;
  warriorClass: WarriorClass | any;
  battlesWon: number;
  battlesLost: number;
  experiencePoints: BN;
  level: number;
  lastBattleAt: BN;
  cooldownExpiresAt: BN;
  bump: number;
  imageRarity: ImageRarity | any;
  imageIndex: number;
  imageUri: string;
  address: PublicKey;
}

export interface AnchorUserProfile {
  owner: PublicKey;
  username: any;
  userPersona: UserPersona | any;
  warriorsCreated: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalBattlesFought: number;
  joinDate: BN;
  totalPoints: BN | number;
  bump: number;
}

export interface PersonaInfo {
  title: string;
  icon: string;
  description: string;
  traits: string;
  color: string;
  glowColor: string;
}

export const PERSONA_INFO: Record<UserPersona, PersonaInfo> = {
  [UserPersona.TreasureHunter]: {
    title: "Treasure Hunter",
    icon: "🏴‍☠️",
    description: "Spectator who watches and learns from the sidelines",
    traits: "Observant • Patient • Strategic",
    color: "from-amber-600 to-yellow-500",
    glowColor: "shadow-amber-500/30",
  },
  [UserPersona.BoneSmith]: {
    title: "Bone Smith",
    icon: "⚒️",
    description: "Builder and developer forging the future",
    traits: "Creative • Technical • Innovative",
    color: "from-blue-600 to-cyan-500",
    glowColor: "shadow-blue-500/30",
  },
  [UserPersona.ObsidianProphet]: {
    title: "Obsidian Prophet",
    icon: "🔮",
    description: "Ideologue spreading the blockchain vision",
    traits: "Visionary • Persuasive • Passionate",
    color: "from-purple-600 to-indigo-500",
    glowColor: "shadow-purple-500/30",
  },
  [UserPersona.GraveBaron]: {
    title: "Grave Baron",
    icon: "🏛️",
    description: "Institutional player with serious capital",
    traits: "Professional • Analytical • Influential",
    color: "from-gray-600 to-slate-500",
    glowColor: "shadow-gray-500/30",
  },
  [UserPersona.Demeter]: {
    title: "Demeter",
    icon: "🌾",
    description: "DeFi farmer cultivating yield across protocols",
    traits: "Strategic • Opportunistic • Calculating",
    color: "from-green-600 to-emerald-500",
    glowColor: "shadow-green-500/30",
  },
  [UserPersona.Collector]: {
    title: "Collector",
    icon: "💎",
    description: "NFT collector seeking rare digital artifacts",
    traits: "Discerning • Aesthetic • Passionate",
    color: "from-pink-600 to-rose-500",
    glowColor: "shadow-pink-500/30",
  },
  [UserPersona.CovenCaller]: {
    title: "Coven Caller",
    icon: "📢",
    description: "Key Opinion Leader influencing the masses",
    traits: "Charismatic • Connected • Influential",
    color: "from-orange-600 to-red-500",
    glowColor: "shadow-orange-500/30",
  },
  [UserPersona.SeerOfAsh]: {
    title: "Seer of Ash",
    icon: "📊",
    description: "Researcher and analyst diving deep into data",
    traits: "Analytical • Methodical • Insightful",
    color: "from-teal-600 to-cyan-500",
    glowColor: "shadow-teal-500/30",
  },
  [UserPersona.Cerberus]: {
    title: "Cerberus",
    icon: "🛡️",
    description: "Security guardian protecting the realm",
    traits: "Vigilant • Protective • Thorough",
    color: "from-red-600 to-crimson-500",
    glowColor: "shadow-red-500/30",
  },
};

export interface AnchorGameConfig {
  admin: PublicKey;
  totalWarriors: BN;
  cooldownTime: BN;
  totalBattles: number;
  isPaused: boolean;
  createdAt: BN;
  bump: number;
}

export interface AnchorUserAchievements {
  owner: PublicKey;
  overallAchievements: AchievementLevel;
  warriorAchivement: AchievementLevel;
  winnerAchievement: AchievementLevel;
  battleAchievement: AchievementLevel;
  firstWarriorDate: BN;
  bump: number;
}

export interface AnchorBattleRoom {
  roomId: number[];
  createdAt: BN;
  playerA: PublicKey;
  playerB: PublicKey | null;
  warriorA: PublicKey;
  warriorB: PublicKey | null;
  selectedConcepts: number[]; // [u8; 5]
  selectedTopics: number[]; // [u8; 10]
  selectedQuestions: number[]; // [u16; 10]
  correctAnswers: boolean[]; // [bool; 10]
  state: BattleState;
  playerAReady: boolean;
  playerBReady: boolean;
  currentQuestion: number;
  playerAAnswers: (boolean | null)[]; // [Option<bool>; 10]
  playerBAnswers: (boolean | null)[]; // [Option<bool>; 10]
  playerACorrect: number;
  playerBCorrect: number;
  winner: PublicKey | null;
  battleDuration: number;
  bump: number;
  battleStartTime: BN;
}

export interface AnchorLeaderboard {
  topPlayers: PublicKey[]; // [pubkey; 20]
  topScores: number[]; // [u32; 20]
  lastUpdated: BN;
  bump: number;
}

// Utility interface for program accounts
export interface ProgramAccount<T> {
  publicKey: PublicKey;
  account: T;
}

// Processed/formatted types for frontend use
export interface Warrior {
  name: string;
  owner: PublicKey;
  dna: number[];
  createdAt: BN | number;
  baseAttack: number;
  baseDefense: number;
  baseKnowledge: number;
  currentHp: number;
  maxHp: number;
  warriorClass: WarriorClass | any;
  battlesWon: number;
  battlesLost: number;
  experiencePoints: BN | any;
  level: number;
  lastBattleAt: BN;
  cooldownExpiresAt: BN;
  imageRarity: ImageRarity | any;
  imageIndex: number;
  imageUri: string;
  isOnCooldown?: boolean;
  address: PublicKey;
}

export interface UserProfile {
  owner: PublicKey;
  username: any;
  userPersona: UserPersona;
  warriorsCreated: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalBattlesFought: number;
  joinDate: BN;
  totalPoints: BN;
}

export interface GameConfig {
  admin: PublicKey;
  totalWarriors: BN;
  cooldownTime: BN;
  totalBattles: number;
  isPaused: boolean;
  createdAt: BN;
}

export interface UserAchievements {
  owner: PublicKey;
  overallAchievements: AchievementLevel;
  warriorAchivement: AchievementLevel;
  winnerAchievement: AchievementLevel;
  battleAchievement: AchievementLevel;
  firstWarriorDate: BN;
}

export interface BattleRoom {
  address: PublicKey;
  roomId: number[];
  createdAt: BN;
  playerA: PublicKey;
  playerB: PublicKey | null;
  warriorA: PublicKey;
  warriorB: PublicKey | null;
  selectedConcepts: number[];
  selectedTopics: number[];
  selectedQuestions: number[];
  correctAnswers: boolean[];
  state: BattleState;
  playerAReady: boolean;
  playerBReady: boolean;
  currentQuestion: number;
  playerAAnswers: (boolean | null)[];
  playerBAnswers: (boolean | null)[];
  playerACorrect: number;
  playerBCorrect: number;
  winner: PublicKey | null;
  battleDuration: number;
  battleStartTime: BN;
  // Computed properties
  isWaitingForPlayers: boolean;
  canStart: boolean;
  currentQuestionIndex: number;
}

export interface Leaderboard {
  topPlayers: PublicKey[];
  topScores: number[];
  lastUpdated: BN;
}

export interface BattleMainState {
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
  winner: string | null;
  myAnswerSubmitted: boolean;
  opponentAnswerSubmitted: boolean;
  bothAnswersSubmitted: boolean;
  canSubmitAnswer: boolean;
  waitingForNextQuestion: boolean;
}

export interface WarriorInfo {
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

export type SettlementStep =
  | "initial"
  | "settling"
  | "undelegating_room"
  | "undelegating_player"
  | "finalizing"
  | "complete"
  | "error";

export type StepStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "skipped";

export interface SettlementState {
  currentStep: SettlementStep;
  stepStatuses: Record<string, StepStatus>;
  progress: number;
  error: string | null;
  retryCount: number;
  canRetry: boolean;
  isProcessing: boolean;
}

export interface BattleQuestion {
  text: string;
  answer: boolean;
}

export interface BattleQuizProps {
  battleRoomPda: string;
  roomIdBytes: Uint8Array;
  onExit?: () => void;
}

export interface FinalBattleScores {
  myScore: number;
  opponentScore: number;
  myHP: number;
  opponentHP: number;
}

// Constants
export const BATTLE_TIMER_DURATION = 120;

export const PHASE_CONFIGS = {
  learning: { color: "text-green-400", icon: "🎓", damageRange: [4, 8] },
  pressure: { color: "text-yellow-400", icon: "⚡", damageRange: [6, 12] },
  deadly: { color: "text-red-400", icon: "💀", damageRange: [10, 18] },
} as const;

// Type guards for better type safety
export const isWarriorClass = (value: string): value is WarriorClass => {
  return Object.values(WarriorClass).includes(value as WarriorClass);
};

export const isBattleState = (value: string): value is BattleState => {
  return Object.values(BattleState).includes(value as BattleState);
};

export const isAchievementLevel = (
  value: string
): value is AchievementLevel => {
  return Object.values(AchievementLevel).includes(value as AchievementLevel);
};

export const convertToBattleRoom = (
  address: PublicKey,
  anchor: AnchorBattleRoom
): BattleRoom => {
  const isWaitingForPlayers = anchor.playerB === null;
  const canStart =
    anchor.playerAReady &&
    anchor.playerBReady &&
    anchor.state === BattleState.QuestionsSelected;

  return {
    address,
    roomId: anchor.roomId,
    createdAt: anchor.createdAt,
    playerA: anchor.playerA,
    playerB: anchor.playerB,
    warriorA: anchor.warriorA,
    warriorB: anchor.warriorB,
    selectedConcepts: anchor.selectedConcepts,
    selectedTopics: anchor.selectedTopics,
    selectedQuestions: anchor.selectedQuestions,
    correctAnswers: anchor.correctAnswers,
    state: anchor.state,
    playerAReady: anchor.playerAReady,
    playerBReady: anchor.playerBReady,
    currentQuestion: anchor.currentQuestion,
    playerAAnswers: anchor.playerAAnswers,
    playerBAnswers: anchor.playerBAnswers,
    playerACorrect: anchor.playerACorrect,
    playerBCorrect: anchor.playerBCorrect,
    winner: anchor.winner,
    battleDuration: anchor.battleDuration,
    battleStartTime: anchor.battleStartTime,
    isWaitingForPlayers,
    canStart,
    currentQuestionIndex: anchor.currentQuestion,
  };
};

export const convertUserPersona = (anchorPersona: any): UserPersona => {
  // Anchor returns enums as objects like { treasureHunter: {} }
  if (typeof anchorPersona === "object" && anchorPersona !== null) {
    const key = Object.keys(anchorPersona)[0];

    // Map Anchor enum keys to TypeScript enum values
    const personaMap: Record<string, UserPersona> = {
      treasureHunter: UserPersona.TreasureHunter,
      boneSmith: UserPersona.BoneSmith,
      obsidianProphet: UserPersona.ObsidianProphet,
      graveBaron: UserPersona.GraveBaron,
      demeter: UserPersona.Demeter,
      collector: UserPersona.Collector,
      covenCaller: UserPersona.CovenCaller,
      seerOfAsh: UserPersona.SeerOfAsh,
      cerberus: UserPersona.Cerberus,
    };

    return personaMap[key] || UserPersona.TreasureHunter;
  }

  return UserPersona.TreasureHunter;
};

export const convertBattleState = (anchorState: any): BattleState => {
  if (typeof anchorState === "object" && anchorState !== null) {
    const key = Object.keys(anchorState)[0];

    const stateMap: Record<string, BattleState> = {
      created: BattleState.Created,
      joined: BattleState.Joined,
      questionsSelected: BattleState.QuestionsSelected,
      readyForDelegation: BattleState.ReadyForDelegation,
      inProgress: BattleState.InProgress,
      completed: BattleState.Completed,
      cancelled: BattleState.Cancelled,
    };

    return stateMap[key] || BattleState.Created;
  }

  // If it's already a TypeScript enum value, return as-is
  if (Object.values(BattleState).includes(anchorState)) {
    return anchorState;
  }

  return BattleState.Created; // Default fallback
};

interface MongoEntity {
  _id: string;
}

// Question interface
export interface Question extends MongoEntity {
  question_id: number;
  text: string;
  correct: boolean;
  explanation: string;
}

// Learning content interface
interface LearningContent extends MongoEntity {
  summary: string;
  big_note: string[];
  battle_relevance: string;
}

// Topic interface
interface Topic extends MongoEntity {
  topic_id: number;
  title: string;
  learning_content: LearningContent;
  questions: Question[];
}

// Main concept interface
export interface Concept extends MongoEntity {
  concept_id: number;
  title: string;
  description: string;
  topics: Topic[];
  __v: number; // MongoDB version key
}
