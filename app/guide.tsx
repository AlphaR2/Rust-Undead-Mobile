import ChooseName from "@/components/ChooseName";
import GameCardCarousel from "@/components/GameCard/GameCardCarousel";
import GameCardIntro from "@/components/GameCard/Intro";
import CharacterSelection from "@/components/GuideCarousel";
import PersonaSelectionScreen from "@/components/Persona";
import WarriorProfileSetup from "@/components/warrior/WarriorProfileSetup";
import { GameFonts } from "@/constants/GameFonts";
import { CreateContext } from "@/context/Context";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Get screen dimensions and handle landscape properly
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IS_LANDSCAPE = SCREEN_WIDTH > SCREEN_HEIGHT;

//bg
const WELCOME_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeie3ioopzpq2s5z45csnm4comlrhjxzziislwxyfawz5cjzdh6smx4";

const SELECTION_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu";

const PERSONA_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiey35dg77o4ym275hr62vdc2minsqno3fagnkx7lti4qowai6ezim";

const PROFILE_BACKGROUND =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeigwpyo3f6gpqwf2xw3qntopgg7rlvescdgiu53ebktsk5lawgpfle";

// Guide data
const GUIDES = [
  {
    id: 1,
    name: "JANUS THE BUILDER",
    title: "Validator Master",
    type: "Balanced",
    description:
      "I am Janus, Master of the Foundation. I build the very bedrock upon which this realm stands. Through me, you'll understand how consensus creates unshakeable truth.",
    specialty: "Validators, consensus, foundation concepts",
    recommendedFor: "Complete beginners who want solid fundamentals",
    learningStyle: "Step-by-step, methodical building of knowledge",
    color: "#cd7f32",
  },
  {
    id: 2,
    name: "JAREK THE ORACLE",
    title: "Knowledge Keeper",
    type: "Advanced",
    description:
      "I am Jarek, Keeper of Ancient Wisdom. The deepest secrets of this realm flow through my consciousness like rivers of pure knowledge.",
    specialty: "Advanced concepts, technical deep-dives, ecosystem insights",
    recommendedFor:
      "Technical backgrounds who want comprehensive understanding",
    learningStyle:
      "Mystical wisdom, interconnected learning, big picture thinking",
    color: "#4169E1",
  },
  {
    id: 3,
    name: "GAIUS THE GUARDIAN",
    title: "Protector of Assets",
    type: "Security",
    description:
      "I am Gaius, Shield of the Realm. I guard against the dark forces that would steal your digital treasures and corrupt your transactions.",
    specialty: "Security, wallets, protection strategies, best practices",
    recommendedFor: "Security-conscious learners who want to stay safe",
    learningStyle: "Protective approach, risk awareness, practical safety",
    color: "#228B22",
  },
  {
    id: 4,
    name: "BRYN THE DAEMON",
    title: "Code Compiler",
    type: "Technical",
    description:
      "I am Bryn, Flame of Efficiency. I transform raw code into blazing reality and optimize every process until it burns with perfect precision.",
    specialty: "Technical implementation, smart contracts, development",
    recommendedFor: "Developers and power users who want to build",
    learningStyle:
      "Aggressive optimization, technical precision, implementation focus",
    color: "#DC143C",
  },
];

