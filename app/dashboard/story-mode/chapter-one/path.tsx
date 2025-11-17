import SelectionScreen from '@/components/ui/Items'
import { useContext, useState } from 'react'
import { CreateContext } from '@/context/Context'
import React from 'react'
import PERSONA_BACKGROUND from '../../../../assets/images/bg-assets/bg-012.png'
import Path1 from '../../../../assets/images/paths/path-01.svg'
import Path2 from '../../../../assets/images/paths/path-02.svg'
import Path3 from '../../../../assets/images/paths/path-03.svg'
import Path4 from '../../../../assets/images/paths/path-04.svg'
import { useEphemeralProgram, useMagicBlockProvider, useWalletInfo } from '@/hooks/useUndeadProgram'
import { encodeWorldId, usePDAs } from '@/hooks/utils/useHelpers'
import { PROGRAM_ID } from '@/config/program'
import { useKora } from '@/hooks/useKora'
import { PublicKey } from '@solana/web3.js'
import { startChapter } from '@/hooks/Rollup/useUndeadActions'
import { toast } from '@/components/ui/Toast'
import { useRouter } from 'expo-router'
import ActiveChapter from '../../../../assets/images/roadmap/active-01.svg'

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
    isLocked: false,
    isSvg: false,
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
const CHAPTER = {
  id: 1,
  title: 'The First Awakening',
  slug: 'chapter-one',
  image: ActiveChapter,
  isLocked: false,
  progress: '0/4',
  isCompleted: false,
  isSvg: true,
  position: { x: 0, y: 0 },
}

const PathScreen: React.FC<PathScreenProps> = ({ onComplete, onBack }) => {
  const router = useRouter()
  const { publicKey, walletType } = useWalletInfo()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)
  const { gamerProfilePda } = usePDAs(publicKey)
  const magicBlockProvider = useMagicBlockProvider()
  const KoraService = useKora()
  const [isStarting, setIsStarting] = useState(false)
  const [loadingChapterId, setLoadingChapterId] = useState<number | null>(null)

  const [chapterStatus, setChapterStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started')

  const handleStartChapter = async (chapterId: number, slug: string, chapterTitle: string, pathId: string) => {
    if (!ephemeralProgram || !publicKey || !gamerProfilePda || !magicBlockProvider) {
      return
    }

    setIsStarting(true)
    setLoadingChapterId(chapterId)

    try {
      let koraBlockhash: string | undefined
      let koraPayer: PublicKey = publicKey
      let koraHealth = false

      if (walletType === 'privy') {
        try {
          koraHealth = await KoraService.checkHealth()

          if (koraHealth) {
            const [koraPayerInfo, koraBlockhashData] = await Promise.all([
              KoraService.service.getPayerSigner(),
              KoraService.service.getBlockhash(),
            ])

            if (koraPayerInfo?.signer_address) {
              koraPayer = new PublicKey(koraPayerInfo.signer_address)
            }

            if (koraBlockhashData?.blockhash) {
              koraBlockhash = koraBlockhashData.blockhash
            }
          }
        } catch (koraError) {
          toast.error('Kora unavailable')
          koraHealth = false
        }
      }

      const { worldIdBytes, undeadWorldPda } = encodeWorldId(chapterTitle, PROGRAM_ID)

      try {
        await ephemeralProgram.account.undeadWorld.fetch(undeadWorldPda)
      } catch (error) {
        toast.error('Error', 'Chapter not found')
        setIsStarting(false)
        setLoadingChapterId(null)
        return
      }

      const result = await startChapter({
        ephemeralProgram,
        playerPublicKey: publicKey,
        koraPayer,
        walletType,
        koraHealth,
        gamerProfilePda,
        undeadWorldPda,
        chapterNumber: chapterId,
        worldId: worldIdBytes,
        magicBlockProvider,
      })

      if (result.success) {
        setChapterStatus('in-progress')

        // toast.success('Success', 'Chapter started!')
        onComplete(pathId)
      } else {
        throw new Error(result.error || 'Failed to start chapter')
      }
    } catch (error: any) {
      toast.error('Error', error?.message || 'Failed to start chapter')
    } finally {
      setIsStarting(false)
      setLoadingChapterId(null)
    }
  }
  const handlePathSelect = (pathId: string) => {
        // onComplete(pathId)

    handleStartChapter(CHAPTER.id, CHAPTER.slug, CHAPTER.title, pathId)

    // console.log("path selected")
  }
  const { paths } = useContext(CreateContext).path

  return (
    <SelectionScreen
      title="THE FIRST AWAKENING"
      description="Four haunted paths hold wisdom. Tread them to rise from ignorance, or linger in shadow."
      items={paths}
      backgroundImage={PERSONA_BACKGROUND}
      titleBackgroundImage={require('../../../../assets/onboarding/dialog-bg-1.png')}
      onBack={onBack}
      onSelect={handlePathSelect}
      showMuteButton={true}
      showBackButton={true}
      overlayOpacity={0.5}
      isLoading={isStarting}
    />
  )
}

export default PathScreen
