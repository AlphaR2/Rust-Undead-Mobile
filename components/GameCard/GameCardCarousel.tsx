import { CreateContext } from "@/context/Context";
import { guideImages, PERSONA_BACKGROUND } from "@/utils/assets";
import React, { useContext, useState } from "react";
import {
  Image,
  ImageBackground,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WARRIOR_TYPES } from "../../types/mobile";

const GameCardCarousel: React.FC = () => {
  const {
    setCurrentOnboardingScreen,
    selectedGuide,
    playerName,
    selectedPersona,
    setSelectedWarriorType,
  } = useContext(CreateContext).onboarding;

  // Phase control: 'dialogue' or 'selection'
  const [currentPhase, setCurrentPhase] = useState<"dialogue" | "selection">(
    "dialogue"
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Background image

  // Guide images mapping

  // Get the guide image
  const getGuideImage = (): string => {
    if (selectedGuide?.id && guideImages[selectedGuide.id]) {
      return guideImages[selectedGuide.id];
    }
    return "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png";
  };

  // Get guide name for speaking
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

  // Get personalized intro message
  const getIntroMessage = (): string => {
    const name = playerName || "Warrior";
    const personaText = selectedPersona
      ? ` as a ${formatPersonaName(selectedPersona)}`
      : "";

    return `${name}${personaText}, the ritual begins. You must now raise your first undead warrior from the essence of ancient powers. This cursed champion will embody your fighting spirit and supernatural gifts. Select wisely - your warrior's nature will shape every battle in the shadows that await.`;
  };

  const handleContinueToSelection = () => {
    setCurrentPhase("selection");
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : WARRIOR_TYPES.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < WARRIOR_TYPES.length - 1 ? prev + 1 : 0));
  };

  const handleConfirm = () => {
    const selectedWarrior = WARRIOR_TYPES[currentIndex];

    console.log("Selected warrior type:", {
      warrior: selectedWarrior.name,
      player: playerName,
      guide: selectedGuide?.name,
      persona: selectedPersona,
    });

    // Save selected warrior to context
    setSelectedWarriorType(selectedWarrior);

    setCurrentOnboardingScreen("warrior-setup");
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = 50;

      if (gestureState.dx > swipeThreshold) {
        handlePrevious();
      } else if (gestureState.dx < -swipeThreshold) {
        handleNext();
      }
    },
  });

  const getVisibleWarriors = () => {
    const visibleWarriors = [];

    // Previous warrior (left side, smaller, darker)
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : WARRIOR_TYPES.length - 1;
    visibleWarriors.push({
      warrior: WARRIOR_TYPES[prevIndex],
      index: prevIndex,
      isActive: false,
    });

    // Current warrior (right side, larger, active)
    visibleWarriors.push({
      warrior: WARRIOR_TYPES[currentIndex],
      index: currentIndex,
      isActive: true,
    });

    return visibleWarriors;
  };

  const currentWarrior = WARRIOR_TYPES[currentIndex];

  // Phase 1: Guide Dialogue
  if (currentPhase === "dialogue") {
    return (
      <ImageBackground
        source={{ uri: PERSONA_BACKGROUND }}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        <View style={styles.blackOverlay} />

        <View style={styles.container}>
          {/* Centered dialogue */}
          <View style={styles.centeredDialogueContainer}>
            <View style={styles.dialogueCard}>
              <Image
                source={{ uri: getGuideImage() }}
                resizeMode="contain"
                style={styles.largeGuideImage}
              />

              <View style={styles.dialogueContent}>
                <Text style={styles.guideName}>{getGuideName()}</Text>
                <Text style={styles.centeredDialogueText}>
                  {getIntroMessage()}
                </Text>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinueToSelection}
                >
                  <ImageBackground
                    source={{
                      uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753433285/Frame_4_ppu88h.png",
                    }}
                    style={styles.continueButtonBg}
                    resizeMode="contain"
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Phase 2: Warrior Selection
  return (
    <ImageBackground
      source={{ uri: PERSONA_BACKGROUND }}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <View style={styles.blackOverlay} />

      <View style={styles.container}>
        {/* Header with smaller guide indicator */}
        <View style={styles.smallDialogueContainer}>
          <Image
            source={{ uri: getGuideImage() }}
            resizeMode="contain"
            style={styles.smallGuideImage}
          />
          <Text style={styles.smallDialogueText}>
            Choose your undead warrior, {playerName}
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Left Side - Warrior Carousel */}
          <View style={styles.charactersSection}>
            {/* Navigation Arrows */}
            <TouchableOpacity
              style={[styles.navButton, styles.leftArrow]}
              onPress={handlePrevious}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>

            {/* Warriors Container */}
            <View
              style={styles.charactersContainer}
              {...panResponder.panHandlers}
            >
              {getVisibleWarriors().map(({ warrior, index, isActive }) => (
                <View
                  key={warrior.id}
                  style={[
                    styles.characterWrapper,
                    isActive
                      ? styles.activeCharacter
                      : styles.inactiveCharacter,
                  ]}
                >
                  <Image
                    source={{ uri: warrior.image }}
                    style={[
                      styles.characterImage,
                      isActive ? styles.activeImage : styles.inactiveImage,
                    ]}
                    resizeMode="contain"
                  />

                  {/* Confirm Button - Only show on active warrior */}
                  {isActive && (
                    <TouchableOpacity
                      style={styles.confirmButtonContainer}
                      onPress={handleConfirm}
                    >
                      <ImageBackground
                        source={{
                          uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753433285/Frame_4_ppu88h.png",
                        }}
                        style={styles.confirmButtonBg}
                        resizeMode="contain"
                      >
                        <Text style={styles.confirmButtonText}>
                          Choose the {warrior.name}
                        </Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.navButton, styles.rightArrow]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Right Side - Warrior Info Card */}
          <View style={styles.infoSection}>
            <ImageBackground
              source={{
                uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753427362/Group_1_khuulp.png",
              }}
              style={styles.infoCardBg}
              resizeMode="contain"
            >
              <View style={styles.infoCard}>
                <Text
                  style={[styles.warriorName, { color: currentWarrior.color }]}
                >
                  {currentWarrior.name}
                </Text>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Combat Style:</Text>
                  <Text style={styles.infoText}>
                    {currentWarrior.combatStyle}
                  </Text>
                </View>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Stat Range:</Text>
                  <Text style={styles.infoText}>
                    {currentWarrior.statRange}
                  </Text>
                </View>

                <View style={styles.infoSectionItem}>
                  <Text style={styles.infoLabel}>Specialty:</Text>
                  <Text style={styles.infoText}>
                    {currentWarrior.specialty}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },

  // Phase 1 - Dialogue styles
  centeredDialogueContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dialogueCard: {
    backgroundColor: "rgba(202, 116, 34, 0.9)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CA7422",
    maxWidth: 400,
    minHeight: 300,
  },
  largeGuideImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  dialogueContent: {
    alignItems: "center",
  },
  guideName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  centeredDialogueText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 25,
  },
  continueButton: {
    alignItems: "center",
  },
  continueButtonBg: {
    width: 140,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Phase 2 - Selection styles
  smallDialogueContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(202, 116, 34, 0.8)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: "rgba(202, 116, 34, 0.3)",
  },
  smallGuideImage: {
    width: 35,
    height: 35,
    marginRight: 12,
  },
  smallDialogueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  charactersSection: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
    height: 400,
    justifyContent: "center",
  },
  leftArrow: {
    position: "absolute",
    left: 0,
    zIndex: 10,
  },
  rightArrow: {
    position: "absolute",
    right: 0,
    zIndex: 10,
  },
  navButton: {
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  navButtonText: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "bold",
  },
  charactersContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  characterWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeCharacter: {
    // Current character styling
  },
  inactiveCharacter: {
    opacity: 0.5,
  },
  characterImage: {
    // Base image styles
  },
  activeImage: {
    width: 200,
    height: 200,
    borderColor: "#D4AF37",
    marginBottom: 32,
  },
  inactiveImage: {
    width: 120,
    height: 200,
    marginTop: 20,
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  confirmButtonContainer: {
    marginTop: -40,
    alignItems: "center",
    backgroundColor: "rgba(202, 116, 34, 0.8)",
    width: 140,
    height: 39,
    justifyContent: "center",
    borderRadius: 19
  },
  confirmButtonBg: {
    width: 140,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoSection: {
    width: "30%",
  },
  infoCardBg: {
    width: "100%",
    minHeight: 350,
  },
  infoCard: {
    padding: 20,
    minHeight: 330,
    gap: 12,
    // justifyContent: "space-between",
  },
  warriorName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  warriorTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
    opacity: 0.9,
  },
  warriorDescription: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
    marginBottom: 16,
    fontStyle: "italic",
  },
  infoSectionItem: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#CA7422",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
  },
  compatibilitySection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(202, 116, 34, 0.2)",
    borderRadius: 6,
    borderWidth: 1,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
});

export default GameCardCarousel;
