import { ImageRarity, UserPersona, WarriorClass } from '@/types/undead'

type NetworkInfo = {
  name: string
  color: string
  bgColor: string
  borderColor: string
}

// ============ TRANSACTION DEDUPLICATION ============

const activeOperations = new Map<string, Promise<any>>()

export const withDeduplication = async <T>(operationKey: string, operation: () => Promise<T>): Promise<T> => {
  if (activeOperations.has(operationKey)) {
    return activeOperations.get(operationKey)!
  }

  const promise = operation()
    .finally(() => {
      activeOperations.delete(operationKey)
    })
    .catch((error) => {
      activeOperations.delete(operationKey)
      throw error
    })

  activeOperations.set(operationKey, promise)
  return promise
}

// ============ NETWORK UTILITIES ============

export const getNetworkInfo = (rpcUrl: string): NetworkInfo => {
  const url = rpcUrl.toLowerCase()

  if (url.includes('mainnet') || url.includes('api.mainnet-beta.solana.com')) {
    return {
      name: 'Mainnet',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/30',
    }
  }

  if (url.includes('devnet') || url.includes('api.devnet.solana.com')) {
    return {
      name: 'Devnet',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/30',
    }
  }

  if (url.includes('testnet') || url.includes('api.testnet.solana.com')) {
    return {
      name: 'Testnet',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/30',
    }
  }

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return {
      name: 'Localhost',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/30',
    }
  }

  return {
    name: 'Custom',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500/30',
  }
}

export const getRpcEndpoint = (): string => {
  const envRpc = process.env.EXPO_PUBLIC_SOLANA_RPC_URL

  if (envRpc?.trim()) {
    try {
      new URL(envRpc)
      return envRpc
    } catch (error) {
      console.warn('Invalid RPC URL in environment variable, falling back to default:', error)
    }
  }

  return 'https://api.devnet.solana.com'
}

// ============ CACHE UTILITIES ============

export const createSimpleCache = <T>() => {
  const cache = new Map<string, { data: T; timestamp: number; ttl: number }>()

  return {
    get: (key: string): T | null => {
      const entry = cache.get(key)
      if (!entry) return null

      if (Date.now() > entry.timestamp + entry.ttl) {
        cache.delete(key)
        return null
      }

      return entry.data
    },

    set: (key: string, data: T, ttlMs: number = 30000) => {
      cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
    },

    clear: () => cache.clear(),

    invalidatePattern: (pattern: string) => {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    },
  }
}

export const createWarriorCache = () => {
  const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  return {
    get: (key: string): any | null => {
      const entry = cache.get(key)
      if (!entry || Date.now() > entry.timestamp + entry.ttl) {
        cache.delete(key)
        return null
      }
      return entry.data
    },

    set: (key: string, data: any, ttlMs: number = 30000) => {
      cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
    },

    clear: () => cache.clear(),

    invalidate: (pattern: string) => {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key)
        }
      }
    },
  }
}

// ============ TYPE CONVERSION UTILITIES ============

export const safeToNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (value?.toNumber) return value.toNumber()
  return Number(value) || 0
}

export const getWarriorClassVariant = (warriorClass: WarriorClass) => {
  switch (warriorClass) {
    case WarriorClass.Validator:
      return { validator: {} }
    case WarriorClass.Oracle:
      return { oracle: {} }
    case WarriorClass.Guardian:
      return { guardian: {} }
    case WarriorClass.Daemon:
      return { daemon: {} }
    default:
      return { validator: {} }
  }
}

export const getUserPersonaVariant = (persona: UserPersona) => {
  switch (persona) {
    case UserPersona.BoneSmith:
      return { boneSmith: {} }
    case UserPersona.Cerberus:
      return { cerberus: {} }
    case UserPersona.TreasureHunter:
      return { treasureHunter: {} }
    case UserPersona.ObsidianProphet:
      return { obsidianProphet: {} }
    case UserPersona.GraveBaron:
      return { graveBaron: {} }
    case UserPersona.Demeter:
      return { demeter: {} }
    case UserPersona.Collector:
      return { collector: {} }
    case UserPersona.CovenCaller:
      return { covenCaller: {} }
    case UserPersona.SeerOfAsh:
      return { seerOfAsh: {} }
    default:
      return { boneSmith: {} }
  }
}

export const getImageRarityName = (imageRarity: ImageRarity | any): any => {
  if (typeof imageRarity === 'object') {
    const key = Object.keys(imageRarity)[0]
    return key.charAt(0).toUpperCase() + key.slice(1)
  }
  return imageRarity || 'Common'
}

// ============ GAME DATA GENERATORS ============

export const generateRandomDNA = (): string => {
  const chars = '0123456789ABCDEF'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateRoomId = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32))
}

export const roomIdToHex = (roomId: Uint8Array): string => {
  return Array.from(roomId)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const hexToRoomId = (hex: string): Uint8Array => {
  if (hex.length !== 64) {
    throw new Error('Hex string must be exactly 64 characters (32 bytes)')
  }

  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }

  return new Uint8Array(bytes)
}

// ============ ASYNC UTILITIES ============

export function calculateWaitTime(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('Retry-After')
  return retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 2000
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


export const GUIDES = [
  {
    id: '1',
    name: 'JANUS THE BUILDER',
    title: 'Validator Master',
    type: 'Balanced',
    description:
      'I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you will understand how consensus creates unshakeable truth.',
    specialty: 'Validators, consensus, foundation concepts',
    recommendedFor: 'Complete beginners who want solid fundamentals',
    learningStyle: 'Step-by-step, methodical building of knowledge',
    color: '#cd7f32',
  },
  {
    id: '2',
    name: 'JAREK THE ORACLE',
    title: 'Knowledge Keeper',
    type: 'Advanced',
    description:
      'I am Jarek, Keeper of Ancient Wisdom. The deepest secrets of this realm flow through my consciousness like rivers of pure knowledge.',
    specialty: 'Advanced concepts, technical deep-dives, ecosystem insights',
    recommendedFor: 'Technical backgrounds who want comprehensive understanding',
    learningStyle: 'Mystical wisdom, interconnected learning, big picture thinking',
    color: '#4169E1',
  },
  {
    id: '3',
    name: 'GAIUS THE GUARDIAN',
    title: 'Protector of Assets',
    type: 'Security',
    description:
      'I am Gaius, Shield of the Realm. I guard against the dark forces that would steal your digital treasures and corrupt your transactions.',
    specialty: 'Security, wallets, protection strategies, best practices',
    recommendedFor: 'Security-conscious learners who want to stay safe',
    learningStyle: 'Protective approach, risk awareness, practical safety',
    color: '#228B22',
  },
  {
    id: '4',
    name: 'BRYN THE DAEMON',
    title: 'Code Compiler',
    type: 'Technical',
    description:
      'I am Bryn, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.',
    specialty: 'Technical implementation, smart contracts, development',
    recommendedFor: 'Developers and power users who want to build',
    learningStyle: 'Aggressive optimization, technical precision, implementation focus',
    color: '#DC143C',
  },
]