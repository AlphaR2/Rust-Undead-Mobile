import { createClient } from "@dynamic-labs/client";
import { useReactiveClient } from "@dynamic-labs/react-hooks";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { SolanaExtension } from "@dynamic-labs/solana-extension";

const dynamicId = process.env.EXPO_PUBLIC_DYNAMIC_ID;

if (!dynamicId) {
  throw new Error("Missing DYNAMIC ID. Please add it to your .env.local file");
}

export const dynamicClient = createClient({
  environmentId: dynamicId || "",
  
})
  .extend(
    ReactNativeExtension({
      appOrigin: "rustundeadmobile://",
    })
  )
  .extend(SolanaExtension());

// Add this hook for using in components
export const useDynamic = () => useReactiveClient(dynamicClient);
