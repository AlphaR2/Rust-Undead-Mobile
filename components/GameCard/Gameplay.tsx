import {
  CharacterClass,
  GAME_CONFIG,
  INSTRUCTION_AUTO_HIDE_DURATION,
  SPRITE_CONFIG,
  WORLD_CONFIG,
} from '@/constants/characters'
import { MaterialIcons } from '@expo/vector-icons'
import Matter from 'matter-js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GameEngine } from 'react-native-game-engine'
import { Camera } from '../game-engine/camera'
import Character from '../game-engine/character'
import Checkpoint from './Checkpoint'
import CheckpointModal, { CheckpointContent } from './CheckpointModal'
import { CheckpointSystem, completeCheckpoint, createCheckpoint } from './CheckpointSystem'
import Ground from '../game-engine/ground'
import { Physics } from '../game-engine/Physics'
import ScrollingBackground from '../game-engine/scrollingBackground'
import { PATH_CONTENTS, PathContent, getCheckpointPositions } from '@/constants/Paths'
import { useContext } from 'react'
import { CreateContext } from '@/context/Context'
import { completePathAndUnlockNext, getActivePath } from '@/utils/path'
import useFetchConcepts from '@/hooks/useFetchConcepts'

interface BackgroundImages {
  layer1: any
  layer2: any
  layer3: any
  layer4: any
  layer5: any
  layer6: any
  layer7: any
}

interface GameplayProps {
  onComplete: () => void
  onBack: () => void
  selectedCharacter: CharacterClass
  backgroundImages: BackgroundImages
  pathId?: string
  customEntities?: any
  pathIndex?: number // Add path index prop
}

