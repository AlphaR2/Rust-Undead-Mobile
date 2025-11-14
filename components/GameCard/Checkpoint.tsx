import chestboxClose from '@/assets/gameplay/Chest_01_Locked.png'
import chestboxOpen from '@/assets/gameplay/Chest_01_Unlocked.png'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

interface CheckpointProps {
  body: any
  size: [number, number]
  cameraOffsetRef: React.RefObject<{ x: number; y: number }>
  isCompleted: boolean
  checkpointNumber: number
}

const Checkpoint: React.FC<CheckpointProps> = ({ body, size, cameraOffsetRef, isCompleted }) => {
  const [width, height] = size
  const x = body.position.x - width / 1 + cameraOffsetRef.current.x
  const y = body.position.y - height / 1.7 + cameraOffsetRef.current.y

  return (
    <View
      style={[
        styles.checkpoint,
        {
          left: x,
          top: y,
          width,
          height,
          zIndex: -1,
        },
      ]}
    >
      {isCompleted ? (
        <Image source={chestboxOpen} alt="chestbox" style={styles.chestImage} />
      ) : (
        <Image source={chestboxClose} alt="chestbox" style={styles.chestImage} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  checkpoint: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  chestImage: {
    height: 50,
    width: 60,
    marginTop: 25,
  },
})

export default Checkpoint