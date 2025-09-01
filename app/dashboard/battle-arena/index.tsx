import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import CreateBattleRoomModal from "@/components/battle-room/CreateBattleRoomModal";

const BattleArenaMobile = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMode, setSelectedMode] = useState(null);
  const [showCreateBattleRoomModal, setShowCreateBattleRoomModal] =
    useState(false);
  const playerStats = {
    name: "WarriorKing",
    level: 45,
    rank: "Steel Legion",
    tier: "S4",
    battles: 0,
    victories: 0,
    defeats: 0,
    winRate: "0%",
    points: 200,
    coins: 6840,
    gems: 13671,
  };

  const battleModes = [
    {
      id: "forge",
      title: "Forge Battle",
      // subtitle: "Create your arena",
      description: "Build custom battles and invite warriors",
      iconFamily: AntDesign,
      iconName: "plus",
      players: "2 Players",
    },
    {
      id: "enter",
      title: "Enter Battle",
      // subtitle: "Join existing arena",
      description: "Jump into ongoing battles worldwide",
      iconFamily: MaterialIcons,
      iconName: "security",
      players: "Quick Match",
    },
    // {
    //   id: 'ranked',
    //   title: 'Ranked Match',
    //   subtitle: 'Competitive play',
    //   description: 'Climb the leaderboards with skill',
    //   iconFamily: FontAwesome5,
    //   iconName: 'crown',
    //   players: 'Ranked'
    // },
    // {
    //   id: 'tournament',
    //   title: 'Tournament',
    //   subtitle: 'Elite competition',
    //   description: 'Face the best warriors in epic battles',
    //   iconFamily: Ionicons,
    //   iconName: 'trophy',
    //   players: 'Elite Only'
    // }
  ];

  const sidebarItems = [
    { id: "home", iconFamily: Ionicons, iconName: "home", label: "Arena" },
    {
      id: "stats",
      iconFamily: Ionicons,
      iconName: "stats-chart",
      label: "Stats",
    },
    {
      id: "leaderboard",
      iconFamily: MaterialIcons,
      iconName: "leaderboard",
      label: "Ranks",
    },
    {
      id: "settings",
      iconFamily: Ionicons,
      iconName: "settings",
      label: "Settings",
    },
  ];

  const statCards = [
    {
      label: "Total Battles",
      value: playerStats.battles,
      iconFamily: MaterialIcons,
      iconName: "sports-martial-arts",
    },
    {
      label: "Victories",
      value: playerStats.victories,
      iconFamily: Ionicons,
      iconName: "trophy",
    },
    {
      label: "Win Rate",
      value: playerStats.winRate,
      iconFamily: MaterialIcons,
      iconName: "track-changes",
    },
    {
      label: "Points",
      value: playerStats.points,
      iconFamily: AntDesign,
      iconName: "star",
    },
  ];

  return (
    <View className="flex-1 bg-gray-900 w-full">
      {/* Top Status Bar */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-black/20 border-b border-[#cd7f32]/20">
        <View className="flex-row items-center gap-x-2">
          <View className="w-10 h-10 rounded-full bg-[#cd7f32] items-center justify-center">
            <Ionicons name="flame" size={20} color="white" />
          </View>
          <View>
            <Text className="text-lg font-bold text-[#cd7f32]">
              BATTLE ARENA
            </Text>
            <Text className="text-xs text-gray-400">
              Warriors Online: 1,247
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-x-4">
          <View className="flex-row items-center space-x-2 bg-yellow-600/20 px-3 py-1 rounded-full">
            <View className="w-3 h-3 bg-yellow-500 rounded-full" />
            <Text className="text-sm font-semibold text-white">
              {playerStats.coins.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-full">
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
            <Text className="text-sm font-semibold text-white">
              {playerStats.gems.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity>
            <AntDesign name="plus" size={24} color="#fb923c" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar */}
        <View className="w-64 bg-black/40 border-r border-[#cd7f32]/20">
          {/* Player Profile */}
          <View className="p-4 border-b border-gray-700">
            <View className="flex-row items-center space-x-3 mb-4">
              <View className="w-16 h-16 rounded-full bg-gradient-to-r from-[#cd7f32] to-red-600 items-center justify-center">
                <FontAwesome5 name="crown" size={24} color="white" />
              </View>
              <View>
                <Text className="text-lg font-bold text-white">
                  {playerStats.name}
                </Text>
                <Text className="text-sm text-[#cd7f32]">
                  Level {playerStats.level}
                </Text>
                <View className="flex-row items-center space-x-2 mt-1">
                  <MaterialIcons
                    name="military-tech"
                    size={12}
                    color="#fbbf24"
                  />
                  <Text className="text-xs text-yellow-400">
                    {playerStats.rank}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="flex-row flex-wrap gap-2">
              {statCards.map((stat, index) => (
                <View
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-2 flex-1 min-w-[70px]"
                >
                  <stat.iconFamily
                    name={stat.iconName}
                    size={16}
                    color="#fb923c"
                  />
                  <Text className="text-xs text-gray-400 mt-1">
                    {stat.label}
                  </Text>
                  <Text className="text-sm font-bold text-white">
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Navigation */}
          {/* <View className="p-4">
            <Text className="text-xs text-gray-400 uppercase font-semibold mb-3">Navigation</Text>
            {sidebarItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveTab(item.id)}
                className={`flex-row items-center space-x-3 p-3 rounded-lg mb-2 ${
                  activeTab === item.id 
                    ? 'bg-[#cd7f32]/20 border border-[#cd7f32]/40' 
                    : 'bg-transparent'
                }`}
              >
                <item.iconFamily 
                  name={item.iconName}
                  size={20} 
                  color={activeTab === item.id ? '#fb923c' : '#6b7280'} 
                />
                <Text className={`font-medium ${
                  activeTab === item.id ? 'text-[#cd7f32]' : 'text-gray-400'
                }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}

          {/* Ready Status */}
          {/* <View className="p-4 mt-auto">
            <View className="bg-[#cd7f32]/20 border border-[#cd7f32]/40 rounded-lg p-3">
              <View className="flex-row items-center space-x-2 mb-2">
                <View className="w-2 h-2 bg-green-500 rounded-full" />
                <Text className="text-sm font-semibold text-[#cd7f32]">
                  Ready for Battle
                </Text>
              </View>
              <Text className="text-xs text-gray-300">
                Start your warrior journey by creating your first battle room
              </Text>
            </View>
          </View> */}
          <View className="flex-col justify-center  items-center space-x-4 mb-2">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="people" size={16} color="#22c55e" />
              <Text className="text-sm text-green-400 font-semibold">
                1,247 Warriors Online
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <Ionicons name="flash" size={16} color="#f59e0b" />
              <Text className="text-sm text-yellow-400 font-semibold">
                324 Active Battles
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 py-2">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View className="mb-2">
              <Text className="text-lg font-bold text-white">
                Choose Your <Text className="text-[#cd7f32]">Destiny</Text>
              </Text>
              <Text className="text-gray-400 mb-2 text-sm">
                Enter the ultimate proving ground where warriors clash in epic
                battles
              </Text>

              {/* Active Players Indicator */}
            </View>

            {/* Battle Modes Grid */}
            <View className="flex-row gap-x-6 mb-4">
              {battleModes.map((mode, index) => (
                <TouchableOpacity
                  key={mode.id}
                  onPress={() => setSelectedMode(mode.id)}
                  className={`bg-gray-800/60 backdrop-blur rounded-2xl py-2 px-4 border-2 flex-1 min-w-[250px] ${
                    selectedMode === mode.id
                      ? "border-[#cd7f32] bg-[#cd7f32]/10"
                      : "border-gray-700"
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                      onPress={() => setShowCreateBattleRoomModal(true)}
                      className={`w-12 h-12 rounded-xl items-center justify-center ${
                        mode.id === "forge"
                          ? "bg-[#cd7f32]/20"
                          : mode.id === "enter"
                            ? "bg-blue-500/20"
                            : mode.id === "ranked"
                              ? "bg-yellow-500/20"
                              : "bg-purple-500/20"
                      }`}
                    >
                      <mode.iconFamily
                        name={mode.iconName}
                        size={24}
                        color={
                          "#fb923c"
                        }
                      />
                    </TouchableOpacity>
                    <View
                      className={`px-2 py-1 rounded-full bg-[#cd7f32]/20 `}
                    >
                      <Text
                        className={`text-xs font-medium text-[#cd7f32] `}
                      >
                        {mode.players}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xl font-bold text-white mb-2">
                    {mode.title}
                  </Text>
                  <Text className="text-sm text-[#cd7f32] mb-3">
                    {mode.subtitle}
                  </Text>
                  <Text className="text-sm text-gray-400 leading-relaxed mb-4">
                    {mode.description}
                  </Text>

                  <TouchableOpacity
                    className={`py-3 px-4 rounded-xl flex-row items-center justify-center space-x-2 bg-[#cd7f32] `}
                  >
                    <Text className="text-white font-semibold">
                      Enter Arena
                    </Text>
                    <MaterialIcons
                      name="track-changes"
                      size={16}
                      color="white"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            {/* Game Features */}
            {/* <View>
              <Text className="text-xl font-bold text-white mb-4">
                Game Features
              </Text>
              <View className="flex-row space-x-4">
                <View className="flex-1 bg-gray-800/40 rounded-xl p-4">
                  <MaterialIcons
                    name="sports-martial-arts"
                    size={24}
                    color="#fb923c"
                  />
                  <Text className="text-sm font-semibold text-white mt-2">
                    Strategic Combat
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Turn-based battles where knowledge is power
                  </Text>
                </View>
                <View className="flex-1 bg-gray-800/40 rounded-xl p-4">
                  <Ionicons name="flash" size={24} color="#eab308" />
                  <Text className="text-sm font-semibold text-white mt-2">
                    Real-time Action
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Lightning-fast responses determine victory
                  </Text>
                </View>
                <View className="flex-1 bg-gray-800/40 rounded-xl p-4">
                  <MaterialIcons
                    name="military-tech"
                    size={24}
                    color="#a855f7"
                  />
                  <Text className="text-sm font-semibold text-white mt-2">
                    Rank Progression
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    Climb the leaderboards with each victory
                  </Text>
                </View>
              </View>
            </View> */}
          </ScrollView>
        </View>
      </View>
      <CreateBattleRoomModal
        visible={showCreateBattleRoomModal}
        onClose={() => setShowCreateBattleRoomModal(false)}
      />
    </View>
  );
};

export default BattleArenaMobile;
