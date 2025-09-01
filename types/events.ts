import { PublicKey } from "@solana/web3.js";
// Enum
export enum CancellationStage {
  NoOpponent = "NoOpponent",
  OpponentJoined = "OpponentJoined",
  PreDelegation = "PreDelegation",
}

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

export interface BattleRoomCancelled {
  roomId: number[];
  creator: PublicKey;
  cancellationStage: CancellationStage;
  affectedPlayers: number;
  roomAge: number;
  warriorA: PublicKey;
  warriorB: PublicKey | null;
  timestamp: number;
}

export interface WarriorReleased {
  warrior: PublicKey;
  warriorName: string;
  owner: PublicKey;
  roomId: number[];
}

export interface DelegationEvent {
  delegated: boolean;
  warriorA: PublicKey;
  warriorB: PublicKey;
}

export interface JoinEvent {
  joined: boolean;
  playerB: PublicKey;
  warriorName: string;
  warrior: PublicKey;
}

export interface ReadyEvent {
  player: PublicKey;
  warriorName: string;
}

export interface BattleStart {
  warriorA: string;
  warriorB: string;
  aHp: number;
  bHp: number;
}

export interface WarriorStatusEvent {
  warriorName: string;
  currentHp: number;
  maxHp: number;
  remainingCooldownTime: number;
  warriorReady: boolean;
}

export interface WinnerEvent {
  winner: PublicKey | null;
  score: number | null;
  hp: number | null;
  tie: boolean;
}

export interface AnswerSubmitEvent {
  player: PublicKey;
  currentQuestionIndex: number;
}

export interface AnswerRevealEvent {
  player: PublicKey;
  isCorrect: boolean;
}

export interface ScoresEvent {
  playerA: number;
  playerB: number;
}

export interface DamageEvent {
  warriorName: string;
  damage: number;
  hp: number;
}

export interface EliminationEvent {
  warriorName: string;
  hp: number;
  eliminated: boolean;
}

export interface NextEvent {
  index: number;
  isCompleted: boolean;
}

export interface WarriorCreatedEvent {
  name: string;
  class: WarriorClass;
  attack: number;
  defense: number;
  knowledge: number;
  imageUrl: string;
  imageRarity: ImageRarity;
  currentHp: number;
  maxHp: number;
}

// Union type for all possible events
export type GameEvent =
  | { name: "BattleRoomCancelled"; data: BattleRoomCancelled }
  | { name: "WarriorReleased"; data: WarriorReleased }
  | { name: "DelegationEvent"; data: DelegationEvent }
  | { name: "JoinEvent"; data: JoinEvent }
  | { name: "ReadyEvent"; data: ReadyEvent }
  | { name: "BattleStart"; data: BattleStart }
  | { name: "WarriorStatusEvent"; data: WarriorStatusEvent }
  | { name: "WinnerEvent"; data: WinnerEvent }
  | { name: "AnswerSubmitEvent"; data: AnswerSubmitEvent }
  | { name: "AnswerRevealEvent"; data: AnswerRevealEvent }
  | { name: "ScoresEvent"; data: ScoresEvent }
  | { name: "DamageEvent"; data: DamageEvent }
  | { name: "EliminationEvent"; data: EliminationEvent }
  | { name: "Next"; data: NextEvent }
  | { name: "WarriorCreatedEvent"; data: WarriorCreatedEvent };

// Event handler function types
export type EventHandler<T> = (event: T, signature: string) => void;

// Collection of all event handlers
export interface GameEventHandlers {
  battleRoomCancelled?: EventHandler<BattleRoomCancelled>;
  warriorReleased?: EventHandler<WarriorReleased>;
  delegationEvent?: EventHandler<DelegationEvent>;
  JoinEvent?: EventHandler<JoinEvent>;
  readyEvent?: EventHandler<ReadyEvent>;
  battleStart?: EventHandler<BattleStart>;
  warriorStatusEvent?: EventHandler<WarriorStatusEvent>;
  winnerEvent?: EventHandler<WinnerEvent>;
  answerSubmitEvent?: EventHandler<AnswerSubmitEvent>;
  answerRevealEvent?: EventHandler<AnswerRevealEvent>;
  scoresEvent?: EventHandler<ScoresEvent>;
  damageEvent?: EventHandler<DamageEvent>;
  eliminationEvent?: EventHandler<EliminationEvent>;
  nextEvent?: EventHandler<NextEvent>;
  warriorCreatedEvent?: EventHandler<WarriorCreatedEvent>;
}

// Event history item for UI display
export interface EventHistoryItem {
  name: string;
  data: any;
  signature: string;
  timestamp: number;
  blockTime?: number;
}

// Event listener status
export interface EventListenerStatus {
  isConnected: boolean;
  error: string | null;
  subscriptionId: number | null;
  reconnectAttempts: number;
  lastEventTime: number | null;
}

// Configuration for event listener
export interface EventListenerConfig {
  heliusApiKey: string;
  network: "mainnet" | "devnet" | "testnet";
  programId: string;
  autoConnect: boolean;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  commitment: "processed" | "confirmed" | "finalized";
}

// Export enums as default for easy access
export default {
  CancellationStage,
  WarriorClass,
  ImageRarity,
};
