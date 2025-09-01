import { CreateContext } from "@/context/Context";
import { guideImages, SELECTION_BACKGROUND } from "@/utils/assets";
import React, { useContext } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GameCardIntro = () => {
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    playerName,
    selectedPersona,
  } = useContext(CreateContext).onboarding;

  // Get the guide image based on selected guide
  const getGuideImage = (): string => {
    if (selectedGuide?.id && guideImages[selectedGuide.id]) {
      return guideImages[selectedGuide.id];
    }
    // Fallback image
    return "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png";
  };

  // Get guide title for badge
  const getGuideTitle = (): string => {
    if (!selectedGuide?.name) return "GUIDE";

    switch (selectedGuide.name) {
      case "JANUS THE BUILDER":
        return "BUILDER";
      case "JAREK THE ORACLE":
        return "ORACLE";
      case "GAIUS THE GUARDIAN":
        return "GUARDIAN";
      case "BRYN THE DAEMON":
        return "DAEMON";
      default:
        return selectedGuide.title?.toUpperCase() || "GUIDE";
    }
  };

  // Get personalized intro message
  const getIntroMessage = (): { greeting: string; explanation: string } => {
    const name = playerName || "Warrior";
    const guideName = getGuideName();

    return {
      greeting: `Welcome, ${name}. Before we begin, let me explain what lies ahead...`,
      explanation:
        "Your journey begins with forging your first undead warrior ...",
    };
  };

  // Get the guide's first name for speaking
  const getGuideName = (): string => {
    if (!selectedGuide?.name) return "Guide";

    switch (selectedGuide.name) {
      case "JANUS THE BUILDER":
        return "Janus";
      case "JAREK THE ORACLE":
        return "Jarek";
      case "GAIUS THE GUARDIAN":
        return "Gaius";
      case "BRYN THE DAEMON":
        return "Bryn";
      default:
        return selectedGuide.name.split(" ")[0] || "Guide";
    }
  };

  // Format persona for display
  const formatPersonaName = (persona: string): string => {
    return persona.replace(/([A-Z])/g, " $1").trim();
  };

  const handleNext = () => {
    console.log("Moving to game card carousel with:", {
      guide: selectedGuide?.name,
      player: playerName,
      persona: selectedPersona,
    });
    setCurrentOnboardingScreen("game-card-carousel");
  };

  const introContent = getIntroMessage();

  return (
    <View className="flex-1 h-full w-full flex justify-end items-end">
      <ImageBackground
        source={{ uri: SELECTION_BACKGROUND }}
        resizeMode="cover"
        className="w-full flex-1 z-40"
        style={{
          height: SCREEN_HEIGHT * 1.3,
          width: "100%",
        }}
      >
        <View className="flex-1 justify-end">
          <View
            className="bg-[#663200] border-t-4 border-[#CA7422] w-full flex flex-row px-8"
            style={{
              height: 120, // Increased for better content display
              overflow: "visible",
            }}
          >
            {/* Guide Image */}
            <View className="w-[20%] relative" style={{ overflow: "visible" }}>
              <Image
                source={{ uri: getGuideImage() }}
                className="w-[150px] h-[220px] relative z-20"
                style={{
                  position: "absolute",
                  top: -70,
                  left: 0,
                }}
                resizeMode="contain"
              />
            </View>

            {/* Content Section */}
            <View className="flex-1 pt-2 pr-4">
              {/* Guide Badge */}
              <TouchableOpacity
                className="w-20 p-1 bg-[#CA7422] rounded-[20px] mb-2"
                style={{ marginTop: -20 }}
                disabled
              >
                <Text className="text-white text-xs text-center font-bold">
                  {getGuideTitle()}
                </Text>
              </TouchableOpacity>

              {/* Dialog Text */}
              <Text className="text-white pt-4 text-sm leading-4 mb-1">
                {introContent.greeting}
              </Text>
              <Text className="text-white text-sm leading-4">
                {introContent.explanation}
              </Text>
            </View>

            {/* Next Button */}
            <TouchableOpacity
              onPress={handleNext}
              style={{ marginTop: -26 }}
              className=" px-2 py-1"
            >
              <Text className="text-[#CA7422] font-semibold text-base">
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default GameCardIntro;
