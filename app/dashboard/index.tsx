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
import buttonBg from '../../assets/onboarding/button-bg-main.png'

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

  return (
    <ImageBackground source={DASHBOARD_BACKGROUND} style={{ flex: 1 }} resizeMode="cover">
      <View
        style={{
          ...require('react-native').StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      <View className="flex-1 flex-col justify-center p-4">
        {/* Top Section with User Data */}
        <View className="w-full flex flex-row justify-between items-start px-4 mb-6">
          {/* Left: User Profile Card */}
          <View className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-lg p-3 min-w-[280px]">
            {/* Profile Header */}
            <View className="flex flex-row items-center mb-2">
              <View className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                <MaterialIcons name="person" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">{userProfile?.username || 'Harrison'}</Text>
                <View className="flex flex-row items-center mt-1">
                  <MaterialIcons name="account-balance-wallet" size={12} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">{formatAddress(userAddress)}</Text>
                  <TouchableOpacity className="ml-2">
                    <MaterialIcons name="content-copy" size={10} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Balance */}
            <View className="flex flex-row items-center">
              <MaterialIcons name="account-balance-wallet" size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-2">{formatBalance(balance)} SOL</Text>
              <View className="ml-2 bg-red-600/20 px-2 py-0.5 rounded">
                <MaterialIcons name="warning" size={12} color="#EF4444" />
              </View>
            </View>
          </View>

          {/* Center: Game Stats */}
          <View className="flex flex-row gap-x-4">
            {/* Gold/Points */}
            <View className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg px-3 py-2 flex flex-row items-center">
              <MaterialIcons name="monetization-on" size={16} color="#EAB308" />
              <Text className="text-yellow-400 font-bold ml-2">{userProfile?.totalPoints?.toString() || '6,840'}</Text>
            </View>

            {/* XP/Level */}
            <View className="bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 flex flex-row items-center">
              <MaterialIcons name="trending-up" size={16} color="#3B82F6" />
              <Text className="text-blue-400 font-bold ml-2">
                {userProfile ? `${userProfile.totalBattlesWon * 100}` : '13,671'}
              </Text>
            </View>
          </View>

          {/* Right: Action Icons & Achievements */}
          <View className="flex flex-row items-center gap-x-3">
            {/* Achievement Icons */}

            <View className="flex flex-col gap-y-2">
              <TouchableOpacity
                className="bg-orange-600/20 border border-orange-500/30 rounded-full p-2"
                onPress={() => router.push('/')}
              >
                <AntDesign name="wallet" size={20} color="orange" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-600/20 border border-red-500/30 rounded-full p-2"
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-row items-center justify-between h-[75%]">
          {/* Left Menu */}
          <View className="flex flex-col gap-y-4 w-[25%]">
            <ImageBackground source={buttonBg} className="w-full h-16" resizeMode="contain">
              <TouchableOpacity className="flex items-center justify-center h-full" onPress={() => router.push('/')}>
                <Text className="text-center font-bold text-lg text-black">Home</Text>
              </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={buttonBg} className="w-full h-16" resizeMode="contain">
              <TouchableOpacity
                className="flex items-center justify-center h-full"
                onPress={() => router.push('/dashboard/battle-arena')}
              >
                <Text className="text-center font-bold text-lg text-black">Battle Arena</Text>
              </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={buttonBg} className="w-full h-16" resizeMode="contain">
              <TouchableOpacity className="flex items-center justify-center h-full" onPress={() => router.push('/')}>
                <Text className="text-center font-bold text-lg text-black">Story</Text>
              </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={buttonBg} className="w-full h-16" resizeMode="contain">
              <TouchableOpacity className="flex items-center justify-center h-full" onPress={() => router.push('/')}>
                <Text className="text-center font-bold text-lg text-black">Continue</Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>

          {/* Right Guide Image with Badges */}
          <View className="flex flex-col items-center w-[70%] relative left-28">
            <Image source={guideImage} className="w-[300px] h-[500px]" resizeMode="contain" />
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

export default Index
