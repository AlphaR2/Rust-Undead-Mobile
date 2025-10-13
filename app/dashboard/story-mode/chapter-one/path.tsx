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
    title: 'The Machine Spirits',
    subtitle: 'Foundations',
    image: Path1,
    isLocked: false,
    isSvg: true,
  },
  {
    id: '2',
    title: 'The Soul Keys',
    subtitle: 'Identity',
    image: Path2,
    isLocked: true,
    isSvg: true,
  },
  {
    id: '3',
    title: 'The Chain Wraiths',
    subtitle: 'Solana',
    image: Path3,
    isLocked: true,
    isSvg: true,
  },
  {
    id: '4',
    title: 'The Validator',
    subtitle: 'Distributed Systems',
    image: Path4,
    isLocked: true,
    isSvg: true,
  },
]

interface PathScreenProps {
  onComplete: (path: string) => void
  onBack: () => void
}

const PathScreen: React.FC<PathScreenProps> = ({ onComplete, onBack }) => {
  const handlePathSelect = (pathId: string) => {
    onComplete(pathId)
  }

  return (
    <SelectionScreen
      title="THE FIRST AWAKENING"
      description="Four haunted paths hold wisdom. Tread them to rise from ignorance, or linger in shadow."
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
