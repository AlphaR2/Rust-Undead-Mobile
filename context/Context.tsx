import { ContextTypes, Guide, WarriorType } from "@/types/mobile";
import { UserPersona } from "@/types/undead";
import React, { createContext, useState } from "react";

export const CreateContext = createContext({} as ContextTypes);

const ContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Auth state
  const [accessToken, setAccessToken] = useState<string | null>("");

  // Loader state
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding screen state
  const [currentOnboardingScreen, setCurrentOnboardingScreen] = useState<
    | "welcome"
    | "selection"
    | "name"
    | "game-card-intro"
    | "game-card-carousel"
    | "warrior-setup"
    | "persona"
  >("welcome");

  // Onboarding data state
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedWarriorType, setSelectedWarriorType] =
    useState<WarriorType | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(
    null
  );
  const [playerName, setPlayerName] = useState<string>("");

  // Utility functions
  const getOnboardingData = () => ({
    selectedGuide,
    selectedWarriorType,
    selectedPersona,
    playerName,
  });

  const resetOnboarding = () => {
    setCurrentOnboardingScreen("welcome");
    setSelectedGuide(null);
    setSelectedWarriorType(null);
    setSelectedPersona(null);
    setPlayerName("");
  };

  return (
    <CreateContext.Provider
      value={{
        auth: { accessToken, setAccessToken },
        loader: {
          isLoading,
          setIsLoading,
        },
        onboarding: {
          currentOnboardingScreen,
          setCurrentOnboardingScreen,
          selectedGuide,
          setSelectedGuide,
          selectedWarriorType,
          setSelectedWarriorType,
          selectedPersona,
          setSelectedPersona,
          playerName,
          setPlayerName,
          getOnboardingData,
          resetOnboarding,
        },
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default ContextProvider;
export { UserPersona };
export type { WarriorType };
