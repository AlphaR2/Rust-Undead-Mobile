import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo } from 'react'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import OverlayScreen from '../ui/Overlay'
import QuizSample from '@/app/dashboard/story-mode/chapter-one/QuizSample'

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

const CheckpointModal: React.FC<CheckpointModalProps> = ({ visible, content, onContinue }) => {
  const { selectedGuide, playerName } = useContext(CreateContext).onboarding

  const guideImage = GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1

  const message = content?.learning_content?.big_note.join(',') || ''

  if (!content) return null

  if (content.topic_id === 6) {
    return <QuizSample onComplete={onContinue} onBack={() => console.log('back')} />
  }

  return (
    <OverlayScreen
      title={content.title || ''}
      message={message}
      learningContent={content.learning_content || { summary: '', big_note: [], battle_relevance: '' }}
      buttonText={'Continue'}
      guideImage={guideImage}
      // badgeText={badgeText}
      // backgroundImage={PERSONA_BACKGROUND}
      dialogBackgroundImage={require('../../assets/onboarding/dialog-bg-2.png')}
      titleBackgroundImage={require('../../assets/onboarding/dialog-bg-1.png')}
      buttonBackgroundImage={require('../../assets/onboarding/button-bg-main.png')}
      // onBack={onBack}
      onContinue={onContinue}
      showMuteButton={true}
      showBackButton={false}
      typewriterDelay={300}
      autoShowButton={false}
      overlayOpacity={0.7}
    />
  )
}
export default CheckpointModal
