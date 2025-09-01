import { CreateContext, UserPersona } from "@/context/Context";
import { PERSONA_INFO, PersonaInfo, getGradientColors } from "@/types/mobile";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PersonaSelectionScreen: React.FC = () => {
  // Get context functions for onboarding flow
  const { setCurrentOnboardingScreen } = useContext(CreateContext).onboarding;
  const {
    selectedPersona: contextSelectedPersona,
    setSelectedPersona: setContextSelectedPersona,
  } = useContext(CreateContext).onboarding;

  // Use context persona or local state
  const [localSelectedPersona, setLocalSelectedPersona] =
    useState<UserPersona | null>(contextSelectedPersona || null);

  const { width, height } = Dimensions.get("window");
  const personas = Object.entries(PERSONA_INFO) as [UserPersona, PersonaInfo][];

  const handlePersonaSelect = (persona: UserPersona) => {
    setLocalSelectedPersona(persona);
    // Save to context immediately when selected
    setContextSelectedPersona(persona);
    console.log("✅ Persona selected and saved to context:", persona);
  };

  const handleConfirm = () => {
    const selectedPersona = localSelectedPersona || contextSelectedPersona;

    if (selectedPersona) {
      // Ensure it's saved to context
      setContextSelectedPersona(selectedPersona);

      // Navigate to next screen
      setCurrentOnboardingScreen("name");

      console.log("✅ Persona confirmed:", selectedPersona);
    } else {
      console.warn("⚠️ No persona selected");
    }
  };

  // Use local or context persona for display
  const currentSelectedPersona = localSelectedPersona || contextSelectedPersona;

  const PersonaCard: React.FC<{
    persona: UserPersona;
    info: PersonaInfo;
    isSelected: boolean;
  }> = ({ persona, info, isSelected }) => {
    const [startColor] = getGradientColors(info.color);

    return (
      <TouchableOpacity
        onPress={() => handlePersonaSelect(persona)}
        className={`mb-2 px-3 py-3 rounded-lg transition-all duration-300 border ${
          isSelected
            ? "border-[#cd7f32]"
            : "bg-[#1a1a1a] border border-gray-500"
        }`}
        style={{
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: isSelected ? 4 : 2,
        }}
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
            <Text
              className={`font-semibold text-sm ${
                isSelected ? "text-white" : "text-gray-400"
              }`}
            >
              {info.title}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={16} color={startColor} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const PreviewCard: React.FC<{ persona: UserPersona; info: PersonaInfo }> = ({
    persona,
    info,
  }) => {
    const [startColor, endColor] = getGradientColors(info.color);

    return (
      <View
        className="rounded-2xl p-6 border border-[#cd7f32] ml-auto"
        style={{
          width: 340,
          height: 335,
          backgroundColor: "#1a1a1a",
        }}
      >
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-3"
            style={{
              shadowColor: startColor,
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={[startColor, endColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 36 }}>{info.icon}</Text>
            </LinearGradient>
          </View>

          <Text className="text-white text-2xl font-bold text-center mb-2">
            {info.title}
          </Text>

          <Text className="text-gray-300 text-base text-center mb-4 leading-5">
            {info.description}
          </Text>

          <View className="bg-gray-800/50 rounded-xl p-3 mb-6 w-full">
            <Text className="text-gray-400 text-xs font-semibold mb-1 text-center">
              KEY TRAITS
            </Text>
            <Text className="text-white text-sm text-center font-medium">
              {info.traits}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!currentSelectedPersona}
          className={`overflow-hidden rounded-xl ${
            !currentSelectedPersona ? "opacity-50" : ""
          }`}
        >
          <Text className="text-white text-base font-bold text-center bg-[#cd7f32] p-2">
            Choose This Persona
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 flex-row p-6 pt-12">
        {/* Left Panel - Persona List */}
        <View style={{ width: width * 0.4 }} className="mr-4">
          <View className="mb-4">
            <Text className="text-white text-2xl font-bold mb-1">
              Choose Your Persona
            </Text>
            <Text className="text-gray-400 text-sm">
              Select the identity that best represents your Web3 journey
            </Text>
          </View>

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
            <PreviewCard
              persona={currentSelectedPersona}
              info={PERSONA_INFO[currentSelectedPersona]}
            />
          ) : (
            <View className="items-center justify-center bg-gray-900/30 rounded-2xl mt-20 border border-gray-700/30 border-dashed p-8 max-w-md mx-auto flex-1">
              <Ionicons name="person-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-lg font-medium mt-3 text-center">
                Select a persona to preview
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Choose from the list to see detailed information
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default PersonaSelectionScreen;
