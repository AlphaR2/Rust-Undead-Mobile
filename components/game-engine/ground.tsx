import { GroundProps } from '@/types/matter'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface UpdatedGroundProps extends GroundProps {
  cameraOffset: { x: number; y: number }
}

const Ground: React.FC<UpdatedGroundProps> = React.memo(
  ({ body, size, cameraOffset }) => {
    const width = size[0] + 100
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.body.position.x === nextProps.body.position.x &&
      prevProps.body.position.y === nextProps.body.position.y &&
      prevProps.cameraOffset.x === nextProps.cameraOffset.x &&
      prevProps.cameraOffset.y === nextProps.cameraOffset.y
    )
  },
)

Ground.displayName = 'Ground'

const styles = StyleSheet.create({
  ground: {
    position: 'absolute',
    backgroundColor: 'black',
  },
})

export default Ground
