import { CreateContext } from "@/context/Context";
import { generateRandomDNA } from "@/hooks/useGameActions";
import { guideImages, PERSONA_BACKGROUND } from "@/utils/assets";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const WarriorProfileSetup = () => {
  const router = useRouter();
  const { selectedGuide, selectedWarriorType, playerName, selectedPersona } =
    useContext(CreateContext).onboarding;

  const [warriorName, setWarriorName] = useState("");
  const [newWarriorDNA, setNewWarriorDNA] = useState<string>("");

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

  // Get personalized dialogue message
  const getDialogueMessage = (): string => {
    const name = playerName || "Warrior";

    const warriorType = selectedWarriorType?.name || "warrior";

    return `${name}, excellent choice on the ${warriorType}! Now we must forge your undead champion's identity. Give your warrior a name that will strike fear into your enemies, and let the ancient magic generate their unique DNA essence.`;
  };

  const handleContinue = () => {
    if (!warriorName.trim()) return;

    console.log("Warrior Profile Created:", {
      playerName,
      guide: selectedGuide?.name,
      warriorType: selectedWarriorType?.name,
      persona: selectedPersona,
      warriorName: warriorName.trim(),
      warriorDNA: newWarriorDNA,
    });

    // Save warrior profile to context if needed
    // You might want to add these to your context

    router.push("/dashboard");
  };

  return (
    <ImageBackground
      source={{ uri: PERSONA_BACKGROUND }}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <View style={styles.blackOverlay} />

      <View style={styles.container}>
        {/* Top dialogue with guide */}
        <View style={styles.dialogueContainer}>
          <Image
            source={{ uri: getGuideImage() }}
            resizeMode="contain"
            style={styles.guideImage}
          />
          <Text style={styles.dialogueText}>{getDialogueMessage()}</Text>
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Left side - Warrior setup */}
          <View style={styles.setupSection}>
            <View style={styles.warriorImageContainer}>
              <Image
                source={{
                  uri:
                    selectedWarriorType?.image ||
                    "https://res.cloudinary.com/deensvquc/image/upload/v1753652714/Subtract_1_zdw1kc.png",
                }}
                resizeMode="contain"
                style={styles.warriorImage}
              />
            </View>

            <View style={styles.inputSection}>
              {/* Warrior Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warrior Name</Text>
                <ImageBackground
                  source={{
                    uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                  }}
                  style={styles.inputBackground}
                  resizeMode="contain"
                >
                  <TextInput
                    value={warriorName}
                    onChangeText={setWarriorName}
                    placeholder="Enter warrior name"
                    placeholderTextColor="#D4AF37"
                    style={styles.textInput}
                    maxLength={20}
                  />
                </ImageBackground>
              </View>

              {/* DNA Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Unique DNA (click dice to randomize)
                </Text>
                <View style={styles.dnaInputContainer}>
                  <ImageBackground
                    source={{
                      uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446388/input-bg_vibbma.png",
                    }}
                    style={styles.inputBackground}
                    resizeMode="contain"
                  >
                    <TextInput
                      value={newWarriorDNA}
                      onChangeText={setNewWarriorDNA}
                      placeholder="Generate DNA"
                      placeholderTextColor="#D4AF37"
                      style={styles.textInput}
                      maxLength={20}
                    />
                  </ImageBackground>
                  <TouchableOpacity
                    onPress={() => setNewWarriorDNA(generateRandomDNA())}
                    style={styles.diceButton}
                  >
                    <Text style={styles.diceEmoji}>🎲</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                disabled={!warriorName.trim()}
                style={[
                  styles.continueButton,
                  !warriorName.trim() && styles.continueButtonDisabled,
                ]}
              >
                <ImageBackground
                  source={{
                    uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753433285/Frame_4_ppu88h.png",
                  }}
                  style={styles.continueButtonBg}
                  resizeMode="contain"
                >
                  <Text
                    style={[
                      styles.continueButtonText,
                      !warriorName.trim() && styles.continueButtonTextDisabled,
                    ]}
                  >
                    Forge Warrior
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right side - Warrior card preview */}
          <View style={styles.previewSection}>
            <ImageBackground
              source={{
                uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753697038/Group_9_wmbgfk.png",
              }}
              style={styles.cardPreview}
              resizeMode="contain"
            >
              {/* You can overlay warrior info here if needed */}
              <View style={styles.cardOverlay}>
                <Text
                  style={[
                    styles.previewWarriorName,
                    { color: selectedWarriorType?.color || "#FFFFFF" },
                  ]}
                >
                  {warriorName || "Your Warrior"}
                </Text>
                <Text style={styles.previewWarriorType}>
                  {selectedWarriorType?.name || "UNDEAD"}
                </Text>
                {newWarriorDNA && (
                  <Text style={styles.previewDNA}>DNA: {newWarriorDNA}</Text>
                )}
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
  dialogueContainer: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(202, 116, 34, 0.8)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(202, 116, 34, 0.3)",
  },
  guideImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  dialogueText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "400",
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  setupSection: {
    width: "60%",
    flexDirection: "row",
    gap: 16,
  },
  warriorImageContainer: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  warriorImage: {
    width: "100%",
    height: "70%",
  },
  inputSection: {
    width: "60%",
    justifyContent: "center",
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  inputBackground: {
    height: 50,
    justifyContent: "center",
  },
  textInput: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  dnaInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  diceButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  diceEmoji: {
    fontSize: 24,
  },
  continueButton: {
    alignItems: "center",
    marginTop: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonBg: {
    width: 160,
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
  continueButtonTextDisabled: {
    color: "#999999",
  },
  previewSection: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardPreview: {
    width: "80%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardOverlay: {
    position: "absolute",
    bottom: "-10%",
    alignItems: "center",
    gap: 4,
  },
  previewWarriorName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewWarriorType: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  previewDNA: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default WarriorProfileSetup;
