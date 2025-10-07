import ChooseName from '@/components/ChooseName'
import GameCardCarousel from '@/components/GameCard/GameCardCarousel'
import GameCardIntro from '@/components/GameCard/Intro'
import CharacterSelection from '@/components/GuideCarousel'
import ProfileCreation from '@/components/MintProfile'
import PersonaSelectionScreen from '@/components/Persona'
import WarriorProfileSetup from '@/components/warrior/WarriorProfileSetup'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import { router, useNavigation } from 'expo-router'
import React, { JSX, useContext, useEffect, useState } from 'react'
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

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const GUIDES = [
  {
    id: '1',
    name: 'JANUS THE BUILDER',
    title: 'Validator Master',
    type: 'Balanced',
    description:
      'I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you will understand how consensus creates unshakeable truth.',
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

const ANIMATION_DURATION_LONG = 1000
const ANIMATION_DURATION_SHORT = 800
const ANIMATION_DELAY = 2000

type OnboardingScreen =
  | 'welcome'
  | 'selection'
  | 'persona'
  | 'name'
  | 'profile'
  | 'game-card-intro'
  | 'game-card-carousel'

const GuideSelection = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen, setSelectedGuide, setPlayerName, setSelectedPersona } =
    useContext(CreateContext).onboarding
  const { userProfile } = useBasicGameData()
  const navigation = useNavigation()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [textDelayAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (userProfile?.username) {
      setPlayerName(userProfile.username)
      setSelectedPersona(userProfile.userPersona || '')
      const matchingGuide = GUIDES.find((guide) => guide.name === 'JANUS THE BUILDER') || GUIDES[0]
      setSelectedGuide(matchingGuide)
    }
  }, [userProfile, setPlayerName, setSelectedPersona, setSelectedGuide])

  useEffect(() => {
    requestAnimationFrame(() => {
      startWelcomeAnimation()
    })
  }, [])

  useEffect(() => {
    if (currentOnboardingScreen === 'selection') {
      requestAnimationFrame(() => {
        startSelectionAnimation()
      })
    }
  }, [currentOnboardingScreen])

  const startWelcomeAnimation = () => {
    fadeAnim.setValue(1)
    slideAnim.setValue(0)
    textDelayAnim.setValue(0)

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textDelayAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION_LONG,
          useNativeDriver: true,
        }),
      ]).start()
    }, ANIMATION_DELAY)
  }

  const startSelectionAnimation = () => {
    fadeAnim.setValue(0)
    slideAnim.setValue(50)

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION_LONG,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION_SHORT,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleNext = () => {
    if (userProfile?.username) {
      router.push('/dashboard')
      // setCurrentOnboardingScreen('game-card-intro')
    } else {
      setCurrentOnboardingScreen('selection')
    }
  }

  const handleBack = () => {
    const backMap: Record<OnboardingScreen, OnboardingScreen | 'default'> = {
      welcome: 'default',
      selection: 'welcome',
      persona: 'selection',
      name: 'persona',
      profile: 'name',
      'game-card-intro': 'name',
      'game-card-carousel': 'game-card-intro',
    }

    const nextScreen = backMap[currentOnboardingScreen as OnboardingScreen]

    if (nextScreen === 'default') {
      if (navigation.canGoBack()) {
        router.back()
      } else {
        router.replace('/intro')
        setCurrentOnboardingScreen('welcome')
      }
    } else {
      setCurrentOnboardingScreen(nextScreen as OnboardingScreen)
    }
  }

  const shouldShowBackButton = currentOnboardingScreen !== 'welcome'

  const BackButton = () => (
    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
      <View style={styles.backButtonContainer}>
        <Text style={styles.backButtonIcon}>←</Text>
      </View>
    </TouchableOpacity>
  )

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <ImageBackground source={WELCOME_BACKGROUND} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.welcomeContentWrapper}>
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
                resizeMode="contain"
              >
                <Text style={[GameFonts.epic, styles.titleText]}>Choose your guide</Text>
              </ImageBackground>
              <ImageBackground
                source={require('../assets/onboarding/dialog-bg-2.png')}
                style={styles.welcomeTextContainer}
                resizeMode="contain"
              >
                <Text style={[styles.welcomeText, GameFonts.bodyMedium]}>
                  Four legendary undead masters await to guide you through the mysteries of blockchain.
                </Text>
              </ImageBackground>
            </Animated.View>
            <Animated.View style={[{ opacity: textDelayAnim }]}>
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                <ImageBackground
                  source={require('../assets/onboarding/button-bg-main.png')}
                  style={styles.buttonBackground}
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

  const screenMap: Record<OnboardingScreen, () => JSX.Element> = {
    welcome: renderWelcomeScreen,
    selection: renderGuideSelection,
    persona: renderPersonaScreen,
    name: renderInputScreen,
    profile: renderMintProfile,
    'game-card-intro': renderGameCardIntroScreen,
    'game-card-carousel': renderGameCardCarouselScreen,
  }

  return screenMap[currentOnboardingScreen as OnboardingScreen]?.() || renderWelcomeScreen()
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
  welcomeContentWrapper: {
    flexDirection: 'column',
    height: '55%',
    alignItems: 'center',
    // gap: -30,
  },
  titleContainer: {
    marginBottom: 12,
    alignItems: 'center',
    padding: 12,
    marginTop: 20,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: SCREEN_WIDTH * 0.7,
    padding: 96,
  },
  welcomeText: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonBackground: {
    paddingVertical: 20,
    paddingHorizontal: 48,
  },
  selectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  selectionHeader: {
    alignItems: 'center',
  },
  carouselWrapper: {
    flex: 1,
  },
  nameInputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
})

export default GuideSelection
