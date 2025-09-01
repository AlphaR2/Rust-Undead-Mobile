import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TrailerProps {
  onComplete: () => void;
}

const VIDEO_URL =
  "https://sapphire-geographical-goat-695.mypinata.cloud/ipfs/bafybeid2nile475xfljxln4oki2wcymt7ci6tyrjnl543nibzem5tjyque";
const SKIP_BUTTON_DELAY = 15000;

const Trailer: React.FC<TrailerProps> = ({ onComplete }) => {
  const [showSkip, setShowSkip] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const player = useVideoPlayer(VIDEO_URL, (player) => {
    player.loop = false;
    player.muted = false;
    player.play();
  });

  useEffect(() => {
    StatusBar.setHidden(true);

    // Show skip button after 15 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), SKIP_BUTTON_DELAY);

    return () => {
      StatusBar.setHidden(false);
      clearTimeout(skipTimer);
    };
  }, []);

  // Separate useEffect for video progress checking
  useEffect(() => {
    const checkVideoProgress = () => {
      if (player && player.duration > 0 && player.currentTime > 0) {
        const timeRemaining = player.duration - player.currentTime;
        // If less than 0.5 seconds remaining or current time equals duration
        if (timeRemaining <= 0.5 || player.currentTime >= player.duration) {
          handleComplete();
        }
      }
    };

    const interval = setInterval(checkVideoProgress, 500);

    return () => clearInterval(interval);
  }, [player, hasCompleted]);

  const handleComplete = () => {
    if (!hasCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    player?.pause();
    handleComplete();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />

      {showSkip && (
        <SafeAreaView style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  skipContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default Trailer;
