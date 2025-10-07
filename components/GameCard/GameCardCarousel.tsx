import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { router } from 'expo-router'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PERSONA_BACKGROUND from '../../assets/images/bg-assets/bg-03.png'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from '../common/Typewrite'

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

const GUIDE_NAMES: Record<string, string> = {
  'JANUS THE BUILDER': 'Janus',
  'JAREK THE ORACLE': 'Jarek',
  'GAIUS THE GUARDIAN': 'Gaius',
  'BRYN THE DAEMON': 'Bryn',
}

const GUIDE_TITLES: Record<string, string> = {
  'JANUS THE BUILDER': 'BUILDER',
  'JAREK THE ORACLE': 'ORACLE',
  'GAIUS THE GUARDIAN': 'GUARDIAN',
  'BRYN THE DAEMON': 'DAEMON',
}

const GameCardCarousel = () => {
  const { selectedGuide, playerName, selectedPersona } = useContext(CreateContext).onboarding
  const [showEnterButton, setShowEnterButton] = useState(false)

  const getGuideImage = () => {
    return GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  }

  const getGuideName = (): string => {
    if (!selectedGuide?.name) return 'Guide'
    return GUIDE_NAMES[selectedGuide.name] || selectedGuide.name.split(' ')[0] || 'Guide'
  }

  const getGuideTitle = (): string => {
    if (!selectedGuide?.name) return 'GUIDE'
    return GUIDE_TITLES[selectedGuide.name] || selectedGuide.title?.toUpperCase() || 'GUIDE'
  }

  const formatPersonaName = (persona: string): string => {
    return persona.replace(/([A-Z])/g, ' $1').trim()
  }

  const getIntroMessage = useMemo((): string => {
    const name = playerName || 'Warrior'
    const personaText = selectedPersona ? ` as a ${formatPersonaName(selectedPersona)}` : ''
    const guideName = getGuideName()

    const messages: Record<string, string> = {
      'JANUS THE BUILDER': `${name}${personaText}, I, ${guideName}, summon you to the necropolis where ancient bones await your craft. Forge your legacy in the eternal shadows. The undead legions kneel before their new master. Enter the Realm now!`,
      'JAREK THE ORACLE': `${name}${personaText}, I, ${guideName}, see your fate woven in the undead realm. The necropolis stirs with restless spirits awaiting your command. Will you seize your destiny? Enter the Realm!`,
      'GAIUS THE GUARDIAN': `${name}${personaText}, I, ${guideName}, stand as your shield in the necropolis. The crypts pulse with dark power, ready for your rule. Lead the undead to glory. Enter the Realm!`,
      'BRYN THE DAEMON': `${name}${personaText}, I, ${guideName}, compile your destiny in the shadowed network. The necropolis boots up, its circuits alive with undead energy. Command the system. Enter the Realm!`,
    }

    return (
      messages[selectedGuide?.name || ''] ||
      `${name}${personaText}, the necropolis awakens under your gaze. The undead await their master to claim the throne of shadows. Your journey begins. Enter the Realm!`
    )
  }, [playerName, selectedPersona, selectedGuide?.name])

  const handleTypewriterCompleteRef = useRef(() => {
    setShowEnterButton(true)
  })

  const handleEnterRealm = () => {
    router.push('/dashboard')
  }

  return (
    <ImageBackground style={styles.container} source={PERSONA_BACKGROUND}>
      <View style={styles.blackOverlay} />
      <View style={styles.contentWrapper}>
        <ImageBackground style={styles.dialogBackground} source={require('../../assets/onboarding/dialog-bg-2.png')}>
          <View style={styles.guideImageContainer}>
            <Image source={getGuideImage()} style={styles.guideImage} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <TouchableOpacity style={styles.badge} disabled>
              <Text style={styles.badgeText}>{getGuideTitle()}</Text>
            </TouchableOpacity>
            <TypewriterText
              key={`typewriter-${selectedGuide?.id}-${playerName}`}
              text={getIntroMessage}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.narration}
              delay={300}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
            {showEnterButton && (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity onPress={handleEnterRealm} style={styles.buttonTouchable}>
                  <ImageBackground
                    source={require('../../assets/onboarding/button-bg-main.png')}
                    style={styles.buttonBackground}
                    resizeMode="contain"
                  >
                    <Text style={[GameFonts.button, styles.buttonText]}>Enter the Realm</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    right: -26,
    bottom: 0,
    width: '100%',
  },
  dialogBackground: {
    width: '100%',
    position: 'absolute',
    bottom: 12,
    right: 48,
    flexDirection: 'row',
    // paddingHorizontal: 32,
    height: 180,
    overflow: 'visible',
  },
  guideImageContainer: {
    width: '30%',
    position: 'relative',
    overflow: 'visible',
  },
  guideImage: {
    width: 290,
    height: 320,
    position: 'absolute',
    bottom: -45,
    right: 10,
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
    position: 'relative',
    // right: -112,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonTouchable: {
    marginLeft: 16,
  },
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    right: -90,
    top: -26,
    position: 'absolute',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 96,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
  },
})

export default GameCardCarousel
