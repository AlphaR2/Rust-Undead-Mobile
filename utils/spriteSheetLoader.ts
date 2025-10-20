import { AnimationType, CharacterClass } from '@/constants/characters'

/**
 * Pre-load all sprite sheets statically
 */
const SPRITE_SHEETS = {
  oracle: {
    idle: require('@/assets/spritesheets/oracle-idle.png'),
    walking: require('@/assets/spritesheets/oracle-walking.png'),
    interact: require('@/assets/spritesheets/oracle-interact.png'),
  },
  validator: {
    idle: require('@/assets/spritesheets/validator-idle.png'),
    walking: require('@/assets/spritesheets/validator-walking.png'),
    interact: require('@/assets/spritesheets/validator-interact.png'),
  },
  guardian: {
    idle: require('@/assets/spritesheets/guardian-idle.png'),
    walking: require('@/assets/spritesheets/guardian-walking.png'),
    interact: require('@/assets/spritesheets/guardian-interact.png'),
  },
  daemon: {
    idle: require('@/assets/spritesheets/daemon-idle.png'),
    walking: require('@/assets/spritesheets/daemon-walking.png'),
    interact: require('@/assets/spritesheets/daemon-interact.png'),
  },
}

/**
 * Get Spritesheet of the character animation
 */
const ITEM_SHEET = {
  idle: require('@/assets/spritesheets/daemon-idle.png'),
}

/**
 * Load sprite metadata
 */
export const SPRITE_METADATA = require('@/assets/spritesheets/sprite-metadata.json')

/**
 * Get sprite sheet for character and animation
 */
export const getSpriteSheet = (character: CharacterClass, animation: AnimationType) => {
  return SPRITE_SHEETS[character][animation]
}

/**
 * Get metadata for character and animation
 */
export const getSpriteMetadata = (character: CharacterClass, animation: AnimationType) => {
  return SPRITE_METADATA[character][animation]
}
