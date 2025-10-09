import { router } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AvatarSelection from './avatar'
import ChapterIntro from './intro'
import Onboarding from './onboarding'
import PathScreen from './path'

type Screen = 'intro' | 'avatar' | 'path' | 'overlay' | 'quiz' | 'quiz-answer' | 'onboarding'

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
    setCurrentScreen('onboarding')
    // router.push('/dashboard/story-mode/roadmap')
  }
  const handleOverlayComplete = () => {
    router.push('/dashboard/story-mode/roadmap')
  }
  const handleQuizComplete = () => {
    router.push('/dashboard/story-mode/roadmap')
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'intro' && <ChapterIntro onComplete={handleIntroComplete} onBack={handleBackFromIntro} />}
      {currentScreen === 'avatar' && (
        <AvatarSelection onComplete={handleAvatarComplete} onBack={handleBackFromAvatar} />
      )}
      {currentScreen === 'path' && <PathScreen onComplete={handlePathComplete} onBack={handleBackFromPath} />}
      {currentScreen === 'onboarding' && <Onboarding onComplete={handleOverlayComplete} onBack={handleBackFromPath} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default ChapterOne
