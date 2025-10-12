import PROFILE_BACKGROUND from '@/assets/images/bg-assets/bg-04.png'
import { Camera } from '@/components/game-engine/camera'
import Character from '@/components/game-engine/character'
import Ground from '@/components/game-engine/ground'
import { Physics } from '@/components/game-engine/Physics'
import { CharacterClass, GAME_CONFIG, SPRITE_CONFIG, WORLD_CONFIG } from '@/constants/characters'
import Matter from 'matter-js'
import React, { useRef, useState } from 'react'
import { Dimensions, ImageBackground, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GameEngine } from 'react-native-game-engine' 

const { width, height } = Dimensions.get('window')    

const Index = () => {
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [running, setRunning] = useState<boolean>(true)
  const [score, setScore] = useState<number>(0)
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterClass>('oracle')
  const moveIntervalRef = useRef<NodeJS.Timeout | any>(null)

  // Add state for camera position to trigger re-renders
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })

  // Get screen dimensions dynamically
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height

  // Calculate world dimensions using config
  const worldWidth = WORLD_CONFIG.getWorldWidth(screenWidth)
  const worldBounds = WORLD_CONFIG.getBounds(screenWidth)

  // Create Matter.js engine and world
  const engine = Matter.Engine.create({
    enableSleeping: false,
    timing: {
      timeScale: 1,
    },
  })
  const world = engine.world
  engine.gravity.y = 0.8

  // Create character at starting position
  const characterBody = Matter.Bodies.rectangle(
    screenWidth * WORLD_CONFIG.startPosition.x,
    screenHeight - WORLD_CONFIG.startPosition.yOffset,
    SPRITE_CONFIG.size.width,
    SPRITE_CONFIG.size.height,
    {
      label: 'character',
      isStatic: false,
      restitution: 0,
      friction: 1,
      frictionAir: 0.01,
      inertia: Infinity,
    },
  )

  // Create ground spanning entire world
  const groundBody = Matter.Bodies.rectangle(worldWidth / 2, screenHeight - 50, worldWidth, 100, {
    label: 'ground',
    isStatic: true,
  })

  // Create boundary walls
  const leftWall = Matter.Bodies.rectangle(worldBounds.min - 10, screenHeight / 2, 20, screenHeight * 2, {
    label: 'leftWall',
    isStatic: true,
  })

  const rightWall = Matter.Bodies.rectangle(worldBounds.max + 10, screenHeight / 2, 20, screenHeight * 2, {
    label: 'rightWall',
    isStatic: true,
  })

  // Add all bodies to world
  Matter.World.add(world, [characterBody, groundBody, leftWall, rightWall])

  // Create camera instance
  const cameraRef = useRef(new Camera(screenWidth, screenHeight, worldWidth))

  // Initial entities
  const entities = {
    physics: { engine, world },
    camera: cameraRef.current,
    setCameraOffset, // Pass state setter to Physics system
    character: {
      body: characterBody,
      size: [SPRITE_CONFIG.size.width, SPRITE_CONFIG.size.height] as [number, number],
      characterClass: selectedCharacter,
      cameraOffset, // Pass state instead of camera object
      renderer: Character,
    },
    ground: {
      body: groundBody,
      size: [worldWidth, 100] as [number, number],
      cameraOffset, // Pass state instead of camera object
      renderer: Ground,
    },
    leftWall: {
      body: leftWall,
      renderer: () => null,
    },
    rightWall: {
      body: rightWall,
      renderer: () => null,
    },
  }

  // Clear any movement interval
  const clearMoveInterval = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
      moveIntervalRef.current = null
    }
  }

  // Update movement handlers to use config speed
  const moveForward = () => {
    clearMoveInterval()

    Matter.Body.setVelocity(characterBody, {
      x: GAME_CONFIG.MOVEMENT_SPEED,
      y: characterBody.velocity.y,
    })

    moveIntervalRef.current = setInterval(() => {
      Matter.Body.setVelocity(characterBody, {
        x: GAME_CONFIG.MOVEMENT_SPEED,
        y: characterBody.velocity.y,
      })
    }, 16)
  }

  const moveBackward = () => {
    clearMoveInterval()

    Matter.Body.setVelocity(characterBody, {
      x: -GAME_CONFIG.MOVEMENT_SPEED,
      y: characterBody.velocity.y,
    })

    moveIntervalRef.current = setInterval(() => {
      Matter.Body.setVelocity(characterBody, {
        x: -GAME_CONFIG.MOVEMENT_SPEED,
        y: characterBody.velocity.y,
      })
    }, 16)
  }

  const stopMovement = () => {
    clearMoveInterval()
    Matter.Body.setVelocity(characterBody, {
      x: 0,
      y: characterBody.velocity.y,
    })
  }

  const resetGame = () => {
    clearMoveInterval()
    Matter.Body.setPosition(characterBody, {
      x: screenWidth * WORLD_CONFIG.startPosition.x,
      y: screenHeight - WORLD_CONFIG.startPosition.yOffset,
    })
    Matter.Body.setVelocity(characterBody, { x: 0, y: 0 })

    // Reset camera
    cameraRef.current.follow(
      screenWidth * WORLD_CONFIG.startPosition.x,
      screenHeight - WORLD_CONFIG.startPosition.yOffset,
    )
    setCameraOffset(cameraRef.current.getOffset())

    setScore(0)
    setRunning(true)
  }

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      clearMoveInterval()
    }
  }, [])

  // Gesture handler using PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Do nothing on initial touch
      },

      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState

        // Only handle horizontal movement
        if (dx > 10) {
          moveForward()
        } else if (dx < -10) {
          moveBackward()
        }
      },

      onPanResponderRelease: () => {
        stopMovement()
      },

      onPanResponderTerminate: () => {
        stopMovement()
      },
    }),
  ).current

  return (
    <ImageBackground style={styles.container} source={PROFILE_BACKGROUND}>
      <View style={styles.overlay} />
      <View style={styles.gameWrapper}>
        <GameEngine
          ref={gameEngineRef}
          style={styles.gameContainer}
          systems={[Physics]}
          entities={entities}
          running={running}
        />

        {/* Gesture layer */}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

        {/* Gesture Instructions Overlay */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>⬅️ Swipe left: Move back</Text>
          <Text style={styles.instructionText}>➡️ Swipe right: Move forward</Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.floatingResetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameWrapper: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  floatingResetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Index
