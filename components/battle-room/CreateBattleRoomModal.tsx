import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  AntDesign,
} from "@expo/vector-icons";

const CreateBattleRoomModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [selectedWarrior, setSelectedWarrior] = useState("james");

  const warriors = [
    {
      id: "james",
      name: "James",
      level: 1,
      rarity: "Uncommon",
      avatar: "🗡️",
      stats: {
        atk: 68,
        def: 68,
        knw: 127,
        hp: 100,
      },
    },
    {
      id: "alex",
      name: "Alex",
      level: 3,
      rarity: "Rare",
      avatar: "⚔️",
      stats: {
        atk: 85,
        def: 72,
        knw: 156,
        hp: 100,
      },
    },
    {
      id: "sarah",
      name: "Sarah",
      level: 5,
      rarity: "Epic",
      avatar: "🏹",
      stats: {
        atk: 92,
        def: 88,
        knw: 178,
        hp: 100,
      },
    },
  ];

  const features = [
    "Select your warrior",
    "Generate quiz questions automatically",
    "Create battle room on-chain",
    "Share room code with opponent",
  ];

  const getSelectedWarrior = () =>
    warriors.find((w) => w.id === selectedWarrior);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "#9ca3af";
      case "Uncommon":
        return "#22c55e";
      case "Rare":
        return "#3b82f6";
      case "Epic":
        return "#a855f7";
      case "Legendary":
        return "#f59e0b";
      default:
        return "#9ca3af";
    }
  };

  const getStatColor = (statType: string) => {
    switch (statType) {
      case "atk":
        return "#ef4444";
      case "def":
        return "#3b82f6";
      case "knw":
        return "#a855f7";
      case "hp":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const selectedWarriorData = getSelectedWarrior();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-4 w-full">
        <View className="bg-gray-900 rounded-3xl border-2 border-[#cd7f32]/30 w-full max-w-5xl h-[90%] overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between  px-2 border-b border-gray-700">
            <View className="flex-row items-center gap-x-3">
              <View className="w-8 h-8 bg-[#cd7f32] rounded-lg items-center justify-center">
                <Ionicons name="flash" size={20} color="white" />
              </View>
              <Text className="text-lg font-bold text-[#cd7f32]">
                Create a battle room
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <AntDesign name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="flex-1 flex-row">
            {/* Left Side - Features & Warrior Selection */}
            <View className="flex-1 p-6 w-[40%]">
              {/* Features List */}
              {/* <View className="bg-gray-800/50 rounded-2xl p-4 mb-6">
                {features.map((feature, index) => (
                  <View key={index} className="flex-row items-center space-x-3 mb-3">
                    <View className="w-2 h-2 bg-[#cd7f32] rounded-full" />
                    <Text className="text-gray-300 text-sm">{feature}</Text>
                  </View>
                ))}
              </View> */}

              {/* Choose Warrior Section */}
              <Text className="text-xl font-bold text-white mb-4">
                Choose a warrior
              </Text>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                {warriors.map((warrior) => (
                  <TouchableOpacity
                    key={warrior.id}
                    onPress={() => setSelectedWarrior(warrior.id)}
                    className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${
                      selectedWarrior === warrior.id
                        ? "bg-[#cd7f32]/20 border-[#cd7f32]"
                        : "bg-gray-800/30 border-gray-700"
                    }`}
                  >
                    <View className="w-12 h-12 bg-gray-700 rounded-xl items-center justify-center mr-4">
                      <Text className="text-2xl">{warrior.avatar}</Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">
                        {warrior.name}
                      </Text>
                      <View className="flex-row items-center space-x-2 mt-1">
                        <Text className="text-sm text-gray-400">
                          Lv.{warrior.level}
                        </Text>
                        <Text
                          className="text-sm font-medium"
                          style={{ color: getRarityColor(warrior.rarity) }}
                        >
                          {warrior.rarity}
                        </Text>
                      </View>
                    </View>

                    {selectedWarrior === warrior.id && (
                      <View className="flex-row items-center space-x-2">
                        <MaterialIcons
                          name="visibility"
                          size={20}
                          color="#fb923c"
                        />
                        <View className="bg-[#cd7f32] px-3 py-1 rounded-full">
                          <Text className="text-white text-sm font-semibold">
                            Selected
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Right Side - Selected Warrior Preview */}
            <View className="w-[60%] px-2 py-2 border-l border-gray-700">
              <View className="bg-gray-800/50 rounded-2xl flex flex-col justify-between p-2 h-full">
                {/* Warrior Header */}
                {/* <View className="flex-row items-center space-x-3 mb-1">
                  <View className="w-8 h-8 bg-[#cd7f32] rounded-lg items-center justify-center">
                    <MaterialIcons name="gps-fixed" size={20} color="white" />
                  </View>
                  <Text className="text-lg font-bold text-[#cd7f32]">
                    - oracle
                  </Text>
                </View> */}

                {/* Warrior Avatar & Name */}
                <View className="flex flex-row gap-x-2 h-[80%]">
                  <View className="bg-gray-900/60  rounded-2xl p-6  items-center w-[60%] flex justify-center">
                    <View className="w-20 h-20 bg-gray-700 rounded-2xl items-center justify-center mb-3">
                      <Text className="text-4xl">
                        {selectedWarriorData?.avatar}
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-white">
                      {selectedWarriorData?.name}
                    </Text>
                  </View>

                  {/* Combat Stats */}
                  <View className="flex-1 w-[30%]">
                    <View className="flex-row items-center space-x-2 mb-4">
                      <MaterialIcons
                        name="sports-martial-arts"
                        size={20}
                        color="#fb923c"
                      />
                      <Text className="text-lg font-bold text-[#cd7f32]">
                        Combat Stats
                      </Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                      {selectedWarriorData &&
                        Object.entries(selectedWarriorData.stats).map(
                          ([statType, value]) => {
                            const color = getStatColor(statType);
                            const maxValue = statType === "hp" ? 100 : 150;
                            const percentage = (value / maxValue) * 100;

                            return (
                              <View key={statType} className="mb-4">
                                <View className="flex-row items-center justify-between mb-2">
                                  <View className="flex-row items-center space-x-2">
                                    <View
                                      className="w-6 h-6 rounded items-center justify-center"
                                      style={{ backgroundColor: `${color}20` }}
                                    >
                                      {statType === "atk" && (
                                        <MaterialIcons
                                          name="gps-fixed"
                                          size={14}
                                          color={color}
                                        />
                                      )}
                                      {statType === "def" && (
                                        <MaterialIcons
                                          name="security"
                                          size={14}
                                          color={color}
                                        />
                                      )}
                                      {statType === "knw" && (
                                        <MaterialIcons
                                          name="psychology"
                                          size={14}
                                          color={color}
                                        />
                                      )}
                                      {statType === "hp" && (
                                        <MaterialIcons
                                          name="favorite"
                                          size={14}
                                          color={color}
                                        />
                                      )}
                                    </View>
                                    <Text className="text-white font-medium text-sm uppercase">
                                      {statType}
                                    </Text>
                                  </View>
                                  <Text className="text-white font-bold text-sm">
                                    {value}
                                  </Text>
                                </View>

                                <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <View
                                    className="h-full rounded-full"
                                    style={{
                                      backgroundColor: color,
                                      width: `${percentage}%`,
                                    }}
                                  />
                                </View>
                              </View>
                            );
                          }
                        )}
                    </ScrollView>
                  </View>
                </View>
                <View className=" border-t border-gray-700">
                  <TouchableOpacity
                    className="bg-[#cd7f32] rounded-2xl py-2 flex-row items-center justify-center space-x-3"
                    onPress={() => {
                      console.log(
                        "Creating battle room with warrior:",
                        selectedWarriorData?.name
                      );
                      onClose();
                    }}
                  >
                    <MaterialIcons name="add-circle" size={20} color="white" />
                    <Text className="text-white text-lg font-bold">
                      Create Battle Room
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Footer - Create Button */}
        </View>
      </View>
    </Modal>
  );
};

export default CreateBattleRoomModal;
