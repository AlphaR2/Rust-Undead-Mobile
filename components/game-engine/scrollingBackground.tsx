import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
interface ScrollingBackgroundProps {
  source: any
  cameraOffset: { x: number; y: number }
  worldWidth: number
  screenWidth: number
  screenHeight: number
  parallaxFactor?: number
  layerWidth?: number
}

const ScrollingBackground: React.FC<ScrollingBackgroundProps> = ({
  source,
  cameraOffset,
  worldWidth,
  screenWidth,
  screenHeight,
  parallaxFactor = 0.5,
  layerWidth = 576,
}) => {
  // Apply parallax effect to camera offset
  const backgroundOffsetX = cameraOffset.x * parallaxFactor

  // Calculate scale based on screen height (576x324 is the original size)
  const originalHeight = 324 // Original image height
  const scale = screenHeight / originalHeight

  // Scaled width maintains aspect ratio
  const scaledWidth = layerWidth * scale

  // Calculate number of tiles needed
  const numTiles = Math.ceil((worldWidth + screenWidth) / scaledWidth) + 2

  return (
    <View style={styles.container}>
      {Array.from({ length: numTiles }, (_, index) => {
        // Calculate position with parallax offset
        const tileOffset = index * scaledWidth + backgroundOffsetX

        return (
          <Image
            key={index}
            source={source}
            style={[
              styles.background,
              {
                width: scaledWidth,
                height: screenHeight,
                left: tileOffset,
              },
            ]}
            resizeMode="cover"
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
  },
})

export default ScrollingBackground
