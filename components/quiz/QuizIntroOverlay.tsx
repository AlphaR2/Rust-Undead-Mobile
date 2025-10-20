import { GameTypewriterPresets, TypewriterText } from '@/components/common/Typewrite'
import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

interface QuizIntroOverlayProps {
  playerName: string
  guideImage: ImageSourcePropType
  buttonBackgroundImage: ImageSourcePropType
  onContinue: () => void
  overlayOpacity?: number
}

const QuizIntroOverlay: React.FC<QuizIntroOverlayProps> = ({
  playerName,
  guideImage,
  buttonBackgroundImage,
  onContinue,
  overlayOpacity = 0.99,
}) => {
  const [showButton, setShowButton] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleTypewriterCompleteRef = useRef(() => {
    setShowButton(true)
  })

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const screenHeight = Dimensions.get('window').height

  const quizIntroMessage = `${playerName}, you have consumed the ancient knowledge. Now the spirits demand proof of your mastery.

Five trials await. Answer correctly and ascend. Fail, and be consumed.

THE TRIAL BEGINS.`

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: screenHeight + 20,
        zIndex: 20,
      }}
    >
      <View style={[styles.blackOverlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />
      <View style={{ display: 'flex', marginLeft: 'auto', flexDirection: 'row' }}>
        <TouchableOpacity style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <MaterialIcons name={'content-copy'} size={20} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <MaterialIcons name={isMuted ? 'volume-off' : 'volume-up'} size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ display: 'flex', flexDirection: 'row', height: '90%' }}>
        <View style={styles.guideImageContainer}>
          <Image source={guideImage} style={styles.guideImage} resizeMode="contain" />
        </View>
        <View
          style={{
            width: '70%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingTop: 20,
            paddingBottom: 15,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={true}
            style={{ height: '80%', overflowY: 'scroll' }}
            persistentScrollbar={true}
          >
            <TypewriterText
              text={quizIntroMessage}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.narration}
              delay={300}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
          </ScrollView>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity onPress={onContinue} style={styles.buttonTouchable}>
              <ImageBackground source={buttonBackgroundImage} style={styles.buttonBackground} resizeMode="contain">
                <Text style={[GameFonts.button, styles.buttonText]}>BEGIN TRIAL</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000071',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'rgba(19, 19, 19, 0.7)',
    borderRadius: 22,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  guideImageContainer: {
    height: '45%',
    width: '20%',
    marginTop: 'auto',
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  typewriterText: {
    color: '#FFFFFF',
    lineHeight: 32,
    fontSize: 14,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonWrapper: {
    alignItems: 'flex-start',
    marginLeft: 'auto',
  },
  buttonTouchable: {
    minWidth: 160,
  },
  buttonBackground: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
})

export default QuizIntroOverlay
