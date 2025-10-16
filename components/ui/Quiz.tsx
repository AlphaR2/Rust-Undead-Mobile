import { GameTypewriterPresets, TypewriterText } from '@/components/common/Typewrite'
import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import { Dimensions, Image, ImageBackground, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface ConversationScreenProps {
  title: string
  // message: string
  question: string
  options: string[]
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
}

const Quiz: React.FC<ConversationScreenProps> = ({
  title,
  // message,
  options,
  question,
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
  typewriterDelay = 300,
  autoShowButton = false,
  overlayOpacity = 0.45,
}) => {
  const [showButton, setShowButton] = useState(autoShowButton)
  const [isMuted, setIsMuted] = useState(false)

  const handleTypewriterCompleteRef = useRef(() => {
    setShowButton(true)
  })

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }
    const screenHeight = Dimensions.get('window').height
  

  return (
    <View  style={{
        display: 'flex',
        flexDirection: 'column',
        height: screenHeight,
        zIndex: 20,

        // justifyContent: 'space-between',
      }}>
      {/* <ImageBackground source={titleBackgroundImage} style={styles.titleContainer} resizeMode="contain">
        <Text style={[GameFonts.epic, styles.titleText]}>{title}</Text>
      </ImageBackground> */}
      <View style={[styles.blackOverlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />
      <View style={styles.contentWrapper}>
        {/* <View style={styles.dialogHeader}>
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
        </View> */}
        <View style={styles.quizContainer}>
          <Text style={styles.quizQuestion}>{question}</Text>
          <View style={styles.quizOptionsContainer}>
            {options.map((option, index) => {
              return (
                <TouchableOpacity key={index}>
                  <Text style={styles.quizOption}>{option}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity onPress={onContinue} style={styles.buttonTouchable}>
            <ImageBackground source={buttonBackgroundImage} style={styles.buttonBackground} resizeMode="contain">
              <Text style={[GameFonts.button, styles.buttonText]}>{buttonText}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
        {/* <ImageBackground source={dialogBackgroundImage}>
          <View style={styles.guideImageContainer}>
            <Image source={guideImage} style={styles.guideImage} resizeMode="contain" />
          </View>
        </ImageBackground> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
     width: '100%',
    height: '100%',
    zIndex: 30,
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
    justifyContent: 'center',
    alignItems: 'center',
    // right: -26,
    flexDirection: 'column',
    rowGap: 80,
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
    width: 150,
    height: 200,
    position: 'absolute',
    bottom: -120,
    right: 90,
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
    // alignItems: 'center',
    // borderColor: 'green',
    // borderWidth: 20,
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
    // marginLeft: 16,
  },
  buttonBackground: {
    // alignItems: 'center',
    width: 'auto',
    height: 'auto',
    // marginRight: -30,
    // top: -20,
    // position: 'absolute',
    justifyContent: 'center',
    padding: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  quizContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    marginTop: 20,
    color: 'white',
    // border: '1px solid white',
    borderColor: 'white',
    borderRadius: 8,

    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    rowGap: 20,
  },
  quizQuestion: {
    color: 'white',
    fontSize: 20,
  },
  quizOptionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 20,
  },
  quizOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    color: 'white',
    textAlign: 'center',
    width: 'auto',
  },
})

export default Quiz
