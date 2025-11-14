// src/components/gameplay/CheckpointsOverlay.tsx
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

const chestClosed = require('@/assets/gameplay/Chest_01_Locked.png')
const chestOpen = require('@/assets/gameplay/Chest_01_Unlocked.png')

interface CheckpointEntity {
  body: Matter.Body
  isCompleted: boolean
  checkpointNumber: number
}

interface CheckpointsOverlayProps {
  checkpointEntities: Record<string, CheckpointEntity>
  cameraOffset: { x: number; y: number }
  screenHeight: number
}

const CHEST_WIDTH = 60
const CHEST_HEIGHT = 50
const CHEST_Y_OFFSET = 25   // how far above the physics body the chest sits

const CheckpointsOverlay: React.FC<CheckpointsOverlayProps> = ({
  checkpointEntities,
  cameraOffset,
  screenHeight,
}) => {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {Object.values(checkpointEntities).map((cp) => {
        const x = cp.body.position.x + cameraOffset.x - CHEST_WIDTH / 2
        const y = cp.body.position.y - CHEST_Y_OFFSET - CHEST_HEIGHT

        return (
          <View
            key={`cp-${cp.checkpointNumber}`}
            style={[
              styles.checkpoint,
              { left: x, top: y, width: CHEST_WIDTH, height: CHEST_HEIGHT },
            ]}
          >
            <Image
              source={cp.isCompleted ? chestOpen : chestClosed}
              style={styles.chestImage}
              resizeMode="contain"
            />
            {/* Optional glow when not completed */}
            {!cp.isCompleted && (
              <View style={styles.glow} />
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  checkpoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chestImage: {
    width: '100%',
    height: '100%',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 30,
    margin: -10,
  },
})

export default React.memo(CheckpointsOverlay)