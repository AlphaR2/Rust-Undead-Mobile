import SelectionScreen from '@/components/ui/Items'
import React from 'react'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/bg-012.png'
import Path1 from '../../../../assets/images/paths/path-01.svg'
import Path2 from '../../../../assets/images/paths/path-02.svg'
import Path3 from '../../../../assets/images/paths/path-03.svg'
import Path4 from '../../../../assets/images/paths/path-04.svg'

const PATHS = [
  {
    id: '1',
    title: 'The Cursed Ledger',
    subtitle: 'Blockchain',
    image: Path1,
    isLocked: false,
    isSvg: true,
  },
  {
    id: '2',
    title: "Solana's Shadow Bolt",
    subtitle: 'What makes Solana special',
    image: Path2,
    isLocked: true,
    isSvg: true,
  },
  {
    id: '3',
    title: 'The Cursed Keys of Binding',
    subtitle: 'Cryptovaults',
    image: Path3,
    isLocked: true,
    isSvg: true,
  },
  {
    id: '4',
    title: 'The Soul Transaction Ritual',
    subtitle: 'Anatomy of soul transaction',
    image: Path4,
    isLocked: true,
    isSvg: true,
  },
]

interface PathScreenProps {
  onComplete: () => void
  onBack: () => void
}

const PathScreen: React.FC<PathScreenProps> = ({ onComplete, onBack }) => {
  const handlePathSelect = (pathId: string) => {
    onComplete()
  }

  return (
    <SelectionScreen
      title="CHAPTER 1"
      description="Five paths lie before you, each holding a shard of ancient power. Walk them all, or remain bound in eternal dusk."
      items={PATHS}
      backgroundImage={PERSONA_BACKGROUND}
      titleBackgroundImage={require('../../../../assets/onboarding/dialog-bg-1.png')}
      onBack={onBack}
      onSelect={handlePathSelect}
      showMuteButton={true}
      showBackButton={true}
      overlayOpacity={0.5}
    />
  )
}

export default PathScreen
