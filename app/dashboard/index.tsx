import { CreateContext } from '@/context/Context'
import { useMWA } from '@/context/mwa/MWAContext'
import { useBasicGameData } from '@/hooks/game/useBasicGameData'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Octicons from '@expo/vector-icons/Octicons'
import { usePrivy } from '@privy-io/expo'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import chaptersStatsIcon from '../../assets/dashboard/chapters-stats.png'
import menuBg from '../../assets/dashboard/menu-bg.png'
import menuBg2 from '../../assets/dashboard/menu-bg2.png'
import profileBackground from '../../assets/dashboard/profile-bg.png'
import resourceBg from '../../assets/dashboard/resources-bg.png'
import victoryStatsIcon from '../../assets/dashboard/victory-stats.png'
import warriorStatsIcon from '../../assets/dashboard/warrior-stats.png'
import DASHBOARD_BACKGROUND from '../../assets/images/gbg.png'
import guide4 from '../../assets/images/guides/guide-daemon.png'
import guide3 from '../../assets/images/guides/guide-guard.png'
import guide2 from '../../assets/images/guides/guide-oracle.png'
import guide1 from '../../assets/images/guides/guide-val.png'

const GUIDE_IMAGES: Record<string, any> = {
  '1': guide1,
  '2': guide2,
  '3': guide3,
  '4': guide4,
}

const DEFAULT_USERNAME = 'Harrison'
const ADDRESS_VISIBLE_START = 4
const ADDRESS_VISIBLE_END = 4
const BALANCE_DECIMALS = 6

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const Firefly = ({ delay }: { delay: number }) => {
  const position = useRef(
    new Animated.ValueXY({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
    }),
  ).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(position, {
              toValue: {
                x: Math.random() * SCREEN_WIDTH,
                y: Math.random() * SCREEN_HEIGHT,
              },
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start()
    }

    setTimeout(animate, delay)
  }, [delay])

  return (
    <Animated.View
      style={[
        styles.firefly,
        {
          transform: [{ translateX: position.x }, { translateY: position.y }],
          opacity,
        },
      ]}
    />
  )
}

