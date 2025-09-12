import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { Guides as characters } from '@/types/mobile'
import React, { useContext, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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

    // SAVE THE SELECTED GUIDE TO CONTEXT
    setSelectedGuide(selectedCharacter)

    // MOVE TO PERSONA SELECTION
    setCurrentOnboardingScreen('persona')

    console.log('Selected guide saved:', selectedCharacter.name)
  }

  const getCharacterIcon = (characterId: string) => {
    switch (characterId) {
      case '1':
        return require('../assets/onboarding/builder-icon.png') // Builder
      case '2':
        return require('../assets/onboarding/oracle-icon.png') // Oracle/Knowledge
      case '3':
        return require('../assets/onboarding/gaurdian-icon.png') // Guardian/Combat
      case '4':
        return require('../assets/onboarding/daemon-icon.png') // Daemon
      default:
        return '⚡'
    }
  }
  const getCharacterImage = (characterId: string) => {
    switch (characterId) {
      case '1':
        return require('../assets/images/guides/guide-val.png') // Validator/Builder
      case '2':
        return require('../assets/images/guides/guide-oracle.png') // Oracle/Knowledge
      case '3':
        return require('../assets/images/guides/guide-guard.png') // Guardian/Combat
      case '4':
        return require('../assets/images/guides/guide-daemon.png') // Daemon
      default:
        return '⚡'
    }
  }

  return (
    <View style={styles.container}>
      {/* Character Cards Grid */}
      <ImageBackground
        source={require('../assets/onboarding/dialog-bg-1.png')}
        style={styles.titleContainer}
        className="px-12 py-6"
        resizeMode="contain"
      >
        <Text className="text-base  text-[#E0E0E0]" style={[GameFonts.epic]}>
          Choose your guide
        </Text>
      </ImageBackground>

      <View style={styles.cardsGrid}>
        {characters.map((character, index) => (
          <TouchableOpacity
            className="flex items-center justify-between flex-col py-1 relative"
            key={character.id}
            onPress={() => handleCharacterSelect(index)}
          >
            <View
              className={`h-40 w-[85%] rounded-lg bg-[#1a1a1a]/60 ${
                selectedIndex === index ? 'border-2 border-[#cd7f32]' : 'border-0'
              }`}
            >
              <Image
                source={getCharacterImage(character.id)}
                resizeMode="contain"
                style={{ top: -57 }}
                className="h-[200px] w-[190px]"
              />
            </View>
            <ImageBackground
              source={
                selectedIndex === index
                  ? require('../assets/onboarding/dialog-bg-3-active.png')
                  : require('../assets/onboarding/dialog-bg-3.png')
              }
              className={`flex items-center justify-center p-4 z-10`}
              resizeMode="contain"
              style={{
                top: -12,
              }}
            >
              <Text style={[GameFonts.body, styles.characterName]}>{character.name}</Text>
              <View className="flex flex-row items-center">
                <Image source={getCharacterIcon(character.id)} resizeMode="contain" className="w-8 h-8" />
                <Text style={[GameFonts.body, styles.characterTitle]}>{character.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity className="flex items-center justify-center" onPress={handleConfirm} activeOpacity={0.85}>
          <ImageBackground
            source={require('../assets/onboarding/button-bg-main.png')}
            className="flex items-center justify-center p-5  w-fit"
            resizeMode="contain"
            style={{
              top: -10,
            }}
          >
            <Text style={[GameFonts.button]} className="text-lg">
              Choose this guide
            </Text>
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
  cardsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    maxWidth: 460,
    gap: 12,
    marginTop: 5,
  },
  cardContainer: {
    width: '42%',
    minWidth: 100,
    marginBottom: 20,
    opacity: 0.7,
    backgroundColor: '#CA742226',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
  },
  selectedCard: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    backgroundColor: '#CA742290',
    borderColor: '#cd7f32',
    shadowColor: '#cd7f32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#CA742226',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  characterIcon: {
    fontSize: 32,
  },
  characterName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  characterTitle: {
    color: '#cd7f32',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedGuideInfo: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  selectedGuideText: {
    color: '#cd7f32',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedGuideDescription: {
    color: '#E0E0E0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmButtonContainer: {
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#121212',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#cd7f32',
    minWidth: 400,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#cd7f32',
    textAlign: 'center',
    letterSpacing: 1,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

export default CharacterSelection
