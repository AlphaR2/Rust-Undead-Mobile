import { GameFonts } from '@/constants/GameFonts'
import { CreateContext, UserPersona } from '@/context/Context'
import { PERSONA_INFO, PersonaInfo, getGradientColors } from '@/types/mobile'
import { Ionicons } from '@expo/vector-icons'
import React, { useContext, useState } from 'react'
import { Dimensions, ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'

const PersonaSelectionScreen: React.FC = () => {
  // Get context functions for onboarding flow
  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding
  const { selectedPersona: contextSelectedPersona, setSelectedPersona: setContextSelectedPersona } =
    useContext(CreateContext).onboarding

  // Use context persona or local state
  const [localSelectedPersona, setLocalSelectedPersona] = useState<UserPersona | null>(contextSelectedPersona || null)

  const { width, height } = Dimensions.get('window')
  const personas = Object.entries(PERSONA_INFO) as [UserPersona, PersonaInfo][]

  const handlePersonaSelect = (persona: UserPersona) => {
    setLocalSelectedPersona(persona)
    // Save to context immediately when selected
    setContextSelectedPersona(persona)
    console.log('✅ Persona selected and saved to context:', persona)
  }

  const handleConfirm = () => {
    const selectedPersona = localSelectedPersona || contextSelectedPersona

    if (selectedPersona) {
      // Ensure it's saved to context
      setContextSelectedPersona(selectedPersona)

      // Navigate to next screen
      setCurrentOnboardingScreen('name')

      console.log('✅ Persona confirmed:', selectedPersona)
    } else {
      console.warn('⚠️ No persona selected')
    }
  }

  // Use local or context persona for display
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
        className={`mb-2  rounded-lg transition-all duration-300  ${
          isSelected ? 'border-[#cd7f32]' : ' border-gray-500'
        }`}
        style={{
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: isSelected ? 4 : 2,
        }}
      >
        <ImageBackground
          source={
            isSelected
              ? require('../assets/onboarding/persona-select-bg-active.png')
              : require('../assets/onboarding/persona-select-bg.png')
          }
          className="px-6 w-fit py-4"
          resizeMode="contain"
        >
          <View className="flex-row items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor: `${startColor}30`,
                borderWidth: 1,
                borderColor: `${startColor}60`,
              }}
            >
              <Text className="text-lg">{info.icon}</Text>
            </View>
            <View className="flex-1">
              <Text  style={[GameFonts.body]} className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-gray-400'}`}>
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
      <View
        className="rounded-[20px]   ml-auto relative"
        style={{
          width: 340,
          height: 200,
          backgroundColor: '#1a1a1a',
        }}
      >
        <View
          className="absolute w-20 h-20 rounded-full items-center justify-center"
          style={{
            // backgroundColor: 'red',
            top: -40, // Half the circle height to overlap
            left: '50%',
            marginLeft: -40, // Half width to center
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
            zIndex: 20,
          }}
        >
          <Text className="text-4xl">{info.icon}</Text>
        </View>
        <View className="flex items-center justify-evenly flex-col  mt-10">
          <Text style={[GameFonts.subtitle]} className="text-white text-xl font-bold text-center mb-2">
            {info.title}
          </Text>

          <Text style={[GameFonts.body]} className="text-gray-300 text-base text-center mb-4 leading-5">
            {info.description}
          </Text>

          <View className="bg-gray-800/50 rounded-xl p-3 mb-6 w-full">
            <Text style={[GameFonts.subtitle]} className="text-gray-400 text-xs font-semibold mb-1 text-center">
              KEY TRAITS
            </Text>
            <Text style={[GameFonts.body]} className="text-white text-sm text-center font-medium">
              {info.traits}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!currentSelectedPersona}
          className={` rounded-xl top-30 bottom-0  mt-[-40px]  ${!currentSelectedPersona ? 'opacity-50' : ''}`}
          style={{
            bottom: -20, // Overlap with main card
            left: '40%',
            top: 25,
            marginLeft: -80, // Half of estimated button width
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 15,
            zIndex: 20,
          }}
        >
          <ImageBackground
            source={require('../assets/onboarding/button-bg-main.png')}
            // style={styles.welcomeTextContainer}
            className="flex items-center justify-center p-6 w-fit absolute"
            resizeMode="contain"
          >
            <Text style={[GameFonts.button]}>Choose this persona</Text>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1">
      <View className="mb-4 flex items-center justify-center flex-col">
        <ImageBackground
          source={require('../assets/onboarding/dialog-bg-1.png')}
          className="px-10 mt-3 text-center  w-fit py-3"
          resizeMode="contain"
        >
          <Text style={[GameFonts.epic]} className="text-base  text-[#E0E0E0]">
            Choose your persona
          </Text>
        </ImageBackground>
        <Text style={[GameFonts.body]} className="text-gray-400 pt-4 font-semibold text-sm">
          Select the identity that best represents your Web3 journey
        </Text>
      </View>

      <View className="flex-1 flex-row p-6 pt-12">
        {/* Left Panel - Persona List */}
        <View style={{ width: width * 0.4 }} className="mr-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 10 }}
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

        {/* Right Panel - Preview */}
        <View className="flex-1">
          {currentSelectedPersona ? (
            <PreviewCard persona={currentSelectedPersona} info={PERSONA_INFO[currentSelectedPersona]} />
          ) : (
            <View className="items-center justify-center bg-gray-900/30 rounded-2xl mt-20 border border-gray-700/30 border-dashed p-8 max-w-md mx-auto flex-1">
              <Ionicons name="person-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-lg font-medium mt-3 text-center">Select a persona to preview</Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Choose from the list to see detailed information
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

export default PersonaSelectionScreen
