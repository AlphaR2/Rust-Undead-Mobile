import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  ImageBackground,
  StyleSheet,
} from 'react-native'


interface Character {
  id: string
  name: string
  title: string
  description: string
  recommendedFor: string
  image: string
}

const characters: Character[] = [
  {
    id: '1',
    name: 'VALDOR THE VALIDATOR',
    title: '(Balanced)',
    description:
      "I am Valdor, guardian of consensus. I'll teach you the ancient ways of agreement and truth in this realm.",
    recommendedFor: 'Complete beginners',
    image:
      'https://res.cloudinary.com/deensvquc/image/upload/v1752487234/samples/upscale-face-1.jpg',
  },
  {
    id: '2',
    name: 'ORACLE MYSTRAL',
    title: '(Knowledge Specialist)',
    description:
      "I am Mystral, keeper of sacred knowledge. Through me, you'll learn the deepest secrets of this realm.",
    recommendedFor: 'Intermediate users',
    image:
      'https://res.cloudinary.com/deensvquc/image/upload/v1752487234/samples/woman-on-a-football-field.jpg',
  },
  {
    id: '3',
    name: 'GUARDIAN NEXUS',
    title: '(Combat Expert)',
    description:
      'I am Nexus, master of battle tactics. I will forge you into a formidable warrior of this digital realm.',
    recommendedFor: 'Advanced users',
    image: 'https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Nexus',
  },
]

const SWIPE_THRESHOLD = 50
const SWIPE_DIRECTION_THRESHOLD = 10

const CharacterCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : characters.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < characters.length - 1 ? prev + 1 : 0))
  }

  const handleConfirm = () => {
    const selectedCharacter = characters[currentIndex]
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > SWIPE_DIRECTION_THRESHOLD
      )
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        handlePrevious()
      } else if (gestureState.dx < -SWIPE_THRESHOLD) {
        handleNext()
      }
    },
  })

  const getVisibleCharacters = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : characters.length - 1

    return [
      {
        character: characters[prevIndex],
        index: prevIndex,
        isActive: false,
      },
      {
        character: characters[currentIndex],
        index: currentIndex,
        isActive: true,
      },
    ]
  }

  const currentCharacter = characters[currentIndex]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Select a tour guide</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.carouselContainer}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.charactersContainer} {...panResponder.panHandlers}>
            {getVisibleCharacters().map(({ character, index, isActive }) => (
              <View
                key={character.id}
                style={[styles.characterWrapper, !isActive && styles.inactiveCharacter]}
              >
                <Image
                  source={{ uri: character.image }}
                  style={[styles.characterImage, isActive ? styles.activeImage : styles.inactiveImage]}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <ImageBackground
            source={{
              uri: 'https://res.cloudinary.com/deensvquc/image/upload/v1753427362/Group_1_khuulp.png',
            }}
            style={styles.infoBackground}
            resizeMode="contain"
          >
            <View style={styles.infoContent}>
              <Text style={styles.characterName}>{currentCharacter.name}</Text>

              <Text style={styles.characterTitle}>{currentCharacter.title}</Text>

              <Text style={styles.characterDescription}>"{currentCharacter.description}"</Text>

              <View style={styles.recommendedSection}>
                <Text style={styles.recommendedLabel}>Recommended for:</Text>
                <Text style={styles.recommendedText}>{currentCharacter.recommendedFor}</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>

      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#92400e',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    color: '#fbbf24',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    maxWidth: 672,
  },
  navButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: 'bold',
  },
  charactersContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 64,
  },
  characterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveCharacter: {
    opacity: 0.5,
  },
  characterImage: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  activeImage: {
    width: 144,
    height: 224,
  },
  inactiveImage: {
    width: 112,
    height: 176,
  },
  infoCard: {
    width: 320,
    marginLeft: 32,
  },
  infoBackground: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 32,
  },
  characterName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  characterTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  characterDescription: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  recommendedSection: {
    marginTop: 'auto',
  },
  recommendedLabel: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#b45309',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 128,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default CharacterCarousel