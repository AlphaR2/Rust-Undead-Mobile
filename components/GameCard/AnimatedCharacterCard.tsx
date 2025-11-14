import { CharacterClass } from '@/context/Context'
import { getSpriteMetadata, getSpriteSheet } from '@/utils/spriteSheetLoader'
import { Atlas, Canvas, Group, Skia, useImage, useRectBuffer } from '@shopify/react-native-skia'
import React, { useEffect, useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Easing, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

interface AnimatedCharacterCardProps {
  characterClass: CharacterClass
  name: string
  description: string
  isSelected: boolean
  isLoading?: boolean
  onSelect: () => void
}

const IDLE_FPS = 20
const SPRITE_DISPLAY_SIZE = 150
const CANVAS_HEIGHT = 180

const AnimatedCharacterCard: React.FC<AnimatedCharacterCardProps> = ({
  characterClass,
  name,
  description,
  isSelected,
  isLoading = false,
  onSelect,
}) => {
  const frameCounter = useSharedValue(0)

  const spriteSheetSource = getSpriteSheet(characterClass, 'idle')
  const metadata = getSpriteMetadata(characterClass, 'idle')
  const { frames, frameWidth, frameHeight } = metadata

  const spriteSheet = useImage(spriteSheetSource)

  const scale = useMemo(() => SPRITE_DISPLAY_SIZE / frameWidth, [frameWidth])

  const sprites = useRectBuffer(1, (rect) => {
    'worklet'
    const frameIndex = Math.floor(frameCounter.value) % frames
    const frameX = frameIndex * frameWidth
    rect.setXYWH(frameX, 0, frameWidth, frameHeight)
  })

  useEffect(() => {
    frameCounter.value = withRepeat(
      withTiming(frames - 1, {
        duration: (frames / IDLE_FPS) * 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }, [frames, frameCounter])

  if (!spriteSheet) {
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected, isLoading && styles.cardLoading]}
        onPress={onSelect}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <View style={styles.fallback}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#c87323" />
            </View>
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected, isLoading && styles.cardLoading]}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.canvasContainer}>
        <Canvas style={{ width: SPRITE_DISPLAY_SIZE, height: CANVAS_HEIGHT }}>
          <Group
            transform={[
              { translateX: SPRITE_DISPLAY_SIZE / 2 },
              { translateY: CANVAS_HEIGHT / 2 },
              { translateX: -(frameWidth * scale) / 2 },
              { translateY: -(frameHeight * scale) / 2 },
            ]}
          >
            <Atlas image={spriteSheet} sprites={sprites} transforms={[Skia.RSXform(scale, 0, 0, 0)]} />
          </Group>
        </Canvas>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#c87323" />
          </View>
        )}
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      {isSelected && <View style={styles.selectedIndicator} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'rgba(200, 116, 35, 0.3)',
  },
  cardSelected: {
    borderColor: 'rgba(200, 116, 35, 0.6)',
    backgroundColor: 'rgba(200, 116, 35, 0.2)',
    shadowColor: '#c87323',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  cardLoading: {
    borderColor: '#c87323',
    backgroundColor: 'rgba(200, 116, 35, 0.3)',
    shadowColor: '#c87323',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
  canvasContainer: {
    width: 150,
    height: 180,
    marginBottom: 12,
    position: 'relative',
  },
  fallback: {
    width: 150,
    height: 180,
    backgroundColor: 'rgba(200, 116, 35, 0.3)',
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: 'white',
  },
})

export default React.memo(AnimatedCharacterCard)