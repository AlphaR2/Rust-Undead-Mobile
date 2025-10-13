import { GameFonts } from '@/constants/GameFonts'
import { CreateContext } from '@/context/Context'
import { PERSONA_INFO, PersonaInfo, getGradientColors } from '@/types/mobile'
import { UserPersona } from '@/types/undead'
import { Ionicons } from '@expo/vector-icons'
import React, { useContext, useState } from 'react'
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const PersonaSelectionScreen: React.FC = () => {
  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding
  const { selectedPersona: contextSelectedPersona, setSelectedPersona: setContextSelectedPersona } =
    useContext(CreateContext).onboarding

  const [localSelectedPersona, setLocalSelectedPersona] = useState<UserPersona | null>(contextSelectedPersona || null)

  const { width, height } = Dimensions.get('window')
  const personas = Object.entries(PERSONA_INFO) as [UserPersona, PersonaInfo][]

  const handlePersonaSelect = async (persona: UserPersona) => {
    setLocalSelectedPersona(persona)
    await setContextSelectedPersona(persona)
  }

  const handleConfirm = async () => {
    const selectedPersona = localSelectedPersona || contextSelectedPersona

    if (selectedPersona) {
      await setContextSelectedPersona(selectedPersona)
      setCurrentOnboardingScreen('name')
    }
  }

  const currentSelectedPersona = localSelectedPersona || contextSelectedPersona

  const PersonaCard: React.FC<{
    persona: UserPersona
    info: PersonaInfo
    isSelected: boolean
  }> = ({ persona, info, isSelected }) => {
    const [startColor] = getGradientColors(info.color)

    return (
      <TouchableOpacity
        onPress={() => handlePersonaSelect(persona)}
        style={[
          styles.personaCard,
          isSelected ? styles.personaCardSelected : styles.personaCardUnselected,
          { shadowOpacity: 0.2, shadowRadius: 8, elevation: isSelected ? 4 : 2 },
        ]}
      >
        <ImageBackground
          source={
            isSelected
              ? require('../assets/onboarding/persona-select-bg-active.png')
              : require('../assets/onboarding/persona-select-bg.png')
          }
          style={styles.personaCardBackground}
          resizeMode="contain"
        >
          <View style={styles.personaCardContent}>
            <View
              style={[
                styles.personaIcon,
                {
                  backgroundColor: `${startColor}30`,
                  borderWidth: 1,
                  borderColor: `${startColor}60`,
                },
              ]}
            >
              <Text style={styles.personaIconText}>{info.icon}</Text>
            </View>
            <View style={styles.personaTextContainer}>
              <Text
                style={[
                  GameFonts.body,
                  styles.personaTitle,
                  isSelected ? styles.personaTitleSelected : styles.personaTitleUnselected,
                ]}
              >
                {info.title}
              </Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={24} color={'#D1B996'} />}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  const PreviewCard: React.FC<{ persona: UserPersona; info: PersonaInfo }> = ({ persona, info }) => {
    return (
      <View style={styles.previewCard}>
        <View style={styles.previewIconContainer}>
          <Text style={styles.previewIcon}>{info.icon}</Text>
        </View>
        <View style={styles.previewContent}>
          <Text style={[GameFonts.subtitle, styles.previewTitle]}>{info.title}</Text>

          <Text style={[GameFonts.body, styles.previewDescription]}>{info.description}</Text>

          <View style={styles.traitsContainer}>
            <Text style={[GameFonts.subtitle, styles.traitsLabel]}>KEY TRAITS</Text>
            <Text style={[GameFonts.body, styles.traitsText]}>{info.traits}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!currentSelectedPersona}
          style={[styles.confirmButton, !currentSelectedPersona && styles.confirmButtonDisabled]}
        >
          <ImageBackground
            source={require('../assets/onboarding/button-bg-main.png')}
            style={styles.confirmButtonBackground}
            resizeMode="contain"
          >
            <Text style={[GameFonts.button, styles.confirmButtonText]}>Choose this persona</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageBackground
          source={require('../assets/onboarding/dialog-bg-1.png')}
          style={styles.headerBackground}
          resizeMode="contain"
        >
          <Text style={[GameFonts.epic, styles.headerTitle]}>Choose your persona</Text>
        </ImageBackground>
        <Text style={[GameFonts.body, styles.headerSubtitle]}>
          Select the identity that best represents your Web3 journey
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.leftPanel, { width: width * 0.4 }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
          >
            {personas.map(([persona, info]) => (
              <PersonaCard
                key={persona}
                persona={persona}
                info={info}
                isSelected={currentSelectedPersona === persona}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.rightPanel}>
          {currentSelectedPersona ? (
            <PreviewCard persona={currentSelectedPersona} info={PERSONA_INFO[currentSelectedPersona]} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>Select a persona to preview</Text>
              <Text style={styles.emptyStateSubtitle}>Choose from the list to see detailed information</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  headerBackground: {
    paddingHorizontal: 40,
    marginTop: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  confirmButtonText: {
    fontSize: 14,
  },
  headerSubtitle: {
    color: '#9ca3af',
    paddingTop: 16,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    paddingTop: 20,
  },
  leftPanel: {
    marginRight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  personaCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  personaCardSelected: {
    borderColor: '#cd7f32',
  },
  personaCardUnselected: {
    borderColor: '#6b7280',
  },
  personaCardBackground: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  personaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personaIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personaIconText: {
    fontSize: 15,
  },
  personaTextContainer: {
    flex: 1,
  },
  personaTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  personaTitleSelected: {
    color: '#ffffff',
  },
  personaTitleUnselected: {
    color: '#9ca3af',
  },
  rightPanel: {
    flex: 1,
  },
  previewCard: {
    borderRadius: 20,
    marginLeft: 'auto',
    position: 'relative',
    width: 340,
    height: 200,
    backgroundColor: '#1a1a1a',
  },
  previewIconContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    top: -40,
    left: '50%',
    marginLeft: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },
  previewIcon: {
    fontSize: 36,
  },
  previewContent: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    marginTop: 25,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewDescription: {
    color: '#d1d5db',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  traitsContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  traitsLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'center',
  },
  traitsText: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmButton: {
    borderRadius: 12,
    bottom: -20,
    left: '40%',
    marginLeft: -80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 20,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 42,
    position: 'absolute',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: 16,
    marginTop: 80,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    borderStyle: 'dashed',
    padding: 32,
    maxWidth: 448,
    marginHorizontal: 'auto',
    flex: 1,
  },
  emptyStateTitle: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
})

export default PersonaSelectionScreen
