import AnimatedCharacterCard from '@/components/GameCard/AnimatedCharacterCard'
import { toast } from '@/components/ui/Toast'
import { GameFonts } from '@/constants/GameFonts'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import { buildGamingProfile, gameProfileToRollup, UserProfileResult } from '@/hooks/useGameActions'
import { useUndeadProgram } from '@/hooks/useUndeadProgram'
import { usePDAs } from '@/hooks/utils/useHelpers'
import { WarriorClass as CharacterClass } from '@/types/undead'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
  const [isCreating, setIsCreating] = useState(false)

  const { program } = useUndeadProgram()
  const { publicKey } = useBasicGameData()
  const { gamerProfilePda } = usePDAs(publicKey)

  const handleSelect = useCallback(
    async (characterClass: CharacterClass) => {
      if (isCreating) return

      setSelectedCharacter(characterClass)
      setIsCreating(true)

      try {
        if (!program || !publicKey || !gamerProfilePda) {
          throw new Error('Wallet or program not ready')
        }

        toast.info('Forging your gaming profile...')

        const profileResult: UserProfileResult = await buildGamingProfile({
          program,
          userPublicKey: publicKey,
          characterClass,
          gamerProfilePda,
        })

        if (!profileResult.success) {
          throw new Error(profileResult.error || 'Failed to create gaming profile')
        }

        toast.success('Gaming profile forged successfully!')

        toast.info('Delegating profile to rollup...')

        const delegateResult: UserProfileResult = await gameProfileToRollup({
          program,
          userPublicKey: publicKey,
          gamerProfilePda,
        })

        if (!delegateResult.success) {
          toast.warning('Profile created but delegation failed. You can continue anyway.')
        } else {
          toast.success('Profile delegated successfully!')
        }

        onComplete(characterClass)
      } catch (error: any) {
        toast.error('Error', error?.message || 'Failed to create gaming profile')
        setSelectedCharacter(null)
      } finally {
        setIsCreating(false)
      }
    },
    [isCreating, program, publicKey, gamerProfilePda, onComplete],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return (
    <ImageBackground source={PERSONA_BACKGROUND} style={styles.container}>
      <View style={styles.overlay} />

      {isCreating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E0E0E0" />
            <Text style={[GameFonts.body, styles.loadingText]}>Forging your avatar...</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton} disabled={isCreating}>
          <View style={[styles.iconBackground, isCreating && styles.disabledButton]}>
            <MaterialIcons name="arrow-back" size={22} color={isCreating ? '#666' : 'white'} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMute} style={styles.headerButton} disabled={isCreating}>
          <View style={[styles.iconBackground, isCreating && styles.disabledButton]}>
            <MaterialIcons
              name={isMuted ? 'volume-off' : 'volume-up'}
              size={22}
              color={isCreating ? '#666' : 'white'}
            />
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
          scrollEnabled={!isCreating}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c87323',
    alignItems: 'center',
    minWidth: 280,
  },
  loadingText: {
    color: '#E0E0E0',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  disabledButton: {
    backgroundColor: '#0a0a0a',
    opacity: 0.5,
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
