import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useState, useEffect, useCallback } from 'react';
import { Guide, WarriorType } from '@/types/mobile';
import { UserPersona } from '@/types/undead';
import { CharacterClass } from '@/constants/characters';

class DataStore {
  static async saveGuide(guide: Guide) {
    await AsyncStorage.setItem('@guide', JSON.stringify(guide));
  }
  
  static async getGuide(): Promise<Guide | null> {
    const data = await AsyncStorage.getItem('@guide');
    return data ? JSON.parse(data) : null;
  }
  
  static async saveWarriorType(type: WarriorType) {
    await AsyncStorage.setItem('@warrior_type', JSON.stringify(type));
  }
  
  static async getWarriorType(): Promise<WarriorType | null> {
    const data = await AsyncStorage.getItem('@warrior_type');
    return data ? JSON.parse(data) : null;
  }
  
  static async savePersona(persona: UserPersona) {
    await AsyncStorage.setItem('@persona', JSON.stringify(persona));
  }
  
  static async getPersona(): Promise<UserPersona | null> {
    const data = await AsyncStorage.getItem('@persona');
    return data ? JSON.parse(data) : null;
  }
  
  static async savePlayerName(name: string) {
    await AsyncStorage.setItem('@player_name', name);
  }
  
  static async getPlayerName(): Promise<string> {
    return (await AsyncStorage.getItem('@player_name')) || '';
  }
  
  static async saveAccessToken(token: string) {
    await AsyncStorage.setItem('@access_token', token);
  }
  
  static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@access_token');
  }

  static async saveSelectedCharacter(character: CharacterClass) {
    await AsyncStorage.setItem('@selected_character', character);
  }
  
  static async getSelectedCharacter(): Promise<CharacterClass | null> {
    return await AsyncStorage.getItem('@selected_character') as CharacterClass | null;
  }
  
  static async clearAll() {
    await AsyncStorage.multiRemove([
      '@guide',
      '@warrior_type',
      '@persona',
      '@player_name',
      '@access_token',
      '@selected_character',
    ]);
  }
}

interface ContextTypes {
  auth: {
    accessToken: string | null;
    setAccessToken: (token: string | null) => Promise<void>;
  };
  loader: {
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
  };
  onboarding: {
    currentOnboardingScreen: string;
    setCurrentOnboardingScreen: (screen: string) => void;
    selectedGuide: Guide | null;
    setSelectedGuide: (guide: Guide | null) => Promise<void>;
    selectedWarriorType: WarriorType | null;
    setSelectedWarriorType: (type: WarriorType | null) => Promise<void>;
    selectedPersona: UserPersona | null;
    setSelectedPersona: (persona: UserPersona | null) => Promise<void>;
    playerName: string;
    setPlayerName: (name: string) => Promise<void>;
    selectedCharacter: CharacterClass | null;
    setSelectedCharacter: (character: CharacterClass | null) => Promise<void>;
    getOnboardingData: () => any;
    resetOnboarding: () => Promise<void>;
  };
}

export const CreateContext = createContext({} as ContextTypes);

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOnboardingScreen, setCurrentOnboardingScreen] = useState<string>('welcome');
  const [selectedGuide, setSelectedGuideState] = useState<Guide | null>(null);
  const [selectedWarriorType, setSelectedWarriorTypeState] = useState<WarriorType | null>(null);
  const [selectedPersona, setSelectedPersonaState] = useState<UserPersona | null>(null);
  const [playerName, setPlayerNameState] = useState<string>('');
  const [selectedCharacter, setSelectedCharacterState] = useState<CharacterClass | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [token, guide, warrior, persona, name, character] = await Promise.all([
        DataStore.getAccessToken(),
        DataStore.getGuide(),
        DataStore.getWarriorType(),
        DataStore.getPersona(),
        DataStore.getPlayerName(),
        DataStore.getSelectedCharacter(),
      ]);

      if (token) setAccessTokenState(token);
      if (guide) setSelectedGuideState(guide);
      if (warrior) setSelectedWarriorTypeState(warrior);
      if (persona) setSelectedPersonaState(persona);
      if (name) setPlayerNameState(name);
      if (character) setSelectedCharacterState(character);
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    } finally {
      setIsHydrated(true);
    }
  };

  const setAccessToken = useCallback(async (token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      await DataStore.saveAccessToken(token);
    } else {
      await AsyncStorage.removeItem('@access_token');
    }
  }, []);

  const setSelectedGuide = useCallback(async (guide: Guide | null) => {
    setSelectedGuideState(guide);
    if (guide) await DataStore.saveGuide(guide);
  }, []);

  const setSelectedWarriorType = useCallback(async (type: WarriorType | null) => {
    setSelectedWarriorTypeState(type);
    if (type) await DataStore.saveWarriorType(type);
  }, []);

  const setSelectedPersona = useCallback(async (persona: UserPersona | null) => {
    setSelectedPersonaState(persona);
    if (persona) await DataStore.savePersona(persona);
  }, []);

  const setPlayerName = useCallback(async (name: string) => {
    setPlayerNameState(name);
    await DataStore.savePlayerName(name);
  }, []);

  const setSelectedCharacter = useCallback(async (character: CharacterClass | null) => {
    setSelectedCharacterState(character);
    if (character) await DataStore.saveSelectedCharacter(character);
  }, []);

  const getOnboardingData = useCallback(() => ({
    selectedGuide,
    selectedWarriorType,
    selectedPersona,
    playerName,
    selectedCharacter,
  }), [selectedGuide, selectedWarriorType, selectedPersona, playerName, selectedCharacter]);

  const resetOnboarding = useCallback(async () => {
    setCurrentOnboardingScreen('welcome');
    setSelectedGuideState(null);
    setSelectedWarriorTypeState(null);
    setSelectedPersonaState(null);
    setPlayerNameState('');
    setSelectedCharacterState(null);
    await DataStore.clearAll();
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <CreateContext.Provider
      value={{
        auth: {
          accessToken,
          setAccessToken,
        },
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
          selectedCharacter,
          setSelectedCharacter,
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
export type { CharacterClass };