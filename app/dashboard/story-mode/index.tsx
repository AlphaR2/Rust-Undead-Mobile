import { router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import StoryModeIntro from './intro'
import StoryModeTrailer from './trailer'

const StoryMode = () => {
  const [showIntro, setShowIntro] = useState<boolean>(false)

  const handleTrailerComplete = () => {
    setShowIntro(true)
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  return (
    <View style={styles.container}>
      {!showIntro ? (
        <StoryModeTrailer onComplete={handleTrailerComplete} onBack={handleBack} />
      ) : (
        <StoryModeIntro onBack={handleBack} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default StoryMode
