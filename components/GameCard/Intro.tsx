import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import { router } from 'expo-router'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from '../common/Typewrite'
import { toast } from '../ui/Toast'

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

const GUIDE_TITLES: Record<string, string> = {
  'JANUS THE BUILDER': 'BUILDER',
  'JAREK THE ORACLE': 'ORACLE',
  'GAIUS THE GUARDIAN': 'GUARDIAN',
  'BRYN THE DAEMON': 'DAEMON',
}

const GUIDE_NAMES: Record<string, string> = {
  'JANUS THE BUILDER': 'Janus',
  'JAREK THE ORACLE': 'Jarek',
  'GAIUS THE GUARDIAN': 'Gaius',
  'BRYN THE DAEMON': 'Bryn',
}

const GameCardIntro = () => {
  const [showNextButton, setShowNextButton] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { selectedGuide, playerName, setCurrentOnboardingScreen } = useContext(CreateContext).onboarding
  const { accessToken } = useContext(CreateContext).auth
  const { userAddress } = useBasicGameData()

  const shouldSkipAnimation = useMemo(() => false, [playerName])

  const saveProfile = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const response = await fetch(`https://undead-protocol.onrender.com/user`, {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: userAddress,
          profileName: playerName,
          choosenGuide: selectedGuide?.name,
          avatar: 'https://example.com/avatars/user1.png',
          userProgress: {
            chapter: 0,
            path: 0,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.message === 'Undead User exists already') {
          setCurrentOnboardingScreen('game-card-carousel')
          return
        }
        throw new Error(responseData.message ?? 'An error occurred')
      }

      toast.success('Success', 'Profile saved successfully')
      setCurrentOnboardingScreen('game-card-carousel')
    } catch (err: any) {
      toast.error('Error', err?.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const getGuideImage = () => {
    return GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  }

  const getGuideTitle = (): string => {
    if (!selectedGuide?.name) return 'GUIDE'
    return GUIDE_TITLES[selectedGuide.name] || selectedGuide.title?.toUpperCase() || 'GUIDE'
  }

  const introMessage = useMemo(() => {
    const name = playerName || 'Warrior'
    return `Welcome, ${name}. Before we begin, let me explain what lies ahead... Your journey begins with forging your first warrior from the essence of ancient powers. This cursed champion will embody your fighting spirit and supernatural gifts.`
  }, [playerName])

  const handleTypewriterCompleteRef = useRef(() => {
    setShowNextButton(true)
  })

  const handleNext = async () => {
    await saveProfile()
  }

  useEffect(() => {
    if (shouldSkipAnimation) {
      setShowNextButton(true)
    }
  }, [shouldSkipAnimation])

  return (
    <View style={styles.container}>
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
              key={`intro-typewriter-${selectedGuide?.id}`}
              text={introMessage}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.narration}
              delay={300}
              skipAnimation={shouldSkipAnimation}
              onComplete={handleTypewriterCompleteRef.current}
            />

            {showNextButton && (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity onPress={handleNext} style={styles.buttonTouchable} disabled={isSaving}>
                  <ImageBackground
                    source={require('../../assets/onboarding/button-bg-main.png')}
                    style={styles.buttonBackground}
                    resizeMode="contain"
                  >
                    <Text style={[GameFonts.button, styles.buttonText, { opacity: isSaving ? 0.5 : 1 }]}>
                      {isSaving ? 'Saving...' : 'Next'}
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
    bottom: -8,
    right: -30,
    flexDirection: 'row',
    height: 180,
  },
  guideImageContainer: {
    width: '30%',
    position: 'relative',
    overflow: 'visible',
  },
  guideImage: {
    width: 290,
    height: 302,
    position: 'absolute',
    bottom: -45,
    right: -6,
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
    fontSize: 12,
    marginTop: 8,
    lineHeight: 32,
    marginBottom: 16,
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonTouchable: {
    marginLeft: 'auto',
  },
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    right: -40,
    top: -26,
    position: 'absolute',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 96,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
})

export default GameCardIntro
