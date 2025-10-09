import SelectionScreen from '@/components/ui/Items'
import React from 'react'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/bg-012.png'
import guide4 from '../../../../assets/images/guides/guide-daemon.png'
import guide3 from '../../../../assets/images/guides/guide-guard.png'
import guide2 from '../../../../assets/images/guides/guide-oracle.png'
import guide1 from '../../../../assets/images/guides/guide-val.png'

const AVATARS = [
  {
    id: '1',
    title: 'Shadow Warrior',
    subtitle: 'Master of stealth and precision',
    image: guide1,
    isLocked: false,
  },
  {
    id: '2',
    title: 'Blood Knight',
    subtitle: 'Wielder of dark magic',
    image: guide2,
    isLocked: false,
  },
  {
    id: '3',
    title: 'Necro Mage',
    subtitle: 'Unstoppable force of power',
    image: guide3,
    isLocked: false,
  },
  {
    id: '4',
    title: 'Soul Reaper',
    subtitle: 'Harbinger of death',
    image: guide4,
    isLocked: false,
  },
]

interface AvatarSelectionProps {
  onComplete: () => void
  onBack: () => void
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onComplete, onBack }) => {
  const handleAvatarSelect = (avatarId: string) => {
    onComplete()
  }

  return (
    <SelectionScreen
      title="CHOOSE YOUR AVATAR"
      description="Your avatar represents your presence in the undead realm. Choose the form that shows your might as a commander."
      items={AVATARS}
      backgroundImage={PERSONA_BACKGROUND}
      titleBackgroundImage={require('../../../../assets/onboarding/dialog-bg-1.png')}
      onBack={onBack}
      onSelect={handleAvatarSelect}
      showMuteButton={true}
      showBackButton={true}
      overlayOpacity={0.7}
      mainImage={undefined}
    />
  )
}

export default AvatarSelection
