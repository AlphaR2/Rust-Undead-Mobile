import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { Guides as characters } from '@/types/mobile'
import React, { useContext, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const CHARACTER_ICONS: Record<string, any> = {
  '1': require('../assets/onboarding/builder-icon.png'),
  '2': require('../assets/onboarding/oracle-icon.png'),
  '3': require('../assets/onboarding/gaurdian-icon.png'),
  '4': require('../assets/onboarding/daemon-icon.png'),
}

const CHARACTER_IMAGES: Record<string, any> = {
  '1': require('../assets/images/guides/guide-val.png'),
  '2': require('../assets/images/guides/guide-oracle.png'),
  '3': require('../assets/images/guides/guide-guard.png'),
  '4': require('../assets/images/guides/guide-daemon.png'),
}

const CharacterSelection = () => {
  const { setCurrentOnboardingScreen, selectedGuide, setSelectedGuide } = useContext(CreateContext).onboarding

  const [selectedIndex, setSelectedIndex] = useState(
    selectedGuide ? characters.findIndex((char) => char.id === selectedGuide.id) : 0,
  )

  const handleCharacterSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const handleConfirm = () => {
    const selectedCharacter = characters[selectedIndex]
    setSelectedGuide(selectedCharacter)
    setCurrentOnboardingScreen('persona')
  }

  const getCharacterIcon = (characterId: string) => {
    return CHARACTER_ICONS[characterId] || '⚡'
  }

  const getCharacterImage = (characterId: string) => {
    return CHARACTER_IMAGES[characterId] || '⚡'
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/onboarding/dialog-bg-1.png')}
        style={styles.titleContainer}
        resizeMode="contain"
      >
        <Text style={[GameFonts.epic, styles.titleText]}>Choose your guide</Text>
      </ImageBackground>

      <View style={styles.cardsGrid}>
        {characters.map((character, index) => (
          <TouchableOpacity
            style={styles.cardTouchable}
            key={character.id}
            onPress={() => handleCharacterSelect(index)}
          >
            <View style={[styles.characterCard, selectedIndex === index && styles.selectedCharacterCard]}>
              <Image source={getCharacterImage(character.id)} resizeMode="contain" style={styles.characterImage} />
            </View>
            <ImageBackground
              source={
                selectedIndex === index
                  ? require('../assets/onboarding/dialog-bg-3-active.png')
                  : require('../assets/onboarding/dialog-bg-3.png')
              }
              style={styles.characterInfo}
              resizeMode="contain"
            >
              <Text style={[GameFonts.body, styles.characterName]}>{character.name}</Text>
              <View style={styles.characterTitleRow}>
                <Image source={getCharacterIcon(character.id)} resizeMode="contain" style={styles.characterIcon} />
                <Text style={[GameFonts.body, styles.characterTitle]}>{character.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
          <ImageBackground
            source={require('../assets/onboarding/button-bg-main.png')}
            style={styles.confirmButtonBackground}
            resizeMode="contain"
          >
            <Text style={[GameFonts.button, styles.confirmButtonText]}>Choose this guide</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  cardsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    maxWidth: 460,
    gap: 12,
    marginTop: 5,
  },
  cardTouchable: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingVertical: 4,
    position: 'relative',
  },
  characterCard: {
    height: 140,
    width: '80%',
    borderRadius: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    borderWidth: 0,
  },
  selectedCharacterCard: {
    borderWidth: 2,
    borderColor: '#cd7f32',
  },
  characterImage: {
    top: -35,
    height: 180,
    width: 180,
  },
  characterInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: -1,
    top: -5,
  },
  characterName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterIcon: {
    width: 32,
    height: 32,
  },
  characterTitle: {
    color: '#cd7f32',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmButtonContainer: {
    alignItems: 'center',
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: 'auto',
    top: -5,
  },
  confirmButtonText: {
    fontSize: 16,
  },
})

export default CharacterSelection
