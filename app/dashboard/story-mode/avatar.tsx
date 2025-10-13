import AnimatedCharacterCard from '@/components/GameCard/AnimatedCharacterCard'
import { GameFonts } from '@/constants/GameFonts'
import { CharacterClass } from '@/constants/characters'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useState } from 'react'
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PERSONA_BACKGROUND from '../../../assets/images/bg-assets/bg-012.png'

const CHARACTERS = [
  {
    class: 'oracle' as CharacterClass,
    name: 'The Oracle',
    description: 'Master of ancient wisdom',
  },
  {
    class: 'validator' as CharacterClass,
    name: 'The Validator',
    description: 'Balanced fighter',
  },
  {
    class: 'guardian' as CharacterClass,
    name: 'The Guardian',
    description: 'Fortress of protection',
  },
  {
    class: 'daemon' as CharacterClass,
    name: 'The Daemon',
    description: 'Aggression and speed',
  },
]

interface AvatarSelectionProps {
  onComplete: (selectedCharacter: CharacterClass) => void
  onBack: () => void
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onComplete, onBack }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterClass | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  const handleSelect = useCallback(
    (characterClass: CharacterClass) => {
      setSelectedCharacter(characterClass)
      onComplete(characterClass)
    },
    [onComplete]
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return (
    <ImageBackground source={PERSONA_BACKGROUND} style={styles.container}>
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
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

      <View style={styles.content}>
        <ImageBackground
          source={require('../../../assets/onboarding/dialog-bg-1.png')}
          style={styles.titleContainer}
          resizeMode="contain"
        >
          <Text style={[GameFonts.epic, styles.titleText]}>CHOOSE YOUR AVATAR</Text>
        </ImageBackground>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.charactersContainer}
        >
          {CHARACTERS.map((character) => (
            <AnimatedCharacterCard
              key={character.class}
              characterClass={character.class}
              name={character.name}
              description={character.description}
              isSelected={selectedCharacter === character.class}
              onSelect={() => handleSelect(character.class)}
            />
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    top: 12,
    left: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  titleContainer: {
    alignItems: 'center',
    padding: 16,
  },
  titleText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  charactersContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
})

export default AvatarSelection