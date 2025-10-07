import { toast } from '@/components/ui/Toast'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo, useRef, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import guide4 from '../assets/images/guides/guide-daemon.png'
import guide3 from '../assets/images/guides/guide-guard.png'
import guide2 from '../assets/images/guides/guide-oracle.png'
import guide1 from '../assets/images/guides/guide-val.png'
import { GameTypewriterPresets, TypewriterText } from './common/Typewrite'

const GUIDE_GREETINGS: Record<string, string> = {
  'JANUS THE BUILDER':
    'I am Janus, Forger of the Necropolis! Name yourself, and we shall carve your legend in eternal stone!',
  'JAREK THE ORACLE': 'I am Jarek, Seer of the Undead Realm! Speak your name, and let fate bind you to the realm!',
  'GAIUS THE GUARDIAN': 'I am Gaius, Shield of the Crypt! Proclaim your name, and command the undead under my guard!',
  'BRYN THE DAEMON': 'I am Bryn, Flame of the Digital Void! Input your name, and ignite your path in the realm!',
}

const GUIDE_TITLES: Record<string, string> = {
  'JANUS THE BUILDER': 'BUILDER',
  'JAREK THE ORACLE': 'ORACLE',
  'GAIUS THE GUARDIAN': 'GUARDIAN',
  'BRYN THE DAEMON': 'DAEMON',
}

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

const DEFAULT_GREETING = 'Hail, brave soul! The necropolis beckons—declare your name to seize your destiny!'
const MAX_NAME_LENGTH = 32

const ChooseName = () => {
  const [playerName, setPlayerName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showInputSection, setShowInputSection] = useState(false)

  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    selectedPersona,
    setPlayerName: setContextPlayerName,
  } = useContext(CreateContext).onboarding

  const greetingText = useMemo(() => {
    const guideName = selectedGuide?.name
    if (!guideName) return DEFAULT_GREETING
    return GUIDE_GREETINGS[guideName] || selectedGuide?.description || DEFAULT_GREETING
  }, [selectedGuide?.name, selectedGuide?.description])

  const getGuideTitle = (guideName?: string): string => {
    if (!guideName) return 'GUIDE'
    return GUIDE_TITLES[guideName] || selectedGuide?.title?.toUpperCase() || 'GUIDE'
  }

  const getGuideImage = () => {
    return GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  }

  const handleTypewriterCompleteRef = useRef(() => {
    setShowInputSection(true)
  })

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

  const handleNameChange = (text: string) => {
    setPlayerName(text)
    setContextPlayerName(text)
  }

  const isButtonDisabled = !playerName.trim() || isCreating

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <ImageBackground style={styles.dialogBackground} source={require('../assets/onboarding/dialog-bg-2.png')}>
          <View style={styles.guideImageContainer}>
            <Image source={getGuideImage()} style={styles.guideImage} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            <TouchableOpacity style={styles.badge} disabled>
              <Text style={styles.badgeText}>{getGuideTitle(selectedGuide?.name)}</Text>
            </TouchableOpacity>
            <TypewriterText
              key={`typewriter-${selectedGuide?.id}`}
              text={greetingText}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.dialogue}
              delay={500}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
            {showInputSection && (
              <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={playerName}
                    onChangeText={handleNameChange}
                    placeholder="Enter your name..."
                    placeholderTextColor="#666"
                    style={styles.textInput}
                    maxLength={MAX_NAME_LENGTH}
                    editable={!isCreating}
                  />
                </View>
                <TouchableOpacity onPress={handleContinue} disabled={isButtonDisabled} style={styles.buttonTouchable}>
                  <ImageBackground
                    source={require('../assets/onboarding/button-bg-main.png')}
                    style={styles.buttonBackground}
                    resizeMode="contain"
                  >
                    <Text style={[GameFonts.button, styles.buttonText, { opacity: isButtonDisabled ? 0.5 : 1 }]}>
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
    flexDirection: 'row',
    height: 180,
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
    marginTop: -35,
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
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 16,
    height: 40,
    width: 428,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    color: 'white',
    fontSize: 14,
  },
  buttonTouchable: {},
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
  },
})

export default ChooseName
