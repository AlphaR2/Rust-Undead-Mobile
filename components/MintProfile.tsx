import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'

// Import guide images directly
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from './common/Typewrite'

const ProfileCreation = () => {
  const [showMintButton, setShowMintButton] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  const { setCurrentOnboardingScreen, selectedGuide, playerName, selectedPersona } =
    useContext(CreateContext).onboarding

  // Check if we should skip animation (returning user or already completed previous steps)
  const shouldSkipAnimation = useMemo(() => false, [])

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

  // Get guide-specific on-chain profile dialogue (shortened)
  const getProfileCreationMessage = (): string => {
    const name = playerName || 'Warrior'
    switch (selectedGuide?.name) {
      case 'JANUS THE BUILDER':
        return `${name}, I shall inscribe your essence into the eternal ledger. This ritual will bind your spirit to the blockchain, creating an unbreakable foundation for your legend.`

      case 'JAREK THE ORACLE':
        return `Behold, ${name}! Time to weave your soul into the eternal blockchain. Your digital essence will exist forever in the decentralized cosmos.`

      case 'GAIUS THE GUARDIAN':
        return `${name}, I must anchor your identity to the blockchain's fortress. This will create an indestructible profile that no force can corrupt.`

      case 'BRYN THE DAEMON':
        return `${name}, prepare for optimization. I will compile your identity into Solana's execution layer - distributed immortality through code.`

      default:
        return `${name}, time to inscribe your legend upon the eternal blockchain. Your profile will be sealed within the immutable ledger forever.`
    }
  }

  // Memoize the profile creation message to prevent changes
  const profileMessage = useMemo(() => {
    return getProfileCreationMessage()
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
    setShowMintButton(true)
  })

  // Handle the on-chain profile creation
  const handleForgeProfile = async () => {
    console.log('Forging on-chain profile with:', {
      guide: selectedGuide?.name,
      player: playerName,
      persona: selectedPersona,
    })

    setIsMinting(true)

    try {
      // TODO: Implement Solana program call here
      // Example structure:
      // const profileData = {
      //   playerName,
      //   selectedGuide: selectedGuide?.id,
      //   selectedPersona,
      //   timestamp: Date.now(),
      // }
      //
      // const signature = await createUserProfile(profileData)
      // console.log('Profile created with signature:', signature)

      // Simulate on-chain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Show success feedback
      console.log('✅ On-chain profile successfully forged!')

      setCurrentOnboardingScreen('game-card-intro')
    } catch (error) {
      console.error('❌ Failed to forge profile:', error)
      // Handle error - show toast or error message
    } finally {
      setIsMinting(false)
    }
  }

  // Initialize button visibility for skip animation cases
  React.useEffect(() => {
    if (shouldSkipAnimation) {
      setShowMintButton(true)
    }
  }, [shouldSkipAnimation])

  // Get gamified button text based on guide
  const getButtonText = (): string => {
    if (isMinting) {
      switch (selectedGuide?.name) {
        case 'JANUS THE BUILDER':
          return 'Building...'
        case 'JAREK THE ORACLE':
          return 'Weaving...'
        case 'GAIUS THE GUARDIAN':
          return 'Forging...'
        case 'BRYN THE DAEMON':
          return 'Compiling...'
        default:
          return 'Minting...'
      }
    }

    switch (selectedGuide?.name) {
      case 'JANUS THE BUILDER':
        return 'Build Profile'
      case 'JAREK THE ORACLE':
        return 'Forge Identity'
      case 'GAIUS THE GUARDIAN':
        return 'Forge Identity'
      case 'BRYN THE DAEMON':
        return 'Compile Profile'
      default:
        return 'Mint Profile'
    }
  }

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className="w-full absolute -bottom-8 right-12 flex flex-row px-8"
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
              <Text className="text-white text-xs text-center font-bold">{getGuideTitle()}</Text>
            </TouchableOpacity>

            {/* Profile Creation Message with Typewriter Effect */}
            <TypewriterText
              key={`profile-typewriter-${selectedGuide?.id}`}
              text={profileMessage}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-4"
              {...GameTypewriterPresets.dialogue}
              delay={300}
              skipAnimation={shouldSkipAnimation}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {/* Mint Profile Button Section - Only show after typewriter completes */}
            {showMintButton && (
              <View className="flex flex-row items-center mt-2">
                {/* Forge Profile Button */}
                <TouchableOpacity onPress={handleForgeProfile} disabled={isMinting} className="ml-2">
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    className="flex items-center  w-fit h-fit -right-[240px] -top-12 relative justify-center py-3 px-[140px]"
                    resizeMode="contain"
                  >
                    <Text
                      className="text-center font-bold text-lg text-black"
                      style={[GameFonts.button, { opacity: isMinting ? 0.7 : 1 }]}
                    >
                      {getButtonText()}
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

export default ProfileCreation
