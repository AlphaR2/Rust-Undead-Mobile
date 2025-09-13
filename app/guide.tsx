import ChooseName from '@/components/ChooseName'
import GameCardCarousel from '@/components/GameCard/GameCardCarousel'
import GameCardIntro from '@/components/GameCard/Intro'
import CharacterSelection from '@/components/GuideCarousel'
import ProfileCreation from '@/components/MintProfile'
import PersonaSelectionScreen from '@/components/Persona'
import WarriorProfileSetup from '@/components/warrior/WarriorProfileSetup'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { useGameData } from '@/hooks/useGameData'
import { router, useNavigation } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import {
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import WELCOME_BACKGROUND from '../assets/images/bg-assets/bg-01.png'
import SELECTION_BACKGROUND from '../assets/images/bg-assets/bg-02.png'
import PERSONA_BACKGROUND from '../assets/images/bg-assets/bg-03.png'
import PROFILE_BACKGROUND from '../assets/images/bg-assets/bg-04.png'
import PRO_BACKGROUND from '../assets/images/bg-assets/bg-099.png'

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Guide data
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

const GuideSelection = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen, setSelectedGuide, setPlayerName, setSelectedPersona } =
    useContext(CreateContext).onboarding
  const { userProfile } = useGameData()
  const navigation = useNavigation()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [textDelayAnim] = useState(new Animated.Value(0))

  // Sync userProfile with CreateContext
  useEffect(() => {
    if (userProfile?.username) {
      setPlayerName(userProfile.username)
      setSelectedPersona(userProfile.userPersona || '')
      const matchingGuide = GUIDES.find((guide) => guide.name === 'JANUS THE BUILDER') || GUIDES[0]
      setSelectedGuide(matchingGuide)
    } else {
    }
  }, [userProfile, setPlayerName, setSelectedPersona, setSelectedGuide])

  // Start welcome animation on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      startWelcomeAnimation()
    })
  }, [])

  // Start selection animation when screen changes
  useEffect(() => {
    if (currentOnboardingScreen === 'selection') {
      requestAnimationFrame(() => {
        startSelectionAnimation()
      })
    }
  }, [currentOnboardingScreen])

  // Animation for welcome screen
  const startWelcomeAnimation = () => {
    fadeAnim.setValue(1)
    slideAnim.setValue(0)
    textDelayAnim.setValue(0)

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textDelayAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start()
    }, 2000)
  }

  // Animation for selection screen
  const startSelectionAnimation = () => {
    fadeAnim.setValue(0)
    slideAnim.setValue(50)

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Handle navigation to next screen
  const handleNext = () => {
    if (userProfile?.username) {
      console.log('🚀 Navigating to game-card-intro for existing user:', userProfile.username)
      setCurrentOnboardingScreen('game-card-intro')
    } else {
      console.log('🚀 Navigating to selection for new user')
      setCurrentOnboardingScreen('selection')
    }
  }

  // Handle back navigation
  const handleBack = () => {
    switch (currentOnboardingScreen) {
      case 'selection':
        setCurrentOnboardingScreen('welcome')
        break
      case 'persona':
        setCurrentOnboardingScreen('selection')
        break
      case 'name':
        setCurrentOnboardingScreen('persona')
        break
      case 'game-card-intro':
        setCurrentOnboardingScreen('name')
        break
      case 'game-card-carousel':
        setCurrentOnboardingScreen('game-card-intro')
        break
      case 'warrior-profile':
        setCurrentOnboardingScreen('game-card-carousel')
        break
      default:
        if (navigation.canGoBack()) {
          router.back()
        } else {
          router.replace('/intro')
          setCurrentOnboardingScreen('welcome')
        }
        break
    }
  }

  // Determine if back button should be shown
  const shouldShowBackButton = currentOnboardingScreen !== 'welcome'

  // Back Button Component
  const BackButton = () => (
    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
      <View style={styles.backButtonContainer}>
        <Text style={styles.backButtonIcon}>←</Text>
      </View>
    </TouchableOpacity>
  )

  // Welcome screen
  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <ImageBackground source={WELCOME_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <View className="flex flex-col items-center gap-y-[-30px]">
            <Animated.View
              style={[
                {
                  opacity: textDelayAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ImageBackground
                source={require('../assets/onboarding/dialog-bg-1.png')}
                style={styles.titleContainer}
                className="p-3 mt-5"
                resizeMode="contain"
              >
                <Text className="text-base text-[#E0E0E0]" style={[GameFonts.epic]}>
                  Choose your guide
                </Text>
              </ImageBackground>
              <ImageBackground
                source={require('../assets/onboarding/dialog-bg-2.png')}
                style={styles.welcomeTextContainer}
                className="p-24"
                resizeMode="contain"
              >
                <Text style={[styles.welcomeText, GameFonts.bodyMedium]} className="">
                  Four legendary undead masters await to guide you through the mysteries of blockchain.
                </Text>
              </ImageBackground>
            </Animated.View>
            <Animated.View style={[{ opacity: textDelayAnim }]}>
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                <ImageBackground
                  source={require('../assets/onboarding/button-bg-main.png')}
                  className="py-6 px-12 flex"
                  resizeMode="contain"
                >
                  <Text style={[GameFonts.button]}>
                    {userProfile?.username ? 'Continue Journey' : 'Meet the Guides'}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Guide selection screen
  const renderGuideSelection = () => (
    <View style={styles.container}>
      <ImageBackground source={SELECTION_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay2} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <View style={styles.selectionContainer}>
              <Animated.View
                style={[
                  styles.selectionHeader,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              />
              <View style={styles.carouselWrapper}>
                <CharacterSelection />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Persona selection screen
  const renderPersonaScreen = () => (
    <View style={styles.container}>
      <ImageBackground source={PERSONA_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay3} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <PersonaSelectionScreen />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Name input screen
  const renderInputScreen = () => (
    <View style={styles.container}>
      <ImageBackground source={PRO_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay2} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            />
            <View style={styles.nameInputWrapper}>
              <ChooseName />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Profile creation screen
  const renderMintProfile = () => (
    <View style={styles.container}>
      <ImageBackground source={PRO_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay2} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            />
            <View style={styles.nameInputWrapper}>
              <ProfileCreation />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Game card intro screen
  const renderGameCardIntroScreen = () => (
    <View style={styles.container}>
      <ImageBackground source={PROFILE_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            />
            <View style={styles.nameInputWrapper}>
              <GameCardIntro />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  // Game card carousel screen
  const renderGameCardCarouselScreen = () => (
    <View style={styles.container}>
      {shouldShowBackButton && (
        <View style={styles.absoluteBackButton}>
          <BackButton />
        </View>
      )}
      <GameCardCarousel />
    </View>
  )

  // Warrior profile setup screen
  const renderWarriorProfileSetupScreen = () => (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu',
        }}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          {shouldShowBackButton && <BackButton />}
          <View style={styles.content}>
            <WarriorProfileSetup />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )

  return currentOnboardingScreen === 'welcome'
    ? renderWelcomeScreen()
    : currentOnboardingScreen === 'selection'
      ? renderGuideSelection()
      : currentOnboardingScreen === 'persona'
        ? renderPersonaScreen()
        : currentOnboardingScreen === 'name'
          ? renderInputScreen()
          : currentOnboardingScreen === 'profile'
            ? renderMintProfile()
            : currentOnboardingScreen === 'game-card-intro'
              ? renderGameCardIntroScreen()
              : currentOnboardingScreen === 'game-card-carousel'
                ? renderGameCardCarouselScreen()
                : renderWarriorProfileSetupScreen()
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '125%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  overlay2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlay3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.79)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  backButton: {
    position: 'absolute',
    left: 9,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonIcon: {
    fontSize: 36,
    color: '#cd7f32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  absoluteBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
  },
  welcomeWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#cd7f32',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  titleUnderline: {
    width: SCREEN_WIDTH * 0.6,
    height: 3,
    backgroundColor: '#cd7f32',
    marginTop: 15,
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  welcomeText: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  selectionHeader: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#E0E0E0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  carouselWrapper: {
    flex: 1,
  },
  nameInputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  selectionContent: {
    flex: 1,
  },
  carouselContainer: {
    height: 200,
    marginBottom: 20,
  },
  carousel: {
    flex: 1,
  },
  guideCard: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  guideAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 20,
  },
  guideInitial: {
    fontSize: 48,
  },
  guideName: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  detailsPanel: {
    flex: 1,
    paddingHorizontal: 10,
  },
  detailsCard: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
    borderWidth: 2,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    color: '#cd7f32',
    textAlign: 'center',
    marginBottom: 5,
  },
  detailsType: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  detailsLabel: {
    fontSize: 14,
    color: '#cd7f32',
    marginBottom: 5,
  },
  detailsValue: {
    fontSize: 14,
    color: '#C0C0C0',
    lineHeight: 18,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: '#121212',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#cd7f32',
    minWidth: 200,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#121212',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#cd7f32',
    textAlign: 'center',
    letterSpacing: 1,
  },
})

export default GuideSelection