const GuideSelection = () => {
  const { currentOnboardingScreen, setCurrentOnboardingScreen } =
    useContext(CreateContext).onboarding;

  console.log(currentOnboardingScreen);
  const [selectedGuide, setSelectedGuide] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [textDelayAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    StatusBar.setHidden(true);
    startWelcomeAnimation();
    return () => StatusBar.setHidden(false);
  }, []);

  useEffect(() => {
    if (currentOnboardingScreen === "selection") {
      startSelectionAnimation();
    }
  }, [currentOnboardingScreen]);

  const startWelcomeAnimation = () => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    textDelayAnim.setValue(0);

    // Delay text by 5 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textDelayAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  };

  const startSelectionAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    setCurrentOnboardingScreen("selection");
  };

  const handleGuideSelect = (index: number) => {
    setSelectedGuide(index);
  };

  const handleConfirm = () => {
    router.push(`/warrior-creation?guide=${GUIDES[selectedGuide].id}`);
  };

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: WELCOME_BACKGROUND }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.content}>
          <View style={styles.welcomeWrapper}>
            <Animated.View
              style={[
                styles.welcomeContainer,
                {
                  opacity: textDelayAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.titleContainer}>
                <Text style={[styles.welcomeTitle, GameFonts.epic]}>
                  CHOOSE YOUR GUIDE
                </Text>
                <View style={styles.titleUnderline} />
              </View>

              <View style={styles.welcomeTextContainer}>
                <Text style={[styles.welcomeText, GameFonts.bodyMedium]}>
                  Four legendary undead masters await to guide you through the
                  mysteries of blockchain.
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[styles.buttonContainer, { opacity: textDelayAnim }]}
            >
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonText, GameFonts.button]}>
                  MEET THE GUIDES
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );

  const renderGuideSelection = () => (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={{ uri: SELECTION_BACKGROUND }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay2} />
        <SafeAreaView style={styles.content}>
          <View style={styles.selectionContainer}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.headerTitle}>Choose your guide</Text>
            </Animated.View>

            <View style={styles.carouselWrapper}>
              <CharacterSelection />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );

  const renderPersonaScreen = () => {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ImageBackground
          source={{ uri: PERSONA_BACKGROUND }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay3} />
          <SafeAreaView style={styles.content}>
            <PersonaSelectionScreen />
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  };

  const renderInputScreen = () => {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ImageBackground
          source={{ uri: PROFILE_BACKGROUND }}
          style={styles.backgroundImage}
          resizeMode="cover" 
        >
          <View style={styles.overlay} />
          <SafeAreaView style={styles.content}>
            <Animated.View
              style={[
                styles.selectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            />
            <View style={styles.nameInputWrapper}>
              <ChooseName />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  };

  const renderGameCardIntroScreen = () => {
    return <GameCardIntro />;
  };

  const renderGameCardCarouselScreen = () => {
    return <GameCardCarousel />;
  };

  const renderWarriorProfileSetupScreen = () => {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={{
            uri: "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeiaqhe26zritbjrhf7vaocixy22ep2ejxx6rawqlonjlqskywqcobu",
          }}
          resizeMode="cover" // Changed to cover
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
          <WarriorProfileSetup />
        </ImageBackground>
      </View>
    );
  };

  return currentOnboardingScreen === "welcome"
    ? renderWelcomeScreen()
    : currentOnboardingScreen === "selection"
      ? renderGuideSelection()
      : currentOnboardingScreen === "persona"
        ? renderPersonaScreen()
        : currentOnboardingScreen === "name"
          ? renderInputScreen()
          : currentOnboardingScreen === "game-card-intro"
            ? renderGameCardIntroScreen()
            : currentOnboardingScreen === "game-card-carousel"
              ? renderGameCardCarouselScreen()
              : renderWarriorProfileSetupScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "125%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlay2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  overlay3: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.79)",
  },
  content: {
    flex: 1,
    paddingHorizontal: IS_LANDSCAPE ? 40 : 20,
  },

  // Welcome Screen Styles
  welcomeWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: IS_LANDSCAPE ? 20 : 40,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: IS_LANDSCAPE ? 20 : 30,
  },
  titleContainer: {
    marginBottom: IS_LANDSCAPE ? 15 : 20,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: IS_LANDSCAPE ? 28 : 35,
    color: "#cd7f32",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  titleUnderline: {
    width: SCREEN_WIDTH * (IS_LANDSCAPE ? 0.6 : 0.8),
    height: 3,
    backgroundColor: "#cd7f32",
    marginTop: 15,
    shadowColor: "#cd7f32",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  welcomeTextContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    maxWidth: IS_LANDSCAPE ? SCREEN_WIDTH * 0.7 : SCREEN_WIDTH * 0.9,
  },
  welcomeText: {
    fontSize: IS_LANDSCAPE ? 14 : 16,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: IS_LANDSCAPE ? 20 : 24,
  },

  // Selection Screen Styles
  selectionContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  selectionHeader: {
    alignItems: "center",
    paddingVertical: IS_LANDSCAPE ? 10 : 20,
  },
  headerTitle: {
    fontSize: IS_LANDSCAPE ? 20 : 24,
    color: "#E0E0E0",
    textAlign: "center",
    fontWeight: "bold",
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: IS_LANDSCAPE ? 10 : 20,
  },
  nameInputWrapper: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: IS_LANDSCAPE ? 20 : 40,
  },
  selectionContent: {
    flex: 1,
  },
  carouselContainer: {
    height: IS_LANDSCAPE ? 150 : 200,
    marginBottom: 20,
  },
  carousel: {
    flex: 1,
  },
  guideCard: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: IS_LANDSCAPE ? 60 : 40,
  },
  guideAvatar: {
    width: IS_LANDSCAPE ? 100 : 120,
    height: IS_LANDSCAPE ? 100 : 120,
    borderRadius: IS_LANDSCAPE ? 50 : 60,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginBottom: IS_LANDSCAPE ? 15 : 20,
  },
  guideInitial: {
    fontSize: IS_LANDSCAPE ? 40 : 48,
  },
  guideName: {
    fontSize: IS_LANDSCAPE ? 16 : 18,
    color: "#E0E0E0",
    textAlign: "center",
  },

  // Details Panel
  detailsPanel: {
    flex: 1,
    paddingHorizontal: 10,
  },
  detailsCard: {
    backgroundColor: "rgba(205, 127, 50, 0.1)",
    borderWidth: 2,
    borderRadius: 15,
    padding: IS_LANDSCAPE ? 15 : 20,
    marginHorizontal: 10,
    marginBottom: IS_LANDSCAPE ? 15 : 20,
  },
  detailsTitle: {
    fontSize: IS_LANDSCAPE ? 18 : 20,
    color: "#cd7f32",
    textAlign: "center",
    marginBottom: 5,
  },
  detailsType: {
    fontSize: IS_LANDSCAPE ? 14 : 16,
    textAlign: "center",
    marginBottom: IS_LANDSCAPE ? 10 : 15,
  },
  detailsDescription: {
    fontSize: IS_LANDSCAPE ? 12 : 14,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: IS_LANDSCAPE ? 16 : 20,
    marginBottom: IS_LANDSCAPE ? 15 : 20,
    fontStyle: "italic",
  },
  detailsLabel: {
    fontSize: IS_LANDSCAPE ? 12 : 14,
    color: "#cd7f32",
    marginBottom: 5,
  },
  detailsValue: {
    fontSize: IS_LANDSCAPE ? 12 : 14,
    color: "#C0C0C0",
    lineHeight: IS_LANDSCAPE ? 16 : 18,
  },

  // Buttons
  buttonContainer: {
    alignItems: "center",
    paddingVertical: IS_LANDSCAPE ? 15 : 20,
  },
  nextButton: {
    backgroundColor: "#121212",
    paddingHorizontal: IS_LANDSCAPE ? 35 : 40,
    paddingVertical: IS_LANDSCAPE ? 12 : 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#cd7f32",
    minWidth: IS_LANDSCAPE ? 180 : 200,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#121212",
    paddingHorizontal: IS_LANDSCAPE ? 35 : 40,
    paddingVertical: IS_LANDSCAPE ? 12 : 16,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: IS_LANDSCAPE ? 180 : 200,
    alignItems: "center",
  },
  buttonText: {
    fontSize: IS_LANDSCAPE ? 14 : 16,
    color: "#cd7f32",
    textAlign: "center",
    letterSpacing: 1,
  },
});

export default GuideSelection;
