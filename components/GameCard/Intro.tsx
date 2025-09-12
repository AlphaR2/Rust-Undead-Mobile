import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'

// Import guide images directly
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from '../common/Typewrite'

const GameCardIntro = () => {
  const [showNextButton, setShowNextButton] = useState(false)

  const { setCurrentOnboardingScreen, selectedGuide, playerName, selectedPersona } =
    useContext(CreateContext).onboarding

  // Check if we should skip animation (returning user or already completed previous steps)
  const shouldSkipAnimation = useMemo(() => (!playerName ? false : false), [playerName])

  // Get the guide image using direct imports
  const getGuideImage = () => {
    switch (selectedGuide?.id) {
      case '1':
        return guide1 // Janus the Builder
      case '2':
        return guide2 // Jarek the Oracle
      case '3':
        return guide3 // Gaius the Guardian
      case '4':
        return guide4 // Bryn the Daemon
      default:
        return guide1 // Default fallback
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

  // Memoize the intro message to prevent changes
  const introMessage = useMemo(() => {
    const name = playerName || 'Warrior'

    return `Welcome, ${name}. Before we begin, let me explain what lies ahead... Your journey begins with forging your first undead warrior from the essence of ancient powers. This cursed champion will embody your fighting spirit and supernatural gifts.`
  }, [playerName, selectedGuide?.name])

  // Get the guide's first name for speaking
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

  // Use useRef to ensure this callback doesn't change
  const handleTypewriterCompleteRef = useRef(() => {
    setShowNextButton(true)
  })

  const handleNext = () => {
    console.log('Moving to game card carousel with:', {
      guide: selectedGuide?.name,
      player: playerName,
      persona: selectedPersona,
    })
    setCurrentOnboardingScreen('game-card-carousel')
  }

  // Initialize button visibility for skip animation cases
  React.useEffect(() => {
    if (shouldSkipAnimation) {
      setShowNextButton(true)
    }
  }, [shouldSkipAnimation])

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className="w-full absolute -bottom-8 right-8 flex flex-row px-8"
          source={require('../../assets/onboarding/dialog-bg-2.png')}
          style={{
            height: 180,
            overflow: 'visible',
          }}
        >
          {/* Guide Image */}
          <View className="w-[30%] relative" style={{ overflow: 'visible' }}>
            <Image
              source={getGuideImage()}
              className="w-[290px] h-[320px] relative z-20"
              height={240}
              width={240}
              style={{
                position: 'absolute',
                bottom: -45,
                right: 25,
              }}
              resizeMode="contain"
            />
          </View>

          {/* Conversation Content */}
          <View className="flex-1 pt-2 pr-4 w-[50%]">
            {/* Guide Title Badge */}
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

            {/* Greeting Text with Typewriter Effect */}
            <TypewriterText
              key={`intro-typewriter-${selectedGuide?.id}`}
              text={introMessage}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-4"
              {...GameTypewriterPresets.narration}
              delay={300}
              skipAnimation={shouldSkipAnimation}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {/* Continue Button Section - Only show after typewriter completes */}
            {showNextButton && (
              <View className="flex flex-row items-center mt-2">
                {/* Continue Button */}
                <TouchableOpacity onPress={handleNext} className="ml-2">
                  <ImageBackground
                    source={require('../../assets/onboarding/button-bg-main.png')}
                    className="flex items-center w-fit h-fit -right-[90px] -top-12 absolute justify-center py-2 px-8"
                    resizeMode="contain"
                  >
                    <Text className="text-center font-bold text-xl text-black" style={[GameFonts.button]}>
                      Next
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    </View>
  )
}

export default GameCardIntro
