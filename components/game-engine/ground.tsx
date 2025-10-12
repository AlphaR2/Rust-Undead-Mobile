import React from 'react'
import { View, StyleSheet } from 'react-native'
import { GroundProps } from '@/types/matter'

interface UpdatedGroundProps extends GroundProps {
  cameraOffset: { x: number; y: number }
}

const Ground: React.FC<UpdatedGroundProps> = ({ body, size, cameraOffset }) => {
  const width = size[0]
  const height = size[1]
  
  // Apply camera offset to position
  const x = body.position.x - width / 2 + cameraOffset.x
  const y = body.position.y - height / 2 + cameraOffset.y

  return (
    <View
      style={[
        styles.ground,
        {
          left: x,
          top: y,
          width: width,
          height: height,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  ground: {
    position: 'absolute',
    backgroundColor: '#8B4513',
    borderTopWidth: 3,
    borderTopColor: '#654321',
  },
})

export default Ground