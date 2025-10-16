import { GameTypewriterPresets, TypewriterText } from '@/components/common/Typewrite'
import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Dimensions } from 'react-native'
import { LearningContent } from '../GameCard/CheckpointModal'

interface ConversationScreenProps {
  title: string
  message: string
  buttonText: string
  playerName?: string
  guideName?: string
  guideImage: ImageSourcePropType
  badgeText?: string
  backgroundImage?: ImageSourcePropType
  dialogBackgroundImage: ImageSourcePropType
  titleBackgroundImage: ImageSourcePropType
  buttonBackgroundImage: ImageSourcePropType
  onBack?: () => void
  onContinue: () => void
  showMuteButton?: boolean
  showBackButton?: boolean
  typewriterDelay?: number
  autoShowButton?: boolean
  overlayOpacity?: number
  learningContent: LearningContent
}

const OverlayScreen: React.FC<ConversationScreenProps> = ({
  title,
  message,
  buttonText,
  guideImage,
  learningContent,

  buttonBackgroundImage,

  onContinue,

  typewriterDelay = 300,
  autoShowButton = false,
  overlayOpacity = 0.9,
}) => {
  const [showButton, setShowButton] = useState(autoShowButton)
  const [isMuted, setIsMuted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [currentMessage, setCurrentMessage] = useState(`Hi, today, we'd be learning about ${title}. 
  ${learningContent.summary}
  AIM:
  ${learningContent.battle_relevance}`)

  const handleTypewriterCompleteRef = useRef(() => {
    setShowButton(true)
  })

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  
  const screenHeight = Dimensions.get('window').height

  const handleContinue = () => {
    if (showIntro) {
      setShowIntro(false)
      setCurrentMessage(message)
    } else {
      onContinue()
    }
  }
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: screenHeight,
        zIndex: 20,

        // justifyContent: 'space-between',
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
            // borderColor: 'white',
            // borderWidth: 2,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={true}
            style={{ height: '80%', overflowY: 'scroll' }}
            persistentScrollbar={true}
          >
            <TypewriterText
              text={showIntro ? currentMessage : message}
              style={[GameFonts.body, styles.typewriterText]}
              {...GameTypewriterPresets.narration}
              delay={typewriterDelay}
              skipAnimation={false}
              onComplete={handleTypewriterCompleteRef.current}
            />
          </ScrollView>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity onPress={handleContinue} style={styles.buttonTouchable}>
              <ImageBackground source={buttonBackgroundImage} style={styles.buttonBackground} resizeMode="contain">
                <Text style={[GameFonts.button, styles.buttonText]}>{buttonText}</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000071',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 40,
    zIndex: 10,
  },
  titleContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    color: '#E0E0E0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dialogHeader: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'rgba(19, 19, 19, 0.9)',
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
  centeredContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderColor: 'red',
    borderRadius: 20,
  },
  dialogContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 40,
    height: 500,
  },
  guideImageContainer: {
    height: '40%',
    width: '20%',
    marginTop: 'auto',
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    maxWidth: 600,
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    borderColor: '#c873234d',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    // marginTop: 18,
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

export default OverlayScreen
