import { router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AvatarSelection from './avatar'
import ChapterIntro from './intro'
import PathScreen from './path'

type Screen = 'intro' | 'avatar' | 'path'

const ChapterOne = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro')

  const handleBackFromIntro = () => {
    router.push('/dashboard/story-mode/roadmap')
  }

  const handleBackFromAvatar = () => {
    setCurrentScreen('intro')
  }

  const handleBackFromPath = () => {
    setCurrentScreen('avatar')
  }

  const handleIntroComplete = () => {
    setCurrentScreen('avatar')
  }

  const handleAvatarComplete = () => {
    setCurrentScreen('path')
  }

  const handlePathComplete = () => {
    router.push('/dashboard/story-mode/roadmap')
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'intro' && (
        <ChapterIntro onComplete={handleIntroComplete} onBack={handleBackFromIntro} />
      )}
      {currentScreen === 'avatar' && (
        <AvatarSelection onComplete={handleAvatarComplete} onBack={handleBackFromAvatar} />
      )}
      {currentScreen === 'path' && <PathScreen onComplete={handlePathComplete} onBack={handleBackFromPath} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default ChapterOne