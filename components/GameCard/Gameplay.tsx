import { GAME_CONFIG, INSTRUCTION_AUTO_HIDE_DURATION, SPRITE_CONFIG, WORLD_CONFIG } from '@/constants/characters'
import { PathContent, getCheckpointPositions } from '@/constants/Paths'
import { CreateContext } from '@/context/Context'
import { updatePosition } from '@/hooks/Rollup/useUndeadActions'
import useFetchConcepts from '@/hooks/useFetchConcepts'
import { useEphemeralProgram, useMagicBlockProvider, useWalletInfo } from '@/hooks/useUndeadProgram'
import { usePDAs } from '@/hooks/utils/useHelpers'
import { WarriorClass as CharacterClass } from '@/types/undead'
import { completePathAndUnlockNext, getActivePath } from '@/utils/path'
import { MaterialIcons } from '@expo/vector-icons'
import Matter from 'matter-js'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native'
import { GameEngine } from 'react-native-game-engine'
import { BoundaryDetectionSystem } from '../game-engine/BoundaryDetectionSystem'
import { Camera } from '../game-engine/camera'
import Character from '../game-engine/character'
import Ground from '../game-engine/ground'
import { Physics } from '../game-engine/physics'
import ScrollingBackground from '../game-engine/scrollingBackground'
import GameLoadingScreen from '../ui/Loading'
import Checkpoint from './Checkpoint'
import CheckpointModal, { CheckpointContent } from './CheckpointModal'
import { CheckpointSystem, completeCheckpoint, createCheckpoint } from './CheckpointSystem'

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
  pathIndex?: number
}

