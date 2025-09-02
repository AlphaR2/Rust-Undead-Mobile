import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  ImageBackground,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  recommendedFor: string;
  image: string;
}

const characters: Character[] = [
  {
    id: "1",
    name: "VALDOR THE VALIDATOR",
    title: "(Balanced)",
    description:
      "I am Valdor, guardian of consensus. I'll teach you the ancient ways of agreement and truth in this realm.",
    recommendedFor: "Complete beginners",
    image:
      "https://res.cloudinary.com/deensvquc/image/upload/v1752487234/samples/upscale-face-1.jpg",
  },
  {
    id: "2",
    name: "ORACLE MYSTRAL",
    title: "(Knowledge Specialist)",
    description:
      "I am Mystral, keeper of sacred knowledge. Through me, you'll learn the deepest secrets of this realm.",
    recommendedFor: "Intermediate users",
    image:
      "https://res.cloudinary.com/deensvquc/image/upload/v1752487234/samples/woman-on-a-football-field.jpg",
  },
  {
    id: "3",
    name: "GUARDIAN NEXUS",
    title: "(Combat Expert)",
    description:
      "I am Nexus, master of battle tactics. I will forge you into a formidable warrior of this digital realm.",
    recommendedFor: "Advanced users",
    image: "https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Nexus",
  },
];

const CharacterCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : characters.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < characters.length - 1 ? prev + 1 : 0));
  };

  const handleConfirm = () => {
    const selectedCharacter = characters[currentIndex];
    console.log("Selected character:", selectedCharacter.name);
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

  const getVisibleCharacters = () => {
    const visibleChars = [];

    // Previous character (left side, smaller, darker)
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : characters.length - 1;
    visibleChars.push({
      character: characters[prevIndex],
      index: prevIndex,
      isActive: false,
    });

    // Current character (center, larger, active)
    visibleChars.push({
      character: characters[currentIndex],
      index: currentIndex,
      isActive: true,
    });

    return visibleChars;
  };

  const currentCharacter = characters[currentIndex];

  return (
    <View className="flex-1 bg-amber-900 px-5">
      {/* Header */}
      <View className="pt-4 pb-2">
        <Text className="text-yellow-400 text-lg text-center font-medium">
          Select a tour guide
        </Text>
      </View>

      {/* Main Content - Landscape Layout */}
      <View className="flex-1 flex-row items-center justify-between">
        
        {/* Left Side - Character Carousel */}
        <View className="flex-1 flex-row items-center justify-center relative max-w-2xl">
          
          {/* Left Navigation Arrow */}
          <TouchableOpacity
            className="absolute left-0 z-10 bg-yellow-400 bg-opacity-20 border border-yellow-400 rounded-full w-12 h-12 justify-center items-center"
            onPress={handlePrevious}
          >
            <Text className="text-yellow-400 text-2xl font-bold">‹</Text>
          </TouchableOpacity>

          {/* Characters Container */}
          <View
            className="flex-1 flex-row items-center justify-around px-16"
            {...panResponder.panHandlers}
          >
            {getVisibleCharacters().map(({ character, index, isActive }) => (
              <View
                key={character.id}
                className={`items-center justify-center ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <Image
                  source={{ uri: character.image }}
                  className={`rounded-2xl border-2 border-yellow-400 ${
                    isActive 
                      ? 'w-36 h-56' 
                      : 'w-28 h-44'
                  }`}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>

          {/* Right Navigation Arrow */}
          <TouchableOpacity
            className="absolute right-0 z-10 bg-yellow-400 bg-opacity-20 border border-yellow-400 rounded-full w-12 h-12 justify-center items-center"
            onPress={handleNext}
          >
            <Text className="text-yellow-400 text-2xl font-bold">›</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side - Character Info Card */}
        <View className="w-80 ml-8">
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753427362/Group_1_khuulp.png",
            }}
            className="h-80 justify-center items-center"
            resizeMode="contain"
          >
            <View className="absolute inset-0 justify-center p-8">
              <Text className="text-white text-base font-bold mb-2 text-center">
                {currentCharacter.name}
              </Text>
              
              <Text className="text-yellow-400 text-sm font-semibold mb-4 text-center">
                {currentCharacter.title}
              </Text>

              <Text className="text-white text-xs italic mb-6 text-left leading-4 px-2">
                "{currentCharacter.description}"
              </Text>

              <View className="mt-auto">
                <Text className="text-yellow-400 text-sm font-bold mb-1">
                  Recommended for:
                </Text>
                <Text className="text-white text-sm font-medium">
                  {currentCharacter.recommendedFor}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>

      {/* Confirm Button - Fixed at bottom */}
      <View className="justify-center items-center pb-6">
        <TouchableOpacity
          className="bg-amber-700 border-2 border-yellow-400 rounded-lg px-8 py-3 min-w-32"
          onPress={handleConfirm}
        >
          <Text className="text-white text-base font-bold text-center">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CharacterCarousel;