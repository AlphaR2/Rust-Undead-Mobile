import { UserPersona } from "./undead";

export interface Guide {
  id: string;
  name: string;
  title: string;
  description: string;
  recommendedFor: string;
}

export interface ContextTypes {
  auth: {
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  };

  loader: {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };

  onboarding: {
    currentOnboardingScreen: string;
    setCurrentOnboardingScreen: React.Dispatch<
      React.SetStateAction<
        | "welcome"
        | "selection"
        | "name"
        | "game-card-intro"
        | "game-card-carousel"
        | "warrior-setup"
        | "persona"
      >
    >;

    // Guide selection
    selectedGuide: Guide | null;
    setSelectedGuide: React.Dispatch<React.SetStateAction<Guide | null>>;

    // Warrior Type selection - NEW
    selectedWarriorType: WarriorType | null;
    setSelectedWarriorType: React.Dispatch<
      React.SetStateAction<WarriorType | null>
    >;

    // Persona selection
    selectedPersona: UserPersona | null;
    setSelectedPersona: React.Dispatch<
      React.SetStateAction<UserPersona | null>
    >;

    // Player name
    playerName: string;
    setPlayerName: React.Dispatch<React.SetStateAction<string>>;

    // Utility functions
    getOnboardingData: () => {
      selectedGuide: Guide | null;
      selectedWarriorType: WarriorType | null;
      selectedPersona: UserPersona | null;
      playerName: string;
    };

    resetOnboarding: () => void;
  };
}

export const Guides = [
  {
    id: "1",
    name: "JANUS THE BUILDER",
    title: "Validator Master",
    description:
      "I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you'll understand how consensus creates unshakeable truth.",
    recommendedFor: "Complete beginners who want solid fundamentals",
  },
  {
    id: "2",
    name: "JAREK THE ORACLE",
    title: "Knowledge Keeper",
    description:
      "I am Jarek, Keeper of Ancient Wisdom. The deepest secrets of this realm flow through my consciousness like rivers of pure knowledge.",
    recommendedFor:
      "Technical backgrounds who want comprehensive understanding",
  },
  {
    id: "3",
    name: "GAIUS THE GUARDIAN",
    title: "Protector of Assets",
    description:
      "I am Gaius, Shield of the Realm. I guard against the dark forces that would steal your digital treasures and corrupt your transactions.",
    recommendedFor: "Security-conscious learners who want to stay safe",
  },
  {
    id: "4",
    name: "BRYN THE DAEMON",
    title: "Code Compiler",
    description:
      "I am Bryn, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.",
    recommendedFor: "Developers and power users who want to build",
  },
];

export const WARRIOR_TYPES: WarriorType[] = [
  {
    id: "1",
    name: "VALIDATOR",
    title: "Validator",
    type: "Balanced",
    description: "The undead Warrior of network consensus",
    specialty: "Well-rounded combat capabilities",
    recommendedFor: "Complete beginners who want solid fundamentals",
    combatStyle: "Balanced ATK/DEF/KNOW",
    statRange: "Consensus Strike - Balanced damage output",
    lore: "Masters of network validation and Byzantine fault tolerance",
    image:
      "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeib7mffhcokc6sjgmtmcolslr7edskvhtvjdaebq6ejmdvpfc4h5w4",
    color: "#cd7f32",
    icon: "⚖️",
  },
  {
    id: "2",
    name: "ORACLE",
    title: "Oracle",
    type: "Advanced",
    description: "Mystical warrior with a Mega brain, lineage of Satoshi",
    specialty: "High knowledge, moderate combat skills",
    recommendedFor:
      "Technical backgrounds who want comprehensive understanding",
    combatStyle: "High KNOW, Moderate ATK/DEF",
    statRange: "Data Feed - Enhanced knowledge-based attacks and defense",
    lore: "These warriors knew about the birth of blockchain and cryptography",
    image:
      "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeidprsrkbd5ict7u2akrhdhikercp6r354zh7tqirhmp37env67ly4",
    color: "#4169E1",
    icon: "🔮",
  },
  {
    id: "3",
    name: "GUARDIAN",
    title: "Guardian",
    type: "Security",
    description: "Stalwart defenders of the blockchain realm",
    specialty: "Exceptional defense, moderate attack",
    recommendedFor: "Security-conscious learners who want to stay safe",
    combatStyle: "High DEF, Moderate ATK/KNOW",
    statRange: "Shield Wall - Superior defensive capabilities",
    lore: "Protectors who secure the network from all threats and hacks",
    image:
      "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafkreihlyscrwzu3tn2rxo4a5hvxv2tujzwvmuk6rgjlovxobdm3swuhc4",
    color: "#228B22",
    icon: "🛡️",
  },
  {
    id: "4",
    name: "DAEMON",
    title: "Daemon",
    type: "Technical",
    description: "Aggressive background processes of destruction",
    specialty: "High attack, low defense - glass cannon",
    recommendedFor: "Developers and power users who want to build",
    combatStyle: "High ATK, Low DEF, Moderate KNOW",
    statRange: "Process Kill - Devastating but risky attacks",
    lore: "Relentless background warriors optimized for raw damage",
    image:
      "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafkreigc7dxsnemb4ojyza7odk2pdvyywzjdhtv5ebjkelfzw3s6hhy5wq",
    color: "#DC143C",
    icon: "⚡",
  },
];

// Updated interface to match new structure
export interface WarriorType {
  id: string;
  name: string;
  title: string;
  type: string;
  description: string;
  specialty: string;
  recommendedFor: string;
  combatStyle: string;
  statRange: string;
  lore: string;
  image: string;
  color: string;
  icon: string;
}

export type GuideImagesType = {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
};

export interface PersonaInfo {
  title: string;
  icon: string;
  description: string;
  traits: string;
  color: string;
  glowColor: string;
}

// Data
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

// Helper function to convert Tailwind colors to React Native colors
export const getGradientColors = (colorString: string): [string, string] => {
  const colorMap: Record<string, string> = {
    "amber-600": "#d97706",
    "yellow-500": "#eab308",
    "blue-600": "#2563eb",
    "cyan-500": "#06b6d4",
    "purple-600": "#9333ea",
    "indigo-500": "#6366f1",
    "gray-600": "#4b5563",
    "slate-500": "#64748b",
    "green-600": "#16a34a",
    "emerald-500": "#10b981",
    "pink-600": "#db2777",
    "rose-500": "#f43f5e",
    "orange-600": "#ea580c",
    "red-500": "#ef4444",
    "teal-600": "#0d9488",
    "red-600": "#dc2626",
    "crimson-500": "#dc143c",
  };

  const parts = colorString.split(" to-");
  const fromColor = parts[0].replace("from-", "");
  const toColor = parts[1];

  return [colorMap[fromColor] || "#6b7280", colorMap[toColor] || "#6b7280"];
};
