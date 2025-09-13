import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { createUserProfile, UserProfileResult } from '@/hooks/useGameActions'
import { useGameData } from '@/hooks/useGameData'
import { useCurrentWallet, usePDAs, useUndeadProgram, useWalletInfo } from '@/hooks/useUndeadProgram'
import { UserPersona } from '@/types/undead'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from './common/Typewrite'
import { toast } from './ui/Toast'

// Guide data (for matching existing profile's guide)
const GUIDES = [
  {
    id: '1',
    name: 'JANUS THE BUILDER',
    title: 'Validator Master',
    type: 'Balanced',
    description:
      'I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you’ll understand how consensus creates unshakeable truth.',
    specialty: 'Validators, consensus, foundation concepts',
    recommendedFor: 'Complete beginners who want solid fundamentals',
    learningStyle: 'Step-by-step, methodical building of knowledge',
    color: '#cd7f32',
  },
  {
    id: '2',
    name: 'JAREK THE ORACLE',
    title: 'Knowledge Keeper',
    type: 'Advanced',
    description:
      'I am Jarek, Keeper of Ancient Wisdom. The deepest secrets of this realm flow through my consciousness like rivers of pure knowledge.',
    specialty: 'Advanced concepts, technical deep-dives, ecosystem insights',
    recommendedFor: 'Technical backgrounds who want comprehensive understanding',
    learningStyle: 'Mystical wisdom, interconnected learning, big picture thinking',
    color: '#4169E1',
  },
  {
    id: '3',
    name: 'GAIUS THE GUARDIAN',
    title: 'Protector of Assets',
    type: 'Security',
    description:
      'I am Gaius, Shield of the Realm. I guard against the dark forces that would steal your digital treasures and corrupt your transactions.',
    specialty: 'Security, wallets, protection strategies, best practices',
    recommendedFor: 'Security-conscious learners who want to stay safe',
    learningStyle: 'Protective approach, risk awareness, practical safety',
    color: '#228B22',
  },
  {
    id: '4',
    name: 'BRYN THE DAEMON',
    title: 'Code Compiler',
    type: 'Technical',
    description:
      'I am Bryn, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.',
    specialty: 'Technical implementation, smart contracts, development',
    recommendedFor: 'Developers and power users who want to build',
    learningStyle: 'Aggressive optimization, technical precision, implementation focus',
    color: '#DC143C',
  },
]

