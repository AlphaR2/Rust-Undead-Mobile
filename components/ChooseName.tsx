import { toast } from '@/components/ui/Toast'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GameTypewriterPresets, TypewriterText } from './common/Typewrite'

// Import guide images directly
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'

const ChooseName = () => {
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showInputSection, setShowInputSection] = useState(false)

  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    selectedPersona,
    playerName: contextPlayerName,
    setPlayerName: setContextPlayerName,
  } = useContext(CreateContext).onboarding

  // Sync local playerName with contextPlayerName when component mounts or context changes
  useEffect(() => {
    if (contextPlayerName) {
      setPlayerName(contextPlayerName) // Initialize local state with context value
    }
  }, [contextPlayerName])

  // Use local playerName for TextInput
  const currentPlayerName = playerName

  // Skip animation if user already has a name (returning user)
  const shouldSkipAnimation = useMemo(() => !!contextPlayerName, [contextPlayerName])

  // Memoize the greeting text to prevent changes
  const greetingText = useMemo(() => {
    const guideName = selectedGuide?.name
    if (!guideName) return 'Greetings, traveler. Tell me - what shall I call you on this journey?'

    switch (guideName) {
      case 'JANUS THE BUILDER':
        return 'Greetings, traveler. I am Janus, Master of the Foundation. Before we lay the first stone of your journey, tell me - what shall I call you as we build your legend together?'
      case 'JAREK THE ORACLE':
        return 'Welcome, seeker of knowledge. I am Jarek, Keeper of Ancient Wisdom. The threads of destiny have brought you here, but first - whisper your name to the winds of fate.'
      case 'GAIUS THE GUARDIAN':
        return 'Hail, brave soul. I am Gaius, your Shield in this realm. Before I can protect you on this perilous journey, I must know - by what name shall you be known?'
      case 'BRYN THE DAEMON':
        return 'Greetings, future architect of code. I am Bryn, the Flame of Efficiency. Before we optimize your path to greatness, input your identifier - what do they call you?'
      default:
        return selectedGuide?.description || 'Greetings, traveler. Tell me - what shall I call you on this journey?'
    }
  }, [selectedGuide?.name, selectedGuide?.description])

  // Guide-specific title display
  const getGuideTitle = (guideName?: string): string => {
    if (!guideName) return 'GUIDE'

    switch (guideName) {
      case 'JANUS THE BUILDER':
        return 'BUILDER'
      case 'JAREK THE ORACLE':
        return 'ORACLE'
      case 'GAIUS THE GUARDIAN':
        return 'GUARDIAN'
      case 'BRYN THE DAEMON':
        return 'DAEMON'
      default:
        return selectedGuide?.title?.toUpperCase() || 'GUIDE'
    }
  }

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

  // Use useRef to ensure this callback doesn't change
  const handleTypewriterCompleteRef = useRef(() => {
    setShowInputSection(true)
  })

  const handleContinue = async () => {
    const nameToUse = currentPlayerName.trim()

    if (!nameToUse) {
      toast.warning('Name Required', 'Please enter your warrior name')
      return
    }

    if (!selectedPersona) {
      toast.error('Persona Required', 'Please select a persona first')
      return
    }

    setIsCreating(true)

    try {
      // Save to context
      setContextPlayerName(nameToUse)
      setShowSuccess(true)
      setCurrentOnboardingScreen('profile')
      console.log('✅ Player name saved:', nameToUse)
      console.log('Selected guide:', selectedGuide?.name)
      console.log('Selected persona:', selectedPersona)
    } catch (error: any) {
      console.error('❌ Error saving name:', error)
      toast.error('Error', 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  const handleNameChange = (text: string) => {
    setPlayerName(text) // Update local state
    setContextPlayerName(text) // Sync with context
  }

  // Initialize input section visibility for returning users
  useEffect(() => {
    if (shouldSkipAnimation) {
      setShowInputSection(true)
    }
  }, [shouldSkipAnimation])

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className="w-full absolute -bottom-8 right-8 flex flex-row px-8"
          source={require('../assets/onboarding/dialog-bg-2.png')}
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
              <Text className="text-white text-xs text-center font-bold">{getGuideTitle(selectedGuide?.name)}</Text>
            </TouchableOpacity>

            {/* Greeting Text */}
            <TypewriterText
              key={`typewriter-${selectedGuide?.id}`}
              text={greetingText}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-2"
              {...GameTypewriterPresets.dialogue}
              delay={500}
              skipAnimation={shouldSkipAnimation}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {/* Name Input Section - Only show after typewriter completes */}
            {showInputSection && (
              <View className="flex flex-row items-center">
                {/* Input Field */}
                <View className="flex-1">
                  <TextInput
                    value={currentPlayerName}
                    onChangeText={handleNameChange}
                    placeholder="Enter your name..."
                    placeholderTextColor="#666"
                    className="px-4 h-[40px] w-[428px] py-2 bg-[#1A1A1A] rounded-xl text-white"
                    style={{
                      fontSize: 14,
                      backgroundColor: '#1A1A1A',
                    }}
                    maxLength={32}
                    editable={!isCreating}
                  />
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!currentPlayerName.trim() || isCreating}
                  className="ml-2"
                >
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    className="flex items-center w-fit h-fit -right-[90px] relative justify-center py-2 px-8"
                    resizeMode="contain"
                  >
                    <Text
                      className="text-center font-bold text-xl text-black"
                      style={[
                        GameFonts.button,
                        {
                          opacity: currentPlayerName.trim() && !isCreating ? 1 : 0.5,
                        },
                      ]}
                    >
                      {isCreating ? 'Creating...' : 'Continue'}
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

export default ChooseName
