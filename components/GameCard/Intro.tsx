import { CreateContext } from '@/context/Context'
import { guideImages, SELECTION_BACKGROUND } from '@/utils/assets'
import React, { useContext } from 'react'
import { Dimensions, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'

const GameCardIntro = () => {
  const { height: SCREEN_HEIGHT } = Dimensions.get('window')
  const { setCurrentOnboardingScreen, selectedGuide, playerName, selectedPersona } =
    useContext(CreateContext).onboarding

  // Get the guide image based on selected guide
  const getGuideImage = (): string => {
    if (selectedGuide?.id && guideImages[selectedGuide.id]) {
      return guideImages[selectedGuide.id]
    }
    // Fallback image
    return 'https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png'
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

  // Get personalized intro message
  const getIntroMessage = (): { greeting: string; explanation: string } => {
    const name = playerName || 'Warrior'
    const guideName = getGuideName()

    return {
      greeting: `Welcome, ${name}. Before we begin, let me explain what lies ahead...`,
      explanation: 'Your journey begins with forging your first undead warrior ...',
    }
  }

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

  // Format persona for display
  const formatPersonaName = (persona: string): string => {
    return persona.replace(/([A-Z])/g, ' $1').trim()
  }

  const handleNext = () => {
    console.log('Moving to game card carousel with:', {
      guide: selectedGuide?.name,
      player: playerName,
      persona: selectedPersona,
    })
    setCurrentOnboardingScreen('game-card-carousel')
  }

  const introContent = getIntroMessage()

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className=" w-full flex flex-row px-8"
          source={require('../../assets/onboarding/dialog-bg-2.png')}
          style={{
            height: 180, // Increased height for input elements
            overflow: 'visible',
          }}
        >
          {/* Guide Image */}
          <View className="w-[30%] relative" style={{ overflow: 'visible' }}>
            <Image
              source={{
                uri: getGuideImage(),
              }}
              className="w-[300px] h-[300px] relative z-20"
              height={280}
              width={280}
              style={{
                position: 'absolute',
                bottom: 0,
                top: -80,
                right: 2,
              }}
            />
          </View>

          {/* Conversation Content */}
          <View className="flex-1 pt-2 pr-4 w-[50%] flex">
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
              <Text className="text-white text-xs text-center font-bold">Oracle</Text>
            </TouchableOpacity>

            {/* Greeting Text */}
            <Text className="text-white pt-4 text-sm leading-4 mb-1">{introContent.greeting}</Text>
            <Text className="text-white text-sm leading-4">{introContent.explanation}</Text>

            <View className="flex flex-row items-center mt-2">
              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleNext}
                // disabled={!currentPlayerName.trim() || isCreating}
                className={` py-2 rounded-xl ml-auto`}
              >
                <ImageBackground
                  source={require('../../assets/onboarding/button-bg-main.png')}
                  // style={styles.welcomeTextContainer}
                  className="flex items-center justify-center py-2 px-8"
                  resizeMode="contain"
                >
                  <Text className={`text-center font-bold text-sm `}>Next</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  )
}

export default GameCardIntro