const ProfileCreation = () => {
  const [showMintButton, setShowMintButton] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [profileCreationError, setProfileCreationError] = useState('')
  const [profileCreated, setProfileCreated] = useState(false)

  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    playerName,
    selectedPersona,
    setPlayerName,
    setSelectedGuide,
    setSelectedPersona,
  } = useContext(CreateContext).onboarding
  const { publicKey, isConnected } = useWalletInfo()
  const { address: walletAddress, name: walletName } = useCurrentWallet()
  const { program } = useUndeadProgram()
  const { profilePda, getUsernameRegistryPda } = usePDAs(publicKey)
  const { userProfile } = useGameData()

  // Sync userProfile with CreateContext and navigate if profile exists
  useEffect(() => {
    if (userProfile?.username) {
      setPlayerName(userProfile.username)
      setSelectedPersona(userProfile.userPersona || 'BoneSmith')
      const matchingGuide = GUIDES.find((guide) => guide.name === 'JANUS THE BUILDER') || GUIDES[0]
      setSelectedGuide(matchingGuide)
      console.log('🚀 Navigating to game-card-intro for existing user:', userProfile.username)
      setCurrentOnboardingScreen('game-card-intro')
    } else {
      console.log('🛠️ ProfileCreation: No existing user profile found')
    }
  }, [userProfile, setPlayerName, setSelectedPersona, setSelectedGuide, setCurrentOnboardingScreen])

  // Convert selectedPersona to UserPersona enum
  const getUserPersona = (): UserPersona => {
    switch (selectedPersona?.toLowerCase()) {
      case 'bonesmith':
      case 'bone_smith':
        return UserPersona.BoneSmith
      case 'cerberus':
        return UserPersona.Cerberus
      case 'treasure_hunter':
      case 'treasurehunter':
        return UserPersona.TreasureHunter
      case 'obsidian_prophet':
      case 'obsidianprophet':
        return UserPersona.ObsidianProphet
      case 'grave_baron':
      case 'gravebaron':
        return UserPersona.GraveBaron
      case 'demeter':
        return UserPersona.Demeter
      case 'collector':
        return UserPersona.Collector
      case 'coven_caller':
      case 'covencaller':
        return UserPersona.CovenCaller
      case 'seer_of_ash':
      case 'seerofash':
        return UserPersona.SeerOfAsh
      default:
        return UserPersona.BoneSmith
    }
  }

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

  const getProfileCreationMessage = (): string => {
    const name = playerName || 'Warrior'
    switch (selectedGuide?.name) {
      case 'JANUS THE BUILDER':
        return `${name}, the Necropolis awaits your mark! Forge your identity forever in the eternal stone, where your legend will stand unyielding against the tides of time!`
      case 'JAREK THE ORACLE':
        return `${name}, the realm summons your essence! Bind your soul to the undying scroll of fate, where ancient spirits will chant your name through the ages!`
      case 'GAIUS THE GUARDIAN':
        return `${name}, the Crypt demands your vow! Anchor your name in the blockchain’s unbreachable fortress, shielded eternally by the might of the undead realm!`
      case 'BRYN THE DAEMON':
        return `${name}, the Digital Void calls! Ignite your essence and compile your identity into the immortal flame, forever blazing in the heart of the realm!`
      default:
        return `${name}, the Necropolis opens its gates! Etch your destiny upon the blockchain’s eternal ledger, where your legend will rise immortal in the realm of shadows!`
    }
  }

  // Memoize profile message
  const profileMessage = useMemo(() => getProfileCreationMessage(), [playerName, selectedGuide?.name])

  // Get guide-specific success message
  const getGuideSuccessMessage = (): string => {
    switch (selectedGuide?.name) {
      case 'JANUS THE BUILDER':
        return 'Your foundation has been built!'
      case 'JAREK THE ORACLE':
        return 'Your essence flows through the blockchain!'
      case 'GAIUS THE GUARDIAN':
        return 'Your identity is protected!'
      case 'BRYN THE DAEMON':
        return 'Your profile has been compiled!'
      default:
        return 'Your legend is inscribed!'
    }
  }

  // Typewriter complete callback
  const handleTypewriterCompleteRef = useRef(() => {
    setShowMintButton(true)
  })

  // Handle profile creation
  const handleForgeProfile = async () => {
    // Skip creation if user already has a profile
    if (userProfile?.username) {
      console.log(
        '🚀 Skipping profile creation, navigating to game-card-intro for existing user:',
        userProfile.username,
      )
      setCurrentOnboardingScreen('game-card-intro')
      return
    }

    if (!isConnected) {
      toast.error('Wallet Required', 'Please connect your wallet to create a profile.')
      return
    }

    if (!program || !publicKey || !playerName || !selectedPersona) {
      setProfileCreationError('Please ensure wallet is connected and all fields are filled')
      toast.error('Error', 'Please ensure wallet is connected and all fields are filled')
      return
    }

    if (!profilePda || !getUsernameRegistryPda) {
      setProfileCreationError('Unable to generate profile addresses')
      toast.error('Error', 'Unable to generate profile addresses')
      return
    }

    setIsMinting(true)
    setProfileCreationError('')

    try {
      const userRegistryPda = getUsernameRegistryPda(playerName)
      const userPersona = getUserPersona()

      const result: UserProfileResult = await createUserProfile({
        program,
        userPublicKey: publicKey,
        username: playerName,
        userPersona,
        profilePda,
        userRegistryPda,
        sessionInfo: null,
      })

      if (result.success) {
        console.log('✅ Profile created successfully:', result.signature)
        setProfileCreated(true)
        // Update CreateContext with new profile data
        setPlayerName(playerName)
        setSelectedGuide(selectedGuide || GUIDES[0])
        setSelectedPersona(selectedPersona || 'BoneSmith')
        console.log('🛠️ Updated CreateContext:', {
          username: playerName,
          guide: selectedGuide?.name,
          persona: selectedPersona,
        })
        // Navigate to next screen
        setCurrentOnboardingScreen('game-card-intro')
        toast.success('Success', getGuideSuccessMessage())
      } else {
        setProfileCreationError(result.error || 'Failed to create profile')
        toast.error('Error', result.error || 'Failed to create profile')
      }
    } catch (error: any) {
      console.error('❌ Error creating user profile:', error)
      setProfileCreationError(error.message || 'Unexpected error occurred. Please try again.')
      toast.error('Error', error.message || 'Unexpected error occurred. Please try again.')
    } finally {
      setIsMinting(false)
    }
  }

  // Get button text
  const getButtonText = (): string => {
    if (!isConnected) return 'Connect Wallet First'
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
          return 'Creating...'
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
        return 'Create Profile'
    }
  }

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <View className="flex-1 justify-end" style={{ width: '85%' }}>
        <ImageBackground
          className="w-full absolute -bottom-8 right-12 flex flex-row px-8"
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
              <Text className="text-white text-xs text-center font-bold">{getGuideTitle()}</Text>
            </TouchableOpacity>
            <TypewriterText
              key={`profile-typewriter-${selectedGuide?.id}`}
              text={profileMessage}
              style={[GameFonts.body]}
              className="text-white mt-2 leading-8 mb-4"
              {...GameTypewriterPresets.dialogue}
              delay={300}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {showMintButton && (
              <View className="flex flex-row items-center mt-2">
                <TouchableOpacity onPress={handleForgeProfile} disabled={isMinting || !isConnected} className="ml-2">
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    className="flex items-center w-fit h-fit left-[360px] -top-4 absolute justify-center py-3 px-8"
                    resizeMode="contain"
                  >
                    <Text
                      className="text-center font-bold text-lg text-black"
                      style={[GameFonts.button, { opacity: isMinting || !isConnected ? 0.7 : 1 }]}
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
