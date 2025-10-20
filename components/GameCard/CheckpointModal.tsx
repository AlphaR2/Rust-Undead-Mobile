import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useContext, useState } from 'react'
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import Quiz from '../quiz/Quiz'
import QuizIntroOverlay from '../quiz/QuizIntroOverlay'
import OverlayScreen from '../ui/Overlay'

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

interface CheckpointModalProps {
  visible: boolean
  content: CheckpointContent | null
  onContinue: () => void
  onOpenBox: () => void
  showMiniModal: boolean
  showQuizIntro?: boolean
  allTopics?: any[]
}

export interface LearningContent {
  summary: string
  big_note: string[]
  battle_relevance: string
}

export interface Question {
  question_id: number
  text: string
  correct: boolean
  explanation: string
}

export interface CheckpointContent {
  topic_id: number
  title?: string
  learning_content?: LearningContent
  questions: Question[]
}

const CheckpointModal: React.FC<CheckpointModalProps> = ({
  visible,
  content,
  onContinue,
  onOpenBox,
  showMiniModal,
  showQuizIntro = false,
  allTopics = [],
}) => {
  const { selectedGuide, playerName } = useContext(CreateContext).onboarding
  const [showQuiz, setShowQuiz] = useState(false)

  const guideImage = GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  const message = content?.learning_content?.big_note.join(',') || ''

  if (!visible || !content) return null

  if (content.topic_id === 6) {
    if (showMiniModal) {
      return (
        <View style={styles.miniModalOverlay}>
          <View style={styles.miniModalContainer}>
            <View style={styles.miniModalContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock-open" size={48} color="rgba(200, 116, 35, 0.8)" />
              </View>

              <Text style={[GameFonts.body, styles.miniModalTitle]}>Final Trial Awaits</Text>

              <Text style={[GameFonts.body, styles.miniModalText]}>
                You have reached the final box. The ancient one demand proof of your knowledge.
              </Text>

              <TouchableOpacity onPress={onOpenBox} style={styles.miniModalButton}>
                <ImageBackground
                  source={require('../../assets/onboarding/button-bg-main.png')}
                  style={styles.miniButtonBackground}
                  resizeMode="contain"
                >
                  <Text style={[GameFonts.button, styles.miniButtonText]}>Open Chest</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    }

    if (showQuizIntro && !showQuiz) {
      return (
        <QuizIntroOverlay
          playerName={playerName || 'Traveler'}
          guideImage={guideImage}
          buttonBackgroundImage={require('../../assets/onboarding/button-bg-main.png')}
          onContinue={() => setShowQuiz(true)}
        />
      )
    }

    if (showQuiz) {
      return (
        <Quiz
          onComplete={onContinue}
          onBack={() => console.log('back')}
          allTopics={allTopics}
          playerName={playerName || 'Traveler'}
        />
      )
    }

    return null
  }

  if (showMiniModal) {
    return (
      <View style={styles.miniModalOverlay}>
        <View style={styles.miniModalContainer}>
          <View style={styles.miniModalContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-open" size={48} color="rgba(200, 116, 35, 0.8)" />
            </View>

            <Text style={[GameFonts.body, styles.miniModalTitle]}>Chest Found</Text>

            <Text style={[GameFonts.body, styles.miniModalText]}>
              You've discovered a wisdom scroll. Open it to see what it says.
            </Text>

            <TouchableOpacity onPress={onOpenBox} style={styles.miniModalButton}>
              <ImageBackground
                source={require('../../assets/onboarding/button-bg-main.png')}
                style={styles.miniButtonBackground}
                resizeMode="contain"
              >
                <Text style={[GameFonts.button, styles.miniButtonText]}>Open Chest</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <OverlayScreen
      title={content.title || ''}
      message={message}
      learningContent={content.learning_content || { summary: '', big_note: [], battle_relevance: '' }}
      buttonText="Continue"
      playerName={playerName}
      guideImage={guideImage}
      contentid={content.topic_id}
      dialogBackgroundImage={require('../../assets/onboarding/dialog-bg-2.png')}
      titleBackgroundImage={require('../../assets/onboarding/dialog-bg-1.png')}
      buttonBackgroundImage={require('../../assets/onboarding/button-bg-main.png')}
      onContinue={onContinue}
      showMuteButton={true}
      showBackButton={false}
      typewriterDelay={300}
      autoShowButton={false}
      overlayOpacity={0.7}
    />
  )
}

const styles = StyleSheet.create({
  miniModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    zIndex: 1000,
  },
  miniModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniModalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(200, 115, 35, 0.6)',
  },
  iconContainer: {
    marginBottom: 20,
  },
  miniModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  miniModalText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  miniModalButton: {
    minWidth: 160,
  },
  miniButtonBackground: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  miniButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
})

export default CheckpointModal
