import { toast } from '@/components/ui/Toast'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from 'react-native'
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from './common/Typewrite'

const ChooseName = () => {
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showInputSection, setShowInputSection] = useState(false)

  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    selectedPersona,
    playerName: contextPlayerName,
    setPlayerName: setContextPlayerName,
  } = useContext(CreateContext).onboarding

  // Memoize greeting text
  const greetingText = useMemo(() => {
    const guideName = selectedGuide?.name
    if (!guideName) return 'Hail, brave soul! The necropolis beckons—declare your name to seize your destiny!'
    switch (guideName) {
      case 'JANUS THE BUILDER':
        return 'I am Janus, Forger of the Necropolis! Name yourself, and we shall carve your legend in eternal stone!'
      case 'JAREK THE ORACLE':
        return 'I am Jarek, Seer of the Undead Realm! Speak your name, and let fate bind you to the realm!'
      case 'GAIUS THE GUARDIAN':
        return 'I am Gaius, Shield of the Crypt! Proclaim your name, and command the undead under my guard!'
      case 'BRYN THE DAEMON':
        return 'I am Bryn, Flame of the Digital Void! Input your name, and ignite your path in the realm!'
      default:
        return (
          selectedGuide?.description ||
          'Hail, brave soul! The necropolis beckons—declare your name to seize your destiny!'
        )
    }
  }, [selectedGuide?.name, selectedGuide?.description])

  // Guide title
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

  // Guide image
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

  // Typewriter callback
  const handleTypewriterCompleteRef = useRef(() => {
    setShowInputSection(true)
  })

  // Handle continue
  const handleContinue = async () => {
    const nameToUse = playerName.trim()
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
      setContextPlayerName(nameToUse)
      setCurrentOnboardingScreen('profile')
    } catch (error) {
      toast.error('Error', 'Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  // Handle name change
  const handleNameChange = (text: string) => {
    setPlayerName(text)
    setContextPlayerName(text)
  }

  return (
    <View className="flex-1 h-full w-full justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className="w-full absolute -bottom-8 right-8 flex flex-row px-8"
          source={require('../assets/onboarding/dialog-bg-2.png')}
          style={{ height: 180, overflow: 'visible' }}
        >
          <View className="w-[30%] relative" style={{ overflow: 'visible' }}>
            <Image
              source={getGuideImage()}
              className="w-[290px] h-[320px] relative z-20"
              height={240}
              width={240}
              style={{ position: 'absolute', bottom: -45, right: 25 }}
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
              <Text className="text-white text-xs text-center font-bold">{getGuideTitle(selectedGuide?.name)}</Text>
            </TouchableOpacity>
            <TypewriterText
              key={`typewriter-${selectedGuide?.id}`}
              text={greetingText}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-2"
              {...GameTypewriterPresets.dialogue}
              delay={500}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
            {showInputSection && (
              <View className="flex flex-row items-center">
                <View className="flex-1">
                  <TextInput
                    value={playerName}
                    onChangeText={handleNameChange}
                    placeholder="Enter your name..."
                    placeholderTextColor="#666"
                    className="px-4 h-[40px] w-[428px] py-2 bg-[#1A1A1A] rounded-xl text-white"
                    style={{ fontSize: 14, backgroundColor: '#1A1A1A' }}
                    maxLength={32}
                    editable={!isCreating}
                  />
                </View>
                <TouchableOpacity onPress={handleContinue} disabled={!playerName.trim() || isCreating} className="ml-2">
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    className="flex items-center w-fit h-fit -right-[90px] relative justify-center py-2 px-8"
                    resizeMode="contain"
                  >
                    <Text
                      className="text-center font-bold text-xl text-black"
                      style={[GameFonts.button, { opacity: playerName.trim() && !isCreating ? 1 : 0.5 }]}
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
