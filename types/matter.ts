// types/matter.ts
import { CharacterClass, ItemType } from '@/constants/characters'
import Matter from 'matter-js'

export interface MatterBody extends Matter.Body {
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

export interface CharacterEntity {
  body: MatterBody
  size: [number, number]
  characterClass?: CharacterClass
  renderer: React.ComponentType<CharacterProps>
}

export interface GroundEntity {
  body: MatterBody
  size: [number, number]
  renderer: React.ComponentType<GroundProps>
}

export interface CharacterProps {
  body: MatterBody
  size: [number, number]
  characterClass?: CharacterClass
}

export interface GroundProps {
  body: MatterBody
  size: [number, number]
}
