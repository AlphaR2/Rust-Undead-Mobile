import { GameFonts } from '@/constants/GameFonts'
import { calculateQuizScore, PASS_THRESHOLD, QuizQuestion, selectRandomQuestions } from '@/utils/quiz'
import React, { useEffect, useState } from 'react'
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import QuizFeedbackComp from './QuizFeedbackComp'

interface QuizProps {
  onComplete: () => void
  onBack: () => void
  allTopics: any[]
  playerName: string
}

const Quiz: React.FC<QuizProps> = ({ onComplete, onBack, allTopics, playerName }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<boolean | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)

  const screenHeight = Dimensions.get('window').height

  useEffect(() => {
    if (allTopics.length > 0) {
      const selectedQuestions = selectRandomQuestions(allTopics.slice(0, 5))
      setQuestions(selectedQuestions)
    }
  }, [allTopics])

  const handleOptionPress = (option: string) => {
    const answer = option === 'True'
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      const isCorrect = selectedAnswer === questions[currentQuestionIndex].correct
      setCurrentAnswer(isCorrect)
      setUserAnswers([...userAnswers, isCorrect])
      setShowFeedback(true)
      setSelectedAnswer(null)
    }
  }

  const handleNextQuestion = () => {
    setShowFeedback(false)
    setCurrentAnswer(null)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleQuizComplete = () => {
    onComplete()
  }

  if (questions.length === 0) {
    return null
  }

  const currentQuestion = questions[currentQuestionIndex]
  const score = calculateQuizScore(userAnswers)
  const passed = score >= PASS_THRESHOLD

  if (quizCompleted) {
    return (
      <View style={styles.fullscreenModal}>
        <QuizFeedbackComp
          message={
            passed
              ? `${playerName}, you have proven yourself worthy. The ancient spirits acknowledge your mastery. Score: ${score}%`
              : `The knowledge eludes you, ${playerName}. You have failed the trial. The spirits are displeased. Score: ${score}%`
          }
          buttonText="Continue"
          guideImage={require('@/assets/images/guides/guide-val.png')}
          backgroundImage={require('@/assets/images/bg-assets/bg-quiz.png')}
          dialogBackgroundImage={require('@/assets/onboarding/dialog-bg-2.png')}
          titleBackgroundImage={require('@/assets/onboarding/dialog-bg-1.png')}
          buttonBackgroundImage={require('@/assets/onboarding/button-bg-main.png')}
          onBack={onBack}
          onContinue={handleQuizComplete}
          answerType={passed}
          badgeText={passed ? 'TRIAL PASSED' : 'TRIAL FAILED'}
        />
      </View>
    )
  }

  if (showFeedback && currentAnswer !== null) {
    return (
      <View style={styles.fullscreenModal}>
        <QuizFeedbackComp
          message=""
          explanation={currentQuestion.explanation}
          buttonText={currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
          guideImage={require('@/assets/images/guides/guide-val.png')}
          backgroundImage={require('@/assets/images/bg-assets/bg-quiz.png')}
          dialogBackgroundImage={require('@/assets/onboarding/dialog-bg-2.png')}
          titleBackgroundImage={require('@/assets/onboarding/dialog-bg-1.png')}
          buttonBackgroundImage={require('@/assets/onboarding/button-bg-main.png')}
          onBack={onBack}
          onContinue={handleNextQuestion}
          answerType={currentAnswer}
          badgeText={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
        />
      </View>
    )
  }

  const options = ['True', 'False']

  return (
    <View style={styles.fullscreenModal}>
      <ImageBackground
        source={require('@/assets/images/bg-assets/bg-quiz.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.contentWrapper}>
          <View style={styles.quizContainer}>
            <Text style={[GameFonts.body, styles.quizTitle]}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>

            <Text style={[GameFonts.body, styles.quizQuestion]}>{currentQuestion.text}</Text>

            <View style={styles.quizOptionsContainer}>
              {options.map((option, index) => {
                const isSelected =
                  (option === 'True' && selectedAnswer === true) || (option === 'False' && selectedAnswer === false)

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOptionPress(option)}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  >
                    <Text style={[styles.quizOption, isSelected && styles.quizOptionSelected]}>{option}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity onPress={handleSubmit} style={styles.buttonTouchable} disabled={selectedAnswer === null}>
              <ImageBackground
                source={require('@/assets/onboarding/button-bg-main.png')}
                style={styles.buttonBackground}
                resizeMode="contain"
              >
                <Text style={[GameFonts.button, styles.buttonText]}>Submit</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  fullscreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: 40,
    width: '100%',
  },
  quizContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
    borderColor: 'rgba(200, 115, 35, 0.6)',
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '85%',
    maxWidth: 600,
    rowGap: 25,
  },
  quizTitle: {
    color: 'rgba(200, 116, 35, 0.9)',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  quizQuestion: {
    color: 'white',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
  },
  quizOptionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 20,
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(200, 116, 35, 0.3)',
    borderColor: 'rgba(200, 116, 35, 0.8)',
  },
  quizOption: {
    color: '#E0E0E0',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  quizOptionSelected: {
    color: '#FFFFFF',
  },
  buttonWrapper: {
    alignItems: 'center',
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

export default Quiz