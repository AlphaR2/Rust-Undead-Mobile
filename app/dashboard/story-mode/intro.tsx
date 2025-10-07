import ConversationScreen from '@/components/ui/Conversation'
import { CreateContext } from '@/context/Context'
import { router } from 'expo-router'
import React, { useContext, useMemo } from 'react'
import PERSONA_BACKGROUND from '../../../assets/images/bg-assets/bg-012.png'
import guide4 from '../../../assets/images/guides/guide-daemon.png'
import guide3 from '../../../assets/images/guides/guide-guard.png'
import guide2 from '../../../assets/images/guides/guide-oracle.png'
import guide1 from '../../../assets/images/guides/guide-val.png'

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

interface StoryModeIntroProps {
  onBack: () => void
}

const StoryModeIntro: React.FC<StoryModeIntroProps> = ({ onBack }) => {
  const { selectedGuide, playerName } = useContext(CreateContext).onboarding

  const guideImage = GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1

  const badgeText = selectedGuide?.name ? GUIDE_TITLES[selectedGuide.name] || 'GUIDE' : 'GUIDE'

  const message = useMemo((): string => {
    const name = playerName || 'Warrior'
    return `${name} of the Undead Realms, You must walk the Paths of destiny, each carved with secrets of the undead realm. Only those who endure will command the future. Behold the Path of Destiny. Preview the chapters that await you.`
  }, [playerName])

  const handleBeginJourney = () => {
    router.push('/dashboard/story-mode/roadmap')
  }

  return (
    <ConversationScreen
      title="STORY MODE"
      message={message}
      buttonText="Begin your journey"
      guideImage={guideImage}
      badgeText={badgeText}
      backgroundImage={PERSONA_BACKGROUND}
      dialogBackgroundImage={require('../../../assets/onboarding/dialog-bg-2.png')}
      titleBackgroundImage={require('../../../assets/onboarding/dialog-bg-1.png')}
      buttonBackgroundImage={require('../../../assets/onboarding/button-bg-main.png')}
      onBack={onBack}
      onContinue={handleBeginJourney}
      showMuteButton={true}
      showBackButton={true}
      typewriterDelay={300}
      autoShowButton={false}
      overlayOpacity={0.5}
    />
  )
}

export default StoryModeIntro
