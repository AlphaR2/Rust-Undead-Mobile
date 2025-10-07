import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
    title: 'Chapter 1',
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
    title: 'Chapter 2',
    slug: 'chapter-two',
    image: require('../../../assets/images/roadmap/inactive-02.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 230, y: -85 },
  },
  {
    id: 3,
    title: 'Chapter 3',
    slug: 'chapter-three',
    image: require('../../../assets/images/roadmap/inactive-03.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 440, y: 0 },
  },
  {
    id: 4,
    title: 'Chapter 4',
    slug: 'chapter-four',
    image: require('../../../assets/images/roadmap/inactive-04.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 680, y: -85 },
  },
  {
    id: 5,
    title: 'Chapter 5',
    slug: 'chapter-five',
    image: require('../../../assets/images/roadmap/inactive-05.png'),
    isLocked: true,
    isCompleted: false,
    isSvg: false,
    position: { x: 920, y: 0 },
  },
  {
    id: 6,
    title: 'Chapter 6',
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

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleChapterSelect = (chapterId: number) => {
    const chapter = CHAPTERS.find((ch) => ch.id === chapterId)
    if (chapter && !chapter.isLocked) {
      if (chapter.id === 1) {
        router.push('/dashboard/story-mode/chapter-one')
      } else if (chapter.id === 2) {
        // router.push('/dashboard/story-mode/chapter-two')
      } else if (chapter.id === 3) {
        // router.push('/dashboard/story-mode/chapter-three')
      } else if (chapter.id === 4) {
        // router.push('/dashboard/story-mode/chapter-four')
      } else if (chapter.id === 5) {
        // router.push('/dashboard/story-mode/chapter-five')
      } else if (chapter.id === 6) {
        // router.push('/dashboard/story-mode/chapter-six')
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <ImageBackground style={styles.container} source={BACKGROUND}>
      <View style={styles.blackOverlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
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
        >
          <View style={styles.roadmapContainer}>
            <Svg height={300} width={1200} style={styles.svg}>
              {CHAPTERS.map((chapter, index) => {
                if (index < CHAPTERS.length - 1) {
                  const startX = chapter.position.x + ICON_SIZE / 2
                  const startY = 150 + chapter.position.y
                  const endX = CHAPTERS[index + 1].position.x + ICON_SIZE / 2
                  const endY = 150 + CHAPTERS[index + 1].position.y

                  return (
                    <Line
                      key={`line-${chapter.id}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={chapter.isCompleted ? '#D97706' : 'rgba(255, 255, 255, 0.3)'}
                      strokeWidth="12"
                    />
                  )
                }
                return null
              })}
            </Svg>

            {CHAPTERS.map((chapter) => (
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
                  disabled={chapter.isLocked}
                  style={styles.chapterButton}
                >
                  <View style={styles.chapterImageContainer}>
                    {chapter.isSvg ? (
                      <chapter.image width={140} height={140} />
                    ) : (
                      <Image source={chapter.image} style={styles.chapterImage} resizeMode="contain" />
                    )}
                    {chapter.isLocked && <Lock width={30} height={30} style={styles.chapterLock} />}
                    {chapter.progress && (
                      <View style={styles.progressBadge}>
                        <Text style={styles.progressText}>{chapter.progress}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.chapterLabelCard}>
                  <Text style={styles.chapterLabel}>{chapter.title}</Text>
                </View>
              </View>
            ))}
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
  chapterLabelCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
