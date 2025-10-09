import ConversationScreen from '@/components/ui/Conversation'
import { CreateContext } from '@/context/Context'
import React, { useContext, useMemo } from 'react'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/chapter-01.png'
import guide4 from '../../../../assets/images/guides/guide-daemon.png'
import guide3 from '../../../../assets/images/guides/guide-guard.png'
import guide2 from '../../../../assets/images/guides/guide-oracle.png'
import guide1 from '../../../../assets/images/guides/guide-val.png'

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

const Overlay: React.FC<ChapterIntroProps> = ({ onComplete, onBack }) => {
  const { selectedGuide, playerName } = useContext(CreateContext).onboarding

  const guideImage = GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  const badgeText = selectedGuide?.name ? GUIDE_TITLES[selectedGuide.name] || 'GUIDE' : 'GUIDE'
  const message = useMemo((): string => {
    const name = playerName || 'Warrior'
    return `The Cursed Ledger is no ordinary book. Every time a record is written, it locks onto the last, forming an unbreakable chain. No page can ever be erased, only added to, so the truth is preserved forever. In our world, this is called a blockchain: a chain of records that cannot be changed once written, trusted by all because everyone can see and agree on it.`
  }, [playerName])

  return (
    <ConversationScreen
      title="THE FIRST AWAKENING"
      message={message}
      buttonText="Begin Training"
      guideImage={guideImage}
      // badgeText={badgeText}
      // backgroundImage={PERSONA_BACKGROUND}
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

export default Overlay
