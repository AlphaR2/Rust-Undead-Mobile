import Gameplay from '@/components/GameCard/Gameplay'
import { router } from 'expo-router'
import React, { useContext, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import ChapterIntro from './intro'

import { CreateContext } from '@/context/Context'
import PathScreen from './path'

type Screen = 'intro' | 'path' | 'gameplay'

const ChapterOne = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro')
  const [selectedPathId, setSelectedPathId] = useState<string>('1')

  const { onboarding } = useContext(CreateContext)
  const { selectedCharacter } = onboarding

  const handleBackFromIntro = () => router.push('/dashboard/story-mode/roadmap')
  const handleBackFromPath = () => setCurrentScreen('path')
  const handleIntroComplete = () => setCurrentScreen('path')
  const handlePathComplete = (pathId: string) => {
    setSelectedPathId(pathId)
    setCurrentScreen('gameplay')
  }
  const handleGameplayComplete = () => router.push('/dashboard/story-mode/roadmap')

  // Static require statements for both image sets
  const factoryImages = {
    layer1: require('../../../../assets/images/backgrounds/factory/layer-1.png'),
    layer2: require('../../../../assets/images/backgrounds/factory/layer-2.png'),
    layer3: require('../../../../assets/images/backgrounds/factory/layer-3.png'),
    layer4: require('../../../../assets/images/backgrounds/factory/layer-4.png'),
    layer5: require('../../../../assets/images/backgrounds/factory/layer-5.png'),
    layer6: require('../../../../assets/images/backgrounds/factory/layer-6.png'),
    layer7: require('../../../../assets/images/backgrounds/factory/layer-7.png'),
  }

  const graveImages = {
    layer1: require('../../../../assets/images/backgrounds/grave/layer-1.png'),
    layer2: require('../../../../assets/images/backgrounds/grave/layer-2.png'),
    layer3: require('../../../../assets/images/backgrounds/grave/layer-3.png'),
    layer4: require('../../../../assets/images/backgrounds/grave/layer-4.png'),
    layer5: require('../../../../assets/images/backgrounds/grave/layer-5.png'),
    layer6: require('../../../../assets/images/backgrounds/grave/layer-6.png'),
    layer7: require('../../../../assets/images/backgrounds/grave/layer-7.png'),
  }

  // Select image set based on pathId
  const backgroundImages = ['3', '4'].includes(selectedPathId) ? graveImages : factoryImages
  const customEntities = {} // Add path-specific entities if needed

  return (
    <View style={styles.container}>
      {currentScreen === 'intro' && <ChapterIntro onComplete={handleIntroComplete} onBack={handleBackFromIntro} />}
      {currentScreen === 'path' && <PathScreen onComplete={handlePathComplete} onBack={handleBackFromPath} />}
      {currentScreen === 'gameplay' && (
        <Gameplay
          onComplete={handleGameplayComplete}
          onBack={handleBackFromPath}
          selectedCharacter={selectedCharacter || 'oracle'}
          backgroundImages={backgroundImages}
          pathId={selectedPathId}
          customEntities={customEntities}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})

export default ChapterOne
