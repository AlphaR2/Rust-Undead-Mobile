<!-- here is code for the warrior creation side  -->

<!-- import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useState } from 'react'
import { Image, ImageBackground, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PERSONA_BACKGROUND from '../../assets/images/bg-assets/bg-03.png'
import { WARRIOR_TYPES } from '../../types/mobile'

// Import guide images directly
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'

const GameCardCarousel: React.FC = () => {
  const { setCurrentOnboardingScreen, selectedGuide, playerName, selectedPersona, setSelectedWarriorType } =
    useContext(CreateContext).onboarding

  // Phase control: 'dialogue' or 'selection'
  const [currentPhase, setCurrentPhase] = useState<'dialogue' | 'selection'>('dialogue')
  const [currentIndex, setCurrentIndex] = useState(0)

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

  // Get guide name for speaking
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

  // Get personalized intro message
  const getIntroMessage = (): string => {
    const name = playerName || 'Warrior'
    const personaText = selectedPersona ? ` as a ${formatPersonaName(selectedPersona)}` : ''

    return `${name}${personaText}, the ritual begins. You must now raise your first undead warrior from the essence of ancient powers. This cursed champion will embody your fighting spirit and supernatural gifts. Select wisely - your warrior's nature will shape every battle in the shadows that await.`
  }

  const handleContinueToSelection = () => {
    setCurrentPhase('selection')
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : WARRIOR_TYPES.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < WARRIOR_TYPES.length - 1 ? prev + 1 : 0))
  }

  const handleConfirm = () => {
    const selectedWarrior = WARRIOR_TYPES[currentIndex]

    console.log('Selected warrior type:', {
      warrior: selectedWarrior.name,
      player: playerName,
      guide: selectedGuide?.name,
      persona: selectedPersona,
    })

    // Save selected warrior to context
    setSelectedWarriorType(selectedWarrior)

    setCurrentOnboardingScreen('warrior-setup')
  }

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = 50

      if (gestureState.dx > swipeThreshold) {
        handlePrevious()
      } else if (gestureState.dx < -swipeThreshold) {
        handleNext()
      }
    },
  })

  const getVisibleWarriors = () => {
    const visibleWarriors = []

    // Previous warrior (left side, smaller, darker)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : WARRIOR_TYPES.length - 1
    visibleWarriors.push({
      warrior: WARRIOR_TYPES[prevIndex],
      index: prevIndex,
      isActive: false,
    })

    // Current warrior (right side, larger, active)
    visibleWarriors.push({
      warrior: WARRIOR_TYPES[currentIndex],
      index: currentIndex,
      isActive: true,
    })

    return visibleWarriors
  }

  const currentWarrior = WARRIOR_TYPES[currentIndex]

  // Phase 1: Guide Dialogue
  if (currentPhase === 'dialogue') {
    return (
      <ImageBackground className="flex-1 flex flex-row items-center justify-center" source={PERSONA_BACKGROUND}>
        <View style={styles.blackOverlay} />

        <ImageBackground source={require('../../assets/onboarding/dialog-bg-4.png')} resizeMode="contain" className="">
          <View style={styles.container}>
            {/* Centered dialogue */}
            <View style={styles.centeredDialogueContainer}>
              <View style={styles.dialogueCard}>
                <View style={styles.dialogueContent}>
                  <Text style={[GameFonts.title, styles.guideName]}>{getGuideName()}</Text>
                  <Text style={styles.centeredDialogueText}>{getIntroMessage()}</Text>

                  <TouchableOpacity
                    className="flex items-center justify-center "
                    onPress={handleContinueToSelection}
                    style={{
                      top: 20,
                    }}
                  >
                    <ImageBackground
                      source={require('../../assets/onboarding/button-bg-main.png')}
                      className="flex items-center justify-center py-8 px-8"
                      resizeMode="contain"
                    >
                      <Text>Continue</Text>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
        <Image source={getGuideImage()} resizeMode="contain" style={styles.largeGuideImage} />
      </ImageBackground>
    )
  }

  // Phase 2: Warrior Selection
  return (
    <ImageBackground source={PERSONA_BACKGROUND} style={styles.backgroundContainer} resizeMode="cover">
      <View style={styles.blackOverlay} />

      <View style={styles.container}>
        {/* Header with smaller guide indicator */}
        <ImageBackground
          source={require('../../assets/onboarding/dialog-bg-1.png')}
          className="px-10 w-fit py-4"
          resizeMode="contain"
        >
          <Text style={[GameFonts.epic]} className="text-sm text-center  text-[#E0E0E0]">
            Choose your warrior class
          </Text>
        </ImageBackground>

        <View style={styles.mainContent}>
          {/* Left Side - Warrior Carousel */}
          <View className="flex flex-row items-center justify-evenly w-[60%] my-auto ">
            {/* Navigation Arrows */}
            <TouchableOpacity style={[styles.leftArrow]} onPress={handlePrevious}>
              <ImageBackground
                source={require('../../assets/onboarding/carousel-nav-button-container.png')}
                resizeMode="contain"
                className="p-6"
              >
                <Text style={styles.navButtonText}>‹</Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* Warriors Container */}
            <View style={styles.charactersContainer} {...panResponder.panHandlers}>
              {getVisibleWarriors().map(({ warrior, index, isActive }) => (
                <View
                  key={warrior.id}
                  style={[styles.characterWrapper, isActive ? styles.activeCharacter : styles.inactiveCharacter]}
                >
                  <Image
                    source={{ uri: warrior.image }}
                    style={[styles.characterImage, isActive ? styles.activeImage : styles.inactiveImage]}
                    resizeMode="contain"
                  />

                  {/* Confirm Button - Only show on active warrior */}
                  {isActive && (
                    <TouchableOpacity style={styles.confirmButtonContainer} onPress={handleConfirm} className="">
                      <ImageBackground
                        source={require('../../assets/onboarding/button-bg-main.png')}
                        className="flex items-center justify-center py-6 w-full px-24  absolute "
                        resizeMode="contain"
                      >
                        <Text>Choose the {warrior.name}</Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.rightArrow]} onPress={handleNext}>
              <ImageBackground
                source={require('../../assets/onboarding/carousel-nav-button-container.png')}
                resizeMode="contain"
                className="p-6"
              >
                <Text style={styles.navButtonText}>›</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Right Side - Warrior Info Card */}
          <View style={styles.infoSection}>
            <ImageBackground
              source={require('../../assets/onboarding/game-card-dialog-bg.png')}
              style={styles.infoCardBg}
              className="h-[350px] w-[350px] p-4"
              resizeMode="contain"
            >
              <View style={styles.infoCard}>
                <Text style={[styles.warriorName, { color: currentWarrior.color }]}>{currentWarrior.name}</Text>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Combat Style:</Text>
                  <Text style={styles.infoText}>{currentWarrior.combatStyle}</Text>
                </View>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Stat Range:</Text>
                  <Text style={styles.infoText}>{currentWarrior.statRange}</Text>
                </View>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Specialty:</Text>
                  <Text style={styles.infoText}>{currentWarrior.specialty}</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // Phase 1 - Dialogue styles
  centeredDialogueContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialogueCard: {
    padding: 30,
    alignItems: 'center',
    maxWidth: 400,
    minHeight: 300,
  },
  largeGuideImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
    top: 80,
    transform: [{ scaleX: -1 }],
  },
  dialogueContent: {
    alignItems: 'center',
  },
  guideName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  centeredDialogueText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 14,
    textAlign: 'center',
  },
  continueButton: {
    alignItems: 'center',
  },
  continueButtonBg: {
    width: 140,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Phase 2 - Selection styles
  smallDialogueContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(202, 116, 34, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: 'rgba(202, 116, 34, 0.3)',
  },
  smallGuideImage: {
    width: 35,
    height: 35,
    marginRight: 12,
  },
  smallDialogueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  charactersSection: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    height: 400,
    justifyContent: 'center',
  },
  leftArrow: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  rightArrow: {
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  navButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  navButtonText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  charactersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  characterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCharacter: {
    // Current character styling
  },
  inactiveCharacter: {
    opacity: 0.5,
  },
  characterImage: {
    // Base image styles
  },
  activeImage: {
    width: 200,
    height: 200,
    borderColor: '#D4AF37',
    marginBottom: 32,
  },
  inactiveImage: {
    width: 120,
    height: 200,
    marginTop: 20,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    left: 20,
  },
  confirmButtonContainer: {
    marginTop: -40,
    alignItems: 'center',
    width: 200,
    height: 39,
    justifyContent: 'center',
    borderRadius: 19,
  },
  confirmButtonBg: {
    width: 140,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoSection: {
    width: '40%',
  },
  infoCardBg: {
    // width: '100%',
    // minHeight: 350,
  },
  infoCard: {
    padding: 20,
    minHeight: 330,
    gap: 12,
  },
  warriorName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warriorTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
    opacity: 0.9,
  },
  warriorDescription: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  infoSectionItem: {
    marginBottom: 12,
  },
  infoLabel: {
    color: '#CA7422',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
  },
  compatibilitySection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(202, 116, 34, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
})

export default GameCardCarousel -->
