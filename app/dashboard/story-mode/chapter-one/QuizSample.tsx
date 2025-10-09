import ConversationScreen from '@/components/ui/Conversation'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo } from 'react'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/chapter-01.png'
import guide4 from '../../../../assets/images/guides/guide-daemon.png'
import guide3 from '../../../../assets/images/guides/guide-guard.png'
import guide2 from '../../../../assets/images/guides/guide-oracle.png'
import guide1 from '../../../../assets/images/guides/guide-val.png'
import Quiz from '@/components/ui/Quiz'

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

interface ChapterIntroProps {
  onComplete: () => void
  onBack: () => void
}

const QuizSample: React.FC<ChapterIntroProps> = ({ onComplete, onBack }) => {
  const { selectedGuide, playerName } = useContext(CreateContext).onboarding

  const guideImage = GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  const badgeText = selectedGuide?.name ? GUIDE_TITLES[selectedGuide.name] || 'GUIDE' : 'GUIDE'
  const message = useMemo((): string => {
    const name = playerName || 'Warrior'
    return `${name}, you have entered the realm of shadows. Four trials stand between you and mastery. Only those who conquer all shall unlock the path forward. Steel yourself, for the undead do not forgive weakness.`
  }, [playerName])

   const options = [
    "Because it is protected by a powerful spell",
    "Because each record is chained to the one before it, making it impossible to alter.",
    "Because it is guarded by undead creatures",
    
  ]

  return (
    <Quiz
      title="THE CURSED LEDGER"
      // message={message}
      question='Why can’t anyone erase what is written in the Cursed Ledger?'
      options={options}
      buttonText="Submit Answer"
      guideImage={guideImage}
      badgeText={badgeText}
      backgroundImage={PERSONA_BACKGROUND}
      dialogBackgroundImage={require('../../../../assets/onboarding/dialog-bg-2.png')}
      titleBackgroundImage={require('../../../../assets/onboarding/dialog-bg-1.png')}
      buttonBackgroundImage={require('../../../../assets/onboarding/button-bg-main.png')}
      onBack={onBack}
      onContinue={onComplete}
      showMuteButton={true}
      showBackButton={true}
      typewriterDelay={300}
      autoShowButton={false}
      overlayOpacity={0.7}
    />
  )
}

export default QuizSample