const Index = () => {
  const router = useRouter()
  const { logout: privyLogout } = usePrivy()
  const { disconnect: mwaDisconnect, isConnected: mwaConnected } = useMWA()
  const { onboarding } = useContext(CreateContext)
  const { selectedGuide } = onboarding
  const { userProfile, balance, userAddress } = useBasicGameData()

  const [guideImage, setGuideImage] = useState(guide1)

  useEffect(() => {
    if (selectedGuide?.id) {
      setGuideImage(GUIDE_IMAGES[selectedGuide.id] || guide1)
    } else {
      setGuideImage(guide1)
    }
  }, [selectedGuide])

  const handleLogout = () => {
    Alert.alert('Logout', `Are you sure you want to logout?`, [
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
            return error instanceof Error ? error.message : 'Unknown error occurred'
          }
        },
      },
    ])
  }

  const formatAddress = (address: string | null): string => {
    if (!address) return 'Not Connected'
    return `${address.slice(0, ADDRESS_VISIBLE_START)}...${address.slice(-ADDRESS_VISIBLE_END)}`
  }

  const formatBalance = (balance: number | null): string => {
    if (balance === null) return '0.000000'
    return balance.toFixed(BALANCE_DECIMALS)
  }

  return (
    <ImageBackground source={DASHBOARD_BACKGROUND} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />

      <View style={styles.fireflyContainer}>
        {[...Array(20)].map((_, i) => (
          <Firefly key={i} delay={i * 150} />
        ))}
      </View>

      <View style={styles.mainContent}>
        <View style={styles.topSection}>
          <View style={styles.profileCard}>
            <ImageBackground source={profileBackground} style={styles.profileBackground} resizeMode="contain">
              <View style={styles.profileRow}>
                <View style={styles.profileInfo}>
                  <Text style={styles.username}>{userProfile?.username || DEFAULT_USERNAME}</Text>
                  <View style={styles.addressRow}>
                    <MaterialIcons name="account-balance-wallet" size={12} color="#9CA3AF" />
                    <Text style={styles.addressText}>{formatAddress(userAddress)}</Text>
                    <TouchableOpacity style={styles.copyButton}>
                      <MaterialIcons name="content-copy" size={10} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          <ImageBackground source={resourceBg} style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialIcons name="monetization-on" size={16} color="#C87423" />
                <Text style={styles.statValueSol}>{formatBalance(balance)}</Text>
              </View>

              {/* <View style={styles.statItem}>
                <MaterialIcons name="trending-up" size={16} color="#3B82F6" />
                <Text style={styles.statValueBlue}>
                  {userProfile ? `${userProfile.totalBattlesWon * XP_MULTIPLIER}` : DEFAULT_XP}
                </Text>
              </View> */}
            </View>
          </ImageBackground>

          <View style={styles.actionIcons}>
            <MaterialCommunityIcons name="police-badge-outline" size={20} color="#CEA858" />
            <Octicons name="unmute" size={20} color="#CEA858" />
            <TouchableOpacity onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={20} color="#CEA858" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.menuColumn}>
            <ImageBackground source={menuBg} style={styles.menuItem} resizeMode="contain">
              <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/dashboard/story-mode')}>
                <Text style={styles.menuTitle}>Story Mode</Text>
                <Text style={styles.menuDescription}>Become the choosen commander of the</Text>
                <Text style={styles.menuDescription}> Undead Legion</Text>
              </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={menuBg2} style={styles.menuItem} resizeMode="contain">
              <TouchableOpacity style={styles.menuButton} disabled activeOpacity={1}>
                <Text style={styles.menuTitle}>Battle Arena</Text>
                <Text style={styles.menuDescription}>Coming to mobile soon</Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>

          <Image source={guideImage} style={styles.guideImage} resizeMode="contain" />
          <View style={styles.statsColumn}>
            <View style={styles.statsGrid}>
              <View style={styles.statBadge}>
                <Image style={styles.statIcon} resizeMode="contain" source={chaptersStatsIcon} />
                <Text style={styles.statLabel}>Chapters</Text>
                <Text style={styles.statValue}>1</Text>
              </View>
              <View style={styles.statBadge}>
                <Image style={styles.statIcon} resizeMode="contain" source={warriorStatsIcon} />
                <Text style={styles.statLabel}>Warriors</Text>
                {/* <Text style={styles.statValue}>4</Text> */}
              </View>
              <View style={styles.statBadge}>
                <Image style={styles.statIcon} resizeMode="contain" source={victoryStatsIcon} />
                <Text style={styles.statLabel}>Victories</Text>
                {/* <Text style={styles.statValue}>4</Text> */}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fireflyContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  firefly: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C87423',
    shadowColor: '#C87423',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  topSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileCard: {
    minWidth: 190,
  },
  profileBackground: {
    width: '100%',
    height: 79,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  avatarContainer: {
    width: 65,
    height: 65,
    backgroundColor: '#C87423',
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    right: 32,
  },
  profileInfo: {
    flexDirection: 'column',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: 600,
  },
  copyButton: {
    marginLeft: 8,
  },
  statsContainer: {
    // width: '40%',
    position: 'relative',
    right: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    // gap: 16,
  },
  statItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueSol: {
    color: '#C87423',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statValueBlue: {
    color: '#60A5FA',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 24,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '75%',
    justifyContent: 'space-between',
  },
  menuColumn: {
    flexDirection: 'column',
    width: '53%',
  },
  menuItem: {
    width: '100%',
    height: 98,
  },
  menuButton: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    left: '18%',
  },
  menuTitle: {
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
  menuDescription: {
    textAlign: 'left',
    fontSize: 12,
    color: 'white',
    fontWeight: '300',
  },
  guideImage: {
    width: 330,
    height: 500,
  },
  statsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 20,
  },
  statsGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  statBadge: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
  },
  statLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '300',
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
})

export default Index
