import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { router } from 'expo-router'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PERSONA_BACKGROUND from '../../assets/images/bg-assets/bg-03.png'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from '../common/Typewrite'

const GameCardCarousel = () => {
  const { selectedGuide, playerName, selectedPersona } = useContext(CreateContext).onboarding
  const [showEnterButton, setShowEnterButton] = useState(false)

  // Get guide image
  const getGuideImage = () => {
    switch (selectedGuide?.id) {
      case '1':
        return guide1
      case '2':
        return guide2
      case '3':
        return guide3
      case '4':
        return guide4
      default:
        return guide1
    }
  }

  // Get guide name
  const getGuideName = (): string => {
    if (!selectedGuide?.name) return 'Guide'
    switch (selectedGuide.name) {
      case 'JANUS THE BUILDER':
        return 'Janus'
      case 'JAREK THE ORACLE':
        return 'Jarek'
      case 'GAIUS THE GUARDIAN':
        return 'Gaius'
      case 'BRYN THE DAEMON':
        return 'Bryn'
      default:
        return selectedGuide.name.split(' ')[0] || 'Guide'
    }
  }

  // Get guide title for badge
  const getGuideTitle = (): string => {
    if (!selectedGuide?.name) return 'GUIDE'
    switch (selectedGuide.name) {
      case 'JANUS THE BUILDER':
        return 'BUILDER'
      case 'JAREK THE ORACLE':
        return 'ORACLE'
      case 'GAIUS THE GUARDIAN':
        return 'GUARDIAN'
      case 'BRYN THE DAEMON':
        return 'DAEMON'
      default:
        return selectedGuide.title?.toUpperCase() || 'GUIDE'
    }
  }

  // Format persona for display
  const formatPersonaName = (persona: string): string => {
    return persona.replace(/([A-Z])/g, ' $1').trim()
  }

  // Refined intro message
  const getIntroMessage = useMemo((): string => {
    const name = playerName || 'Warrior'
    const personaText = selectedPersona ? ` as a ${formatPersonaName(selectedPersona)}` : ''
    const guideName = getGuideName()

    switch (selectedGuide?.name) {
      case 'JANUS THE BUILDER':
        return `${name}${personaText}, I, ${guideName}, summon you to the necropolis where ancient bones await your craft. Forge your legacy in the eternal shadows. The undead legions kneel before their new master. Enter the Realm now!`
      case 'JAREK THE ORACLE':
        return `${name}${personaText}, I, ${guideName}, see your fate woven in the undead realm. The necropolis stirs with restless spirits awaiting your command. Will you seize your destiny? Enter the Realm!`
      case 'GAIUS THE GUARDIAN':
        return `${name}${personaText}, I, ${guideName}, stand as your shield in the necropolis. The crypts pulse with dark power, ready for your rule. Lead the undead to glory. Enter the Realm!`
      case 'BRYN THE DAEMON':
        return `${name}${personaText}, I, ${guideName}, compile your destiny in the shadowed network. The necropolis boots up, its circuits alive with undead energy. Command the system. Enter the Realm!`
      default:
        return `${name}${personaText}, the necropolis awakens under your gaze. The undead await their master to claim the throne of shadows. Your journey begins. Enter the Realm!`
    }
  }, [playerName, selectedPersona, selectedGuide?.name])

  // Typewriter callback
  const handleTypewriterCompleteRef = useRef(() => {
    console.log('🛠️ Typewriter complete, showing Enter button', {
      playerName,
      selectedPersona,
      guide: selectedGuide?.name,
    })
    setShowEnterButton(true)
  })

  const handleEnterRealm = () => {
    console.log('🚀 Navigating to dashboard', {
      playerName,
      selectedPersona,
      guide: selectedGuide?.name,
    })
    router.push('/dashboard')
  }

  return (
    <ImageBackground className="flex-1" source={PERSONA_BACKGROUND}>
      <View style={styles.blackOverlay} />
      <View className="flex-1 justify-end absolute right-14 bottom-0" style={{ width: '75%' }}>
        <ImageBackground
          className="w-full absolute bottom-3 right-12 flex flex-row px-8"
          source={require('../../assets/onboarding/dialog-bg-2.png')}
          style={{ height: 180, overflow: 'visible' }}
        >
          <View className="w-[30%] relative" style={{ overflow: 'visible' }}>
            <Image
              source={getGuideImage()}
              className="w-[290px] h-[320px] relative z-20"
              height={240}
              width={240}
              style={{ position: 'absolute', bottom: -45, right: 10 }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 pt-2 pr-4 w-[50%]">
            <TouchableOpacity
              className="w-24 p-1 border"
              style={{
                marginTop: -20,
                borderColor: '#c873234d',
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                backgroundColor: 'black',
              }}
              disabled
            >
              <Text className="text-white text-xs text-center font-bold">{getGuideTitle()}</Text>
            </TouchableOpacity>
            <TypewriterText
              key={`typewriter-${selectedGuide?.id}-${playerName}`}
              text={getIntroMessage}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-4"
              {...GameTypewriterPresets.narration}
              delay={300}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
            {showEnterButton && (
              <View className="flex flex-row  relative -right-28 items-center mt-2">
                <TouchableOpacity onPress={handleEnterRealm} className=" ml-4">
                  <ImageBackground
                    source={require('../../assets/onboarding/button-bg-main.png')}
                    className="flex items-center w-fit h-fit -right-[70px] -top-8 absolute justify-center py-3 px-16"
                    resizeMode="contain"
                  >
                    <Text className="text-center font-bold text-lg text-black" style={[GameFonts.button]}>
                      Enter the Realm
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
})

export default GameCardCarousel
