import React from 'react'
import SelectionScreen from '@/components/ui/Items'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/bg-012.png'

interface OnboardingProps {
  onComplete: () => void
  onBack: () => void
}

const Onboarding : React.FC<OnboardingProps>  = ({ onComplete, onBack }) => {
   const handleAvatarSelect = (avatarId: string) => {
    onComplete()
  }

  return (
    <SelectionScreen
      title="THE CURSED LEDGER"
      description="You step into the Vault of Eternal Records. A glowing book floats in the air, bound by chains of light. Only the one who understands the Ledger may pass."
      items={[]}
      backgroundImage={PERSONA_BACKGROUND}
      titleBackgroundImage={require('../../../../assets/onboarding/dialog-bg-1.png')}
      onBack={onBack}
      onSelect={handleAvatarSelect}
      showMuteButton={true}
      showBackButton={true}
      overlayOpacity={0.7}
      mainImage={require('../../../../assets/images/chapter1/transparent-Photoroom.png')}
      buttonBackgroundImage={require('../../../../assets/onboarding/button-bg-main.png')}
      ctaButtonText='Continue'
    />
  )
}

export default Onboarding