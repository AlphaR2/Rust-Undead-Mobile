import React from 'react';
import { View } from 'react-native';

const Character = ({ body, size }) => {
  const width = size[0];
  const height = size[1];
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: '#FF6B6B',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#C92A2A',
      }}
    />
  );
};

export default Character;