const Gameplay: React.FC<GameplayProps> = ({
  onComplete,
  onBack,
  selectedCharacter,
  backgroundImages,
  pathId,
  customEntities = {},
  pathIndex = 0, // Default to first path
}) => {
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [running, setRunning] = useState<boolean>(true)
  const moveIntervalRef = useRef<NodeJS.Timeout | any>(null)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const instructionTimerRef = useRef<NodeJS.Timeout | any>(null)
  const { setCurrentScreen, setPaths, paths } = useContext(CreateContext).path
  const [pathContents, setPathContents] = useState<PathContent>()
  const [path, setPath] = useState<{
    checkpoints: CheckpointContent[]
    id: number
  } | null>()
  const [checkpointPositions, setCheckpointPositions] = useState<
    {
      x: number
      y: number
    }[]
  >()

  // Checkpoint modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [currentCheckpointContent, setCurrentCheckpointContent] = useState<CheckpointContent | null>(null)
  const [currentCheckpointNumber, setCurrentCheckpointNumber] = useState<number | null>(null)

  const [activePathId, setActivePathId] = useState<string>('')

  const { data, loading, error } = useFetchConcepts()
 

  useEffect(() => {
    if (data) {
      setPathContents(data)
    }
  }, [data])

  useEffect(() => {
    if (paths.length >= 1) {
      const activePath = getActivePath(paths)
      activePath && setActivePathId(activePath?.id)
    }
  }, [paths])

  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const worldWidth = WORLD_CONFIG.getWorldWidth(screenWidth)
  const worldBounds = WORLD_CONFIG.getBounds(screenWidth)

  const engineRef = useRef(
    Matter.Engine.create({
      enableSleeping: false,
      timing: { timeScale: 1 },
    }),
  )
  const engine = engineRef.current
  const world = engine.world
  engine.gravity.y = 0.8

  const characterBodyRef = useRef(
    Matter.Bodies.rectangle(
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
    ),
  )
  const characterBody = characterBodyRef.current

  const groundBodyRef = useRef(
    Matter.Bodies.rectangle(worldWidth / 2, screenHeight + 32, worldWidth, 100, {
      label: 'ground',
      isStatic: true,
    }),
  )
  const groundBody = groundBodyRef.current

  const leftWallRef = useRef(
    Matter.Bodies.rectangle(worldBounds.min - 10, screenHeight / 2, 20, screenHeight * 2, {
      label: 'leftWall',
      isStatic: true,
    }),
  )
  const leftWall = leftWallRef.current

  const rightWallRef = useRef(
    Matter.Bodies.rectangle(worldBounds.max + 10, screenHeight / 2, 20, screenHeight * 2, {
      label: 'rightWall',
      isStatic: true,
    }),
  )
  const rightWall = rightWallRef.current

  useEffect(() => {
    Matter.World.add(world, [characterBody, groundBody, leftWall, rightWall])

    return () => {
      Matter.World.clear(world, false)
      Matter.Engine.clear(engine)
    }
  }, [])

  useEffect(() => {
    instructionTimerRef.current = setTimeout(() => {
      setShowInstructions(false)
    }, INSTRUCTION_AUTO_HIDE_DURATION)

    return () => {
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current)
      }
    }
  }, [])

  const cameraRef = useRef(new Camera(screenWidth, screenHeight, worldWidth))

  // Callback when checkpoint is reached
  const handleCheckpointReached = useCallback((checkpointNumber: number, content: CheckpointContent) => {
    console.log('🎉 Checkpoint reached callback triggered:', checkpointNumber)
    setCurrentCheckpointNumber(checkpointNumber)
    setCurrentCheckpointContent(content)
    setModalVisible(true)
    setRunning(false) // Pause game
  }, [])

  // Callback when modal is closed
  const handleContinue = useCallback(() => {
    // console.log('Continuing from checkpoint:', currentCheckpointNumber)
    if (currentCheckpointNumber !== null && entitiesRef.current) {
      // Mark checkpoint as completed
      completeCheckpoint(entitiesRef.current, currentCheckpointNumber)
    }

    if (currentCheckpointNumber === 6) {
      setCurrentScreen('path')
      setPaths(completePathAndUnlockNext(paths, activePathId))
    }
    setModalVisible(false)
    setCurrentCheckpointContent(null)
    setCurrentCheckpointNumber(null)
    setRunning(true) // Resume game
  }, [currentCheckpointNumber])

  // Create checkpoints FIRST, before entities

  useEffect(() => {
    const pathContentRaw = pathContents && pathContents[pathIndex] ? pathContents[pathIndex] : null
    setPath(pathContentRaw)
    setCheckpointPositions(pathContentRaw ? getCheckpointPositions(worldWidth, screenHeight, pathContentRaw.checkpoints.length + 1) : [])
  }, [pathContents])

  const checkpointEntitiesRef = useRef<any>({})

  // Initialize checkpoints once
  useEffect(() => {
    if (path && (checkpointPositions?.length ?? 0) > 0) {
      // console.log('🎮 Initializing checkpoints for path:', path.title)
      // console.log('Ground position:', groundBody.position)
      // console.log('Character start position:', characterBody.position)

      const newCheckpointEntities: any = {}
      checkpointPositions?.forEach((pos, index) => {
        const checkpointData = createCheckpoint(world, pos.x, pos.y, index + 1, path.checkpoints[index])
        newCheckpointEntities[`checkpoint_${index + 1}`] = {
          ...checkpointData,
          renderer: Checkpoint,
        }
        // console.log(`📍 Checkpoint ${index + 1} created at x:${pos.x.toFixed(0)}, y:${pos.y.toFixed(0)}`)
      })

      checkpointEntitiesRef.current = newCheckpointEntities

      // Force update the entities ref
      Object.assign(entitiesRef.current, newCheckpointEntities)
      // console.log('✅ Total entities:', Object.keys(entitiesRef.current).filter(k => k.startsWith('checkpoint_')))
    }
  }, [checkpointPositions, path])

  const handleSetCameraOffset = useCallback((newOffset: { x: number; y: number }) => {
    setCameraOffset((prevOffset) => {
      if (prevOffset.x !== newOffset.x || prevOffset.y !== newOffset.y) {
        return newOffset
      }
      return prevOffset
    })
  }, [])

  const entitiesRef = useRef({
    physics: { engine, world },
    camera: cameraRef.current,
    setCameraOffset: handleSetCameraOffset,
    onCheckpointReached: handleCheckpointReached,
    character: {
      body: characterBody,
      size: [SPRITE_CONFIG.size.width, SPRITE_CONFIG.size.height] as [number, number],
      characterClass: selectedCharacter,
      cameraOffset: { x: 0, y: 0 },
      renderer: Character,
    },
    ground: {
      body: groundBody,
      size: [worldWidth, 100] as [number, number],
      cameraOffset: { x: 0, y: 0 },
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
    ...customEntities,
  })

  // Update camera offsets for all entities
  useEffect(() => {
    if (entitiesRef.current.character) {
      entitiesRef.current.character.cameraOffset = cameraOffset
    }
    if (entitiesRef.current.ground) {
      entitiesRef.current.ground.cameraOffset = cameraOffset
    }

    // Update checkpoint camera offsets
    Object.keys(entitiesRef.current).forEach((key) => {
      if (key.startsWith('checkpoint_')) {
        entitiesRef.current[key].cameraOffset = cameraOffset
      }
    })
  }, [cameraOffset])

  const clearMoveInterval = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
      moveIntervalRef.current = null
    }
  }, [])

  const moveForward = useCallback(() => {
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
  }, [characterBody, clearMoveInterval])

  const moveBackward = useCallback(() => {
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
  }, [characterBody, clearMoveInterval])

  const stopMovement = useCallback(() => {
    clearMoveInterval()
    Matter.Body.setVelocity(characterBody, {
      x: 0,
      y: characterBody.velocity.y,
    })
  }, [characterBody, clearMoveInterval])

  useEffect(() => {
    return () => {
      clearMoveInterval()
    }
  }, [clearMoveInterval])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState
        if (dx > 10) {
          moveForward()
        } else if (dx < -10) {
          moveBackward()
        }
      },
      onPanResponderRelease: stopMovement,
      onPanResponderTerminate: stopMovement,
    }),
  ).current

  const handleInfoPress = useCallback(() => {
    setShowInstructions(true)

    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current)
    }

    instructionTimerRef.current = setTimeout(() => {
      setShowInstructions(false)
    }, INSTRUCTION_AUTO_HIDE_DURATION)
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <ScrollingBackground
        source={backgroundImages.layer1}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.1}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer2}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.2}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer3}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.3}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer4}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.45}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer5}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.6}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer6}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.75}
        layerWidth={576}
      />

      <ScrollingBackground
        source={backgroundImages.layer7}
        cameraOffset={cameraOffset}
        worldWidth={worldWidth}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        parallaxFactor={0.9}
        layerWidth={576}
      />

      <View style={styles.overlay} />

      <View style={styles.gameWrapper}>
        <GameEngine
          ref={gameEngineRef}
          style={styles.gameContainer}
          systems={[Physics, CheckpointSystem]}
          entities={entitiesRef.current}
          running={running}
        />

        {/* Checkpoint Modal */}
        <CheckpointModal visible={modalVisible} content={currentCheckpointContent} onContinue={handleContinue} />

        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

        {showInstructions ? (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>Swipe left: Move back</Text>
            <Text style={styles.instructionText}> Swipe right: Move forward</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="info-outline" size={22} color="white" />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="arrow-back" size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderColor: 'rgba(200, 116, 35, 0.6)',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  instructionText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  infoButton: {
    position: 'absolute',
    top: 22,
    right: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: 22,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    borderRadius: 17,
    padding: 6.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default Gameplay
