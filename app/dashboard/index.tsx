import { CreateContext } from '@/context/Context'
import { useMWA } from '@/context/mwa/MWAContext'
import { useGameData } from '@/hooks/useGameData'
import { useWalletInfo } from '@/hooks/useUndeadProgram'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { usePrivy } from '@privy-io/expo'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { Alert, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import DASHBOARD_BACKGROUND from '../../assets/images/gbg.png'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'
import menuBg from '../../assets/dashboard/menu-bg.png'
import menuBg2 from '../../assets/dashboard/menu-bg2.png'
import warriorStatsIcon from '../../assets/dashboard/warrior-stats.png'
import victoryStatsIcon from '../../assets/dashboard/victory-stats.png'
import chaptersStatsIcon from '../../assets/dashboard/chapters-stats.png'

import profileBackground from '../../assets/dashboard/profile-bg.png'
import resourceBg from '../../assets/dashboard/resources-bg.png'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Octicons from '@expo/vector-icons/Octicons'

const Index = () => {
  const router = useRouter()
  const { logout: privyLogout } = usePrivy()
  const { disconnect: mwaDisconnect, isConnected: mwaConnected } = useMWA()
  const { onboarding } = useContext(CreateContext)
  const { selectedGuide } = onboarding
  const { userProfile, userWarriors, balance, loading, error, userAddress } = useGameData()
  const { publicKey, isConnected, walletType } = useWalletInfo()

  const [guideImage, setGuideImage] = useState(guide1)

  useEffect(() => {
    if (selectedGuide?.id) {
      setGuideImage(
        selectedGuide.id === '1'
          ? guide1
          : selectedGuide.id === '2'
            ? guide2
            : selectedGuide.id === '3'
              ? guide3
              : guide4,
      )
    } else {
      setGuideImage(guide1)
    }
  }, [selectedGuide])

  const handleLogout = () => {
    const walletProvider = mwaConnected ? 'Mobile Wallet Adapter' : 'Privy'

    Alert.alert('Logout', `Are you sure you want to disconnect from ${walletProvider} and logout?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            if (mwaConnected) {
              await mwaDisconnect()
            } else {
              await privyLogout()
            }
            router.replace('/')
          } catch (error) {
            console.error('Logout error:', error)
          }
        },
      },
    ])
  }

  const formatAddress = (address: string | null): string => {
    if (!address) return 'Not Connected'
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: number | null): string => {
    if (balance === null) return '0.000000'
    return balance.toFixed(6)
  }

  const getWalletTypeDisplay = (type: string): string => {
    switch (type?.toLowerCase()) {
      case 'phantom':
        return 'Phantom'
      case 'solflare':
        return 'Solflare'
      case 'backpack':
        return 'Backpack'
      default:
        return type || 'Unknown'
    }
  }

  console.log(userProfile)
  return (
    <ImageBackground source={DASHBOARD_BACKGROUND} style={{ flex: 1 }} resizeMode="cover">
      <View
        style={{
          ...require('react-native').StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      <View className="flex-1 flex-col justify-center px-4">
        {/* Top Section with User Data */}
        <View className="w-full flex flex-row justify-between items-center px-4  ">
          {/* Left: User Profile Card */}
          <View className="  min-w-[280px]">
            <ImageBackground source={profileBackground} className="w-full h-20" resizeMode="contain">
              <View className="flex flex-row items-start mb-2">
                <View className="w-[65px] h-[65px] bg-[#C87423]  rounded-full flex items-center justify-center right-8">
                  <MaterialIcons name="person" size={40} color="white" />
                </View>
                <View className="flex flex-col py-3 items-start">
                  <Text className="text-white font-bold text-sm">{userProfile?.username || 'Harrison'}</Text>
                  <View className="flex flex-row items-center mt-1">
                    <MaterialIcons name="account-balance-wallet" size={12} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{formatAddress(userAddress)}</Text>
                    <TouchableOpacity className="ml-2">
                      <MaterialIcons name="content-copy" size={10} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  {/* Balance */}
                  <View className="flex flex-row items-center">
                    <MaterialIcons name="account-balance-wallet" size={16} color="white" />
                    <Text className="text-white text-xs font-medium ml-2">{formatBalance(balance)} SOL</Text>
                    <View className="ml-2 bg-red-600/20 px-2 py-0.5 rounded">
                      <MaterialIcons name="warning" size={12} color="#EF4444" />
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
            {/* Profile Header */}
          </View>

          {/* Center: Game Stats */}
          <ImageBackground source={resourceBg} className="w-[30%] flex items-center justify-center">
            <View className="flex flex-row gap-x-4">
              {/* Gold/Points */}
              <View className=" border-yellow-500/30 rounded-lg px-3 py-2 flex flex-row items-center">
                <MaterialIcons name="monetization-on" size={16} color="#EAB308" />
                <Text className="text-yellow-400 font-bold ml-2">
                  {userProfile?.totalPoints?.toString() || '6,840'}
                </Text>
              </View>

              {/* XP/Level */}
              <View className=" border-blue-500/30 rounded-lg px-3 py-2 flex flex-row items-center">
                <MaterialIcons name="trending-up" size={16} color="#3B82F6" />
                <Text className="text-blue-400 font-bold ml-2">
                  {userProfile ? `${userProfile.totalBattlesWon * 100}` : '13,671'}
                </Text>
              </View>
            </View>
          </ImageBackground>

          {/* Right: Action Icons & Achievements */}
          <View className="flex items-center flex-row gap-x-6">
            <MaterialCommunityIcons name="police-badge-outline" size={20} color="#CEA858" className="font-thin" />
            <Octicons name="unmute" size={20} color="#CEA858" />
            <MaterialCommunityIcons name="logout" size={20} color="#CEA858" />
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-row items-center h-[75%] justify-between">
          {/* Left Menu */}
          <View className="flex flex-col w-[45%] ">
            <ImageBackground source={menuBg} className="w-full h-32" resizeMode="contain">
              <TouchableOpacity
                className="flex items-start justify-center h-full left-[18%] text-wrap"
                onPress={() => router.push('/dashboard/story-mode')}
              >
                <Text className="text-start font-bold text-lg text-white font-li">Story Mode</Text>
                <Text className="text-start  text-xs text-wrap text-white font-light">
                  Learn all about Solana while having fun and
                </Text>
                <Text className="text-start font-light text-xs text-wrap text-white">winning points</Text>
              </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={menuBg2} className="w-full h-32" resizeMode="contain">
              <TouchableOpacity
                className="flex items-start justify-center h-full left-[18%] text-wrap"
                onPress={() => router.push('/')}
              >
                <Text className="text-start font-bold text-lg text-white">Battle Arena</Text>
                <Text className="text-start  text-xs text-wrap text-white font-light">Coming soon</Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>

          {/* Right Guide Image with Badges */}
          <Image source={guideImage} className="w-[300px] h-[500px] " resizeMode="contain" />
          <View className="flex flex-row items-center relative z-20">
            <View className="flex flex-col gap-y-2 ">
              <View className="flex items-center">
                <Image className="w-[40px] h-[40px]" resizeMode="contain" source={chaptersStatsIcon} />
                <Text className="text-white text-sm font-light">Chapters</Text>
                <Text className="text-white font-bold text-lg">4</Text>
              </View>
              <View className="flex items-center">
                <Image className="w-[40px] h-[40px]" resizeMode="contain" source={warriorStatsIcon} />
                <Text className="text-white text-sm font-light">Warriors</Text>
                <Text className="text-white font-bold text-lg">4</Text>
              </View>
              <View className="flex items-center">
                <Image className="w-[40px] h-[40px]" resizeMode="contain" source={victoryStatsIcon} />
                <Text className="text-white text-sm font-light">Victories</Text>
                <Text className="text-white font-bold text-lg">4</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default Index
