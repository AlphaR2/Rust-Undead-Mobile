export type CharacterClass = 'oracle' | 'validator' | 'guardian' | 'daemon'
export type AnimationType = 'idle' | 'walking' | 'interact'

export interface CharacterConfig {
  name: string
  class: CharacterClass
  description: string
  frames: {
    idle: number
    walking: number
    interact: number
  }
}

export const CHARACTERS: Record<string, CharacterConfig> = {
  oracle: {
    name: 'Jarek',
    class: 'oracle',
    description: 'Knowledge Specialist - Master of ancient wisdom',
    frames: {
      idle: 18,
      walking: 24,
      interact: 12,
    },
  },
  validator: {
    name: 'Janus',
    class: 'validator',
    description: 'Balanced Fighter - Professional and reliable',
    frames: {
      idle: 18,
      walking: 24,
      interact: 12,
    },
  },
  guardian: {
    name: 'Gaius',
    class: 'guardian',
    description: 'Tank - Fortress of protection',
    frames: {
      idle: 18,
      walking: 24,
      interact: 12,
    },
  },
  daemon: {
    name: 'Bryn',
    class: 'daemon',
    description: 'Glass Cannon - High-tech aggression',
    frames: {
      idle: 18,
      walking: 24,
      interact: 12,
    },
  },
}

// Game constants
export const GAME_CONFIG = {
  WARRIOR_WIDTH: 128,
  WARRIOR_HEIGHT: 128,
  GROUND_Y_RATIO: 0.7, // 70% down the screen
  MOVEMENT_SPEED: 5, // Max speed
  ANIMATION_FPS: {
    idle: 6, // 6 frames per second (slow, subtle)
    walking: 12, // 12 frames per second (smooth walking)
    interact: 10, // 10 frames per second
  },
}

export const SPRITE_CONFIG = {
  fps: {
    idle: 6,
    walking: 12,
    interact: 10,
  },
  size: {
    width: 128,
    height: 128,
  },
}

// World configuration
export const WORLD_CONFIG = {
  // World is 4x the screen width (adjust multiplier if needed: 2x, 3x, 5x)
  widthMultiplier: 4,
  
  // Helper function to calculate world width based on screen
  getWorldWidth: (screenWidth: number) => screenWidth * 4,
  
  // World boundaries
  getBounds: (screenWidth: number) => ({
    min: 0,
    max: screenWidth * 4,
  }),
  
  // Starting position (as ratio of screen width)
  startPosition: {
    x: 0.15, // Start at 15% of screen width
    yOffset: 150, // Offset from bottom
  },
}