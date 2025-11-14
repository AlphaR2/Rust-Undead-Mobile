import { CharacterProps } from '@/types/matter'
import { getSpriteMetadata, getSpriteSheet } from '@/utils/spriteSheetLoader'
import { Atlas, Canvas, Group, Skia, useImage, useRectBuffer } from '@shopify/react-native-skia'
import React, { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

// Extend props to include cameraOffset
interface CharacterPropsWithCamera extends CharacterProps {
  cameraOffsetRef: React.RefObject<{ x: number; y: number }>
}

const Character: React.FC<CharacterPropsWithCamera> = ({ body, size, characterClass = 'oracle', cameraOffsetRef }) => {
  const frameCounter = useSharedValue(0)
  const animationRef = useRef<NodeJS.Timeout | any>(null)
  const cameraOffset = cameraOffsetRef.current

  // Determine animation based on velocity
  const isMoving = Math.abs(body.velocity.x) > 0.5
  const currentAnimation = isMoving ? 'walking' : 'idle'

  // Get sprite sheet and metadata
  const spriteSheetSource = getSpriteSheet(characterClass, currentAnimation)
  const metadata = getSpriteMetadata(characterClass, currentAnimation)
  const { frames, frameWidth, frameHeight } = metadata

  // Load the sprite sheet
  const spriteSheet = useImage(spriteSheetSource)

  // Determine FPS based on animation
  const fps = currentAnimation === 'walking' ? 12 : 6

  // Animation loop
  useEffect(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
    }

    animationRef.current = setInterval(() => {
      frameCounter.value = (frameCounter.value + 1) % frames
    }, 1000 / fps)

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [frames, fps, currentAnimation])

  // Reset frame when animation changes
  useEffect(() => {
    frameCounter.value = 0
  }, [currentAnimation])

  // Create sprite rectangle buffer
  const sprites = useRectBuffer(1, (rect) => {
    'worklet'
    const frameIndex = Math.floor(frameCounter.value) % frames
    const frameX = frameIndex * frameWidth
    rect.setXYWH(frameX, 0, frameWidth, frameHeight)
  })

  // Determine direction and scale
  const facingLeft = body.velocity.x < 0
  const scale = size[0] / frameWidth

  // Fallback if sprite sheet not loaded
  if (!spriteSheet) {
    return (
      <View
        style={[
          styles.fallback,
          {
            left: body.position.x - size[0] / 2 + cameraOffset.x,
            top: body.position.y - size[1] / 2 + cameraOffset.y,
            width: size[0],
            height: size[1],
          },
        ]}
      />
    )
  }

  return (
    <Canvas
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Group
        transform={[
          { translateX: body.position.x + cameraOffset.x },
          { translateY: body.position.y + cameraOffset.y },
          { scaleX: facingLeft ? -1 : 1 },
          { translateX: -size[0] / 2 },
          { translateY: -size[1] / 2 },
        ]}
      >
        <Atlas image={spriteSheet} sprites={sprites} transforms={[Skia.RSXform(scale, 0, 0, 0)]} />
      </Group>
    </Canvas>
  )
}

const styles = StyleSheet.create({
  fallback: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 116, 35, 0.8)',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(200, 116, 35, 0.6)',
  },
})

export default Character