import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import TRAILER_PLACEHOLDER from '../../../assets/images/bg-assets/bg-03.png'

interface StoryModeTrailerProps {
  onComplete: () => void
  onBack: () => void
}

const StoryModeTrailer: React.FC<StoryModeTrailerProps> = ({ onComplete, onBack }) => {
  return (
    <ImageBackground source={TRAILER_PLACEHOLDER} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    right: 24,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default StoryModeTrailer