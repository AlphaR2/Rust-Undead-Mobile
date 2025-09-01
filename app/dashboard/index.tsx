import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import { TableProperties } from "lucide-react-native";

const Index = () => {
  const router = useRouter();
  return (
    <View className="flex-1  flex-col justify-center p-4 bg-gradient-to-br from-[#0f0f0f] bg-[#1a1a1a] to-[#2a2a2a]">
      <View className="  w-full h-10 mt-10 flex flex-row justify-between px-4">
        <View className="flex flex-row items-center gap-x-1">
          <TouchableOpacity>
            <FontAwesome6 name="people-group" size={20} color="orange" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
            <AntDesign name="wallet" size={20} color="orange" />
            {/* <Text className="text-sm">Wallet</Text> */}
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center">

        <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
        <AntDesign name="Trophy" size={24} color="orange" />
          {/* <Text className="text-sm">settings</Text> */}
        </TouchableOpacity>
        <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
          <Feather name="settings" size={20} color="orange" />
          {/* <Text className="text-sm">settings</Text> */}
        </TouchableOpacity>
        </View>

      </View>
      <View className="flex-row items-center px-4 justify-between">
        <View className="flex flex-col gap-y-4 w-[20%]">
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
            }}
            className="w-20  border ml-20 inline-block"
          >
            <TouchableOpacity
              // disabled={!warriorName.trim()}
              className={`px-8 py-3 rounded-xl w-full pt-4`}
            >
              <Text className={`text-center font-bold text-lg text-white`}>
                Home
              </Text>
            </TouchableOpacity>
          </ImageBackground>
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
            }}
            className="w-20 pt-4"
          >
            <TouchableOpacity
            onPress={()=> router.push("/dashboard/battle-arena")}
              // disabled={!warriorName.trim()}
              className={`px-8 py-3 rounded-xl w-full pt-4`}
            >
              <Text className={`text-center font-bold text-lg text-white`}>
                Battle Arena
              </Text>
            </TouchableOpacity>
          </ImageBackground>
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
            }}
            className="w-20 pt-4"
          >
            <TouchableOpacity
              // disabled={!warriorName.trim()}
              className={`px-8 py-3 rounded-xl w-full pt-4`}
            >
              <Text className={`text-center font-bold text-lg text-white`}>
                Story
              </Text>
            </TouchableOpacity>
          </ImageBackground>
          <ImageBackground
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753446242/button-bg_lwqals.png",
            }}
            className="w-20 pt-4"
          >
            <TouchableOpacity
              // disabled={!warriorName.trim()}
              className={`px-8 py-3 rounded-xl w-full pt-4`}
            >
              <Text className={`text-center font-bold text-lg text-white`}>
                Continue
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
        <View>
          <Image
            source={{
              uri: "https://res.cloudinary.com/deensvquc/image/upload/v1753436774/Mask_group_ilokc7.png",
            }}
            resizeMode="contain"
            className="w-[350px] h-[350px]"
          />
        </View>
      </View>
    </View>
  );
};

export default Index;
