import { View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import Topbar from "@/components/Topbar";


const RootLayout = () => {
  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* <Topbar/> */}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "#F6BE00",
          headerBackTitle: "",
          headerTitle: "",
          headerShown: false

        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      
    </View>
  );
};

export default RootLayout;
