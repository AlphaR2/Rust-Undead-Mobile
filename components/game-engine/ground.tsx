import React from 'react'
import { View, StyleSheet } from 'react-native'
import { GroundProps } from '@/types/matter'

const Ground: React.FC<GroundProps> = ({ body, size }) => {
  const width = size[0]
  const height = size[1]
  
  const x = body.position.x - width / 2
  const y = body.position.y - height / 2

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