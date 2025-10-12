import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

interface ScrollingBackgroundProps {
  source: any
  cameraOffset: { x: number; y: number }
  worldWidth: number
  screenWidth: number
  screenHeight: number
  parallaxFactor?: number // Optional: for parallax effect (0-1, where 1 = moves with camera fully)
}

const ScrollingBackground: React.FC<ScrollingBackgroundProps> = ({
  source,
  cameraOffset,
  worldWidth,
  screenWidth,
  screenHeight,
  parallaxFactor = 0.5, // Default: moves at 50% speed for depth effect
}) => {
  // Apply parallax effect to camera offset
  const backgroundOffsetX = cameraOffset.x * parallaxFactor

  return (
    <View style={styles.container}>
      {/* Render multiple copies of background to cover entire world width */}
      <Image
        source={source}
        style={[
          styles.background,
          {
            width: worldWidth,
            height: screenHeight,
            left: backgroundOffsetX,
          },
        ]}
        resizeMode="cover"
      />
      
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