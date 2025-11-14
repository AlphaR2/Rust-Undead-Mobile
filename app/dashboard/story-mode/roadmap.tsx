import { toast } from '@/components/ui/Toast'
import { PROGRAM_ID } from '@/config/program'
import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { startChapter } from '@/hooks/Rollup/useUndeadActions'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import { useKora } from '@/hooks/useKora'
import { useEphemeralProgram, useMagicBlockProvider, useWalletInfo } from '@/hooks/useUndeadProgram'
import { encodeWorldId, usePDAs } from '@/hooks/utils/useHelpers'
import { MaterialIcons } from '@expo/vector-icons'
import { PublicKey } from '@solana/web3.js'
import { router } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Svg, { Line, SvgProps } from 'react-native-svg'
import BACKGROUND from '../../../assets/images/bg-assets/bg-012.png'
import ActiveChapter from '../../../assets/images/roadmap/active-01.svg'
import Lock from '../../../assets/images/roadmap/lock.svg'

interface Chapters {
  id: number
  title: string
  slug: any
  image: React.FC<SvgProps> | any
  isLocked: boolean
  progress?: string
  isCompleted: boolean
  isSvg: boolean
  position: {
    x: number
    y: number
  }
}

const CHAPTERS: Chapters[] = [
  {
    id: 1,
    title: 'The First Awakening',
    slug: 'chapter-one',
    image: ActiveChapter,
    isLocked: false,
    progress: '0/4',
    isCompleted: false,
    isSvg: true,
    position: { x: 0, y: 0 },
  },
  {
    id: 2,
    title: 'Coming Soon',
    slug: 'chapter-two',
    image: require('../../../assets/images/roadmap/inactive-02.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 230, y: -85 },
  },
  {
    id: 3,
    title: 'Coming Soon',
    slug: 'chapter-three',
    image: require('../../../assets/images/roadmap/inactive-03.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 440, y: 0 },
  },
  {
    id: 4,
    title: 'Coming Soon',
    slug: 'chapter-four',
    image: require('../../../assets/images/roadmap/inactive-04.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 680, y: -85 },
  },
  {
    id: 5,
    title: 'Coming Soon',
    slug: 'chapter-five',
    image: require('../../../assets/images/roadmap/inactive-05.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 920, y: 0 },
  },
  {
    id: 6,
    title: 'Coming Soon',
    slug: 'chapter-six' as any,
    image: require('../../../assets/images/roadmap/inactive-06.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 1110, y: -85 },
  },
]

const ICON_SIZE = 119.22

const ChapterRoadmap = () => {
  const [isMuted, setIsMuted] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [loadingChapterId, setLoadingChapterId] = useState<number | null>(null)
  const [chapterStatus, setChapterStatus] = useState<{ [key: number]: 'not-started' | 'in-progress' | 'completed' }>({})
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const { publicKey, walletType } = useWalletInfo()
  const ephemeralProgram = useEphemeralProgram(PROGRAM_ID)
  const { gamerProfilePda } = usePDAs(publicKey)
  const magicBlockProvider = useMagicBlockProvider()
  const KoraService = useKora()
  const { userAddress } = useBasicGameData()
  const { auth } = useContext(CreateContext)
  const { getUserIdByWallet } = auth

  useEffect(() => {
    loadChapterStatus()
  }, [ephemeralProgram, gamerProfilePda])

  const updateUserProgress = async (chapter: number, path: number) => {
    try {
      const userId = await getUserIdByWallet(userAddress!)
      if (!userId) {
        throw new Error('User ID not found')
      }

      const authToken = process.env.EXPO_PUBLIC_AUTH_PASSWORD
      const response = await fetch(`https://undead-protocol.onrender.com/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        method: 'PATCH',
        body: JSON.stringify({
          userProgress: {
            chapter,
            path,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user progress')
      }

      return true
    } catch (error) {
      console.error('Error updating user progress:', error)
      return false
    }
  }

  const loadChapterStatus = async () => {
    if (!ephemeralProgram || !gamerProfilePda) {
      setIsLoadingStatus(false)
      return
    }

    try {
      const profile = await ephemeralProgram.account.gamerProfile.fetch(gamerProfilePda)
      const currentChapter = profile.currentChapter

      const statusMap: { [key: number]: 'not-started' | 'in-progress' | 'completed' } = {}

      CHAPTERS.forEach((chapter) => {
        if (chapter.id < currentChapter) {
          statusMap[chapter.id] = 'completed'
        } else if (chapter.id === currentChapter && currentChapter > 0) {
          statusMap[chapter.id] = 'in-progress'
        } else {
          statusMap[chapter.id] = 'not-started'
        }
      })

      setChapterStatus(statusMap)
    } catch (error) {
      console.error('Failed to load chapter status')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleChapterSelect = async (chapterId: number) => {
    const chapter = CHAPTERS.find((ch) => ch.id === chapterId)
    if (!chapter || chapter.isLocked || isStarting) return

    const status = chapterStatus[chapterId]

    if (status === 'in-progress') {
      router.push(`/dashboard/story-mode/chapter-one`)
      return
    }

    if (status === 'not-started') {
      await handleStartChapter(chapterId, chapter.slug, chapter.title)
    }
  }

  const handleStartChapter = async (chapterId: number, slug: string, chapterTitle: string) => {
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
        setChapterStatus((prev) => ({
          ...prev,
          [chapterId]: 'in-progress',
        }))

        if (userAddress) {
          await updateUserProgress(chapterId, 1)
        }

        toast.success('Success', 'Chapter started!')

        setTimeout(() => {
          router.push(`/dashboard/story-mode/chapter-one`)
        }, 500)
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

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const getChapterButtonStyle = (chapterId: number) => {
    const status = chapterStatus[chapterId]
    const isLoading = loadingChapterId === chapterId

    if (isLoading) {
      return styles.chapterButtonLoading
    }

    if (status === 'in-progress') {
      return styles.chapterButtonActive
    }

    if (status === 'completed') {
      return styles.chapterButtonCompleted
    }

    return styles.chapterButtonDefault
  }

  const getChapterLabel = (chapter: Chapters) => {
    const status = chapterStatus[chapter.id]
    const isLoading = loadingChapterId === chapter.id

    if (isLoading) {
      return 'Starting...'
    }

    if (status === 'in-progress') {
      return 'Continue'
    }

    if (status === 'completed') {
      return 'Completed'
    }

    if (chapter.isLocked) {
      return chapter.title
    }

    return 'Start Chapter'
  }

  if (isLoadingStatus) {
    return (
      <ImageBackground style={styles.container} source={BACKGROUND}>
        <View style={styles.blackOverlay} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading chapters...</Text>
        </View>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground style={styles.container} source={BACKGROUND}>
      <View style={styles.blackOverlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton} disabled={isStarting}>
          <View style={styles.iconBackground}>
            <MaterialIcons name="arrow-back" size={22} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <MaterialIcons name={isMuted ? 'volume-off' : 'volume-up'} size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <ImageBackground
        source={require('../../../assets/onboarding/dialog-bg-1.png')}
        style={styles.titleContainer}
        resizeMode="contain"
      >
        <Text style={[GameFonts.epic, styles.titleText]}>ROADMAP</Text>
      </ImageBackground>

      <View style={styles.roadmapWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          scrollEnabled={!isStarting}
        >
          <View style={styles.roadmapContainer}>
            <Svg height={300} width={1200} style={styles.svg}>
              {CHAPTERS.map((chapter, index) => {
                if (index < CHAPTERS.length - 1) {
                  const startX = chapter.position.x + ICON_SIZE / 2
                  const startY = 150 + chapter.position.y
                  const endX = CHAPTERS[index + 1].position.x + ICON_SIZE / 2
                  const endY = 150 + CHAPTERS[index + 1].position.y

                  const isCompleted = chapterStatus[chapter.id] === 'completed'

                  return (
                    <Line
                      key={`line-${chapter.id}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={isCompleted ? '#D97706' : 'rgba(255, 255, 255, 0.3)'}
                      strokeWidth="12"
                    />
                  )
                }
                return null
              })}
            </Svg>

            {CHAPTERS.map((chapter) => {
              const isLoading = loadingChapterId === chapter.id
              const status = chapterStatus[chapter.id]
              const isDisabled = chapter.isLocked || isStarting

              return (
                <View
                  key={chapter.id}
                  style={[
                    styles.chapterNode,
                    {
                      top: chapter.position.y,
                      left: chapter.position.x,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleChapterSelect(chapter.id)}
                    disabled={isDisabled}
                    style={[styles.chapterButton, getChapterButtonStyle(chapter.id)]}
                  >
                    <View style={styles.chapterImageContainer}>
                      {isLoading ? (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="large" color="#D97706" />
                        </View>
                      ) : (
                        <>
                          {chapter.isSvg ? (
                            <chapter.image width={140} height={140} />
                          ) : (
                            <Image source={chapter.image} style={styles.chapterImage} resizeMode="contain" />
                          )}
                          {chapter.isLocked && <Lock width={30} height={30} style={styles.chapterLock} />}
                          {status === 'in-progress' && chapter.progress && (
                            <View style={styles.progressBadge}>
                              <Text style={styles.progressText}>{chapter.progress}</Text>
                            </View>
                          )}
                          {status === 'completed' && (
                            <View style={styles.completedBadge}>
                              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.chapterLabelCard,
                      status === 'in-progress' && styles.chapterLabelCardActive,
                      status === 'completed' && styles.chapterLabelCardCompleted,
                    ]}
                  >
                    <Text style={styles.chapterLabel}>{getChapterLabel(chapter)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          Each chapter is a step toward mastery, the end awaits only the persistent commander.
        </Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    top: 12,
    left: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 8,
    zIndex: 100,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: '#131313',
    borderRadius: 17,
    padding: 6.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterLock: {
    position: 'absolute',
    top: 22,
    right: 38,
  },
  titleContainer: {
    alignItems: 'center',
    padding: 8,
    marginTop: 32,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  roadmapWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 60,
    paddingVertical: 100,
    minWidth: '100%',
  },
  roadmapContainer: {
    position: 'relative',
    width: 1200,
  },
  svg: {
    position: 'absolute',
    top: -90,
    left: 1,
  },
  chapterNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  chapterButton: {
    alignItems: 'center',
  },
  chapterButtonDefault: {
    opacity: 1,
  },
  chapterButtonActive: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  chapterButtonCompleted: {
    opacity: 0.8,
  },
  chapterButtonLoading: {
    opacity: 0.6,
  },
  chapterImageContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 119.22,
    height: 97,
  },
  chapterImage: {
    height: 145,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
  },
  progressBadge: {
    position: 'absolute',
    top: -1,
    left: -12,
    backgroundColor: '#D97706',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedBadge: {
    position: 'absolute',
    top: -5,
    right: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  chapterLabelCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(200, 116, 35, 0.4)',
  },
  chapterLabelCardActive: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: '#D97706',
    borderWidth: 2,
  },
  chapterLabelCardCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  chapterLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 4,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})

export default ChapterRoadmap
