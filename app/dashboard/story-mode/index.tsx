import { CharacterClass } from '@/constants/characters'
import { CreateContext } from '@/context/Context'
import { router } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import AvatarSelection from './avatar'
import StoryModeTrailer from './trailer'

const StoryMode = () => {
  const { selectedCharacter, setSelectedCharacter } = useContext(CreateContext).onboarding
  const [showAvatar, setShowAvatar] = useState<boolean>(false)

  useEffect(() => {
    if (selectedCharacter) {
      router.replace({
        pathname: '/dashboard/story-mode/intro',
        params: { selectedCharacter },
      })
    }
  }, [selectedCharacter])

  const handleTrailerComplete = () => {
    setShowAvatar(true)
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleAvatarComplete = async (character: CharacterClass) => {
    await setSelectedCharacter(character)
    router.push({
      pathname: '/dashboard/story-mode/intro',
      params: { selectedCharacter: character },
    })
  }

  return (
    <View style={styles.container}>
      {!showAvatar ? (
        <StoryModeTrailer onComplete={handleTrailerComplete} onBack={handleBack} />
      ) : (
        <AvatarSelection onComplete={handleAvatarComplete} onBack={handleBack} />
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
