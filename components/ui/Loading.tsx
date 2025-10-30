import { GameFonts } from '@/constants/GameFonts'
import React, { useEffect, useRef } from 'react'
import { Animated, ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'

interface GameLoadingScreenProps {
  backgroundImage?: ImageSourcePropType
  titleBackgroundImage: ImageSourcePropType
  loadingText?: string
  overlayOpacity?: number
}

const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  backgroundImage,
  titleBackgroundImage,
  loadingText = 'Loading...',
  overlayOpacity = 0.6,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current
  const pulseValue = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    )

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    spinAnimation.start()
    pulseAnimation.start()

    return () => {
      spinAnimation.stop()
      pulseAnimation.stop()
    }
  }, [spinValue, pulseValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <ImageBackground style={styles.container} source={backgroundImage}>
      <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />
      
      <ImageBackground source={titleBackgroundImage} style={styles.titleContainer} resizeMode="contain">
        <Text style={[GameFonts.epic, styles.titleText]}>Preparing Adventure</Text>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinner}>
            <View style={styles.spinnerSegment} />
            <View style={[styles.spinnerSegment, styles.spinnerSegment2]} />
            <View style={[styles.spinnerSegment, styles.spinnerSegment3]} />
          </View>
        </Animated.View>

        <Animated.Text style={[GameFonts.body, styles.loadingText, { opacity: pulseValue }]}>
          {loadingText}
        </Animated.Text>

        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: pulseValue }]} />
          <Animated.View style={[styles.dot, { opacity: pulseValue, animationDelay: 200 }]} />
          <Animated.View style={[styles.dot, { opacity: pulseValue, animationDelay: 400 }]} />
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  titleContainer: {
    position: 'absolute',
    top: 22,
    alignItems: 'center',
    padding: 12,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  spinner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  spinnerSegment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderRadius: 40,
    borderColor: 'transparent',
    borderTopColor: '#c87323',
  },
  spinnerSegment2: {
    transform: [{ rotate: '120deg' }],
    borderTopColor: '#d69347',
  },
  spinnerSegment3: {
    transform: [{ rotate: '240deg' }],
    borderTopColor: '#e5b36b',
  },
  loadingText: {
    color: '#E0E0E0',
    fontSize: 18,
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c87323',
  },
})

export default GameLoadingScreen