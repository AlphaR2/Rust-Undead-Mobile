import { Canvas, Circle, Group, Image, Rect, useImage } from '@shopify/react-native-skia'
import React, { useMemo } from 'react'
import { StyleSheet } from 'react-native'

interface BackgroundImages {
  layer1: any
  layer2: any
  layer3: any
  layer4: any
  layer5: any
  layer6: any
  layer7: any
}

interface SkiaBackgroundProps {
  backgroundImages: BackgroundImages
  cameraOffset: { x: number; y: number }
  worldWidth: number
  screenWidth: number
  screenHeight: number
  groundBody: any
  checkpointEntities: Record<string, any>
}

const LAYER_CONFIG = [
  { factor: 0.1 },
  { factor: 0.2 },
  { factor: 0.3 },
  { factor: 0.45 },
  { factor: 0.6 },
  { factor: 0.75 },
  { factor: 0.9 },
] as const

const ORIGINAL_HEIGHT = 324
const LAYER_WIDTH = 576

const SkiaBackground: React.FC<SkiaBackgroundProps> = ({
  backgroundImages,
  cameraOffset,
  worldWidth,
  screenWidth,
  screenHeight,
  groundBody,
  checkpointEntities,
}) => {
  const layer1 = useImage(backgroundImages.layer1)
  const layer2 = useImage(backgroundImages.layer2)
  const layer3 = useImage(backgroundImages.layer3)
  const layer4 = useImage(backgroundImages.layer4)
  const layer5 = useImage(backgroundImages.layer5)
  const layer6 = useImage(backgroundImages.layer6)
  const layer7 = useImage(backgroundImages.layer7)

  const images = useMemo(
    () => [layer1, layer2, layer3, layer4, layer5, layer6, layer7],
    [layer1, layer2, layer3, layer4, layer5, layer6, layer7],
  )

  const scale = useMemo(() => screenHeight / ORIGINAL_HEIGHT, [screenHeight])
  const tileWidth = useMemo(() => LAYER_WIDTH * scale, [scale])

  const checkpoints = useMemo(() => Object.values(checkpointEntities), [checkpointEntities])

  // Memoize layer rendering to prevent recreating on every camera movement
  const renderParallaxLayer = useMemo(() => {
    return (image: any, factor: number, index: number) => {
      if (!image) return null

      const offset = cameraOffset.x * factor
      const total = worldWidth + screenWidth
      const count = Math.ceil(total / tileWidth) + 2

      return Array.from({ length: count }, (_, i) => {
        const x = i * tileWidth - offset
        return <Image key={`layer${index}-tile${i}`} image={image} x={x} y={0} width={tileWidth} height={screenHeight} fit="cover" />
      })
    }
  }, [cameraOffset.x, worldWidth, screenWidth, tileWidth, screenHeight])

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      {LAYER_CONFIG.map((cfg, i) => (
        <Group key={`layer-${i}`}>{renderParallaxLayer(images[i], cfg.factor, i)}</Group>
      ))}

      <Rect
        x={groundBody.position.x - worldWidth / 2 + cameraOffset.x}
        y={groundBody.position.y - 50}
        width={worldWidth + 100}
        height={100}
        color="#111"
      />

      {checkpoints.map((cp: any) => (
        <Group key={`checkpoint-${cp.id}`}>
          <Circle
            cx={cp.body.position.x + cameraOffset.x}
            cy={cp.body.position.y}
            r={20}
            color={cp.completed ? 'rgba(255, 215, 0, 0.3)' : '#FFD700'}
          />
        </Group>
      ))}
    </Canvas>
  )
}

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default React.memo(SkiaBackground, (prev, next) => {
  return (
    prev.cameraOffset.x === next.cameraOffset.x &&
    prev.cameraOffset.y === next.cameraOffset.y &&
    prev.checkpointEntities === next.checkpointEntities &&
    prev.backgroundImages === next.backgroundImages
  )
})