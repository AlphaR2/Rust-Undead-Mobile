import Character from '@/components/game-engine/character';
import Ground from '@/components/game-engine/ground';
import { Physics } from '@/components/game-engine/Physics';
import Matter from 'matter-js';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, PanResponder, ImageBackground } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import PROFILE_BACKGROUND from '@/assets/images/bg-assets/bg-04.png'

const { width, height } = Dimensions.get('window');

const Index = () => {
  const gameEngineRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const moveIntervalRef = useRef(null);

  // Get screen dimensions dynamically
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Create Matter.js engine and world
  const engine = Matter.Engine.create({ enableSleeping: false });
  const world = engine.world;
  world.gravity.y = 0.8; // Gravity

  // Create character body
  const characterBody = Matter.Bodies.rectangle(
    screenWidth / 4,
    screenHeight - 150,
    40,
    40,
    { 
      label: 'character',
      isStatic: false,
      restitution: 0,
      friction: 1,
      frictionAir: 0.01,
      inertia: Infinity // Prevents rotation
    }
  );

  // Create ground body with full screen width
  const groundBody = Matter.Bodies.rectangle(
    screenWidth / 2,
    screenHeight - 50,
    screenWidth * 2, // Make it extra wide to ensure full coverage
    100,
    { 
      label: 'ground',
      isStatic: true 
    }
  );

  // Add bodies to world
  Matter.World.add(world, [characterBody, groundBody]);

  // Initial entities
  const entities = {
    physics: { engine, world },
    character: { body: characterBody, size: [40, 40], renderer: Character },
    ground: { body: groundBody, size: [screenWidth * 2, 100], renderer: Ground }
  };

  // Clear any movement interval
  const clearMoveInterval = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  // Movement handlers with continuous movement
  const moveForward = () => {
    clearMoveInterval();
    
    // Apply initial movement
    Matter.Body.setVelocity(characterBody, { 
      x: 5, 
      y: characterBody.velocity.y 
    });

    // Continue movement while pressed
    moveIntervalRef.current = setInterval(() => {
      Matter.Body.setVelocity(characterBody, { 
        x: 5, 
        y: characterBody.velocity.y 
      });
    }, 16); // ~60fps
  };

  const moveBackward = () => {
    clearMoveInterval();
    
    // Apply initial movement
    Matter.Body.setVelocity(characterBody, { 
      x: -5, 
      y: characterBody.velocity.y 
    });

    // Continue movement while pressed
    moveIntervalRef.current = setInterval(() => {
      Matter.Body.setVelocity(characterBody, { 
        x: -5, 
        y: characterBody.velocity.y 
      });
    }, 16); // ~60fps
  };

  const jump = () => {
    // Only jump if character is on the ground (very small vertical velocity)
    if (Math.abs(characterBody.velocity.y) < 1) {
      Matter.Body.setVelocity(characterBody, { 
        x: characterBody.velocity.x, 
        y: -12 
      });
    }
  };

  const stopMovement = () => {
    // Clear the continuous movement interval
    clearMoveInterval();
    
    // Only stop horizontal movement, preserve vertical velocity
    Matter.Body.setVelocity(characterBody, { 
      x: 0, 
      y: characterBody.velocity.y 
    });
  };

   const resetGame = () => {
    clearMoveInterval();
    Matter.Body.setPosition(characterBody, { x: width / 4, y: height - 150 });
    Matter.Body.setVelocity(characterBody, { x: 0, y: 0 });
    setScore(0);
    setRunning(true);
  };

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      clearMoveInterval();
    };
  }, []);

  // Gesture handler using PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt, gestureState) => {
        // Tap detected - handle jump
        const touchY = evt.nativeEvent.pageY;
        const screenMiddle = screenHeight / 2;
        
        // If tap is in upper half of screen, jump
        if (touchY < screenMiddle) {
          jump();
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Horizontal swipe/drag
        const { dx, dy } = gestureState;
        
        // If horizontal movement is dominant (more than vertical)
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 10) {
            // Swiping right - move forward
            moveForward();
          } else if (dx < -10) {
            // Swiping left - move backward
            moveBackward();
          }
        }
        
        // Vertical swipe up - jump
        if (dy < -20) {
          jump();
        }
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        // Stop movement when finger is lifted
        stopMovement();
      },
      
      onPanResponderTerminate: () => {
        // Stop movement if gesture is interrupted
        stopMovement();
      },
    })
  ).current;

  return (
    <ImageBackground style={styles.container} source={PROFILE_BACKGROUND}>
      <View style={styles.overlay} />
      <View style={styles.gameWrapper} {...panResponder.panHandlers}>
        <GameEngine
          ref={gameEngineRef}
          style={styles.gameContainer}
          systems={[Physics]}
          entities={entities}
          running={running}
        />

        {/* Score Display */}
        {/* <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View> */}

        {/* Gesture Instructions Overlay */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>👆 Tap top: Jump</Text>
          <Text style={styles.instructionText}>⬅️ Swipe left: Move back</Text>
          <Text style={styles.instructionText}>➡️ Swipe right: Move forward</Text>
          <Text style={styles.instructionText}>⬆️ Swipe up: Jump</Text>
        </View>

        {/* Reset Button (floating) */}
        <TouchableOpacity
          style={styles.floatingResetButton}
          onPress={resetGame}
        >
          <Text style={styles.resetButtonText}>↻ Reset</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#87CEEB',
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
  scoreContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  scoreText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
});

export default Index;
