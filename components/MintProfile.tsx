import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import { createUserProfile, UserProfileResult } from '@/hooks/useGameActions'
import { useUndeadProgram, useWalletInfo } from '@/hooks/useUndeadProgram'
import { usePDAs } from '@/hooks/utils/useHelpers'
import { UserPersona } from '@/types/undead'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText, TypewriterTextRef } from './common/Typewrite'
import { toast } from './ui/Toast'

const GUIDES = [
  {
    id: '1',
    name: 'JANUS THE BUILDER',
    title: 'Validator Master',
    type: 'Balanced',
    description:
      'I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you will understand how consensus creates unshakeable truth',
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

  const typewriterRef = useRef<TypewriterTextRef>(null)

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
  const { program } = useUndeadProgram()
  const { profilePda, getUsernameRegistryPda } = usePDAs(publicKey)
  const { userProfile, refreshData } = useBasicGameData()

  useEffect(() => {
    if (userProfile?.username) {
      setPlayerName(userProfile.username)
      setSelectedPersona(userProfile.userPersona || UserPersona.TreasureHunter)
      const matchingGuide = GUIDES.find((guide) => guide.name === 'JANUS THE BUILDER') || GUIDES[0]
      setSelectedGuide(matchingGuide)
      setCurrentOnboardingScreen('game-card-intro')
    }
  }, [userProfile, setPlayerName, setSelectedPersona, setSelectedGuide, setCurrentOnboardingScreen])

  const getUserPersona = (): UserPersona => {
    const personaMap: Record<string, UserPersona> = {
      bonesmith: UserPersona.BoneSmith,
      bone_smith: UserPersona.BoneSmith,
      cerberus: UserPersona.Cerberus,
      treasure_hunter: UserPersona.TreasureHunter,
      treasurehunter: UserPersona.TreasureHunter,
      obsidian_prophet: UserPersona.ObsidianProphet,
      obsidianprophet: UserPersona.ObsidianProphet,
      grave_baron: UserPersona.GraveBaron,
      gravebaron: UserPersona.GraveBaron,
      demeter: UserPersona.Demeter,
      collector: UserPersona.Collector,
      coven_caller: UserPersona.CovenCaller,
      covencaller: UserPersona.CovenCaller,
      seer_of_ash: UserPersona.SeerOfAsh,
      seerofash: UserPersona.SeerOfAsh,
    }

    return personaMap[selectedPersona?.toLowerCase() || ''] || UserPersona.BoneSmith
  }

  const getGuideImage = () => {
    const imageMap: Record<string, any> = {
      '1': guide1,
      '2': guide2,
      '3': guide3,
      '4': guide4,
    }
    return imageMap[selectedGuide?.id || '1'] || guide1
  }

  const getGuideTitle = (): string => {
    if (!selectedGuide?.name) return 'GUIDE'

    const titleMap: Record<string, string> = {
      'JANUS THE BUILDER': 'BUILDER',
      'JAREK THE ORACLE': 'ORACLE',
      'GAIUS THE GUARDIAN': 'GUARDIAN',
      'BRYN THE DAEMON': 'DAEMON',
    }

    return titleMap[selectedGuide.name] || selectedGuide.title?.toUpperCase() || 'GUIDE'
  }

  const getProfileCreationMessage = (): string => {
    const name = playerName || 'Warrior'
    const messageMap: Record<string, string> = {
      'JANUS THE BUILDER': `${name}, the Necropolis awaits your mark! Forge your identity forever in the eternal stone, where your legend will stand unyielding against the tides of time!`,
      'JAREK THE ORACLE': `${name}, the realm summons your essence! Bind your soul to the undying scroll of fate, where ancient spirits will chant your name through the ages!`,
      'GAIUS THE GUARDIAN': `${name}, the Crypt demands your vow! Anchor your name in the blockchain's unbreachable fortress, shielded eternally by the might of the undead realm!`,
      'BRYN THE DAEMON': `${name}, the Digital Void calls! Ignite your essence and compile your identity into the immortal flame, forever blazing in the heart of the realm!`,
    }

    return (
      messageMap[selectedGuide?.name || ''] ||
      `${name}, the Necropolis opens its gates! Etch your destiny upon the blockchain's eternal ledger, where your legend will rise immortal in the realm of shadows!`
    )
  }

  const profileMessage = useMemo(() => getProfileCreationMessage(), [playerName, selectedGuide?.name])

  const getGuideSuccessMessage = (): string => {
    const successMap: Record<string, string> = {
      'JANUS THE BUILDER': 'Your foundation has been built!',
      'JAREK THE ORACLE': 'Your essence flows through the blockchain!',
      'GAIUS THE GUARDIAN': 'Your identity is protected!',
      'BRYN THE DAEMON': 'Your profile has been compiled!',
    }

    return successMap[selectedGuide?.name || ''] || 'Your legend is inscribed!'
  }

  const handleTypewriterCompleteRef = useRef(() => {
    setShowMintButton(true)
  })

  const handleScreenTap = () => {
    if (!showMintButton) {
      typewriterRef.current?.skipToEnd()
    }
  }

  const handleForgeProfile = async () => {
    if (userProfile?.username) {
      toast.info('Debug', 'User profile already exists')
      setCurrentOnboardingScreen('game-card-intro')
      return
    }

    if (!isConnected) {
      toast.error('Wallet Required', 'Please connect your wallet to create a profile.')
      return
    }

    if (!program || !publicKey) {
      toast.error('Error', 'Please ensure your wallet is connected')
      return
    }

    if (!playerName?.trim()) {
      toast.error('Error', 'Please enter a username')
      return
    }

    if (playerName.trim().length > 32) {
      setProfileCreationError('Username must be 32 characters or less')
      toast.error('Error', 'Username must be 32 characters or less')
      return
    }

    if (!selectedPersona) {
      setProfileCreationError('Please select a persona')
      toast.error('Error', 'Please select a persona')
      return
    }

    if (!profilePda) {
      setProfileCreationError('Unable to generate profile address')
      toast.error('Error', 'Unable to generate profile address')
      return
    }

    const userRegistryPda = getUsernameRegistryPda?.(playerName.trim())
    if (!userRegistryPda) {
      setProfileCreationError('Unable to generate username registry address')
      toast.error('Error', 'Unable to generate username registry address')
      return
    }

    setIsMinting(true)
    setProfileCreationError('')

    try {
      const userPersona = getUserPersona()

      // console.log('Creating profile with:', {
      //   username: playerName.trim(),
      //   userPersona,
      //   publicKey,
      //   profilePda: profilePda.toBase58(),
      //   userRegistryPda: userRegistryPda.toBase58(),
      // })

      const result: UserProfileResult = await createUserProfile({
        program,
        userPublicKey: publicKey,
        username: playerName.trim(),
        userPersona,
        profilePda,
        userRegistryPda,
      })

      if (result.success) {
        setProfileCreated(true)
        toast.success('Success', getGuideSuccessMessage())

        await refreshData()

        setCurrentOnboardingScreen('game-card-intro')
      } else {
        const errorMsg = result.error || 'Failed to create profile'
        setProfileCreationError(errorMsg)
        toast.error('Profile Creation Failed', errorMsg)
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unexpected error occurred. Please try again.'
      setProfileCreationError(errorMessage)
      toast.error('Error', errorMessage)
    } finally {
      setIsMinting(false)
    }
  }

  const getButtonText = (): string => {
    if (!isConnected) return 'Connect Wallet First'

    if (isMinting) {
      const loadingMap: Record<string, string> = {
        'JANUS THE BUILDER': 'Building...',
        'JAREK THE ORACLE': 'Weaving...',
        'GAIUS THE GUARDIAN': 'Forging...',
        'BRYN THE DAEMON': 'Compiling...',
      }
      return loadingMap[selectedGuide?.name || ''] || 'Creating...'
    }

    const buttonMap: Record<string, string> = {
      'JANUS THE BUILDER': 'Build Profile',
      'JAREK THE ORACLE': 'Forge Identity',
      'GAIUS THE GUARDIAN': 'Forge Identity',
      'BRYN THE DAEMON': 'Compile Profile',
    }

    return buttonMap[selectedGuide?.name || ''] || 'Create Profile'
  }

  const isButtonDisabled = isMinting || !isConnected || !playerName?.trim()

  return (
    <View style={styles.container}>
      <Pressable style={styles.contentWrapper} onPress={handleScreenTap}>
        <ImageBackground style={styles.dialogBackground} source={require('../assets/onboarding/dialog-bg-2.png')}>
          <View style={styles.guideImageContainer}>
            <Image source={getGuideImage()} style={styles.guideImage} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <TouchableOpacity style={styles.badge} disabled>
              <Text style={styles.badgeText}>{getGuideTitle()}</Text>
            </TouchableOpacity>
            <TypewriterText
              ref={typewriterRef}
              key={`profile-typewriter-${selectedGuide?.id}`}
              text={profileMessage}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.dialogue}
              delay={300}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {showMintButton && (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  onPress={handleForgeProfile}
                  disabled={isButtonDisabled}
                  style={styles.buttonTouchable}
                >
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    style={styles.buttonBackground}
                    resizeMode="contain"
                  >
                    <Text style={[GameFonts.button, styles.buttonText, { opacity: isButtonDisabled ? 0.5 : 1 }]}>
                      {getButtonText()}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  dialogBackground: {
    width: '100%',
    position: 'absolute',
    bottom: -8,
    left: 36,
    flexDirection: 'row',
    height: 180,
    overflow: 'visible',
  },
  guideImageContainer: {
    width: '30%',
    position: 'relative',
    overflow: 'visible',
  },
  guideImage: {
    width: 280,
    height: 320,
    position: 'absolute',
    bottom: -54,
    right: 25,
    zIndex: 20,
  },
  textContainer: {
    flex: 1,
    paddingTop: 8,
    paddingRight: 16,
    width: '50%',
  },
  badge: {
    width: 96,
    padding: 4,
    marginTop: -20,
    borderColor: '#c873234d',
    borderWidth: 1,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: 'black',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  typewriterText: {
    color: 'white',
    marginTop: 8,
    lineHeight: 32,
    marginBottom: 16,
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  buttonTouchable: {
    marginLeft: 8,
    width: '100%',
  },
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    marginLeft: 170,
    top: -35,
    left: 32,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
})

export default ProfileCreation
