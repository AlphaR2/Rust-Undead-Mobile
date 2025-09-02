import { toast } from '@/components/ui/Toast'
import { CreateContext } from '@/context/Context'
import { GuideImagesType } from '@/types/mobile'
import { guideImages } from '@/utils/assets'
import React, { useContext, useState } from 'react'
import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from 'react-native'

const ChooseName = () => {
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding
  const { selectedGuide, selectedPersona } = useContext(CreateContext).onboarding
  const { playerName: contextPlayerName, setPlayerName: setContextPlayerName } = useContext(CreateContext).onboarding

  // Use context player name or local state
  const currentPlayerName = contextPlayerName || playerName

  const getGuideGreeting = (guideName?: string): string => {
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
  }

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

  // Get the guide image with proper type checking
  const getGuideImage = (): string => {
    if (selectedGuide?.id && selectedGuide.id in guideImages) {
      return guideImages[selectedGuide.id as keyof GuideImagesType]
    }
    return 'https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png'
  }

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

      // Show success toast
      toast.success('Name Chosen!', `Welcome to the realm, ${nameToUse}!`)
      setShowSuccess(true)

      // Navigate to next screen
      setCurrentOnboardingScreen('game-card-intro')

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
    setPlayerName(text)
  }

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      {/* {showSuccess && (
        <ImageBackground
          source={require('../assets/onboarding/name-chosen-dialog-bg.png')}
          className="border p-6 absolute items-center"
          style={{
            // bottom: 10,
            top: -10,
            left: 0,
            right: 0,
          }}
          resizeMode="contain"
        >
          <Text className="text-white text-sm">VICTORY! Name succesfully chosen!</Text>
          <Text className="text-white text-sm">Welcome to te Realm, ‘Name chosen’</Text>
        </ImageBackground>
      )} */}
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className=" w-full flex flex-row px-8"
          source={require('../assets/onboarding/dialog-bg-2.png')}
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
            <Text className="text-white text-sm mt-2 leading-5 mb-4">{getGuideGreeting(selectedGuide?.name)}</Text>

            {/* Name Input Section */}
            <View className="flex flex-row items-center mt-2">
              {/* Input Field */}
              <View className="flex-1">
                <TextInput
                  value={currentPlayerName}
                  onChangeText={handleNameChange}
                  // placeholder="Enter your name..."
                  placeholderTextColor="#D4AF37"
                  className="px-4 py-2 bg-[#1A1A1A]  rounded-xl text-white  "
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
                className={` py-2 rounded-xl ${currentPlayerName.trim() && !isCreating ? '' : ' '}`}
              >
                <ImageBackground
                  source={require('../assets/onboarding/button-bg-main.png')}
                  // style={styles.welcomeTextContainer}
                  className="flex items-center justify-center py-2 px-8"
                  resizeMode="contain"
                >
                  <Text
                    className={`text-center font-bold text-sm ${
                      currentPlayerName.trim() && !isCreating ? 'text-black' : 'text-black'
                    }`}
                  >
                    {isCreating ? 'Creating...' : 'Continue'}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  )
}

export default ChooseName
