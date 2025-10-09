import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import { Image, ImageBackground, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import correctAnswerIcon from '@/assets/images/chapter1/quiz/correct-choice.png'
import wrongAnswerIcon from '@/assets/images/chapter1/quiz/wrong-choice.png'


interface ConversationScreenProps {
  // title: string
  message: string
  buttonText: string
  playerName?: string
  guideName?: string
  guideImage: ImageSourcePropType
  badgeText?: string
  backgroundImage: ImageSourcePropType
  dialogBackgroundImage: ImageSourcePropType
  titleBackgroundImage: ImageSourcePropType
  buttonBackgroundImage: ImageSourcePropType
  onBack: () => void
  onContinue: () => void
  showMuteButton?: boolean
  showBackButton?: boolean
  typewriterDelay?: number
  autoShowButton?: boolean
  overlayOpacity?: number
  answerType: boolean
}

const QuizFeedbackComp: React.FC<ConversationScreenProps> = ({
  // title,
  message,
  buttonText,
  guideImage,
  badgeText,
  backgroundImage,
  dialogBackgroundImage,
  titleBackgroundImage,
  buttonBackgroundImage,
  onBack,
  onContinue,
  showMuteButton = true,
  showBackButton = true,
  // typewriterDelay = 300,
  autoShowButton = true,
  overlayOpacity = 0.45,
  answerType,
}) => {
  const [showButton, setShowButton] = useState(autoShowButton)
  const [isMuted, setIsMuted] = useState(false)

  const handleTypewriterCompleteRef = useRef(() => {
    setShowButton(true)
  })

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <ImageBackground style={styles.container} source={backgroundImage}>
      <ImageBackground source={titleBackgroundImage} style={styles.titleContainer} resizeMode="contain">
        {/* <Text style={[GameFonts.epic, styles.titleText]}>{title}</Text> */}
      </ImageBackground>
      <View style={[styles.blackOverlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />
      <View style={styles.contentWrapper}>
        <View style={styles.dialogHeader}>
          {showBackButton && (
            <TouchableOpacity onPress={onBack} style={styles.headerButton}>
              <View style={styles.iconBackground}>
                <MaterialIcons name="arrow-back" size={22} color="white" />
              </View>
            </TouchableOpacity>
          )}
          {showMuteButton && (
            <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
              <View style={styles.iconBackground}>
                <MaterialIcons name={isMuted ? 'volume-off' : 'volume-up'} size={22} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <ImageBackground style={styles.dialogBackground} source={dialogBackgroundImage}>
          <View style={styles.guideImageContainer}>
            <Image source={guideImage} style={styles.guideImage} resizeMode="contain" />
          </View>
          <View style={styles.textContainer}>
            {badgeText && (
              <TouchableOpacity style={styles.badge} disabled>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </TouchableOpacity>
            )}
            {answerType === true ? (
              <View style={styles.answerContainer}>
                <Image source={correctAnswerIcon} />
                <Text style={styles.correctAnswer}>Correct</Text>
              </View>
            ) : (
                <View style={styles.answerContainer}>
                <Image style={{height: 50, width: 50}} source={wrongAnswerIcon} />
                <Text style={styles.wrongAnswer}>Correct</Text>
              </View>
            )}
            <Text style={styles.message}>{message}</Text>
            {showButton && (
              <View style={styles.buttonWrapper}>
                <TouchableOpacity onPress={onContinue} style={styles.buttonTouchable}>
                  <ImageBackground source={buttonBackgroundImage} style={styles.buttonBackground} resizeMode="contain">
                    <Text style={[GameFonts.button, styles.buttonText]}>{buttonText}</Text>
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
  dialogHeader: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    top: -32,
    right: 30,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: '#131313',
    borderRadius: 17,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    right: -26,
    bottom: 0,
    width: '100%',
  },
  dialogBackground: {
    width: '100%',
    position: 'absolute',
    bottom: 18,
    right: 48,
    flexDirection: 'row',
    height: 190,
  },
  guideImageContainer: {
    width: '30%',
    position: 'relative',
    overflow: 'visible',
  },
  guideImage: {
    width: 240,
    height: 320,
    position: 'absolute',
    bottom: -55,
    right: 1,
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
    marginTop: 12,
    lineHeight: 32,
    marginBottom: 1,
  },
  buttonWrapper: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    marginTop: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 22,
    padding: 12,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  buttonTouchable: {
    marginLeft: 16,
  },
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    right: -10,
    top: -20,
    position: 'absolute',
    justifyContent: 'center',
    padding: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  correctAnswer: {
    color: '#17B26A',
  },
  wrongAnswer: {
    color: "#E5484D"
  },
  answerContainer: {
    display: 'flex',
    columnGap: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  message: {
    color: 'white',
    fontStyle: 'italic',
  },
})

export default QuizFeedbackComp
