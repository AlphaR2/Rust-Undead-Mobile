import { CreateContext } from "@/context/Context";
import { Guides as characters } from "@/types/mobile";
import React, { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CharacterSelection = () => {
  const { setCurrentOnboardingScreen, selectedGuide, setSelectedGuide } =
    useContext(CreateContext).onboarding;

  const [selectedIndex, setSelectedIndex] = useState(
    selectedGuide
      ? characters.findIndex((char) => char.id === selectedGuide.id)
      : 0
  );

  const handleCharacterSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    const selectedCharacter = characters[selectedIndex];

    // SAVE THE SELECTED GUIDE TO CONTEXT
    setSelectedGuide(selectedCharacter);

    // MOVE TO PERSONA SELECTION
    setCurrentOnboardingScreen("persona");

    console.log("Selected guide saved:", selectedCharacter.name);
  };

  const getCharacterIcon = (characterId: string) => {
    switch (characterId) {
      case "1":
        return "⚖️"; // Builder
      case "2":
        return "🔮"; // Oracle/Knowledge
      case "3":
        return "🛡️"; // Guardian/Combat
      case "4":
        return "⚡"; // Daemon
      default:
        return "⚡";
    }
  };

  return (
    <View style={styles.container}>
      {/* Character Cards Grid */}
      <View style={styles.cardsGrid}>
        {characters.map((character, index) => (
          <TouchableOpacity
            key={character.id}
            style={[
              styles.cardContainer,
              selectedIndex === index && styles.selectedCard,
            ]}
            onPress={() => handleCharacterSelect(index)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.characterIcon}>
                  {getCharacterIcon(character.id)}
                </Text>
              </View>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterTitle}>{character.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>CHOOSE THIS GUIDE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 460,
    gap: 15,
  },
  cardContainer: {
    width: "42%",
    minWidth: 100,
    marginBottom: 20,
    opacity: 0.7,
    backgroundColor: "#CA742226",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 16,
  },
  selectedCard: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
    backgroundColor: "#CA742290",
    borderColor: "#cd7f32",
    shadowColor: "#cd7f32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#CA742226",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  characterIcon: {
    fontSize: 32,
  },
  characterName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  characterTitle: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  selectedGuideInfo: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
    maxWidth: 300,
  },
  selectedGuideText: {
    color: "#cd7f32",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  selectedGuideDescription: {
    color: "#E0E0E0",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  confirmButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: "#121212",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#cd7f32",
    minWidth: 200,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#cd7f32",
    textAlign: "center",
    letterSpacing: 1,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CharacterSelection;