const Gameplay: React.FC<GameplayProps> = ({
  onBack,
  selectedCharacter,
  backgroundImages,
  customEntities = {},
  pathIndex = 0,
}) => {
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [running, setRunning] = useState<boolean>(true)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const cameraOffsetRef = useRef({ x: 0, y: 0 })
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const instructionTimerRef = useRef<NodeJS.Timeout | any>(null)
  const { setCurrentScreen, setPaths, paths } = useContext(CreateContext).path
  const { publicKey } = useWalletInfo()
  const ephemeralProgram = useEphemeralProgram()
  const { gamerProfilePda } = usePDAs(publicKey)
  const magicBlockProvider = useMagicBlockProvider()

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

  const [modalVisible, setModalVisible] = useState(false)
  const [showMiniModal, setShowMiniModal] = useState(false)
  const [miniModalType, setMiniModalType] = useState('checkpoint')
  const [showQuizIntro, setShowQuizIntro] = useState(false)
  const [currentCheckpointContent, setCurrentCheckpointContent] = useState<CheckpointContent | null>(null)
  const [currentCheckpointNumber, setCurrentCheckpointNumber] = useState<number | null>(null)

  const [activePathId, setActivePathId] = useState<string>('')

  const { data, loading } = useFetchConcepts()

  // Position tracking state
  const positionUpdateQueue = useRef<number[]>([])
  const isUpdatingPosition = useRef(false)
  const lastRecordedPosition = useRef<number>(0)

  // Transaction toast state
  const [txToast, setTxToast] = useState<{ signature: string; visible: boolean }>({ signature: '', visible: false })
  const toastOpacity = useRef(new Animated.Value(0)).current
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTxToast = useCallback((signature: string) => {
    console.log('🎨 Showing toast for signature:', signature)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }

    const truncated = `${signature.slice(0, 4)}...${signature.slice(-4)}`
    console.log('✂️ Truncated signature:', truncated)
    setTxToast({ signature: truncated, visible: true })

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('🎨 Toast animation complete')
      setTxToast({ signature: '', visible: false })
    })
  }, [toastOpacity])

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
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        inertia: Infinity,
        density: 0.001,
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

  const syncPositionToBlockchain = useCallback(
    async (position: number) => {
      if (!ephemeralProgram || !publicKey || !gamerProfilePda || !magicBlockProvider) {
        console.warn('⚠️ Solana context not ready for position update')
        console.log('ephemeralProgram:', !!ephemeralProgram)
        console.log('publicKey:', publicKey?.toString())
        console.log('gamerProfilePda:', gamerProfilePda?.toString())
        console.log('magicBlockProvider:', !!magicBlockProvider)
        return
      }

      if (isUpdatingPosition.current) {
        console.log('⏳ Position update in progress, queuing:', position)
        positionUpdateQueue.current.push(position)
        return
      }

      isUpdatingPosition.current = true

      try {
        const roundedPosition = Math.round(position)
        console.log('📍 Syncing position to blockchain:', roundedPosition)

        const result = await updatePosition({
          ephemeralProgram,
          playerPublicKey: publicKey,
          gamerProfilePda,
          position: roundedPosition,
          magicBlockProvider,
        })

        if (result.success && result.signature) {
          console.log('✅ Position synced:', roundedPosition, 'Sig:', result.signature)
          lastRecordedPosition.current = roundedPosition
          showTxToast(result.signature)
        } else {
          console.error('❌ Position sync failed:', result.error)
        }
      } catch (error) {
        console.error('❌ Error syncing position:', error)
      } finally {
        isUpdatingPosition.current = false

        if (positionUpdateQueue.current.length > 0) {
          const nextPosition = positionUpdateQueue.current.pop()!
          console.log('📥 Processing queued position:', nextPosition)
          positionUpdateQueue.current = []
          syncPositionToBlockchain(nextPosition)
        }
      }
    },
    [ephemeralProgram, publicKey, gamerProfilePda, magicBlockProvider, showTxToast],
  )

  useEffect(() => {
    console.log('🎮 Position tracking started')
    const interval = setInterval(() => {
      if (characterBody && running) {
        const currentPosition = Math.round(characterBody.position.x)
        console.log('📊 Current position:', currentPosition, 'Last recorded:', lastRecordedPosition.current)

        if (currentPosition !== lastRecordedPosition.current) {
          console.log('🔄 Position changed, syncing...')
          syncPositionToBlockchain(currentPosition)
        }
      }
    }, 1000)

    return () => {
      console.log('🛑 Position tracking stopped')
      clearInterval(interval)
    }
  }, [characterBody, running, syncPositionToBlockchain])

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

  const handleCheckpointReached = useCallback(
    (checkpointNumber: number, content: CheckpointContent) => {
      console.log('🎯 Checkpoint reached:', checkpointNumber)
      setCurrentCheckpointNumber(checkpointNumber)
      setCurrentCheckpointContent(content)
      setShowMiniModal(true)
      setModalVisible(true)
      setRunning(false)

      if (characterBody) {
        const position = Math.round(characterBody.position.x)
        console.log('📍 Syncing position at checkpoint:', position)
        syncPositionToBlockchain(position)
      }
    },
    [characterBody, syncPositionToBlockchain],
  )

  const handleOpenBox = useCallback(() => {
    setTimeout(() => {
      if (currentCheckpointNumber === 6) {
        setShowQuizIntro(true)
      }

      if (miniModalType === 'chapter-end') {
        setCurrentScreen('path')
        setPaths(completePathAndUnlockNext(paths, activePathId))
      }

      setShowMiniModal(false)
    }, 0)
  }, [currentCheckpointNumber, miniModalType, paths, activePathId, setCurrentScreen, setPaths])

  const handleContinue = useCallback(() => {
    if (currentCheckpointNumber !== null && entitiesRef.current) {
      completeCheckpoint(entitiesRef.current, currentCheckpointNumber)
    }

    setModalVisible(false)
    setShowMiniModal(false)
    setShowQuizIntro(false)
    setCurrentCheckpointContent(null)
    setCurrentCheckpointNumber(null)
    setRunning(true)
  }, [currentCheckpointNumber, paths, activePathId])

  useEffect(() => {
    const pathContentRaw = pathContents && pathContents[pathIndex] ? pathContents[pathIndex] : null
    setPath(pathContentRaw)
    setCheckpointPositions(
      pathContentRaw ? getCheckpointPositions(worldWidth, screenHeight, pathContentRaw.checkpoints.length) : [],
    )
  }, [pathContents])

  const checkpointEntitiesRef = useRef<any>({})

  useEffect(() => {
    if (path && (checkpointPositions?.length ?? 0) > 0) {
      const newCheckpointEntities: any = {}
      checkpointPositions?.forEach((pos, index) => {
        const checkpointData = createCheckpoint(world, pos.x, pos.y, index + 1, path.checkpoints[index])
        newCheckpointEntities[`checkpoint_${index + 1}`] = {
          ...checkpointData,
          cameraOffsetRef: cameraOffsetRef,
          renderer: Checkpoint,
        }
      })

      checkpointEntitiesRef.current = newCheckpointEntities
      Object.assign(entitiesRef.current, newCheckpointEntities)
    }
  }, [checkpointPositions, path])

  const handleSetCameraOffsetRef = useCallback((newOffset: { x: number; y: number }) => {
    cameraOffsetRef.current = newOffset
  }, [])

  const handleSetCameraOffset = useCallback((newOffset: { x: number; y: number }) => {
    setCameraOffset((prevOffset) => {
      if (prevOffset.x !== newOffset.x || prevOffset.y !== newOffset.y) {
        return newOffset
      }
      return prevOffset
    })
  }, [])

  const handleReachEnd = useCallback(() => {
    console.log('🏁 Reached end of world!')
    
    if (characterBody) {
      const position = Math.round(characterBody.position.x)
      console.log('📍 Syncing final position:', position)
      syncPositionToBlockchain(position)
    }

    setShowMiniModal(true)
    setModalVisible(true)
    setMiniModalType('chapter-end')
  }, [characterBody, syncPositionToBlockchain])

  const handleReachStart = useCallback(() => {}, [])

  const entitiesRef = useRef({
    physics: { engine, world },
    camera: cameraRef.current,
    cameraOffsetRef: cameraOffsetRef,
    setCameraOffset: handleSetCameraOffset,
    setCameraOffsetRef: handleSetCameraOffsetRef,
    onCheckpointReached: handleCheckpointReached,
    onReachEnd: handleReachEnd,
    onReachStart: handleReachStart,
    worldBounds: {
      min: worldBounds.min,
      max: worldBounds.max,
    },
    character: {
      body: characterBody,
      size: [SPRITE_CONFIG.size.width, SPRITE_CONFIG.size.height] as [number, number],
      characterClass: selectedCharacter,
      cameraOffsetRef: cameraOffsetRef,
      renderer: Character,
    },
    ground: {
      body: groundBody,
      size: [worldWidth, 100] as [number, number],
      cameraOffsetRef: cameraOffsetRef,
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

  const moveForward = useCallback(() => {
    Matter.Body.setVelocity(characterBody, {
      x: GAME_CONFIG.MOVEMENT_SPEED,
      y: characterBody.velocity.y,
    })
  }, [characterBody])

  const moveBackward = useCallback(() => {
    Matter.Body.setVelocity(characterBody, {
      x: -GAME_CONFIG.MOVEMENT_SPEED,
      y: characterBody.velocity.y,
    })
  }, [characterBody])

  const stopMovement = useCallback(() => {
    Matter.Body.setVelocity(characterBody, {
      x: 0,
      y: characterBody.velocity.y,
    })

    console.log('🛑 Movement stopped')
    if (characterBody) {
      const position = Math.round(characterBody.position.x)
      console.log('📍 Syncing position on stop:', position)
      syncPositionToBlockchain(position)
    }
  }, [characterBody, syncPositionToBlockchain])

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
      <GameLoadingScreen
        backgroundImage={backgroundImages.layer1}
        titleBackgroundImage={require('../../assets/onboarding/dialog-bg-1.png')}
        loadingText="Preparing your adventure..."
        overlayOpacity={0.6}
      />
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
          systems={[Physics, CheckpointSystem, BoundaryDetectionSystem]}
          entities={entitiesRef.current}
          running={running}
        />

        <CheckpointModal
          visible={modalVisible}
          content={currentCheckpointContent}
          onContinue={handleContinue}
          onOpenBox={handleOpenBox}
          showMiniModal={showMiniModal}
          miniModalType={miniModalType}
          showQuizIntro={showQuizIntro}
          allTopics={pathContents?.[pathIndex]?.checkpoints || []}
        />

        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

        {showInstructions ? (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>Swipe left: Move back</Text>
            <Text style={styles.instructionText}>Swipe right: Move forward</Text>
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

        {txToast.visible && (
          <Animated.View style={[styles.txToast, { opacity: toastOpacity }]}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.txToastText}>{txToast.signature}</Text>
          </Animated.View>
        )}
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
  txToast: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    zIndex: 100,
  },
  txToastText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
})

export default Gameplay