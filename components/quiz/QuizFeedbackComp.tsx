import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
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
import correctAnswerIcon from '@/assets/images/chapter1/quiz/correct-choice.png'
import wrongAnswerIcon from '@/assets/images/chapter1/quiz/wrong-choice.png'

interface QuizFeedbackCompProps {
  message: string
  buttonText: string
  guideImage: ImageSourcePropType
  badgeText?: string
  backgroundImage: ImageSourcePropType
  dialogBackgroundImage: ImageSourcePropType
  titleBackgroundImage: ImageSourcePropType
  buttonBackgroundImage: ImageSourcePropType
  onBack: () => void
  onContinue: () => void
  answerType: boolean
  explanation?: string
  showMuteButton?: boolean
  showBackButton?: boolean
  overlayOpacity?: number
}

const QuizFeedbackComp: React.FC<QuizFeedbackCompProps> = ({
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
  answerType,
  explanation,
  showMuteButton = true,
  showBackButton = true,
  overlayOpacity = 0.7,
}) => {
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <ImageBackground style={styles.container} source={backgroundImage}>
      <ImageBackground source={titleBackgroundImage} style={styles.titleContainer} resizeMode="contain" />
      
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
              <View style={styles.badge}>
                <Text style={[GameFonts.body, styles.badgeText]}>{badgeText}</Text>
              </View>
            )}

            <View style={styles.answerContainer}>
              {answerType ? (
                <>
                  <Image source={correctAnswerIcon} style={styles.answerIcon} />
                  <Text style={[GameFonts.body, styles.correctAnswer]}>Correct</Text>
                </>
              ) : (
                <>
                  <Image source={wrongAnswerIcon} style={styles.answerIcon} />
                  <Text style={[GameFonts.body, styles.wrongAnswer]}>Incorrect</Text>
                </>
              )}
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={true}
            >
              {explanation && (
                <View style={styles.explanationContainer}>
                  <Text style={[GameFonts.body, styles.explanationTitle]}>Explanation:</Text>
                  <Text style={[GameFonts.body, styles.explanationText]}>{explanation}</Text>
                </View>
              )}
              
              {message && message !== explanation && (
                <Text style={[GameFonts.body, styles.message]}>{message}</Text>
              )}
            </ScrollView>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity onPress={onContinue} style={styles.buttonTouchable}>
                <ImageBackground
                  source={buttonBackgroundImage}
                  style={styles.buttonBackground}
                  resizeMode="contain"
                >
                  <Text style={[GameFonts.button, styles.buttonText]}>{buttonText}</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 40,
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
    width: 'auto',
    maxWidth: 150,
    padding: 6,
    marginTop: -20,
    borderColor: 'rgba(200, 115, 35, 0.6)',
    borderWidth: 1,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  answerContainer: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  answerIcon: {
    height: 24,
    width: 24,
  },
  correctAnswer: {
    color: '#17B26A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wrongAnswer: {
    color: '#E5484D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    maxHeight: 100,
    marginBottom: 8,
  },
  explanationContainer: {
    marginBottom: 8,
  },
  explanationTitle: {
    color: 'rgba(200, 116, 35, 0.9)',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  explanationText: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 20,
  },
  message: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 20,
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
    color: '#000000',
    textTransform: 'uppercase',
  },
})

export default QuizFeedbackComp