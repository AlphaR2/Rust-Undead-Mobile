import { CreateContext } from '@/context/Context'
import { generateRandomDNA } from '@/utils/helper'
import { useRouter } from 'expo-router'
import React, { useContext, useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import PERSONA_BACKGROUND from '../../assets/images/bg-assets/bg-03.png'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

const GUIDE_NAMES: Record<string, string> = {
  'JANUS THE BUILDER': 'Janus',
  'JAREK THE ORACLE': 'Jarek',
  'GAIUS THE GUARDIAN': 'Gaius',
  'BRYN THE DAEMON': 'Bryn',
}

const MAX_WARRIOR_NAME_LENGTH = 20
const MAX_DNA_LENGTH = 20

const WarriorProfileSetup = () => {
  const router = useRouter()
  const { selectedGuide, selectedWarriorType, playerName, selectedPersona } = useContext(CreateContext).onboarding

  const [warriorName, setWarriorName] = useState('')
  const [newWarriorDNA, setNewWarriorDNA] = useState<string>('')

  const getGuideImage = () => {
    return GUIDE_IMAGES[selectedGuide?.id || '1'] || guide1
  }

  const getGuideName = (): string => {
    if (!selectedGuide?.name) return 'Guide'
    return GUIDE_NAMES[selectedGuide.name] || selectedGuide.name.split(' ')[0] || 'Guide'
  }

  const formatPersonaName = (persona: string): string => {
    return persona.replace(/([A-Z])/g, ' $1').trim()
  }

  const getDialogueMessage = (): string => {
    const name = playerName || 'Warrior'
    const warriorType = selectedWarriorType?.name || 'warrior'

    return `${name}, excellent choice on the ${warriorType}! Now we must forge your undead champion's identity. Give your warrior a name that will strike fear into your enemies, and let the ancient magic generate their unique DNA essence.`
  }

  const handleContinue = () => {
    if (!warriorName.trim()) return

    router.push('/dashboard')
  }

  const handleGenerateDNA = () => {
    setNewWarriorDNA(generateRandomDNA())
  }

  const isButtonDisabled = !warriorName.trim()

  return (
    <ImageBackground source={PERSONA_BACKGROUND} style={styles.backgroundContainer} resizeMode="cover">
      <View style={styles.blackOverlay} />

      <View style={styles.container}>
        <View style={styles.headerSection}>
          <ImageBackground
            source={require('../../assets/onboarding/dialog-bg-1.png')}
            style={styles.headerBackground}
            resizeMode="contain"
          >
            <Text style={styles.headerText}>Warrior Name Setup</Text>
          </ImageBackground>
          <View style={styles.dialogueWrapper}>
            <Text style={styles.dialogueText}>{getDialogueMessage()}</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.setupSection}>
            <View style={styles.warriorImageContainer}>
              <Image
                source={{
                  uri:
                    selectedWarriorType?.image ||
                    'https://res.cloudinary.com/deensvquc/image/upload/v1753652714/Subtract_1_zdw1kc.png',
                }}
                resizeMode="contain"
                style={styles.warriorImage}
              />
            </View>

            <View style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warrior Name</Text>
                <View style={styles.inputBackground}>
                  <TextInput
                    value={warriorName}
                    onChangeText={setWarriorName}
                    placeholder="Enter warrior name"
                    placeholderTextColor="#666"
                    style={styles.textInput}
                    maxLength={MAX_WARRIOR_NAME_LENGTH}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unique DNA (click dice to randomize)</Text>
                <View style={styles.dnaInputContainer}>
                  <View style={styles.dnaInputBackground}>
                    <TextInput
                      value={newWarriorDNA}
                      onChangeText={setNewWarriorDNA}
                      placeholder="Generate DNA"
                      placeholderTextColor="#666"
                      style={styles.textInput}
                      maxLength={MAX_DNA_LENGTH}
                    />
                  </View>
                  <TouchableOpacity onPress={handleGenerateDNA} style={styles.diceButton}>
                    <Text style={styles.diceEmoji}>🎲</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleContinue}
                disabled={isButtonDisabled}
                style={[styles.continueButtonWrapper, isButtonDisabled && styles.continueButtonDisabled]}
              >
                <ImageBackground
                  source={require('../../assets/onboarding/button-bg-main.png')}
                  style={styles.continueButtonBg}
                  resizeMode="contain"
                >
                  <Text style={styles.continueButtonText}>Create Warrior</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.previewSection}>
            <ImageBackground
              source={{
                uri: 'https://res.cloudinary.com/deensvquc/image/upload/v1753697038/Group_9_wmbgfk.png',
              }}
              style={styles.cardPreview}
              resizeMode="contain"
            >
              <View style={styles.cardOverlay}>
                <Text style={[styles.previewWarriorName, { color: selectedWarriorType?.color || '#FFFFFF' }]}>
                  {warriorName || 'Your Warrior'}
                </Text>
                <Text style={styles.previewWarriorType}>{selectedWarriorType?.name || 'UNDEAD'}</Text>
                {newWarriorDNA && <Text style={styles.previewDNA}>DNA: {newWarriorDNA}</Text>}
              </View>
            </ImageBackground>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 160,
  },
  headerBackground: {
    paddingHorizontal: 40,
    width: 'auto',
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  dialogueWrapper: {
    width: '65%',
  },
  dialogueText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 16,
  },
  setupSection: {
    width: '60%',
    flexDirection: 'row',
    gap: 16,
  },
  warriorImageContainer: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warriorImage: {
    width: '100%',
    height: '50%',
  },
  inputSection: {
    width: '60%',
    justifyContent: 'center',
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  inputBackground: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    height: 50,
    justifyContent: 'center',
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    height: '100%',
  },
  dnaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dnaInputBackground: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: '80%',
    height: 50,
  },
  diceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  diceEmoji: {
    fontSize: 24,
  },
  continueButtonWrapper: {
    marginLeft: 'auto',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonBg: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: 'auto',
    top: -10,
  },
  continueButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  previewSection: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPreview: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: '-10%',
    alignItems: 'center',
    gap: 4,
  },
  previewWarriorName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewWarriorType: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewDNA: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
})

export default WarriorProfileSetup