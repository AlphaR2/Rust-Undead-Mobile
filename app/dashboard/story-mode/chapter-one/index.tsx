import Gameplay from '@/components/GameCard/Gameplay'
import { router } from 'expo-router'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import ChapterIntro from './intro'

import { CreateContext } from '@/context/Context'
import PathScreen from './path'

const ChapterOne = () => {
  
  const [selectedPathId, setSelectedPathId] = useState<string>('1')

  const { onboarding, path } = useContext(CreateContext)
  const { currentScreen, setCurrentScreen } = path
  const { selectedCharacter } = onboarding

  // ✅ Memoize all handler functions
  const handleBackFromIntro = useCallback(() => {
    router.push('/dashboard/story-mode/roadmap')
  }, [])

  const handleBackFromPath = useCallback(() => {
    setCurrentScreen('path')
  }, [setCurrentScreen])

  const handleIntroComplete = useCallback(() => {
    setCurrentScreen('path')
  }, [setCurrentScreen])

  const handlePathComplete = useCallback(
    (pathId: string) => {
      setSelectedPathId(pathId)
      setCurrentScreen('gameplay')
    },
    [setCurrentScreen],
  )

  const handleGameplayComplete = useCallback(() => {
    router.push('/dashboard/story-mode/roadmap')
  }, [])

  // ✅ Memoize image objects
  const factoryImages = useMemo(
    () => ({
      layer1: require('../../../../assets/images/backgrounds/factory/layer-1.png'),
      layer2: require('../../../../assets/images/backgrounds/factory/layer-2.png'),
      layer3: require('../../../../assets/images/backgrounds/factory/layer-3.png'),
      layer4: require('../../../../assets/images/backgrounds/factory/layer-4.png'),
      layer5: require('../../../../assets/images/backgrounds/factory/layer-5.png'),
      layer6: require('../../../../assets/images/backgrounds/factory/layer-6.png'),
      layer7: require('../../../../assets/images/backgrounds/factory/layer-7.png'),
    }),
    [],
  )

  const graveImages = useMemo(
    () => ({
      layer1: require('../../../../assets/images/backgrounds/grave/layer-1.png'),
      layer2: require('../../../../assets/images/backgrounds/grave/layer-2.png'),
      layer3: require('../../../../assets/images/backgrounds/grave/layer-3.png'),
      layer4: require('../../../../assets/images/backgrounds/grave/layer-4.png'),
      layer5: require('../../../../assets/images/backgrounds/grave/layer-5.png'),
      layer6: require('../../../../assets/images/backgrounds/grave/layer-6.png'),
      layer7: require('../../../../assets/images/backgrounds/grave/layer-7.png'),
    }),
    [],
  )

  const backgroundImages = useMemo(
    () => (['3', '4'].includes(selectedPathId) ? graveImages : factoryImages),
    [selectedPathId, graveImages, factoryImages],
  )

  const customEntities = useMemo(() => ({}), [])

  return (
    <View style={styles.container}>
      {currentScreen === 'intro' && <ChapterIntro onComplete={handleIntroComplete} onBack={handleBackFromIntro} />}
      {currentScreen === 'path' && <PathScreen onComplete={handlePathComplete} onBack={handleBackFromPath} />}
      {currentScreen === 'gameplay' && (
        <Gameplay
          onComplete={handleGameplayComplete}
          onBack={handleBackFromPath}
          selectedCharacter={selectedCharacter!}
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
