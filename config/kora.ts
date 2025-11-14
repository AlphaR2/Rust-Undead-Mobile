import { KoraConfig } from "@/types/kora";

const getKoraConfig = (): KoraConfig => {
  const endpoint = process.env.EXPO_PUBLIC_KORA_ENDPOINT;
  const apiKey = process.env.EXPO_PUBLIC_KORA_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error("Kora configuration is missing in environment variables.");
  }

  return {
    endpoint,
    apiKey,
  };
};

export const KORA_CONFIG = getKoraConfig();
