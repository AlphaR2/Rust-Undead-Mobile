import { usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, Image,  StyleSheet, View } from 'react-native'

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen')

export default function SplashScreen() {
  const { user } = usePrivy()

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        if (user) {
          console.log('User authenticated, navigating to guide')
          setTimeout(() => {
            router.replace('/guide')
          }, 2000)
        } else {
          console.log('No user authenticated, navigating to intro')
          setTimeout(() => {
            router.replace('/intro')
          }, 3000)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setTimeout(() => {
          router.replace('/intro')
        }, 3000)
      }
    }

    checkAuthAndNavigate()
  }, [user])

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/spl.png')} style={styles.splashImage} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  splashImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
})
