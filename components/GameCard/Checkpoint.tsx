import React from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import chestboxClose from '@/assets/gameplay/chestbox-close.png'
import chestboxOpen from '@/assets/gameplay/chestbox-open.png'

interface CheckpointProps {
  body: any
  size: [number, number]
  cameraOffset: { x: number; y: number }
  isCompleted: boolean
  checkpointNumber: number
}

const Checkpoint: React.FC<CheckpointProps> = ({ body, size, cameraOffset, isCompleted, checkpointNumber }) => {
  const [width, height] = size
  const x = body.position.x - width / 2 + cameraOffset.x
  const y = body.position.y - height / 2 + cameraOffset.y

  return (
    <View
      style={[
        styles.checkpoint,
        {
          left: x,
          top: y,
          width,
          height,
          // backgroundColor: isCompleted ? '#4CAF50' : '#FFD700',
          // borderColor: isCompleted ? '#2E7D32' : '#FFA000',
        },
      ]}
    >
      {/* Chest lock/checkmark indicator */}
      {isCompleted ? (
        <Image
          source={chestboxOpen}
          alt="chestbox"
          height={10}
          width={10}
          style={{ height: 80, width: 100, marginTop: 25 }}
        />
      ) : (
        <Image
          source={chestboxClose}
          alt="chestbox"
          height={10}
          width={10}
          style={{ height: 80, width: 100, marginTop: 25 }}
        />
      )}
      {/* <Text style={styles.icon}>
        {isCompleted ? '✓' : '🔒'}
      </Text> */}

      {/* Checkpoint number */}
      {/* <Text style={styles.number}>{checkpointNumber}</Text> */}
    </View>
  )
}

const styles = StyleSheet.create({
  checkpoint: {
    position: 'absolute',
    // borderWidth: 3,
    // borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  number: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

export default Checkpoint
